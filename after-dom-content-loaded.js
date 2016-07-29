// Globals variables - There are saved in browser's storage
// for view state memorisation
var elementIdsToSave = {};
var pathToProperty = '';

/**
 * EXPANDING and COLLAPSING ACTIONS
 * =====================================
 */
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
  
  // for view preservation functionality
  if (!elementIdsToSave[parentNode.id]) {
    elementIdsToSave[parentNode.id] = true;
    updateElementIdsInChromeStorage(elementIdsToSave);
  }
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
  
  // for view preservation functionality
  if (elementIdsToSave.hasOwnProperty(parentNode.id) && elementIdsToSave[parentNode.id]) {
    elementIdsToSave[parentNode.id] = undefined;
    updateElementIdsInChromeStorage(elementIdsToSave);
  }
}

function collapseAll() {
  var items = document.getElementsByClassName('collapsible');
  // except the first one, '0' is the root
  for (var i = 1; i < items.length; i++) {
    collapse(items[i]);
  }
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
    collapseAll();
  });

const HIGHLIGHTED_CLASS_NAME = "highlighted";

/**
 * JSON PROPERTY HIGHLIGHTING
 * =====================================
 */

function clearPathToProperty() {
  // clear the selected one
  var highlightedOnes = document.getElementsByClassName(HIGHLIGHTED_CLASS_NAME);
  for (var j = 0; j < highlightedOnes.length; j++) {
    highlightedOnes[j].className = '';
  }
  
  // clear the error
  document.getElementById('not-found-property-error').style.display = 'none';
}

document
  .getElementById('clearPathToProperty')
  .addEventListener('click', function() {
    clearPathToProperty();
    
    document.getElementById('pathToProperty').value = '';
  });

document
  .getElementById('pathToProperty')
  .addEventListener('change', function (event) {
    pathToProperty = event.target.value;
    updatePathPropertyInChromeStorage(pathToProperty);
  });

function updatePathToProperty(newValue, scrollTo) {
  document.getElementById('pathToProperty').value = newValue;
  
  if (scrollTo) {
    scrollToProperty();
  } else {
    highlightProperty();
  }
}

function highlightProperty() {
  clearPathToProperty();
  
  var str = document.getElementById('pathToProperty').value.trim();
  if (str === '') {
    return;
  }
  
  var path = str.split('.');
  
  var tempPath = '';
  for (var i = 0; i < path.length; i++) {
    tempPath += (i === 0? '': '.') + path[i];
    
    var foundElement =  document.getElementById(tempPath);
    if (foundElement) {
      expand(foundElement.lastElementChild);
    } else {
      document.getElementById('not-found-property-error').style.display = 'block';
    }
  }
  
  // highlight
  var importantElement = document.getElementById(tempPath);
  importantElement.className += ' ' + HIGHLIGHTED_CLASS_NAME;
  return importantElement;
}

function scrollToProperty() {
  var highlightedElement = highlightProperty();
  highlightedElement.scrollIntoView();
}

document
  .getElementById('showPathToProperty')
  .addEventListener('click', function() {
    scrollToProperty();
  });

/*
 **
 * PATH DETECTOR - FOR ANY SELECTED PROPERTY
 * =====================================
 */
var allJsonProperties = document.getElementsByClassName('prop');

for (var i = 0; i < allJsonProperties.length; i++) {
  allJsonProperties[i].addEventListener('click', function(event) {
    var propertyPath = event.target.parentNode.id;
    updatePathToProperty(propertyPath);
    updatePathPropertyInChromeStorage(propertyPath)
  });
}

/**
 *
 * VIEW STATE PRESERVATION
 * =====================================
 */
// initially collapse all, in case view state is preseved, this will boots up performance a bit
collapseAll();

function isViewStatePreserved() {
  return document.getElementById('preserveViewStateCheckbox').checked;
}

function updateElementIdsInChromeStorage(value) {
  if (isViewStatePreserved()) {
    chrome.storage.sync.set({'elementIds': value});
  }
}

function updatePathPropertyInChromeStorage(value) {
  if (isViewStatePreserved()) {
    chrome.storage.sync.set({'pathToProperty': value});
  }
}

// Read view states from the storage
chrome.storage.sync.get(['preserveViewState', 'elementIds', 'pathToProperty'], function(items) {
  var preserveViewStateCheckbox = document.getElementById('preserveViewStateCheckbox');
  if (items['preserveViewState']) {
    preserveViewStateCheckbox.checked = true;
    
    var elementIds = items['elementIds'];
    var foundElement;
    
    for (var elementId in elementIds) {
      if (elementIds.hasOwnProperty(elementId) && elementId) {
        foundElement =  document.getElementById(elementId);
        if (foundElement) {
          expand(foundElement.lastElementChild);
        }
      }
    }
    
    if (items['pathToProperty']) {
      updatePathToProperty(items['pathToProperty'], true);
    }
  } else {
    preserveViewStateCheckbox.checked = false;
  }
});

function saveViewState(save) {
  preserveViewState = false;
  elementIdsToSave = {};
  pathToProperty = '';
  
  if (save) {
    preserveViewState = true;
    
    var collapsibleElements = document.getElementsByClassName('collapsible');
    var collapsibleElement;
    
    for (var i = 1; i < collapsibleElements.length; i++) {
      collapsibleElement = collapsibleElements[i];
      if (collapsibleElement.style.display !== 'none') {
        elementIdsToSave[collapsibleElement.parentNode.id] = true;
      }
    }
    
    pathToProperty = document.getElementById('pathToProperty').value;
  }
  
  chrome.storage.sync.set({
    'preserveViewState': preserveViewState,
    'elementIds': elementIdsToSave,
    'pathToProperty': pathToProperty
  });
}

document
  .getElementById('preserveViewStateCheckbox')
  .addEventListener('change', function(event) {
    saveViewState(event.target.checked);
  });

document
  .getElementById('saveViewStateButton')
  .addEventListener('click', function () {
    saveViewState(true);
  
    document
      .getElementById('preserveViewStateCheckbox').checked = true;
  });
