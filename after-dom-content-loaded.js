function isRootObject(item) {
  return ( item.nodeName != 'LI' );
}

function expand(target) {
  var ellipsis = target.parentNode.getElementsByClassName('ellipsis')[0];
  target.parentNode.removeChild(ellipsis);
  target.style.display = '';
}

function collapse(target) {
  target.style.display = 'none';

  var ellipsis = document.createElement('span');
  ellipsis.className = 'ellipsis';
  ellipsis.innerHTML = ' &hellip; ';
  target.parentNode.insertBefore(ellipsis, target);
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
  
    collapser.innerHTML = ( collapser.innerHTML == '-' ) ? '+' : '-';
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