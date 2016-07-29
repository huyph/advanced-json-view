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
  .addEventListener('click', function(event) {
    var items = document.getElementsByClassName('collapsible');
    for( var i = 0; i < items.length; i++) {
      if (items[i].style.display === 'none') {
        expand(items[i]);
      }
    }
  });

document
  .getElementById('collapseAll')
  .addEventListener('click', function(event) {
    var items = document.getElementsByClassName('collapsible');
    for (var i = 0; i < items.length; i++) {
      if (items[i].style.display !== 'none') {
        collapse(items[i]);
      }
    }
  });

document
  .getElementById('submitJsonPropertyFinder')
  .addEventListener('click', function(event) {
    var path = document.getElementById('jsonPropertyFinder').value.trim().split('.');
    for (var i = 0; i < path.length; i++) {
      
    }
  });