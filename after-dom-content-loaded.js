function isRootObject(item) {
  return ( item.nodeName != 'LI' );
}

function expand(target) {
  // already collapsed
  if ( target.style.display !== 'none' ) {
    return;
  }
  
  var parentNode = target.parentNode;
  var ellipsis = parentNode.getElementsByClassName('ellipsis')[0];
  
  target.style.display = '';
  parentNode.removeChild(ellipsis);
  parentNode.getElementsByClassName('collapser')[0].innerHTML = '-';
}

function collapse(target) {
  // already collapsed
  if ( target.style.display === 'none' ) {
    return;
  }
  var ellipsis = document.createElement('span');
  var parentNode = target.parentNode;
  
  target.style.display = 'none';
  
  ellipsis.className = 'ellipsis';
  ellipsis.innerHTML = ' &hellip; ';
  
  parentNode.insertBefore(ellipsis, target);
  parentNode.getElementsByClassName('collapser')[0].innerHTML = '+';
}

function addCollapser(item) {
  var collapser = document.createElement('div');
  collapser.className = 'collapser';
  collapser.innerHTML = '-';
  collapser.addEventListener('click', function (event) {
    var collapser = event.target;
  
    var target = collapser.parentNode.getElementsByClassName('collapsible');
  
    if ( ! target.length ) {
      return;
    }
  
    target = target[0];
    
    if ( target.style.display == 'none' ) {
      expand(target);
    } else {
      collapse(target);
    }
  }, false);
  item.insertBefore(collapser, item.firstChild);
}

var items = document.getElementsByClassName('collapsible');
for( var i = 0; i < items.length; i++) {
  addCollapser(items[i].parentNode);
}

document
  .getElementById('expandAll')
  .addEventListener('click', function() {
    var items = document.getElementsByClassName('collapsible');
    for( var i = 0; i < items.length; i++) {
      expand(items[i]);
    }
  });

document
  .getElementById('collapseAll')
  .addEventListener('click', function() {
    var items = document.getElementsByClassName('collapsible');
    // except the first one, '0' is the root
    for (var i = 1; i < items.length; i++) {
      collapse(items[i]);
    }
  });

const HIGHLIGHTED_CLASS_NAME = "highlighted";

document
  .getElementById('submitPathToProperty')
  .addEventListener('click', function() {
    // clear the selected one
    var highlightedOnes = document.getElementsByClassName(HIGHLIGHTED_CLASS_NAME);
    
    // in practice, there is only one
    for (var j = 0; j < highlightedOnes.length; j++) {
      highlightedOnes[j].className = '';
    }

    var path = document.getElementById('pathToProperty').value.trim().split('.');
    
    var tempPath = '';
    for (var i = 0; i < path.length; i++) {
      tempPath += (i === 0? '': '.') + path[i];
      
      var foundElement =  document.getElementById(tempPath);
      if (foundElement) {
        expand(document.getElementById(tempPath).lastElementChild);
      } else {
        // FIXME: print error
      }
    }
    
    // highlight
    document.getElementById(tempPath).className += ' ' + HIGHLIGHTED_CLASS_NAME;
  });


// VIEW STATE PRESERVATION
// Read it from the storage
chrome.storage.sync.get(['preserveViewState'], function(items) {
  var preserveViewStateCheckbox = document.getElementById('preserveViewStateCheckbox');
  if (items['preserveViewState']) {
    preserveViewStateCheckbox.checked = true;
  } else {
    preserveViewStateCheckbox.checked = false;
  }
});

document
  .getElementById('preserveViewStateCheckbox')
  .addEventListener('change', function(event) {
    chrome.storage.sync.set({'preserveViewState': event.target.checked});
    
    
  });
