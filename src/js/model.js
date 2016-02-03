(function() {

'use strict';

/**
 * This file contains methods having to do with
 * getting and setting of data.  Leverages local
 * store.
 *
 * @exports model
 *
 */

const _ = require( 'underscore' ),
      h = require( './lib/helpers.js' ),
      jsonData = require( './data.js' );


/**
 * Main model object.
 *
 * @namespace
 */
const model = {
  // Init function to load data into local store
  init () {
    let localStore = model.getLocalStore();
    if( _.isNull( localStore ) ) {
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
  getPostsByType ( postType ) {
    // Get content from local store
    const data = model.getLocalStore();
    // Return just data.postType ie data.posts
    return data[ postType + 's'];
  },

  /**
   * Get a single post based on url slugs
   *
   * @param slugs {array} The url slugs for the post
   * @return post {object} Single post based on url slugs
   *
   */
  getPostBySlugs ( slugs ) {
    let post;

    if ( slugs.length > 1 &&
      ( slugs[0] === 'blog' ) ) {
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
  getPostBySlug ( slug, postType ) {
    const store = model.getLocalStore();
    let posts,
        post;

    // Get posts from local storage
    posts = store[ postType ];
    // Filter the posts to match the slug
    post = _.filter( posts, (post) => {
      return post.slug == slug;
    });

    return post[0];
  },

  /**
   * Gets content from local store
   *
   * @return store {object} Local storage object with all content
   */
  getLocalStore () {
    const store = JSON.parse(
                        localStorage.getItem( 'vanillaPress' )
                      );
    let newStore = {};

    if( _.isNull( store ) ) {
      newStore = store;
    } else {
      newStore = store[0];
    }
    return newStore;
  },

  /**
   * Gets a unique id for a new post
   *
   * @return next highest id based on existing posts
   */
  getNewPostId () {
    const store = model.getLocalStore();

    // Get the current highest post id
    let latestPost = _.max( store.posts, (post) => {
      return post.id;
    } );
    // Return new unique id
    return latestPost.id + 1;
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
    let slugExists,
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
    const store = model.getLocalStore();

    // Check if filtering posts for slug is empty
    return _.isEmpty(
           _.filter( store.posts, ( post ) => {
             return post.slug === slug;
           }) ) ? false : true;

  },

  /**
   * Saves temporary store to local storage.
   *
   * @param store {object} Temporary store to update
   */
  updateLocalStore: function( store ) {
    let newStore = [ store ];
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

}());
