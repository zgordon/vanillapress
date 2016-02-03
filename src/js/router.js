(function() {

'use strict';

/**
 * The router object takes actions based on the
 * hash in the url (i.e. #content-here)
 *
 * @exports router
 */


const _ = require( 'underscore' ),
      h = require( './lib/helpers.js' ),
      model = require( './model.js' ),
      view = require( './view.js' );

/**
 * The main router object.
 *
 * @namespace
 */
var router = {
  init () {
    router.setCurrentPost();
    view.update();
    router.listenPageChange();
  },

  // Add listener to url changes
  listenPageChange () {
    window.addEventListener(
      'hashchange',
      router.setCurrentPost,
      false
    );
  },

  // Updates the the current post based on url
  setCurrentPost () {
    const slugs = h.getAfterHash(),
          post = model.getPostBySlugs( slugs );

    if( _.isUndefined( post ) ) {
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
  updateHash ( slug ) {
    window.location.hash = slug;
  }

};

module.exports = router;

}());
