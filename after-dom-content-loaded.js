// Globals variables - There are saved in browser's storage
// for view state memorisation
var elementIdsToSave = {};

// Min period that a write can be periodically run
const MIN_PERIOD_FOR_WRITE_OPERATIONS_IN_SECONDS = 1 / (chrome.storage.MAX_WRITE_OPERATIONS_PER_MINUTE / 60) + 0.2;

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
    updateElementIdsInBrowserStorage();
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
    updateElementIdsInBrowserStorage();
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
    updatePathPropertyInBrowserStorage();
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

Element.prototype.documentOffsetTop = function () {
  return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop() : 0 );
};

function scrollToTheMiddleOfThePageWith(element) {
  var top = element.documentOffsetTop() - ( window.innerHeight / 2 );
  window.scrollTo( 0, top );
}

function scrollToProperty() {
  var highlightedElement = highlightProperty();
  scrollToTheMiddleOfThePageWith(highlightedElement);
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
    updatePathPropertyInBrowserStorage()
  });
}

/**
 *
 * VIEW STATE PRESERVATION
 * =====================================
 */
// initially collapse all, in case view state is preseved, this will boots up performance a bit
collapseAll();

var viewStateChanged = {};
function resetViewStateChangedFlag() {
  viewStateChanged = {
    'autoPreserveViewState': false,
    'elementIds': false,
    'pathToProperty': false
  };
}

function updateAutoPreserveViewState() {
  viewStateChanged.autoPreserveViewState = true;
}

function updateElementIdsInBrowserStorage() {
  viewStateChanged.elementIds = true;
}

function updatePathPropertyInBrowserStorage() {
  viewStateChanged.pathToProperty = true;
}

// Read view states from the storage
chrome.storage.sync.get(['autoPreserveViewState', 'elementIds', 'pathToProperty'], function(items) {
  var autoPreserveViewStateCheckbox = document.getElementById('autoPreserveViewStateCheckbox');
  if (items['autoPreserveViewState']) {
    autoPreserveViewStateCheckbox.checked = true;
    
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
  
    saveViewStateIntervalID = createSaveViewStateIntervalTask();
  } else {
    autoPreserveViewStateCheckbox.checked = false;
  }
});

function writeToBrowserStorage(autoPreserveViewState, elementIds, pathToProperty) {
  chrome.storage.sync.set({
    'autoPreserveViewState': autoPreserveViewState,
    'elementIds': elementIds,
    'pathToProperty': pathToProperty
  }, function() {
    log('Current view state is saved to browser storage.');
  });
}

/**
 * Save view state to browser storage
 */
function saveViewState() {
  if (!viewStateChanged.elementIds && !viewStateChanged.pathToProperty) {
    // nothing new to save
    return;
  }
  
  var pathToProperty = document.getElementById('pathToProperty').value;
  writeToBrowserStorage(true, elementIdsToSave, pathToProperty);
  
  resetViewStateChangedFlag();
}

var saveViewStateIntervalID;

/**
 * @returns {number} - interval id
 */
function createSaveViewStateIntervalTask() {
  return setInterval(saveViewState, MIN_PERIOD_FOR_WRITE_OPERATIONS_IN_SECONDS * 1000);
}

document
  .getElementById('autoPreserveViewStateCheckbox')
  .addEventListener('change', function(event) {
    if (event.target.checked === true) {
      // don't create another interval task if there is one already
      if (!saveViewStateIntervalID) {
        saveViewStateIntervalID = createSaveViewStateIntervalTask();
      }
    } else {
      // cancel existing one
      if (saveViewStateIntervalID) {
        clearInterval(saveViewStateIntervalID);
        saveViewStateIntervalID = undefined;
      }
  
      setTimeout(function () {
        chrome.storage.sync.set({
          'autoPreserveViewState': false
        }, function () {
          log('Auto-preserve is off');
        });
      }, MIN_PERIOD_FOR_WRITE_OPERATIONS_IN_SECONDS * 1000);
    }
  });