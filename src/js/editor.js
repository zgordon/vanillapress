var Spinner = require( 'spin.js' ),
    helpers = require( './lib/helpers.js' ),
    router = require( './router.js' ),
    model = require( './model.js' ),
    view = require( './view.js' ),
    wysiwygEditor = require('wysiwyg'),
    wysiwyg;

var editor = {
  init: function() {
    editor.listenEditorToggle();
  },

  visible: 'false',
  currentMenu: 'edit',
  currentPost: '',
  currentPostType: '',

  listenAdminHomeLink: function(){
    editor.clearMenus();
    editor.showPrimaryMenu();
    event.preventDefault();
  },

  listenPrimaryLinks: function() {
    var urlSegments = helpers.getAfterHash( this.href );
    var currentPost = urlSegments[0].substring( 0, urlSegments[0].length - 1 );
    editor.currentPostType = currentPost;
    editor.clearMenus();
    editor.showSecondaryMenu();
    event.preventDefault();
  },

  listenSecondaryNavTitle: function(){
    editor.clearMenus();
    editor.showSecondaryMenu();
    event.preventDefault();
  },

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

  listenEditorToggle: function(){
    var editorToggleEl = helpers.getEditorToggleLink();
    editorToggleEl.addEventListener( 'click', function(){
      editor.toggle();
      event.preventDefault();
    }, false );
  },

  listenUpdatePost: function() {
    var newPost = false;

    event.preventDefault();

    // If new post
    if( editor.currentPost.slug === '_new' ) {
      var localStore = model.getLocalStore(),
          postIds = [];

      newPost = true;
      editor.currentPost.type = 'post';

      // Slugify title
      editor.currentPost.slug = helpers.slugifyTitle( editor.currentPost.title );

      // Get a new post id
      localStore = localStore.posts;
      localStore.forEach(function( post ) {
        postIds.push( Number( post.id ) );
      });
      var highestId = Math.max.apply( Math, postIds );
      editor.currentPost.id = highestId + 1;

      // Set the date
      editor.currentPost.date = Date();
      editor.currentPost.modified = Date();
    }

    // Get the local store of post type.
    var postType = editor.currentPostType,
        store = model.getLocalStore(),
        storePosts;

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
        }
      });
    }

    //add store data back
    if ( postType === 'post' ) {
      store.posts = storePosts;
    } else if ( postType === 'page' ) {
      store.pages = storePosts;
    } else {
      store.settings = storePosts;
    }

    model.updateLocalStore( store );
    router.updateHash( 'blog/' + editor.currentPost.slug );
    view.currentPost = editor.currentPost;
    view.update();
    editor.updateSaveBtnText();
  },

  listenDeletePost: function(){
    var store = model.getLocalStore(),
        storePosts = store.posts,
        confirmation = confirm('Are you sure you want to delete this post?'),
        deleteId,
        deleteIdIndex;

    for ( var i = 0, max = storePosts.length; i < max ; i++) {
      if ( editor.currentPost.id === storePosts[i].id ) {
        deleteIdIndex = i;
      }
    }

    // Confirm detele
    // Return to posts page
    if ( confirmation === true ) {
      storePosts.splice( deleteIdIndex, 1 );
      store.posts = storePosts;
      model.updateLocalStore( store );
      editor.currentPost = {};
      view.currentPost = model.getPostBySlug( 'blog', 'pages' );
      view.update();
      editor.clearMenus();
      editor.showSecondaryMenu();
    }

    event.preventDefault();
  },

  showCurrentMenu: function(){
    if ( editor.currentMenu === 'primary' ) {
      showPrimaryMenu();
    } else if ( postType === 'secondary' ) {
      showSecondaryMenu();
    } else if ( postType === 'edit' ) {
      showEditPanel();
    } else {
      showPrimaryMenu();
    }
  },

  showPrimaryMenu: function(){
    var primaryNav = helpers.getEditorPrimaryNav(),
        primaryLinks = helpers.getEditorPrimaryNavLinks();

    primaryNav.classList.add( 'active' );
    for ( var i = 0, max = primaryLinks.length; i < max; i++ ) {
      primaryLinks[i].addEventListener(
        'click',
        editor.listenPrimaryLinks,
        false
      );
    }
    editor.currentMenu = 'primary';
  },

  showSecondaryMenu: function(){
    var secondaryNav = helpers.getEditorSecondaryNav(),
        postType = editor.currentPostType,
        menuItems = model.getContent( postType ),
        secondaryUl =  helpers.getEditorSecondaryNavUl(),
        secondaryLinks = secondaryUl.getElementsByTagName( 'a' ),
        addNewPostLink = helpers.getEditorAddNewPost(),
        deletePostLink = helpers.getDeletePostLink();

    secondaryNav.classList.add( 'active' );
    editor.currentMenu = 'secondary';
    editor.updateNavTitle();
    helpers.addMenuItems( menuItems, postType );

    for ( var i = 0, max = secondaryLinks.length; i < max; i++ ) {
      secondaryLinks[i].addEventListener(
        'click',
        editor.listenLoadEditForm,
        false);
    }

    addNewPostLink.addEventListener(
      'click',
      editor.listenLoadNewPostForm,
      false
    );
    deletePostLink.addEventListener(
      'click',
      editor.listenDeletePost,
      false
    );
  },

  showEditPanel: function() {
    var post = editor.currentPost,
        editNav = helpers.getEditorEditNav(),
        editForm = helpers.getEditorForm(),
        deleteBtn = helpers.getDeletePostLink();

    editor.clearEditForm();
    editNav.classList.toggle('active');
    editor.currentMenu = 'edit';
    editor.updateNavTitle();
    editor.fillEditForm();

    editForm.addEventListener(
      'submit',
      editor.listenUpdatePost,
      false
    );
    deleteBtn.addEventListener(
      'click',
      editor.listenDeletePost,
      false
    );
  },

  fillEditForm: function() {
    var post = editor.currentPost,
        editTitle = document.getElementById('editTitle'),
        postTitle = helpers.getPostTitle(),
        titleField = helpers.getEditorTitleField();

    editTitle.value = post.title;
    editContent.value = post.content;

    wysiwyg = wysiwygEditor(document.getElementById('editContent'));

    if ( post.type !== 'setting' ) {
      titleField.addEventListener( 'input', function() {
        editor.currentPost.title = this.value;
        view.updateTitle( this.value );
      }, false);
      wysiwyg.onUpdate( function() {
        view.updateContent( wysiwyg.read() );
        editor.currentPost.content = wysiwyg.read();
      });
    } else {
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
  clearEditForm: function() {
    var editTitle = document.getElementById( 'editTitle' ),
        wysiwyg = helpers.getEditorWysiwyg();

    editTitle.value = '';
    editContent.value = '';
    if ( wysiwyg !== null ) {
      wysiwyg.remove();
    }
  },
  clearMenus: function(){
    var navs = helpers.getEditorNavs(),
        navUl = helpers.getEditorSecondaryNavUl(),
        navlinks = navUl.getElementsByTagName( 'a' );

    // Remove active class from all navs
    for ( var j = 0, max = navs.length; j < max; j++ ) {
      var nav = navs[j];
      nav.classList.remove( 'active' );
    }

    // Remove all children from #editor nav.secondary ul
    while ( navUl.firstChild ) {
      navUl.removeChild( navUl.firstChild );
    }

    // Remove event listeners
    for ( var i = 0, navMax = navlinks.length; i < navMax; i++ ) {
      editorLinks[i].removeEventListener(
        'click',
        refreshMenu,
        false
      );
    }
  },

  toggle: function() {
    var editorEl = helpers.getEditorEl(),
        toggleEl = helpers.getEditorToggleEl(),
        mainNav = helpers.getMainNavEl();

    editor.clearMenus();
    editor.currentPost = view.currentPost;
    editor.currentPostType = view.currentPost.type;
    editor.currentMenu = 'edit';

    editorEl.classList.toggle('hidden');
    toggleEl.classList.toggle('hidden');
    mainNav.classList.toggle('inactive');

    if( toggleEl.classList.contains( 'hidden' ) === false ) {
      var navTitleLink = helpers.getEditorNavTitleLink();

      editor.showEditPanel();
      navTitleLink.addEventListener(
        'click',
        editor.listenSecondaryNavTitle,
        false
      );
      view.listenDisableMainNavLinks();
    } else {
      if ( view.currentPost.type === 'post' ) {
        router.updateHash( 'blog/' + view.currentPost.slug );
      } else {
        router.updateHash( view.currentPost.slug );
      }
      view.listenMainNavLinksUpdatePage();
    }

  },

  updateNavTitle: function() {

    var postType = editor.currentPostType,
        currentMenu = editor.currentMenu,
        homeLink = helpers.getEditorHomeLinkEl(currentMenu);

    homeLink.addEventListener(
      'click',
      editor.listenAdminHomeLink,
      false
    );

    if( currentMenu === 'secondary' ) {
      var navTitleEl = helpers.getEditorNavTitleEl( currentMenu );
      navTitleEl.innerHTML = postType + 's';
    } else {
      var navTitleLink = helpers.getEditorNavTitleLink();
      navTitleLink.textContent = postType + 's';
      navTitleLink.addEventListener(
        'click',
        editor.listenSecondaryNavTitle,
        false
      );
    }

  },

  updateSaveBtnText: function( text ) {

    var btn = helpers.getEditorEditUpdateBtn(),
        saving = function() {
          setTimeout( function () {
            Spinner.stop();
            btn.innerText = 'Saved!';
            saved();
          }, 900 );
        },
        saved = function(){
          setTimeout( function () {
            btn.innerText = 'Update';
          }, 1000 );
        },
        spinnerOpts = {
          color:'#fff',
          lines: 8,
          length: 4,
          radius: 3,
          width: 1,
          left: '10%'
        };
        Spinner = new Spinner( spinnerOpts )
                        .spin( btn );

    btn.innerText = 'Saving...';
    saving();
  }
};

module.exports = editor;
