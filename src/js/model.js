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
      jsonData = require( './data.js' ),
      error404 = {type:'404',title:'404 Error', content: 'Please try another page'};


/**
 * Main model object.
 *
 * @namespace
 */
var model = {

  /**
   * Init function to load data into local store
   *
   */
  init () {
    let localStore = model.getLocalStore();
    if( _.isNull( localStore ) ) {
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
  getPostsByType ( postType ) {
    // Get content from local store
    const data = model.getLocalStore();
    // Return just data.postType ie data.posts
    return data[ postType ];
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
    if ( slugs.length > 1 &&  'blog' === slugs[0] ) {
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
  getPostBySlug ( slug, postType ) {
    const store = model.getLocalStore();
    let posts = store[ postType ],
        post;

    // Filter the posts to match the slug
    post = _.filter( posts, (post) => {
      return post.slug == slug;
    });

    return post[0];
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
  checkIfSlugExists ( slug ) {
    const store = model.getLocalStore();

    // Check if filtering posts for slug is empty
    return _.isEmpty(
           _.filter( store.posts, ( post ) => {
             return post.slug === slug;
           }) ) ? false : true;

  },

  /**
   * Gets content from local store
   *
   * @return store {object} Local storage object with all content
   */
  getLocalStore () {
    return JSON.parse( localStorage.getItem( 'vanillaPress' ) );
  },

  /**
   * Saves temporary store to local storage.
   *
   * @param store {object} Temporary store to update
   */
  updateLocalStore ( store ) {
    // Makes sure to stringify store object before saving
    localStorage.setItem( 'vanillaPress', JSON.stringify( store ) );
  },

  /**
   * Deletes data from local storage.
   *
   */
  removeLocalStore () {
    localStorage.removeItem( 'vanillaPress' );
  }
};

module.exports = model;

}());
