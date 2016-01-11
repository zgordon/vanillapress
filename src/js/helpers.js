function getAfterHash(url) {
  url = typeof url !== 'undefined' ? url : null;
  returnArray = typeof returnArray !== 'undefined' ? returnArray : null;
  var urlSegments;
  if (url === null){
      urlSegments = window.location.hash.substr(1);
  } else {
      urlSegments = url.split('#')[1];
  }
  return urlSegments.split("/");
}

function refreshMenu(){

  //console.log(this);
  //urlSegments = getAfterHash();
  //console.log(this);
  //ffwindow.location.hash = window.location.hash;

  //editor.loadMenu();
  //event.preventDefault();
}

function addMenuItems(menuItems, contentType) {
  menuItems.forEach(function(item){
    var a = createLink(item.title, contentType, item.slug);
    addMenuItem(a);
  });
}
function addMenuItem(menuItem) {
  var ul = document.querySelector("#editor nav.secondary ul");
  var li = document.createElement("li");
  li.appendChild(menuItem);
  ul.appendChild(li);
}
function createLink(text, contentType, slug) {
  var a = document.createElement('a');
  var aText = document.createTextNode(text);
  a.appendChild(aText);
  a.href = "#edit/" + contentType + "/" + slug;
  return a;
}
