var helpers = require( "./lib/helpers.js" );
var model = require( "./model.js" );
var view = require( "./view.js" );

var router = {
  init: function() {
    router.setCurrentPost();
    view.update();
    router.listenPageChange();
  },
  listenPageChange: function() {
    window.addEventListener("hashchange", router.setCurrentPost, false);
  },
  setCurrentPost: function() {
    var slugs = helpers.getAfterHash();
    var post = model.getPostBySlugs(slugs);
    view.currentPost = post;
  },
  updateHash: function(slug) {
    window.location.hash = slug;
  }
};
module.exports = router;
