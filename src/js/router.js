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
      view = require( './view.js' ),
      error404 = {type:'404',title:'404 Error', content: 'Please try another page'};

/**
 * The main router object.
 *
 * @namespace
 */
var router = {
  init () {
    page('/vanillapress/', router.loadPage);
    page('/vanillapress/about', router.loadPage);
    page('/vanillapress/contact', router.loadPage);
    page('/vanillapress/blog', router.loadBlog);
    page('/vanillapress/blog/:slug', router.loadBlog);
    page.start();
    router.refreshCurrentPost();
    router.listenPageChange();
  },

  updatePage( url ) {
    console.log(  url );
    if( 'home' === url ||
        '/home/' === url )
    {
      url = '/vanillapress/';
    }
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
    view.setCurrentPost( post );
  },

  loadBlog ( ctx ) {
    let slugs = [],
        post;
    // remove the / from the slug
    slugs.push( ctx.path.substring(0, ctx.path.length - 1)
                        .replace( '/', '' )
                        .split( '/' ) );
    post = model.getPostBySlugs( slugs[1] );
    view.setCurrentPost( post );
  },

  loadBlogPost ( ctx ) {
    let slugs = [],
        post;
    // remove the / from the slug
    slugs.push( ctx.path.substring(0, ctx.path.length - 1)
                        .replace( '/', '' )
                        .split( '/' ) );
    post = model.getPostBySlugs( slugs[0] );
    view.currentPost = post;
    view.update();
  },
  /**
   * Add listener to url changes
   *
   */
  listenPageChange () {
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
  refreshCurrentPost () {
    const slugs = h.getAfterHash(),
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
 updateHash ( slug ) {
    if ( 'home' === slug ) slug = '';
    window.location.hash = slug;
  }

};

module.exports = router;

}());
