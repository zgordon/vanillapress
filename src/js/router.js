(function() {

'use strict';

/**
 * The router object takes actions based on the
 * hash in the url (i.e. #content-here)
 *
 * @exports router
 */

<<<<<<< HEAD

const _ = require( 'underscore' ),
      page = require( 'page' ),
      h = require( './lib/helpers.js' ),
      model = require( './model.js' ),
      view = require( './view.js' );
=======
var helpers = require( './lib/helpers.js' ),
    model = require( './model.js' ),
    view = require( './view.js' ),
    error404 = {type:'404',title:'404 Error', content: 'Please try another page'};
>>>>>>> v1

/**
 * The main router object.
 *
 * @namespace
 */
var router = {
<<<<<<< HEAD
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
=======
  init: function() {
    router.refreshCurrentPost();
    router.listenPageChange();
>>>>>>> v1
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

<<<<<<< HEAD
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
=======
  /**
   * Add listener to url changes
   *
   */
  listenPageChange: function() {
>>>>>>> v1
    window.addEventListener(
      'hashchange',
      router.refreshCurrentPost,
      false
    );
  },

<<<<<<< HEAD
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
=======
  /**
   * Updates the the current post based on url
   *
   */
  refreshCurrentPost: function() {
    var slugs = helpers.getAfterHash(),
        post = model.getPostBySlugs( slugs );

    if( post ) {
      view.setCurrentPost( post );
>>>>>>> v1
    } else {
      // If page does not exist set 404 page
      view.setCurrentPost( error404 );
    }


  },

<<<<<<< HEAD
  // Helper function to update hash based on slug
  updateHash ( slug ) {
=======
  /**
   * Helper function to update hash based on slug
   *
   */
  updateHash: function(slug) {
>>>>>>> v1
    window.location.hash = slug;
  }

};

module.exports = router;

}());
