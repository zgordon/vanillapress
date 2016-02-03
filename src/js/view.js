
/**
 * This file controls the main front end view
 * of the app.
 *
 *
 * @exports view
 */
var helpers = require( './lib/helpers.js' ),
    model = require( './model.js' );


/**
 * Main view object
 *
 * @namespace
 */
var view = {
  init: function() {
    view.listenMainNavLinksUpdatePage();
    view.loadMainHeader();
  },

  currentPost: '',


  /**
   * Listener activate and deactivate main nav.
   * @function
  */
  listenMainNavLinksUpdatePage: function() {
    var mainNav = document.getElementById( 'mainNav' ),
        links = mainNav.getElementsByTagName( 'a' );
    for ( var i = 0, max = links.length; i < max; i++ ) {
      // Add listener to activate main nav
      links[i].addEventListener('click',view.mainNavControl,false);
      // Remove listener that disables main nav
      links[i].removeEventListener('click',view.disableNav );
    }
  },

  /**
   * Listener to disable the main nav while the
   * editor is open.
   *
   */
  listenDisableMainNavLinks: function() {
    var links = helpers.getMainNavLinks();
    for ( var i = 0, len = links.length; i < len; i++ ) {
      // Add listener to deactivate main nav
      links[i].removeEventListener('click', view.mainNavControl);
      // Remove listener to disable main nav
      links[i].addEventListener('click', view.disableNav, false);
    }
  },

  /**
   * Main nav listener to load proper page
   *
   */
  mainNavControl: function() {
    var newPageSlugs = helpers.getAfterHash( this.href ),
        post = model.getPostBySlugs( newPageSlugs );
    view.currentPost = post;
    view.update();
  },

  /**
   * Updates the view based on current post
   *
   */
  update: function() {
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
  loadMainHeader: function() {
    // Get site name and description from store
    var siteName = model.getPostBySlug( 'site-name', 'settings' ),
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
  updateSiteName: function( content ) {
    var siteName = helpers.getSiteName();
    siteName.innerHTML = content;
  },

  /**
   * Helper function to update to the site description in the view.
   *
   * @param content {string} The site description to display
   */
  updateSiteDescription: function( content ) {
    var siteDescription = helpers.getSiteDescription();
    siteDescription.innerHTML = content;
  },

  /**
   * Helper function to update main page title in the view.
   *
   * @param title {string} The title to display
   */
  updateTitle: function(title) {
    var titleEl = document.getElementById( 'pageTitle' );
    titleEl.innerHTML = title;
  },

  /**
   * Helper function to update main page content in the view.
   *
   * @param content {string} The content to display
   */
  updateContent: function(content) {
    var contentEl = document.getElementById( 'pageContent' );
    contentEl.innerHTML = content;
  },

  /**
   * Gets blog posts and appends them to the page.
   *
   */
  loadBlogPosts: function() {
    var posts = model.getPostsByType( 'post' ),
        postsMarkup = document.createElement( 'section' ),
        primaryContentEL;

    postsMarkup.id = 'blogPosts';
    // Get markup for each post
    for ( var i = 0, max = posts.length; i < max; i++ ) {
      postsMarkup.appendChild( helpers.createPostMarkup( posts[i] ) );
    }
    primaryContentEL = helpers.getPrimaryContentEl();
    // Append posts to page
    primaryContentEL.appendChild( postsMarkup );
  },

  /**
   * Remove blog posts from page
   *
   */
  removeBlogPosts: function(){
    var blogPost = document.getElementById( 'blogPosts' );
    if( blogPost )  {
      blogPost.remove();
    }
  },

  /**
   * Prevents main nav from working. Used when editor is open.
   *
   */
  disableNav: function(){
    event.preventDefault();
  }
};
module.exports = view;
