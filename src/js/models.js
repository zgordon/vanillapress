var data = require( "./data.js" );
var helpers = require( "./lib/helpers.js" );
//console.log(data[2]);
var models = {
  getContent: function(type) {
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
  }
}

module.exports = models;
