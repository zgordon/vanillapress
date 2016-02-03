/**
 * Contains the properties and methods for the editor.
 *
 * @exports editor
 */

var Spinner = require( 'spin.js' ),
    helpers = require( './lib/helpers.js' ),
    router = require( './router.js' ),
    model = require( './model.js' ),
    view = require( './view.js' ),
    wysiwygEditor = require('wysiwyg'),
    wysiwyg;

/**
 * Main editor panel.
 *
 * @namespace
 */
var editor = {
  init: function() {
    editor.listenEditorToggle();
  },

  visible: 'false',
  currentMenu: 'edit',
  currentPost: '',
  currentPostType: '',


  /**
   * Listener for Admin link in editor.
   * Clears menus and shows primary menu.
   *
   */
  listenAdminHomeLink: function(){
    editor.clearMenus();
    editor.showPrimaryMenu();
    event.preventDefault();
  },


  /**
   * Listeners for links in the primary menu
   * Loads seconday menu
   *
   */
  listenPrimaryLinks: function() {
    var urlSegments = helpers.getAfterHash( this.href );
    var currentPost = urlSegments[0].substring( 0, urlSegments[0].length - 1 );
    editor.currentPostType = currentPost;
    editor.clearMenus();
    editor.showSecondaryMenu();
    event.preventDefault();
  },


  /**
   * Listener for post type link in editor
   * (i.e. Posts, Pages, Settings).
   * Loads secondary menu.
   *
   */
  listenSecondaryNavTitle: function(){
    editor.clearMenus();
    editor.showSecondaryMenu();
    event.preventDefault();
  },


  /**
   * Listener to load the post edit field.
   *
  */
  listenLoadEditForm: function(){
    editor.clearMenus();
    var slugs = helpers.getAfterHash( this.href );
    var post = model.getPostBySlugs( slugs );
    editor.currentPost = post;
    editor.currentPostType = post.type;

    if ( editor.currentPostType !== 'setting' ) {
      view.currentPost = post;
      view.update();
    } else {
      event.preventDefault();
    }

    editor.showEditPanel();
  },


  /**
   * Listener to the new post field
   *
   */
  listenLoadNewPostForm: function(){
    var post = {slug: '_new',title:'',content:''},
        updateBtn = helpers.getEditorEditUpdateBtn();

    editor.clearMenus();
    editor.currentPost = post;

    if ( editor.currentPostType !== 'setting' ) {
      view.currentPost = post;
      view.update();
    } else {
      event.preventDefault();
    }

    editor.showEditPanel();
    updateBtn.innerText = 'Save';
  },


  /**
   * Listener for the editor toggle button
   *
   */
  listenEditorToggle: function(){
    var editorToggleEl = helpers.getEditorToggleLink();
    editorToggleEl.addEventListener( 'click', function(){
      editor.toggle();
      event.preventDefault();
    }, false );
  },


  /**
   * Listener to update content from the post add / edit
   * form.
   *
   * @todo Make sure url slug is unique
   */
  listenUpdatePost: function() {
    var newPost = false,
        postType = editor.currentPostType,
        store = model.getLocalStore(),
        localStore = model.getLocalStore(),
        storePosts;

    event.preventDefault();

    // If new post add to local store
    if( editor.currentPost.slug === '_new' ) {
      var postIds = [],
          highestId;

      newPost = true;
      editor.currentPost.type = 'post';

      // Slugify title
      editor.currentPost.slug = helpers.slugifyTitle( editor.currentPost.title );

      // Get a new post id
      localStore = localStore.posts;
      localStore.forEach(function( post ) {
        postIds.push( Number( post.id ) );
      });
      highestId = Math.max.apply( Math, postIds );
      editor.currentPost.id = highestId + 1;

      // Set the date
      editor.currentPost.date = Date();
      editor.currentPost.modified = Date();
    }

    // Get temp store of posts based on type
    if ( postType === 'post' ) {
      storePosts = store.posts;
    } else if ( postType === 'page' ) {
      storePosts = store.pages;
    } else {
      storePosts = store.settings;
    }

    // Get the current item to edit from store.
    if ( newPost === true ) {
      storePosts.push( editor.currentPost );
    } else {
      storePosts.forEach(function( item ){
        if( editor.currentPost.id == item.id ){
          item.title = editor.currentPost.title;
          item.content = editor.currentPost.content;
          item.modified = Date();
        }
      });
    }

    // Add temp store data back
    if ( postType === 'post' ) {
      store.posts = storePosts;
    } else if ( postType === 'page' ) {
      store.pages = storePosts;
    } else {
      store.settings = storePosts;
    }
    model.updateLocalStore( store );

    // Update url and current post
    if ( postType === 'post' ) {
      router.updateHash( 'blog/' + editor.currentPost.slug );
    } else if ( postType === 'page' ) {
      router.updateHash( editor.currentPost.slug );
    } else {

    }

    view.update();
    editor.updateSaveBtnText();
  },


  /**
   * Listener to delete post
   *
   */
  listenDeletePost: function(){
    var store = model.getLocalStore(),
        storePosts = store.posts,
        confirmation = confirm('Are you sure you want to delete this post?'),
        deleteId,
        deleteIdIndex;

    // Get the index of the item to delete from store
    for ( var i = 0, max = storePosts.length; i < max ; i++) {
      if ( editor.currentPost.id === storePosts[i].id ) {
        deleteIdIndex = i;
      }
    }

    // Only procude with delete if confirmation
    if ( confirmation === true ) {
      // Remove item from store
      storePosts.splice( deleteIdIndex, 1 );
      store.posts = storePosts;
      model.updateLocalStore( store );

      // Update current post to empty, show blog posts
      editor.currentPost = {};
      view.currentPost = model.getPostBySlug( 'blog', 'pages' );
      view.update();
      editor.clearMenus();
      editor.showSecondaryMenu();
    }

    event.preventDefault();
  },


  /**
   * Displays the primary menu.
   *
   */
  showPrimaryMenu: function(){
    var primaryNav = helpers.getEditorPrimaryNav(),
        primaryLinks = helpers.getEditorPrimaryNavLinks();

    primaryNav.classList.add( 'active' );

    // Add event listeners to primary links
    for ( var i = 0, max = primaryLinks.length; i < max; i++ ) {
      primaryLinks[i].addEventListener(
        'click',
        editor.listenPrimaryLinks,
        false
      );
    }
    editor.currentMenu = 'primary';
  },

  /**
   * Displays the secondary menu
   *
   */
  showSecondaryMenu: function(){
    var secondaryNav = helpers.getEditorSecondaryNav(),
        postType = editor.currentPostType,
        menuItems = model.getPostsByType( postType ),
        secondaryUl =  helpers.getEditorSecondaryNavUl(),
        secondaryLinks = secondaryUl.getElementsByTagName( 'a' ),
        addNewPostLink = helpers.getEditorAddNewPost(),
        deletePostLink = helpers.getDeletePostLink();

    // Display secondary menu
    secondaryNav.classList.add( 'active' );
    editor.currentMenu = 'secondary';
    editor.updateNavTitle();
    console.log( menuItems );
    helpers.addMenuItems( menuItems, postType );

    // Add listeners to secondary links
    for ( var i = 0, max = secondaryLinks.length; i < max; i++ ) {
      secondaryLinks[i].addEventListener(
        'click',
        editor.listenLoadEditForm,
        false);
    }

    // Check to see if should add new post button
    if ( editor.currentPostType === 'post' ) {
      addNewPostLink.classList.remove('hidden');
    } else {
      addNewPostLink.classList.add('hidden');
    }

    // Add listener to new post link
    addNewPostLink.addEventListener(
      'click',
      editor.listenLoadNewPostForm,
      false
    );
  },

  /**
   * Displays the edit post panel
   *
   */
  showEditPanel: function() {
    var post = editor.currentPost,
        editNav = helpers.getEditorEditNav(),
        editForm = helpers.getEditorForm(),
        deleteBtn = helpers.getDeletePostLink();

    // Display the edit panel and form
    editor.clearEditForm();
    editNav.classList.toggle('active');
    editor.currentMenu = 'edit';
    editor.updateNavTitle();
    editor.fillEditForm();

    // Add event listener to update post
    editForm.addEventListener(
      'submit',
      editor.listenUpdatePost,
      false
    );
    // Add event listener to delete post
    deleteBtn.addEventListener(
      'click',
      editor.listenDeletePost,
      false
    );
  },

  /**
   * Dynamically fill the edit post form based on the
   * current post.
   *
   */
  fillEditForm: function() {
    var post = editor.currentPost,
        editTitle = document.getElementById('editTitle'),
        postTitle = helpers.getPostTitle(),
        titleField = helpers.getEditorTitleField();

    // Update the title and content fields
    editTitle.value = post.title;
    editContent.value = post.content;

    // Initialize the wysiwyg editor
    wysiwyg = wysiwygEditor(document.getElementById('editContent'));

    //  Add listeners to update the view on field changes
    if ( post.type !== 'setting' ) {
      // Actions if not editing a setting
      titleField.addEventListener( 'input', function() {
        editor.currentPost.title = this.value;
        view.updateTitle( this.value );
      }, false);
      wysiwyg.onUpdate( function() {
        view.updateContent( wysiwyg.read() );
        editor.currentPost.content = wysiwyg.read();
      });
    } else {
      // Live update controls for settings
      if (  post.slug === 'site-name' ) {
        wysiwyg.onUpdate(function () {
          view.updateSiteName( wysiwyg.read() );
          editor.currentPost.content = wysiwyg.read();
        });
      } else if( post.slug == 'site-description' ) {
        wysiwyg.onUpdate( function () {
          view.updateSiteDescription( wysiwyg.read() );
          editor.currentPost.content = wysiwyg.read();
        });
      } else {

      }
    }
  },

  /**
   * Clears the edit form.
   * Must call before loading data to form.
   *
   */
  clearEditForm: function() {
    var editTitle = document.getElementById( 'editTitle' ),
        wysiwyg = helpers.getEditorWysiwyg();

    // Set the edit fields blank
    editTitle.value = '';
    editContent.value = '';
    // Remove the wysiwyg editor
    if ( wysiwyg !== null ) {
      wysiwyg.remove();
    }
  },

  /**
   * Clears the current menu.
   * Must call before loading a menu.
   *
   */
  clearMenus: function(){
    var navs = helpers.getEditorNavs(),
        navUl = helpers.getEditorSecondaryNavUl(),
        navlinks = navUl.getElementsByTagName( 'a' );

    // Remove active class from all navs
    for ( var j = 0, max = navs.length; j < max; j++ ) {
      var nav = navs[j];
      nav.classList.remove( 'active' );
    }

    // Remove event listeners from all previous nav links
    for ( var i = 0, navMax = navlinks.length; i < navMax; i++ ) {
      navlinks[i].removeEventListener(
        'click',
        editor.refreshMenu,
        false
      );
    }

    // Remove all list items from secondary nav ul tag
    while ( navUl.firstChild ) {
      navUl.removeChild( navUl.firstChild );
    }

  },


  /**
   * Main control for the editor toggle.
   *
   */
  toggle: function() {
    var editorEl = helpers.getEditorEl(),
        toggleEl = helpers.getEditorToggleEl(),
        mainNav = helpers.getMainNavEl();

    // Clear menus and load edit panel
    editor.clearMenus();
    editor.currentPost = view.currentPost;
    editor.currentPostType = view.currentPost.type;
    editor.currentMenu = 'edit';

    // Toggle editor and nav hidden classes
    editorEl.classList.toggle('hidden');
    toggleEl.classList.toggle('hidden');
    // Toggle whether view nav is disabled
    mainNav.classList.toggle('inactive');

    // Take specific actions if opening or closing editor
    if ( toggleEl.classList.contains( 'hidden' ) === false ) {
      // If opening editor
      var navTitleLink = helpers.getEditorNavTitleLink();
      editor.showEditPanel();
      navTitleLink.addEventListener(
        'click',
        editor.listenSecondaryNavTitle,
        false
      );
      view.listenDisableMainNavLinks();
    } else {
      // If closing editor
      if ( view.currentPost.type === 'post' ) {
        router.updateHash( 'blog/' + view.currentPost.slug );
      } else {
        router.updateHash( view.currentPost.slug );
      }
      view.listenMainNavLinksUpdatePage();
    }

  },

  /**
   * Update the editor breadcrumb navigation
   * (i.e. Admin / Posts, Admin / Pages, Admin / Settings, etc. )
   *
   */
  updateNavTitle: function() {
    var postType = editor.currentPostType,
        currentMenu = editor.currentMenu,
        homeLink = helpers.getEditorHomeLinkEl( currentMenu );

    // Add event listener to Admin home link
    homeLink.addEventListener(
      'click',
      editor.listenAdminHomeLink,
      false
    );

    // Add secondary link based on current nav and post type
    if( currentMenu === 'secondary' ) {
      // If on secondary nav
      var navTitleEl = helpers.getEditorNavTitleEl( currentMenu );
      navTitleEl.innerHTML = postType + 's';
    } else {
      // If editing post
      var navTitleLink = helpers.getEditorNavTitleLink();
      navTitleLink.textContent = postType + 's';
      navTitleLink.addEventListener(
        'click',
        editor.listenSecondaryNavTitle,
        false
      );
    }

  },

  /**
   * Saves post in edit form.
   * Mimics live updating text: "Saving, Saved!"
   *
   */
  updateSaveBtnText: function() {
    var btn = helpers.getEditorEditUpdateBtn(),
        finalText = 'Udpate',
        savedText = 'Saved!',
        spinnerOpts = {
          color:'#fff',
          lines: 8,
          length: 4,
          radius: 3,
          width: 1,
          left: '10%'
        },
        spinner = new Spinner( spinnerOpts )
                        .spin( btn ),
        // Displays save text
        saving = function() {
          setTimeout( function () {
            spinner.stop();
            btn.innerText = savedText;
            saved();
          }, 900 );
        },
        // Displays final text
        saved = function(){
          setTimeout( function () {
            btn.innerText = finalText;
          }, 1000 );
        };

    // Update btn text and start saving
    btn.innerText = 'Saving...';
    saving();
  }
};

module.exports = editor;
