/**
 * The router object takes actions based on the
 * hash in the url (i.e. #content-here)
 *
 * @exports router
 */

var helpers = require( './lib/helpers.js' ),
    model = require( './model.js' ),
    view = require( './view.js' );

/**
 * The main router object.
 *  
 */
var router = {
  init: function() {
    router.setCurrentPost();
    view.update();
    router.listenPageChange();
  },

  // Add listener to url changes
  listenPageChange: function() {
    window.addEventListener(
      'hashchange',
      router.setCurrentPost,
      false
    );
  },

  // Updates the the current post based on url
  setCurrentPost: function() {
    var slugs = helpers.getAfterHash(),
        post = model.getPostBySlugs( slugs );

    view.currentPost = post;
    view.update();
  },

  // Helper function to update hash based on slug
  updateHash: function(slug) {
    window.location.hash = slug;
  }

};

module.exports = router;
