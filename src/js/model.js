var data = require( "./data.js" );
var jsonData = require( "./json.js" );
var helpers = require( "./lib/helpers.js" );

var model = {
  init: function() {
    var localStore = model.getLocalStore();
    if(typeof localStore === "undefined" || localStore === null | localStore === "") {
      localStorage.setItem('vanillaPress', JSON.stringify(jsonData) );
      localStore = model.getLocalStore();
    }
  },
  getContent: function(type) {
    var data = model.getLocalStore();
    type = type + "s";
    switch (type) {
      case "posts":
        content = data.posts;
        break;
      case "pages":
        content = data.pages;
        break;
      case "settings":
        content = data.settings;
        break;
      default:
        content =  [{type:"404",title:"404 Error"}];
    }
    return content;
  },
  getPostBySlugs: function(slugs) {
    var post;
    if( slugs.length > 1 && (slugs[0] == "posts" || slugs[0] == "blog")) {
      post = model.getPostBySlug(slugs[1], 'posts');
    } else if(slugs.length > 1 && slugs[0] == "settings"){
      post = model.getPostBySlug(slugs[1], 'settings');
    } else {
      if( slugs[0] === "") slugs[0] = "home";
      post = model.getPostBySlug(slugs[0], 'pages');
    }
    return post;
  },
  getPostBySlug: function(slug, contentType){
    //get contet from local storage
    var data = model.getLocalStore();
    var content;
    switch (contentType) {
      case "posts":
        content = data.posts;
        break;
      case "pages":
        content = data.pages;
        break;
      case "settings":
        content = data.settings;
        break;
      default:
        content =  [{type:"404",title:"404 Error"}];
    }
    var item = content.filter( function( obj ) {
      return obj.slug == slug;
    });
    return item[0];
  },
  getCurrentContentObj: function() {
    var newPageSlugs = helpers.getAfterHash();
    var post;
    if( newPageSlugs.length > 1 ) {
      post = model.getPostBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      post = model.getPostBySlug(newPageSlugs[0], 'pages');
    }
    return post;
  },
  getLocalStore: function() {
    var store = JSON.parse(localStorage.getItem('vanillaPress'));
    if(store === null) {
      store = [""];
    }
    return store[0];
  },
  updateLocalStore: function(store) {
    //console.log( JSON.stringify(store) );
    var newStore = [store];
    localStorage.setItem('vanillaPress', JSON.stringify(newStore) );
  },
  removeLocalStore: function() {
    localStorage.removeItem('vanillaPress');
  }
};

module.exports = model;
