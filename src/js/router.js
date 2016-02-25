/**
 * The router object takes actions based on the
 * hash in the url (i.e. #content-here)
 *
 * @exports router
 */

var helpers = require( './lib/helpers.js' ),
    model = require( './model.js' ),
    view = require( './view.js' ),
    error404 = {type:'404',title:'404 Error', content: 'Please try another page'};

/**
 * The main router object.
 *
 * @namespace
 */
var router = {
  init: function() {
    router.refreshCurrentPost();
    router.listenPageChange();
  },

  /**
   * Add listener to url changes
   *
   */
  listenPageChange: function() {
    window.addEventListener(
      'hashchange',
      router.refreshCurrentPost,
      false
    );
  },

  /**
   * Updates the the current post based on url
   *
   */
  refreshCurrentPost: function() {
    var slugs = helpers.getAfterHash(),
        post = model.getPostBySlugs( slugs );

    if( post ) {
      view.setCurrentPost( post );
    } else {
      // If page does not exist set 404 page
      view.setCurrentPost( error404 );
    }


  },

  /**
   * Helper function to update hash based on slug
   *
   */
  updateHash: function(slug) {
    window.location.hash = slug;
  }

};

module.exports = router;
