(function() {

'use strict';

/**
 * Contains the properties and methods for the editor.
 *
 * @exports editor
 */

var Spinner = require( 'spin.js' ),
    _ = require( 'underscore' ),
    h = require( './lib/helpers.js' ),
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
  init () {
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
  listenAdminHomeLink (){
    editor.clearMenus();
    editor.showPrimaryMenu();
    event.preventDefault();
  },


  /**
   * Listeners for links in the primary menu
   * Loads seconday menu
   *
   */
  listenPrimaryLinks () {
    const urlSegments = h.getAfterHash( this.href ),
    //const currentPost = urlSegments[0].substring( 0, urlSegments[0].length - 1 );
          currentPost = urlSegments[0];
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
  listenSecondaryNavTitle () {
    editor.clearMenus();
    editor.showSecondaryMenu();
    event.preventDefault();
  },


  /**
   * Listener to load the post edit field.
   *
  */
  listenLoadEditForm () {
    //event.preventDefault();
    editor.clearMenus();
    const slugs = h.getAfterHash( this.href ),
          post = model.getPostBySlugs( slugs );

    console.log( 'url: ' + this.href );

    console.log( 'slugs: ' + slugs );
    console.log( 'post: ' + post );

    editor.currentPost = post;
    editor.currentPostType = post.type;

    if ( editor.currentPostType !== 'settings' ) {
      //view.currentPost = post;
      router.updatePage( this.href );
      console.log( view.currentPost );
    } else {

    }

    editor.showEditPanel();
  },


  /**
   * Listener to the new post field
   *
   */
  listenLoadNewPostForm () {
    let post = {slug: '_new',title:'',content:''},
        updateBtn = h.getEditorEditUpdateBtn(),
        deleteBtn = h.getDeletePostLink();

    event.preventDefault();
    editor.clearMenus();
    editor.currentPost = post;

    if ( editor.currentPostType !== 'settings' ) {
      // Clear the view
      view.clearContent();
    }

    editor.showEditPanel();
    deleteBtn.classList.add( 'hidden' );
    updateBtn.innerText = 'Save';
  },


  /**
   * Listener for the editor toggle button
   *
   */
  listenEditorToggle () {
    const editorToggleEl = h.getEditorToggleLink();
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
  listenUpdatePost () {
    let store = model.getLocalStore(),
        newPost = false,
        storePosts;

    event.preventDefault();

    // If new post add to local store
    if( editor.currentPost.slug === '_new' ) {
      let postIds = [],
          highestId;

      newPost = true;
      editor.currentPost.type = 'posts';

      // Slugify title
      editor.currentPost.slug = h.slugifyTitle( editor.currentPost.title );
      // Make sure slug is unique
      editor.currentPost.slug = model.uniqueifySlug( editor.currentPost.slug );

      // Get a new post id
      editor.currentPost.id = model.getNewPostId();

      // Set the date
      editor.currentPost.date = Date();
      editor.currentPost.modified = Date();
    }

    // Get temp store of posts based on type
    storePosts = store[ editor.currentPostType ];//

    if ( newPost === true ) {
      // If new post add post to store
      storePosts.push( editor.currentPost );
    } else {
      // If existing post then update post in store
       storePosts = _.map( storePosts, (post) => {
         if ( post.id === editor.currentPost.id ) {
           post.title = editor.currentPost.title;
           post.content = editor.currentPost.content;
           post.modified = Date();
         }
         return post;
       });
    }

    store[ editor.currentPostType ] = storePosts;

    model.updateLocalStore( store );

    // Update url and current post
    if ( editor.currentPostType === 'posts' ) {
      router.updateHash( 'blog/' + editor.currentPost.slug );
    } else if ( editor.currentPostType === 'pages' ) {
      router.updateHash( editor.currentPost.slug );
    } else {

    }

    view.currentPost = editor.currentPost;
    view.update();
    editor.updateSaveBtnText();
  },


  /**
   * Listener to delete post
   *
   */
  listenDeletePost () {
    let store = model.getLocalStore(),
        confirmation = confirm('Are you sure you want to delete this post?'),
        storePosts,
        deleteId,
        deleteIdIndex;

    // Get the index of the item to delete from store
    storePosts = _.reject( store.posts, (post) => {
      return  post.id === editor.currentPost.id;
    });
    // for ( var i = 0, max = storePosts.length; i < max ; i++) {
    //   if ( editor.currentPost.id === storePosts[i].id ) {
    //     deleteIdIndex = i;
    //   }
    // }

    // Only procude with delete if confirmation
    if ( confirmation === true ) {
      // Remove item from store
      //storePosts.splice( deleteIdIndex, 1 );
      store.posts = storePosts;
      model.updateLocalStore( store );

      // Update current post to empty, show blog posts
      editor.currentPost = {};
      router.updateHash( 'blog' );
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
  showPrimaryMenu () {
    let primaryNav = h.getEditorPrimaryNav(),
        primaryLinks = h.getEditorPrimaryNavLinks();

    primaryNav.classList.add( 'active' );

    // Add event listeners to primary links
    _.each( primaryLinks, (link) => {
      link.addEventListener(
        'click',
        editor.listenPrimaryLinks,
        false
      );
    });
    editor.currentMenu = 'primary';
  },

  /**
   * Displays the secondary menu
   *
   */
  showSecondaryMenu () {
    let secondaryNav = h.getEditorSecondaryNav(),
        postType = editor.currentPostType,
        menuItems = model.getPostsByType( postType ),
        secondaryUl =  h.getEditorSecondaryNavUl(),
        secondaryLinks = secondaryUl.getElementsByTagName( 'a' ),
        addNewPostLink = h.getEditorAddNewPost(),
        deletePostLink = h.getDeletePostLink();

    // Display secondary menu
    secondaryNav.classList.add( 'active' );
    editor.currentMenu = 'secondary';
    editor.updateNavTitle();
    h.addMenuItems( menuItems, postType );

    // Add listeners to secondary links
    _.each( secondaryLinks, (link) => {
      link.addEventListener(
        'click',
        editor.listenLoadEditForm,
        false);
    });
    // for ( var i = 0, max = secondaryLinks.length; i < max; i++ ) {
    //   secondaryLinks[i].addEventListener(
    //     'click',
    //     editor.listenLoadEditForm,
    //     false);
    // }

    // Check if need to show new post button
    if ( editor.currentPostType === 'posts' ) {
      addNewPostLink.classList.remove('hidden');
      // Add listener to new post link
      addNewPostLink.addEventListener(
        'click',
        editor.listenLoadNewPostForm,
        false
      );
    } else {
      addNewPostLink.classList.add('hidden');
    }

  },

  /**
   * Displays the edit post panel
   *
   */
  showEditPanel () {
    let post = editor.currentPost,
        editNav = h.getEditorEditNav(),
        editForm = h.getEditorForm(),
        deleteBtn = h.getDeletePostLink();

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

    if ( editor.currentPostType === 'posts' ) {
      deleteBtn.classList.remove( 'hidden' );
      // Add event listener to delete post
      deleteBtn.addEventListener(
        'click',
        editor.listenDeletePost,
        false
      );
    } else {
      deleteBtn.classList.add( 'hidden' );
    }
  },

  /**
   * Dynamically fill the edit post form based on the
   * current post.
   *
   */
  fillEditForm () {
    let post = editor.currentPost,
        editTitle = document.getElementById('editTitle'),
        postTitle = h.getPostTitle(),
        titleField = h.getEditorTitleField();

    // Update the title and content fields
    editTitle.value = post.title;
    editContent.value = post.content;

    // Initialize the wysiwyg editor
    wysiwyg = wysiwygEditor(document.getElementById('editContent'));

    //  Add listeners to update the view on field changes
    if ( post.type !== 'settings' ) {
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
  clearEditForm () {
    let editTitle = document.getElementById( 'editTitle' ),
        wysiwyg = h.getEditorWysiwyg();

    // Set the edit fields blank
    editTitle.value = '';
    editContent.value = '';
    // Remove the wysiwyg editor
    if ( !_.isNull(wysiwyg) ) {
      wysiwyg.remove();
    }
  },

  /**
   * Clears the current menu.
   * Must call before loading a menu.
   *
   */
  clearMenus () {
    let navs = h.getEditorNavs(),
        navUl = h.getEditorSecondaryNavUl(),
        navlinks = navUl.getElementsByTagName( 'a' );

    // Remove active class from all navs
    _.each( navs, (nav) => {
      nav.classList.remove( 'active' );
    });

    // Remove event listeners from all previous nav links
    if( !_.isEmpty( navUl ) ) {
      _.each( navLinks, (link) => {
        link.removeEventListener(
          'click',
          editor.refreshMenu,
          false
        );
      });
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
  toggle () {
    let editorEl = h.getEditorEl(),
        toggleEl = h.getEditorToggleEl(),
        mainNav = h.getMainNavEl();

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
      var navTitleLink = h.getEditorNavTitleLink();
      editor.showEditPanel();
      navTitleLink.addEventListener(
        'click',
        editor.listenSecondaryNavTitle,
        false
      );
      view.listenDisableMainNavLinks();
    } else {
      // If closing editor
      if ( view.currentPost.type === 'posts' ) {
        router.updatePage( 'blog/' + view.currentPost.slug );
        //router.updateHash( 'blog/' + view.currentPost.slug );
      } else {
        if ( editor.currentPost.slug === '_new' ) {
          // If closing a new post editor
          router.updatePage( 'blog' );
          //router.setCurrentPost();
        } else {
          router.updatePage( view.currentPost.slug );
        }
      }
      view.listenMainNavLinksUpdatePage();
    }

  },

  /**
   * Update the editor breadcrumb navigation
   * (i.e. Admin / Posts, Admin / Pages, Admin / Settings, etc. )
   *
   */
  updateNavTitle () {
    let postType = editor.currentPostType,
        currentMenu = editor.currentMenu,
        homeLink = h.getEditorHomeLinkEl( currentMenu ),
        navTitleLink,
        navTitleEl;

    // Add event listener to Admin home link
    homeLink.addEventListener(
      'click',
      editor.listenAdminHomeLink,
      false
    );

    // Add secondary link based on current nav and post type
    if( currentMenu === 'secondary' ) {
      // If on secondary nav
      navTitleEl = h.getEditorNavTitleEl( currentMenu );
      navTitleEl.innerHTML = postType;
    } else {
      // If editing post
      navTitleLink = h.getEditorNavTitleLink();
      navTitleLink.textContent = postType;
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
  updateSaveBtnText () {

    let btn = h.getEditorEditUpdateBtn(),
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
          setTimeout( () => {
            spinner.stop();
            btn.innerText = savedText;
            saved();
          }, 900 );
        },
        // Displays final text
        saved = function(){
          setTimeout( () => {
            btn.innerText = finalText;
          }, 1000 );
        };

    // Update btn text and start saving
    btn.innerText = 'Saving...';
    saving();
  }
};

module.exports = editor;

}());
