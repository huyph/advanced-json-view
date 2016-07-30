const DEBUG_ENABLED = true;
const ADVANCED_JSON_VIEW = 'AdvancedJSONView: ';

const JSON_REGEX = /^\s*([\[\{].*[\}\]])\s*$/;
const JSONP_REGEX = /^[\s\u200B\uFEFF]*([\w$\[\]\.]+)[\s\u200B\uFEFF]*\([\s\u200B\uFEFF]*([\[{][\s\S]*[\]}])[\s\u200B\uFEFF]*\);?[\s\u200B\uFEFF]*$/;


if (isJson()) {
  main();
} else {
  log('Terminated. The data is not of type json/jsonp.');
}

/**
 * Only call this when the file is of type json
 */
function main() {
  var controlsDiv =
    '<div class="controls">' +
      '<div id="not-found-property-error">Error: cannot find this property</div>' +
      '<button id="showPathToProperty">Go to</button><input id="pathToProperty"></input>' +
      '<button id="clearPathToProperty">Clear</button>' +
      '<text class="text-white">      ----      </text>' +
      '<button id="collapseAll">Collapse all</button>' +
      '<button id="expandAll">Expand all</button>' +
      '<div class="right">' +
          '<input id="autoPreserveViewStateCheckbox" type="checkbox" checked></input><label for="autoPreserveViewStateCheckbox">Auto-preserve view state</label>' +
      '</div>' +
    '</div>';
  
  document.body.innerHTML = controlsDiv + constructPrettifiedOutputOfJson();
}

/**
 * Log messages
 * @param msg
 */
function log(msg) {
  if (DEBUG_ENABLED) {
    console.log(ADVANCED_JSON_VIEW + msg);
  }
}

/**
 * @returns {boolean} - true if the view file of type JSON
 */
function isJson() {
  this.data = document.body.innerHTML;
  this.uri = document.location.href;
  
  // Pre-process data step
  if(/^\<pre.*\>(.*)\<\/pre\>$/.test(this.data)){
    log("data is wrapped in <pre>...</pre>, stripping HTML...");
    this.data = this.data.replace(/<(?:.|\s)*?>/g, ''); //Aggressively strip HTML.
  }
  
  // Check data against JSON regex
  var is_json = JSON_REGEX.test(this.data);
  var is_jsonp = JSONP_REGEX.test(this.data);
  log('is_json='+is_json+' is_jsonp='+is_jsonp);
  
  return is_json || is_jsonp;
}

/**
 * @returns {string} - prettified output of the global json data
 */
function constructPrettifiedOutputOfJson() {
  /**
   * Extended version of Firefox JSONView (http://code.google.com/p/jsonview)
   * @constructor
   */
  function JSONFormatter() {}
  JSONFormatter.prototype = {
    htmlEncode: function (t) {
      return t != null ? t.toString().replace(/&/g,'&amp;').replace(/'/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
    },
    
    decorateWithSpan: function (value, className) {
      return '<span class="' + className + '">' + this.htmlEncode(value) + '</span>';
    },
    
    getPath: function (parentPath, prop) {
      return (parentPath === ''? prop: parentPath + "." + prop);
    },
    
    // Convert a basic JSON datatype (number, string, boolean, null, object, array) into an HTML fragment.
    valueToHTML: function(value, parentPath) {
      var valueType = typeof value;
      
      var output = "";
      if (value == null) {
        output += this.decorateWithSpan('null', 'null');
      }
      else if (value && value.constructor == Array) {
        output += this.arrayToHTML(value, parentPath);
      }
      else if (valueType == 'object') {
        output += this.objectToHTML(value, parentPath);
      }
      else if (valueType == 'number') {
        output += this.decorateWithSpan(value, 'num', parentPath);
      }
      else if (valueType == 'string') {
        if (/^(http|https):\/\/[^\s]+$/.test(value)) {
          value = this.htmlEncode(value);
          output += '<a href="' + value + '">' + value + '</a>';
        } else {
          output += this.decorateWithSpan('"' + value + '"', 'string');
        }
      }
      else if (valueType == 'boolean') {
        output += this.decorateWithSpan(value, 'bool');
      }
      
      return output;
    },
    
    // Convert an array into an HTML fragment
    arrayToHTML: function(json, parentPath) {
      var output = '[<ul class="array collapsible">';
      var hasContents = false;
      for ( var prop in json ) {
        var newParentPath = this.getPath(parentPath, prop);
        
        hasContents = true;
        output += '<li id="' + newParentPath + '">';
        output += this.valueToHTML(json[prop], newParentPath);
        output += '</li>';
      }
      output += '</ul>]';
      
      if ( ! hasContents ) {
        output = "[ ]";
      }
      
      return output;
    },
    
    // Convert a JSON object to an HTML fragment
    objectToHTML: function(json, parentPath) {
      var output = '{<ul class="obj collapsible">';
      var hasContents = false;
      for ( var prop in json ) {
        var newParentPath = this.getPath(parentPath, prop);
  
        hasContents = true;
        output += '<li id="' + newParentPath + '">';
        output += '<span class="prop">' + this.htmlEncode(prop) + '</span>: ';
        output += this.valueToHTML(json[prop], newParentPath);
        output += '</li>';
      }
      output += '</ul>}';
      
      if ( ! hasContents ) {
        output = "{ }";
      }
      
      return output;
    },
    
    // Convert a whole JSON object into a formatted HTML document.
    jsonToHTML: function(json, callback, uri) {
      var output = '';
      if( callback ){
        output += '<div class="callback">' + callback + ' (</div>';
        output += '<div id="json">';
      }else{
        output += '<div id="json">';
      }
      output += this.valueToHTML(json, '');
      output += '</div>';
      if( callback ){
        output += '<div class="callback">)</div>';
      }
      return this.toHTML(output, uri);
    },
    
    // Produce an error document for when parsing fails.
    errorPage: function(error, data, uri) {
      var output = '<div id="parsing-json-error">Error parsing JSON: '+error.message+'</div>';
      output += '<h1>'+error.stack+':</h1>';
      output += '<div id="json">' + this.htmlEncode(data) + '</div>';
      return this.toHTML(output, uri + ' - Error');
    },
    
    // Wrap the HTML fragment in a full document. Used by jsonToHTML and errorPage.
    toHTML: function(content, title) {
      return '<doctype html>' +
        '<html><head><title>' + title + '</title>' +
        '<link rel="stylesheet" type="text/css" href="'+chrome.extension.getURL("advanced-json-view.css")+'">' +
        '<script type="text/javascript" src="'+chrome.extension.getURL("default.js")+'"></script>' +
        '</head><body>' +
        content +
        '</body></html>';
    }
  };
  
  // Sanitize & output -- all magic from JSONView Firefox
  this.jsonFormatter = new JSONFormatter();
  
  var outputDoc = '';
  var cleanData = '',
    callback = '';
  
  var callback_results = JSONP_REGEX.exec(this.data);
  if( callback_results && callback_results.length == 3 ){
    log("JSONp detected");
    callback = callback_results[1];
    cleanData = callback_results[2];
  } else {
    log("Vanilla JSON detected");
    cleanData = this.data;
  }
  log(cleanData);
  
  // Covert, and catch exceptions on failure
  try {
    var jsonObj = JSON.parse(cleanData);
    if ( jsonObj ) {
      outputDoc = this.jsonFormatter.jsonToHTML(jsonObj, callback, this.uri);
    } else {
      throw "There was no object!";
    }
  } catch(e) {
    log(e);
    outputDoc = this.jsonFormatter.errorPage(e, this.data, this.uri);
  }
  
  return outputDoc;
}