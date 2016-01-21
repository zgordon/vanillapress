Array.prototype.isArray = true;

var helpers = {

  getAfterHash: function(url) {
    url = url || null;
    var urlSegments = [""];
    if( url !== null ) {
      url = url.substring(url.indexOf('#')+1);
      urlSegments = url.split("/");
    } else {
      var pageUrl = window.location.hash.substr(1);
      urlSegments = pageUrl.split("/");
    }
    return urlSegments;
  },

  addMenuItems: function(menuItems, contentType) {
    menuItems.forEach(function(item){
      var a = helpers.createLink(item.title, contentType, item.slug);
      helpers.addMenuItem(a);
    });
  },

  addMenuItem: function(menuItem) {
    var ul = document.querySelector("#editor nav#secondary ul");
    var li = document.createElement("li");
    li.appendChild(menuItem);
    ul.appendChild(li);
  },

  createLink: function(text, postType, slug) {
    var a = document.createElement('a');
    var aText = document.createTextNode(text);
    a.appendChild(aText);
    switch (postType) {
      case "post":
        a.href = "#blog/" + slug;
        break;
      case "setting":
        a.href = "#settings/" + slug;
        break;
      default:
        a.href = "#" + slug;
    }
    return a;
  },

  getEditorEl: function() {
    return document.getElementById("editor");
  },

  getEditorToggleEl: function() {
    return document.getElementById("editorToggle");
  },

  getEditorToggleLink: function() {
    return document.querySelector("#editorToggle a");
  },

  getEditorPrimaryNav: function() {
    return  document.querySelector("#editor nav#primary");
  },

  getEditorPrimaryNavLinks: function() {
    var primaryNav = helpers.getEditorPrimaryNav();
    return  primaryNav.getElementsByTagName("a");
  },

  getEditorSecondaryNav: function() {
    return  document.querySelector("#editor nav#secondary");
  },

  getEditorSecondaryNavUl: function() {
    var secondaryNav = helpers.getEditorSecondaryNav();
    return  secondaryNav.querySelector("ul");
  },

  getEditorEditNav: function() {
    return  document.querySelector("#editor nav#edit");
  },

  getEditorHomeLinkEl: function(currentMenu) {
    var nav;
    switch (currentMenu) {
      case "edit":
        nav = helpers.getEditorEditNav();
        break;
      case "secondary":
        nav = helpers.getEditorSecondaryNav();
        break;
      default:
        nav = helpers.getEditorPrimaryNav();
    }
    return nav.querySelector("h3 .go-home");
  },

  getEditorNavTitleEl: function(currentMenu) {
    var nav;
    switch (currentMenu) {
      case "edit":
        nav = helpers.getEditorEditNav();
        break;
      case "secondary":
        nav = helpers.getEditorSecondaryNav();
        break;
      default:
        nav = helpers.getEditorPrimaryNav();
    }
    return nav.querySelector("h3 span");
  },

  getEditorNavTitleLink: function() {
      var editNav = helpers.getEditorEditNav();
      return editNav.querySelector("h3 span a");
  },

  getEditorTitleField: function() {
    return document.getElementById("editTitle");
  },

  getEditorWysiwyg: function() {
    var editNav = helpers.getEditorEditNav();
    return editNav.querySelector("form iframe");
  },

  getEditorForm: function() {
    var editNav = helpers.getEditorEditNav();
    return editNav.querySelector("form");
  },

  getEditorEditUpdateBtn: function() {
    return document.getElementById("editUpdateBtn");
  },

  getSiteName: function() {
    siteNameEl = document.getElementById("siteName");
    return siteNameEl.querySelector("a");
  },

  getSiteDescription: function() {
    return document.getElementById("siteDesription");
  },

  getMainNavEl: function() {
    var mainNavEl = document.getElementById("mainNav");
    return mainNavEl;
  },

  getMainNavLinks: function() {
    var mainNav = document.getElementById("mainNav");
    var links = mainNav.getElementsByTagName("a");
    return links;
  },

  getPostTitle: function() {
    var titleEl = document.getElementById("pageTitle");
    return titleEl;
  }

};

module.exports = helpers;
