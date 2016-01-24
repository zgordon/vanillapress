var data = require( './data.js' ),
    jsonData = require( './json.js' ),
    helpers = require( './lib/helpers.js' );

var model = {
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

  getContent: function( postType ) {
    var data = model.getLocalStore();

    if ( postType === 'post' ) {
      content = data.posts;
    } else if ( postType === 'page' ) {
      content = data.pages;
    } else if ( postType === 'setting' ) {
      content = data.settings;
    } else {
      content =  [{type:'404',title:'404 Error'}];
    }

    return content;
  },

  getPostBySlugs: function( slugs ) {
    var post;

    if ( slugs.length > 1 && ( slugs[0] === 'posts' || slugs[0] === 'blog' ) ) {
      post = model.getPostBySlug( slugs[1], 'posts' );
    } else if ( slugs.length > 1 && slugs[0] === 'settings' ) {
      post = model.getPostBySlug( slugs[1], 'settings' );
    } else {
      if( slugs[0] === '') slugs[0] = 'home';
      post = model.getPostBySlug( slugs[0], 'pages');
    }
    return post;
  },

  getPostBySlug: function( slug, postType ){
    // Get contet from local storage
    var data = model.getLocalStore(),
        content,
        item;

    if ( postType === 'posts' ) {
      content = data.posts;
    } else if ( postType === 'pages' ) {
      content = data.pages;
    } else if ( postType === 'settings' ) {
      content = data.settings;
    } else {
      content =  [{type:'404',title:'404 Error'}];
    }

    item = content.filter( function( obj ) {
      return obj.slug == slug;
    });
    return item[0];
  },

  getCurrentContentObj: function() {
    var newPageSlugs = helpers.getAfterHash(),
        post;

    if ( newPageSlugs.length > 1 ) {
      post = model.getPostBySlug( newPageSlugs[1], 'posts' );
    } else {
      if ( newPageSlugs[0] === '' ) newPageSlugs[0] = 'home';
      post = model.getPostBySlug( newPageSlugs[0], 'pages' );
    }
    return post;
  },

  getLocalStore: function() {
    var store = JSON.parse( localStorage.getItem( 'vanillaPress' ) );
    if( store === null ) {
      store = [''];
    }
    return store[0];
  },

  updateLocalStore: function(store) {
    var newStore = [ store ];
    localStorage.setItem( 'vanillaPress', JSON.stringify( newStore ) );
  },
  removeLocalStore: function() {
    localStorage.removeItem( 'vanillaPress' );
  }
};

module.exports = model;
