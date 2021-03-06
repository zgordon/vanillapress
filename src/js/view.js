(function() {

'use strict';

/**
 * This file controls the main front end view
 * of the app.
 *
 *
 * @exports view
 */
 const _ = require( 'underscore' ),
       h = require( './lib/helpers.js' ),
       model = require( './model.js' );


/**
 * Main view object
 *
 * @namespace
 */
var view = {
  init () {
    view.listenMainNavLinksUpdatePage();
    view.loadMainHeader();
  },

  currentPost: '',


  /**
   * Listener activate and deactivate main nav.
   * @function
  */
  listenMainNavLinksUpdatePage () {
    const links = document.querySelectorAll( '#mainNav a' );
    _.each( links, ( link ) => {
      // Add listener to activate main nav
      link.addEventListener( 'click', view.mainNavControl, false );
      // Remove listener that disables main nav
      link.removeEventListener( 'click', view.disableNav );
    });

  },

  /**
   * Listener to disable the main nav while the
   * editor is open.
   *
   */
  listenDisableMainNavLinks () {
    const links = h.getMainNavLinks();
    _.each( links, ( link ) => {
      // Add listener to deactivate main nav
      link.removeEventListener('click', view.mainNavControl);
      // Remove listener to disable main nav
      link.addEventListener('click', view.disableNav, false);
    });
  },

  /**
   * Main nav listener to load proper page
   *
   */
  mainNavControl () {
    const newPageSlugs = h.getAfterHash( this.href ),
          post = model.getPostBySlugs( newPageSlugs );
    view.currentPost = post;
    view.update();
  },

  /**
   * Updates the view based on current post
   *
   */
  update () {
    view.updateTitle( view.currentPost.title );
    view.updateContent( view.currentPost.content );

    view.removeBlogPosts();
    if ( view.currentPost.slug === 'blog' ) {
      // Append blog posts to blog page
      view.loadBlogPosts();
    }
  },

  /**
   * Loads the main header based on settings data in local store.
   *
   */
  loadMainHeader () {
    // Get site name and description from store
    const siteName = model.getPostBySlug( 'site-name', 'settings' ),
          siteDescription = model.getPostBySlug(
            'site-description',
            'settings'
          );
    view.updateSiteName( siteName.content );
    view.updateSiteDescription( siteDescription.content );
  },

  /**
   * Helper function to update to post content in the view.
   *
   * @param content {string} The site name to display
   */
  updateSiteName ( content ) {
    let siteName = h.getSiteName();
    siteName.innerHTML = content;
  },

  /**
   * Helper function to update to the site description in the view.
   *
   * @param content {string} The site description to display
   */
  updateSiteDescription ( content ) {
    let siteDescription = h.getSiteDescription();
    siteDescription.innerHTML = content;
  },

  /**
   * Helper function to update main page title in the view.
   *
   * @param title {string} The title to display
   */
  updateTitle ( title ) {
    let titleEl = document.getElementById( 'pageTitle' );
    titleEl.innerHTML = title;
  },

  /**
   * Helper function to update main page content in the view.
   *
   * @param content {string} The content to display
   */
  updateContent ( content ) {
    let contentEl = document.getElementById( 'pageContent' );
    contentEl.innerHTML = content;
  },

  /**
   * Helper function to clear title and content
   * in the main view
   *
   */
  clearContent () {
    let titleEl = document.getElementById( 'pageTitle' ),
        contentEl = document.getElementById( 'pageContent' );

    titleEl.innerHTML = '';
    contentEl.innerHTML = '';
  },

  /**
   * Gets blog posts and appends them to the page.
   *
   */
  loadBlogPosts () {
    var posts = model.getPostsByType( 'posts' ),
        postsSection = document.createElement( 'section' ),
        primaryContentEL = h.getPrimaryContentEl();

    postsSection.id = 'blogPosts';
    // Get markup for each post
    //console.log( posts );
    _.each( posts, (post) => {
      postsSection.appendChild( h.createPostMarkup( post ) );
    });
    // Append posts to page
    primaryContentEL.appendChild( postsSection );
  },

  /**
   * Remove blog posts from page
   *
   */
  removeBlogPosts () {
    let blogPost = document.getElementById( 'blogPosts' );
    if( blogPost )  {
      blogPost.remove();
    }
  },

  /**
   * Prevents main nav from working. Used when editor is open.
   *
   */
  disableNav () {
    event.preventDefault();
  }
};
module.exports = view;

}());
