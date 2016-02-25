/**
 * This file contains methods having to do with
 * getting and setting of data.  Leverages local
 * store.
 *
 * @exports model
 *
 */

var jsonData = require( './data.js' ),
    error404 = {type:'404',title:'404 Error', content: 'Please try another page'};


/**
 * Main model object.
 *
 * @namespace
 */
var model = {
  /**
   * Initializes model and sets local store if empty
   *
   */
  init: function() {
    var localStore = model.getLocalStore();
    if( typeof localStore === 'undefined' || localStore === null ||
        localStore === '' ) {
      localStorage.setItem(
        'vanillaPress',
        JSON.stringify( jsonData )
      );
    }
  },

  /**
   * Gets posts based on post type.
   *
   * @param postType {string} The type of content needed (post, page, etc)
   * @return posts {array} Posts matching post type (Posts, Pages, etc)
   */
  getPostsByType: function( postType ) {
    // Get content from local store
    var data = model.getLocalStore(),
        posts;

    // Get posts from local store
    if ( 'posts' === postType ) {
      return data.posts;
    } else if ( 'pages' === postType ) {
      return data.pages;
    } else if ( 'settings' === postType ) {
      return data.settings;
    } else {
      return  [ error404 ];
    }
  },

  /**
   * Get a single post based on url slugs
   *
   * @param slugs {array} The url slugs for the post
   * @return post {object} Single post based on url slugs
   *
   */
  getPostBySlugs: function( slugs ) {
    var post;

    if ( slugs.length > 1 && 'blog' === slugs[0] ) {
      // If blog post
      return model.getPostBySlug( slugs[1], 'posts' );
    } else if ( slugs.length > 1 && 'settings' === slugs[0] ) {
      // If setting
      return model.getPostBySlug( slugs[1], 'settings' );
    } else {
      // If page
      if( '' === slugs[0] ) slugs[0] = 'home';
      return model.getPostBySlug( slugs[0], 'pages');
    }
  },

  /**
   * Get single post slug and post type
   *
   * @param slug {string} The url slug for the post
   * @param postType {string} The post type for the post
   * @return post {object} Single post based on url slugs
   *
   */
  getPostBySlug: function( slug, postType ){
    // Get contet from local storage
    var data = model.getLocalStore(),
        posts = model.getPostsByType ( postType ),
        post;

    // Get the post from store based on the slug
    post = posts.filter( function( post ) {
      return post.slug == slug;
    });

    return post[0];
  },

  /**
   * Gets a unique id for a new post
   *
   * @return next highest id based on existing posts
   */
  getNewPostId: function() {
    var localStore = model.getLocalStore(),
        postIds = [],
        newId,
        highestId;

    localStore.posts.forEach(function( post ) {
      postIds.push( Number( post.id ) );
    });
    highestId = Math.max.apply( Math, postIds );
    newId = highestId + 1;
    return newId;
  },

  /**
   * Checks if slug exists.
   * Adds a number to the end of the slug
   * until finds a unique slug.
   *
   * @param slug {string}
   * @return next highest id based on existing posts
   */
  uniqueifySlug: function( slug ) {
    var slugExists,
        n = 1,
        uniqueSlug = slug;

    // Check if slug exists
    slugExists = model.checkIfSlugExists( slug );
    while ( slugExists ) {
      uniqueSlug = slug + '-' + n;
      slugExists = model.checkIfSlugExists( uniqueSlug );
      n++;
    }

    return uniqueSlug;
  },

  /**
   * Checks if slug exists.
   *
   * @param slug {string}
   * @return true if slug exists or false if does not exist
   */
  checkIfSlugExists: function( slug ) {
    var localStore = model.getLocalStore(),
        slugs = [],
        slugExists;

    localStore.posts.forEach(function( post ) {
      slugs.push( post.slug );
    });

    slugExists = ( slugs.indexOf( slug ) > -1 );

    return slugExists;
  },

  /**
   * Gets content from local store
   *
   * @return store {object} Local storage object with all content
   */
  getLocalStore: function() {
    return JSON.parse( localStorage.getItem( 'vanillaPress' ) );
  },

  /**
   * Saves temporary store to local storage.
   *
   * @param store {object} Temporary store to update
   */
  updateLocalStore: function( store ) {
    // Makes sure to stringify store object before saving
    localStorage.setItem( 'vanillaPress', JSON.stringify( store ) );
  },

  /**
   * Deletes data from local storage.
   *
   */
  removeLocalStore: function() {
    localStorage.removeItem( 'vanillaPress' );
  }
};

module.exports = model;
