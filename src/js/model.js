var data = require( "./data.js" );
var helpers = require( "./lib/helpers.js" );

var model = {
  getContent: function(type) {
    type = type + "s";
    var content;
    switch (type) {
      case "posts":
        content = data[0];
        break;
      case "pages":
        content = data[1];
        break;
      case "settings":
        content = data[2];
        break;
      default:
        content =  [{type:"404",title:"404 Error"}];
    }
    return content;
  },
  getCurrentContentObj: function() {
    var newPageSlugs = helpers.getAfterHash();
    var pageContent;
    if( newPageSlugs.length > 1 ) {
      pageContent = model.getContentBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      pageContent = model.getContentBySlug(newPageSlugs[0], 'pages');
    }
    return pageContent;
  },
  getContentBySlug: function(slug, contentType){
    var content;
    switch (contentType) {
      case "posts":
        content = data[0];
        break;
      case "pages":
        content = data[1];
        break;
      case "settings":
        content = data[2];
        break;
      default:
        content =  [{type:"404",title:"404 Error"}];
    }
    var item = content.filter( function( obj ) {
      return obj.slug == slug;
    });
    return item[0];
  },

  save: function(content) {

  }
};

module.exports = model;
