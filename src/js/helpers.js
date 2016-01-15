Array.prototype.isArray = true;

function getAfterHash(url) {
  url = url || null;
  var urlSegments = [""];
  if( url !== null ) {
    url = url.substring(url.indexOf('#')+1);
    urlSegments = url.split("/");
  } else {
    var pageUrl = window.location.hash.substr(1);
    urlSegments = pageUrl.split("/");
  }
  return urlSegments;
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

function getEditorEl() {
  var el = document.getElementById("editor");
  return el;
}
function getEditorToggleEl() {
  var el = document.getElementById("editorToggle");
  return el;
}
function getCurrentContentObj() {

  var newPageSlugs = getAfterHash();  
  var pageContent;
  if( newPageSlugs.length > 1 ) {
    pageContent = getContentBySlug(newPageSlugs[1], 'posts');
  } else {
    if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
    pageContent = getContentBySlug(newPageSlugs[0], 'pages');
  }
  return pageContent;
}
