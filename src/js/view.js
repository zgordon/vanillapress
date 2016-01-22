var helpers = require( "./lib/helpers.js" );
var model = require( "./model.js" );

var view = {
  init: function() {
    view.listenMainNavLinksUpdatePage();
    view.loadMainHeader();
  },
  currentPost: "",
  listenMainNavLinksUpdatePage: function() {
    var mainNav = document.getElementById("mainNav");
    var links = mainNav.getElementsByTagName("a");
    for(var i = 0, len = links.length; i < len; i++) {
      links[i].addEventListener("click", view.mainNavControl, false);
      links[i].removeEventListener("click", view.disableNav);
    }
  },
  listenDisableMainNavLinks: function() {
    var links = helpers.getMainNavLinks();
    for(var i = 0, len = links.length; i < len; i++) {
      links[i].removeEventListener("click", view.mainNavControl);
      links[i].addEventListener("click", view.disableNav, false);
    }
  },
  mainNavControl: function() {
    var newPageSlugs = helpers.getAfterHash(this.href);
    var post = model.getPostBySlugs(newPageSlugs);
    view.currentPost = post;
    view.update();
  },
  update: function() {
    // var urlSegments = helpers.getAfterHash(this);
    // console.log(this + " " + view.currentPost.title);
    // //view.updateCurrentNav();
    view.removeBlogPosts();
    view.updateTitle( view.currentPost.title );
    view.updateContent( view.currentPost.content );
    if(view.currentPost.slug === "blog") {
      view.loadBlogPosts();
    }
  },
  push: function(post) {
    router.updateHash(post);
    view.updateTitle( post.title );
    view.updateContent( post.content );
  },
  loadMainHeader: function() {
    var siteName = model.getPostBySlug("site-name", "settings");
    var siteDescription = model.getPostBySlug("site-description", "settings");
    view.updateSiteName(siteName.content);
    view.updateSiteDescription(siteDescription.content);
  },
  updateSiteName: function(content) {
    var siteName = helpers.getSiteName();
    siteName.innerHTML = content;
  },
  updateSiteDescription: function(content) {
    var siteDescription = helpers.getSiteDescription();
    siteDescription.innerHTML = content;
  },
  updateTitle: function(title) {
    var titleEl = document.getElementById("pageTitle");
    titleEl.innerHTML = title;
  },
  updateContent: function(content) {
    var contentEl = document.getElementById("pageContent");
    contentEl.innerHTML = content;
  },
  loadBlogPosts: function() {
    var posts = model.getContent("post");
    var postContent = document.createElement("section");
    postContent.id = "blogPosts";
    //var postContent = helpers.createPostMarkup(posts[0]);
    for (var i = 0; i < posts.length; i++) {
      postContent.appendChild(helpers.createPostMarkup(posts[i]));
    }
    var primaryContentEL = helpers.getPrimaryContentEl();
    primaryContentEL.appendChild(postContent);

  },
  removeBlogPosts: function(){
    var blogPost = document.getElementById("blogPosts");
    if(blogPost) blogPost.remove();    
  },
  disableNav: function(){
    event.preventDefault();
  }
};
module.exports = view;
