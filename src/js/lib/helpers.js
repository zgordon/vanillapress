Array.prototype.isArray = true;

var helpers = {

  getAfterHash: function( url ) {
    url = url || '';
    var urlSegments = [];

    if( url !== '' ) {
      url = url.substring( url.indexOf( '#' ) + 1 );
      urlSegments = url.split( '/' );
    } else {
      var pageUrl = window.location.hash.substr( 1 );
      urlSegments = pageUrl.split( '/' );
    }

    return urlSegments;
  },

  addMenuItems: function( menuItems, contentType ) {
    menuItems.forEach( function( item ){

      var a = helpers.createLink( item.title, contentType, item.slug );
      helpers.addMenuItem( a );

    });
  },

  addMenuItem: function( menuItem ) {
    var ul = document.querySelector( '#editor nav#secondary ul' ),
        li = document.createElement( 'li' );

    li.appendChild( menuItem );
    ul.appendChild( li );
  },

  createLink: function( text, postType, slug ) {
    var a = document.createElement( 'a' ),
        aText = document.createTextNode( text );

    a.appendChild( aText );

    if ( postType === 'post' ) {
      a.href = '#blog/' + slug;
    } else if ( postType === 'setting' ) {
      a.href = '#settings/' + slug;
    } else {
      a.href = '#' + slug;
    }

    return a;
  },

  createPostMarkup: function( post ) {
    var articleEl = document.createElement( 'article' ),
        titleEl = document.createElement( 'h3' ),
        titleLink = document.createElement( 'a' ),
        title = document.createTextNode( post.title ),
        contentDiv,
        excerpt;

    titleLink.appendChild( title );
    titleLink.href = '#blog/' + post.slug;
    titleEl.appendChild( titleLink );

    contentDiv = document.createElement( 'div' );
    excerpt = post.content;

    if ( excerpt.length > 100 ) {
      excerpt = excerpt.substr( 0, 60 ) + '\u2026';
    }

    contentDiv.innerHTML = excerpt;

    articleEl.appendChild( titleEl );
    articleEl.appendChild( contentDiv );

    return articleEl;
  },

  getEditorEl: function() {
    return document.getElementById( 'editor' );
  },

  getEditorToggleEl: function() {
    return document.getElementById( 'editorToggle' );
  },

  getEditorToggleLink: function() {
    return document.querySelector( '#editorToggle a' );
  },

  getEditorNavs: function() {
    var editorEl = helpers.getEditorEl(),
        navs = editorEl.getElementsByTagName( 'nav' );
    return  navs;
  },

  getEditorPrimaryNav: function() {
    return  document.querySelector( '#editor nav#primary' );
  },

  getEditorPrimaryNavLinks: function() {
    var primaryNav = helpers.getEditorPrimaryNav();
    return  primaryNav.getElementsByTagName( 'a' );
  },

  getEditorSecondaryNav: function() {
    return  document.querySelector( '#editor nav#secondary' );
  },

  getEditorSecondaryNavUl: function() {
    var secondaryNav = helpers.getEditorSecondaryNav();
    return  secondaryNav.querySelector( 'ul' );
  },

  getEditorAddNewPost: function() {
    return  document.querySelector( '#editor #addNew a' );
  },

  getDeletePostLink: function() {
    return document.querySelector( '#deletePost a' );
  },

  getCurrentNavEl: function( currentMenu ) {
    var nav;

    if ( currentMenu === 'edit' ) {
      nav = helpers.getEditorEditNav();
    } else if ( currentMenu === 'secondary' ) {
      nav = helpers.getEditorSecondaryNav();
    } else {
      nav = helpers.getEditorPrimaryNav();
    }

    return nav;
  },

  getEditorEditNav: function() {
    return  document.querySelector( '#editor nav#edit' );
  },

  getEditorHomeLinkEl: function( currentMenu ) {
    var nav = helpers.getCurrentNavEl( currentMenu );
    return nav.querySelector( 'h3 .go-home' );
  },

  getEditorNavTitleEl: function( currentMenu ) {
    var nav = helpers.getCurrentNavEl( currentMenu );
    return nav.querySelector( 'h3 span' );
  },

  getEditorNavTitleLink: function() {
    var editNav = helpers.getEditorEditNav();
    return editNav.querySelector( 'h3 span a' );
  },

  getEditorTitleField: function() {
    return document.getElementById( 'editTitle' );
  },

  slugifyTitle: function( title ) {
    var slug = title;

    slug = slug.replace(/[^a-zA-Z0-9\s]/g,"");
    slug = slug.toLowerCase();
    slug = slug.replace(/\s/g,'-');

    return slug;
  },

  getEditorWysiwyg: function() {
    var editNav = helpers.getEditorEditNav();
    return editNav.querySelector( 'form iframe' );
  },

  getEditorForm: function() {
    var editNav = helpers.getEditorEditNav();
    return editNav.querySelector( 'form' );
  },

  getEditorEditUpdateBtn: function() {
    var editBtn = document.getElementById( 'editUpdateBtn' );
    return editBtn;
  },

  getSiteName: function() {
    var siteNameEl = document.getElementById( 'siteName' );
    return siteNameEl.querySelector( 'a' );
  },

  getSiteDescription: function() {
    return document.getElementById( 'siteDesription' );
  },

  getMainNavEl: function() {
    var mainNavEl = document.getElementById( 'mainNav' );
    return mainNavEl;
  },

  getMainNavLinks: function() {
    var mainNav = document.getElementById( 'mainNav' ),
        links = mainNav.getElementsByTagName( 'a' );
    return links;
  },

  getPostTitle: function() {
    var titleEl = document.getElementById( 'pageTitle' );
    return titleEl;
  },

  getPrimaryContentEl: function(){
    var primaryContentEL = document.querySelector( '#view .content .primary' );
    return primaryContentEL;
  }

};

module.exports = helpers;
