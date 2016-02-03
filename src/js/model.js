/**
 * This file contains methods having to do with
 * getting and setting of data.  Leverages local
 * store.
 *
 * @exports model
 *
 */

var jsonData = require( './data.js' ),
    helpers = require( './lib/helpers.js' );


/**
 * Main model object.
 *
 * @namespace
 */
var model = {
  // Init function to load data into local store
  init: function() {
    var localStore = model.getLocalStore();
    if( typeof localStore === 'undefined' || localStore === null ||
        localStore === '' ) {
      localStorage.setItem(
        'vanillaPress',
        JSON.stringify( jsonData )
      );
      localStore = model.getLocalStore();
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
    if ( postType === 'post' ) {
      posts = data.posts;
    } else if ( postType === 'page' ) {
      posts = data.pages;
    } else if ( postType === 'setting' ) {
      posts = data.settings;
    } else {
      posts =  [{type:'404',title:'404 Error'}];
    }
    return posts;
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

    if ( slugs.length > 1 &&
      ( slugs[0] === 'posts' || slugs[0] === 'blog' ) ) {
      // If blog post
      post = model.getPostBySlug( slugs[1], 'posts' );
    } else if ( slugs.length > 1 && slugs[0] === 'settings' ) {
      // If setting
      post = model.getPostBySlug( slugs[1], 'settings' );
    } else {
      // If page
      if( slugs[0] === '') slugs[0] = 'home';
      post = model.getPostBySlug( slugs[0], 'pages');
    }

    return post;
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
        posts,
        item;

    if ( postType === 'posts' ) {
      posts = data.posts;
    } else if ( postType === 'pages' ) {
      posts = data.pages;
    } else if ( postType === 'settings' ) {
      posts = data.settings;
    } else {
      posts =  [{type:'404',title:'404 Error'}];
    }

    // Get the post from store based on the slug
    item = posts.filter( function( obj ) {
      return obj.slug == slug;
    });

    return item[0];
  },

  /**
   * Gets content from local store
   *
   * @return store {object} Local storage object with all content
   */
  getLocalStore: function() {
    var localStore = JSON.parse( localStorage.getItem( 'vanillaPress' ) ),
        store = {};

    if( localStore === null ) {
      store = localStore;
    } else {
      store = localStore[0];
    }
    return store;
  },

  /**
   * Gets a unique id for a new post
   *
   * @return next highest id based on existing posts
   */
  getNewPostId: function() {
    var newId,
        localStore = model.getLocalStore(),
        postIds = [],
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
        n = 1;

    // Check if slug exists
    slugExists = model.checkIfSlugExists( slug );

    // If slug exists, get unique string
    if ( slugExists === true ) {
      // Append -n to end of url
      slug = slug + '-' + n;
      // Keep adding -n++ until get unique slug
      while ( slugExists === true ) {
        slug = slug.substring( 0, slug.lastIndexOf( '-' ) );
        slug = slug + '-' + n;
        slugExists = model.checkIfSlugExists( slug );
        n++;
      }
    }

    return slug;
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
   * Saves temporary store to local storage.
   *
   * @param store {object} Temporary store to update
   */
  updateLocalStore: function( store ) {
    var newStore = [ store ];
    // Makes sure to stringify store object before saving
    localStorage.setItem( 'vanillaPress', JSON.stringify( newStore ) );
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
