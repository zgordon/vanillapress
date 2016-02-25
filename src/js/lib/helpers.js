(function() {

'use strict';

Array.prototype.isArray = true;
const _ = require( 'underscore' ),
    h = {

  getAfterHash ( url ) {
    let urlSegments = [],
        pageUrl;

    url = url || '';

    if( url !== '' ) {
      url = url.substring( url.indexOf( '#' ) + 1 );
      urlSegments = url.split( '/' );
    } else {
      pageUrl = window.location.hash.substr( 1 );
      urlSegments = pageUrl.split( '/' );
    }

    return urlSegments;
  },

<<<<<<< HEAD
  addMenuItems ( menuItems, postType ) {
     _.map( menuItems, ( item ) => {
       let link = h.createLink( item.title, postType, item.slug );
       h.addMenuItem( link );
     });
=======
  addMenuItems: function( menuItems, postType ) {
    menuItems.forEach( function( item ){

      var a = helpers.createLink( item.title, postType, item.slug );
      helpers.addMenuItem( a );

    });
>>>>>>> v1
  },

  addMenuItem ( menuItem ) {
    let ul = document.querySelector( '#editor nav#secondary ul' ),
        li = document.createElement( 'li' );

    li.appendChild( menuItem );
    ul.appendChild( li );
  },

  createLink ( text, postType, slug ) {
    const linkText = document.createTextNode( text );
    let link = document.createElement( 'a' );


<<<<<<< HEAD
    link.appendChild( linkText );

    if ( postType === 'posts' ) {
      link.href = '/blog/' + slug + '/';
    } else if ( postType === 'settings' ) {
      link.href = '/settings/' + slug + '/';
=======
    if ( 'posts' === postType  ) {
      a.href = '#blog/' + slug;
    } else if ( 'settings' === postType ) {
      a.href = '#settings/' + slug;
>>>>>>> v1
    } else {
      link.href = '/' + slug + '/';
    }

    return link;
  },

  createPostMarkup ( post ) {
    const title = document.createTextNode( post.title );
    let articleEl = document.createElement( 'article' ),
        titleEl = document.createElement( 'h3' ),
        titleLink = document.createElement( 'a' ),
        contentDiv,
        excerpt;

    titleLink.appendChild( title );
    titleLink.href = '/blog/' + post.slug + '/';
    titleEl.appendChild( titleLink );

    contentDiv = document.createElement( 'div' );
    console.log( post );
    excerpt = post.content;

    if ( excerpt.length > 100 ) {
      excerpt = excerpt.substr( 0, 60 ) + '\u2026';
    }

    contentDiv.innerHTML = excerpt;

    articleEl.appendChild( titleEl );
    articleEl.appendChild( contentDiv );

    return articleEl;
  },

  getEditorEl () {
    return document.getElementById( 'editor' );
  },

  getEditorToggleEl () {
    return document.getElementById( 'editorToggle' );
  },

  getEditorToggleLink () {
    return document.querySelector( '#editorToggle a' );
  },

  getEditorNavs () {
    var editorEl = h.getEditorEl();
    return editorEl.getElementsByTagName( 'nav' );
  },

  getEditorPrimaryNav () {
    return document.querySelector( '#editor nav#primary' );
  },

  getEditorPrimaryNavLinks () {
    let primaryNav = h.getEditorPrimaryNav();
    return primaryNav.getElementsByTagName( 'a' );
  },

  getEditorSecondaryNav () {
    return document.querySelector( '#editor nav#secondary' );
  },

  getEditorSecondaryNavUl () {
    let secondaryNav = h.getEditorSecondaryNav();
    return secondaryNav.querySelector( 'ul' );
  },

  getEditorAddNewPost () {
    return document.querySelector( '#editor #addNew a' );
  },

  getDeletePostLink () {
    return document.querySelector( '#deletePost a' );
  },

  getCurrentNavEl ( currentMenu ) {
    let nav;

    if ( currentMenu === 'edit' ) {
      nav = h.getEditorEditNav();
    } else if ( currentMenu === 'secondary' ) {
      nav = h.getEditorSecondaryNav();
    } else {
      nav = h.getEditorPrimaryNav();
    }

    return nav;
  },

  getEditorEditNav () {
    return document.querySelector( '#editor nav#edit' );
  },

  getEditorHomeLinkEl ( currentMenu ) {
    let currentNav = h.getCurrentNavEl( currentMenu );
    return currentNav.querySelector( 'h3 .go-home' );
  },

  getEditorNavTitleEl ( currentMenu ) {
    let currentNav = h.getCurrentNavEl( currentMenu );
    return currentNav.querySelector( 'h3 span' );
  },

  getEditorNavTitleLink () {
    let editNav = h.getEditorEditNav();
    return editNav.querySelector( 'h3 span a' );
  },

  getEditorTitleField () {
    return document.getElementById( 'editTitle' );
  },

<<<<<<< HEAD
  slugifyTitle ( title ) {
    return title.trim()
                .replace(/[^a-zA-Z0-9\s]/g,"")
                .toLowerCase()
                .replace(/\s/g,'-');
=======
  slugifyTitle: function( title ) {
    var slug = title.trim();

    slug = slug.replace(/[^a-zA-Z0-9\s]/g,"");
    slug = slug.toLowerCase();
    slug = slug.replace(/\s/g,'-');

    return slug;
>>>>>>> v1
  },

  getEditorWysiwyg () {
    let editNav = h.getEditorEditNav();
    return editNav.querySelector( 'form iframe' );
  },

  getEditorForm () {
    let editNav = h.getEditorEditNav();
    return editNav.querySelector( 'form' );
  },

<<<<<<< HEAD
  getEditorEditUpdateBtn () {
    return document.getElementById( 'editUpdateBtn' );
=======
  getEditorEditUpdateBtn: function() {
    return document.getElementById( 'editUpdateBtn' );

  },

  getViewEl: function() {
    return document.getElementById( 'view' );
  },

  getViewLinks: function() {
    return document.querySelectorAll( '#view a' );
>>>>>>> v1
  },

  getSiteName () {
    let siteName = document.getElementById( 'siteName' );
    return siteName.querySelector( 'a' );
  },

  getSiteDescription () {
    return document.getElementById( 'siteDesription' );
  },

  getMainNavEl () {
    return document.getElementById( 'mainNav' );
  },

  getMainNavLinks () {
    let mainNav = document.getElementById( 'mainNav' );
    return mainNav.getElementsByTagName( 'a' );
  },

  getPostTitle () {
    return document.getElementById( 'pageTitle' );
  },

  getPrimaryContentEl (){
    return document.querySelector( '#view .content .primary' );
  }

};

module.exports = h;

}());
