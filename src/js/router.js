(function() {

'use strict';

/**
 * The router object takes actions based on the
 * hash in the url (i.e. #content-here)
 *
 * @exports router
 */


const _ = require( 'underscore' ),
      page = require( 'page' ),
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
    page('/', router.loadPage);
    page('/about', router.loadPage);
    page('/contact', router.loadPage);
    page('/blog', router.loadPage);
    page('/blog/:slug', router.loadBlog);
    page.start();
    router.setCurrentPost();
    view.update();
    //router.listenPageChange();
  },
  updatePage( url ) {
    if( url === 'home' ) url = '/';
    page( url );
  },
  // Loads page based on url
  loadPage ( ctx ) {
    let slugs = [],
        post;
    if( ctx.path === '' ) {
      slugs.push( 'home' );
    } else {
      // remove the / from the slug
      slugs.push( ctx.path.substring(0, ctx.path.length - 1)
                          .replace( '/', '' ));

    }
    post = model.getPostBySlugs( slugs );
    view.currentPost = post;
    view.update();
  },
  loadBlog ( ctx ) {
    let slugs = [],
        post;
    // remove the / from the slug
    slugs.push( ctx.path.substring(0, ctx.path.length - 1)
                        .replace( '/', '' )
                        .split( '/' ) );
    post = model.getPostBySlugs( slugs[0] );
    // console.log( slugs );
    view.currentPost = post;
    view.update();
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
