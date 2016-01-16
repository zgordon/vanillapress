var helpers = require( "./lib/helpers.js" );
var models = require( "./models.js" );
var view = {
  init: function() {
    var viewContent = helpers.getCurrentContentObj();
    view.updateTitle( viewContent.title );
    view.updateContent( viewContent.content );

  },
  update: function() {
    var newPageSlugs = helpers.getAfterHash(this.href);
    var viewContent;
    if( newPageSlugs.length > 1 ) {
      viewContent = models.getContentBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      viewContent = models.getContentBySlug(newPageSlugs[0], 'pages');
    }

    view.updateTitle( viewContent.title );
    view.updateContent( viewContent.content );
  },
  updateTitle: function(title) {
    var titleEl = document.getElementById("pageTitle");
    titleEl.innerHTML = title;
  },
  updateContent: function(content) {
    var contentEl = document.getElementById("pageContent");
    contentEl.innerHTML = content;
  }
};
module.exports = view;
