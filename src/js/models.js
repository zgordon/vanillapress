
function getContent(type) {
  var content;
  switch (type) {
    case "posts":
      content = Posts;
      break;
    case "pages":
      content = Pages;
      break;
    case "settings":
      content = Settings;
      break;
    default:
      content =  [{type:"404",title:"404 Error"}];
  }
  return content;
}

function getContentBySlug(slug, contentType){
  var content;
  switch (contentType) {
    case "posts":
      content = Posts;
      break;
    case "pages":
      content = Pages;
      break;
    case "settings":
      content = Settings;
      break;
    default:
      content =  [{type:"404",title:"404 Error"}];
  }
  var item = content.filter( function( obj ) {
    return obj.slug == slug;
  });
  return item[0];
}
