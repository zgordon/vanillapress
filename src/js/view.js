var helpers = require( "./lib/helpers.js" );
var model = require( "./model.js" );
// var listeners = require( "./listeners.js" );

var view = {
  init: function() {
    var viewContent = model.getCurrentContentObj();
    view.updateTitle( viewContent.title );
    view.updateContent( viewContent.content );
  },
  listenMainNavLinksUpdatePage: function() {
    var mainNav = document.getElementById("mainNav");
    var links = mainNav.getElementsByTagName("a");
    for(var i = 0, len = links.length; i < len; i++) {
      links[i].addEventListener("click", view.update, false);
      links[i].removeEventListener("click", view.disableNav);
    }
  },
  listenDisableMainNavLinks: function() {
    var links = helpers.getMainNavLinks();
    for(var i = 0, len = links.length; i < len; i++) {
      links[i].removeEventListener("click", view.update);
      links[i].addEventListener("click", view.disableNav, false);
    }
  },
  update: function() {
    var newPageSlugs = helpers.getAfterHash(this.href);
    var post;
    if( newPageSlugs.length > 1 ) {
      post = model.getContentBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      post = model.getContentBySlug(newPageSlugs[0], 'pages');
    }
    //view.updateCurrentNav();
    view.updateTitle( post.title );
    view.updateContent( post.content );
  },
  push: function(post) {
    router.updateHash(post);
    view.updateTitle( post.title );
    view.updateContent( post.content );
  },
  updateTitle: function(title) {
    var titleEl = document.getElementById("pageTitle");
    titleEl.innerHTML = title;
  },
  updateContent: function(content) {
    var contentEl = document.getElementById("pageContent");
    contentEl.innerHTML = content;
  },
  disableNav: function(){
    event.preventDefault();
  }
};
module.exports = view;
