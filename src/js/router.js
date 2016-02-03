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
 * @namespace
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

    if( typeof post === 'undefined' ) {
      // If page does not exist set 404 page
      view.currentPost = {
        title: '404',
        content: '<p>Oops! Please try a different url</p>',
        slug: '404'
      };
    } else {
      view.currentPost = post;
    }

    view.update();
  },

  // Helper function to update hash based on slug
  updateHash: function(slug) {
    window.location.hash = slug;
  }

};

module.exports = router;
