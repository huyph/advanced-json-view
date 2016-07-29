function isRootObject(item) {
  return ( item.nodeName != 'LI' );
}

function expand(target) {
  var parentNode = target.parentNode;
  var ellipsis = parentNode.getElementsByClassName('ellipsis')[0];
  
  target.style.display = '';
  parentNode.removeChild(ellipsis);
  parentNode.getElementsByClassName('collapser')[0].innerHTML = '-';
}

function collapse(target) {
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
      if (items[i].style.display === 'none') {
        expand(items[i]);
      }
    }
  });

document
  .getElementById('collapseAll')
  .addEventListener('click', function() {
    var items = document.getElementsByClassName('collapsible');
    // except the first one, '0' is the root
    for (var i = 1; i < items.length; i++) {
      if (items[i].style.display !== 'none') {
        collapse(items[i]);
      }
    }
  });

// const SELECTED_CLASS_NAME = "selected";

document
  .getElementById('submitPathToProperty')
  .addEventListener('click', function() {
    var path = document.getElementById('pathToProperty').value.trim().split('.');

    var items = document.getElementsByClassName('collapsible');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      
      // FIXME: throw an error if if property is not found
      var tempIndex = path.indexOf(item.parentNode.childNodes[1].innerHTML);
      
      if (tempIndex > -1) {
        if (item.style.display === 'none') {
          expand(item);
        }
        //
        // if (tempIndex === path.length - 1) {
        //   item.parentNode.className += " " + SELECTED_CLASS_NAME;
        // }
      }
    }
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
