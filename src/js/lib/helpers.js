var models = require( "./../models.js" );

Array.prototype.isArray = true;
var helpers = {

  getAfterHash: function(url) {
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
  },

  addMenuItems: function(menuItems, contentType) {
    menuItems.forEach(function(item){
      var a = helpers.createLink(item.title, contentType, item.slug);
      helpers.addMenuItem(a);
    });
  },

  addMenuItem: function(menuItem) {
    var ul = document.querySelector("#editor nav.secondary ul");
    var li = document.createElement("li");
    li.appendChild(menuItem);
    ul.appendChild(li);
  },

  createLink: function(text, contentType, slug) {
    var a = document.createElement('a');
    var aText = document.createTextNode(text);
    a.appendChild(aText);
    a.href = "#edit/" + contentType + "/" + slug;
    return a;
  },

  getEditorEl: function() {
    var el = document.getElementById("editor");
    return el;
  },

  getEditorToggleEl: function() {
    var el = document.getElementById("editorToggle");
    return el;
  },

  getCurrentContentObj: function() {

    var newPageSlugs = helpers.getAfterHash();
    var pageContent;
    if( newPageSlugs.length > 1 ) {
      pageContent = models.getContentBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      pageContent = models.getContentBySlug(newPageSlugs[0], 'pages');      
    }
    return pageContent;
  }


}

module.exports = helpers;
