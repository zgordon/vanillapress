// var addClass = require('amp-add-class');
// var removeClass = require('amp-remove-class');
var Spinner = require('spin.js');

var helpers = require( "./lib/helpers.js" );
var router = require( "./router.js" );
var model = require( "./model.js" );
var view = require( "./view.js" );

var wysiwygEditor = require('wysiwyg');

var wysiwyg;

var editor = {
  init: function() {
    editor.listenEditorToggle();
  },
  visible: "false",
  currentMenu: "edit",
  currentPost: "",
  currentPostType: "",
  listenAdminHomeLink: function(){
    editor.clearMenus();
    editor.showPrimaryMenu();
    event.preventDefault();
  },
  listenPrimaryLinks: function() {
    var urlSegments = helpers.getAfterHash(this.href);
    var currentPost = urlSegments[0].substring(0, urlSegments[0].length - 1);
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
    var slugs = helpers.getAfterHash(this.href);
    var post = model.getPostBySlugs(slugs);
    editor.currentPost = post;
    editor.currentPostType = post.type;
    if(editor.currentPostType != "setting") {
      view.currentPost = post;
      view.update();
    } else {
      event.preventDefault();
    }
    editor.showEditPanel();
  },
  listenLoadNewPostForm: function(){
    editor.clearMenus();
    var post = {slug: "_new",title:"",content:""};
    editor.currentPost = post;
    if(editor.currentPostType != "setting") {
      view.currentPost = post;
      view.update();
    } else {
      event.preventDefault();
    }
    editor.showEditPanel();
    var updateBtn = helpers.getEditorEditUpdateBtn();
    updateBtn.innerText = "Save";
    //change text for Update btn
  },
  listenEditorToggle: function(){
    var editorToggleEl = helpers.getEditorToggleLink();
    editorToggleEl.addEventListener("click", function(){
      editor.toggle();
      event.preventDefault();
    }, false);
  },
  listenUpdatePost: function() {
    event.preventDefault();

    var newPost = false;

    //if new post
    if( editor.currentPost.slug == "_new" ) {
      newPost = true;
      editor.currentPost.type = "post";
      //slugify title
      editor.currentPost.slug = helpers.slugifyTitle(editor.currentPost.title);
      //get a new post id
      var localStore = model.getLocalStore();
      localStore = localStore.posts;
      var postIds = [];
      localStore.forEach(function(post) {
        postIds.push(Number(post.id));
      });
      var highestId = Math.max.apply( Math, postIds );
      editor.currentPost.id = highestId + 1;
      //set the date
      editor.currentPost.date = Date();
      editor.currentPost.modified = Date();
    }

    //get the local store of post type
    var postType = editor.currentPostType;
    var store = model.getLocalStore();
    var storePosts;
    switch (postType) {
      case "post":
        storePosts = store.posts;
        break;
      case "page":
        storePosts = store.pages;
        break;
      default:
        storePosts = store.settings;
    }
    //get the current item to edit from store
    if(newPost === true){
      storePosts.push(editor.currentPost);
    } else {
      storePosts.forEach(function(item){
        if(editor.currentPost.id == item.id){
          item.title = editor.currentPost.title;
          item.content = editor.currentPost.content;
        }
      });
    }
    //add store data back
    switch (postType) {
      case "post":
        store.posts = storePosts;
        break;
      case "page":
        store.pages = storePosts;
        break;
      default:
        store.settings = storePosts;
    }

    model.updateLocalStore(store);
    router.updateHash("blog/" + editor.currentPost.slug);
    view.currentPost = editor.currentPost;
    view.update();
    editor.updateSaveBtnText();

  },
  listenDeletePost: function(){
    var store = model.getLocalStore();
    var storePosts = store.posts;
    var deleteId,
        deleteIdIndex;

    for(var i=0; i<storePosts.length; i++) {
      if(editor.currentPost.id == storePosts[i].id){
        deleteIdIndex = i;
      }
    }

    //confirm detele
    //return to posts page
    var confirmation = confirm("Are you sure you want to delete this post?");
    if (confirmation === true) {
      console.log(deleteIdIndex);
      storePosts.splice(deleteIdIndex, 1);
      store.posts = storePosts;
      model.updateLocalStore(store);
      editor.currentPost = {};
      view.currentPost = model.getPostBySlug("blog", "pages");
      view.update();
      editor.clearMenus();
      editor.showSecondaryMenu();
    }


    event.preventDefault();
  },
  showCurrentMenu: function(){
    switch ( editor.currentMenu ) {
      case "primary":
        showPrimaryMenu();
        break;
      case "secondary":
        showSecondaryMenu();
        break;
      case "edit":
        showEditPanel();
        break;
      default:
        showPrimaryMenu();
    }
  },
  showPrimaryMenu: function(){
    var primaryNav = helpers.getEditorPrimaryNav();
    primaryNav.classList.add("active");
    var primaryLinks = helpers.getEditorPrimaryNavLinks();
    for (var i = 0; i < primaryLinks.length; i++) {
      primaryLinks[i].addEventListener("click", editor.listenPrimaryLinks, false);
    }
    editor.currentMenu = "primary";
  },
  showSecondaryMenu: function(){
    var secondaryNav = helpers.getEditorSecondaryNav();
    var postType = editor.currentPostType;
    secondaryNav.classList.add("active");
    editor.currentMenu = "secondary";
    editor.updateNavTitle();
    var menuItems = model.getContent(postType);
    helpers.addMenuItems(menuItems, postType);
    var secondaryUl =  helpers.getEditorSecondaryNavUl();
    var secondaryLinks = secondaryUl.getElementsByTagName("a");
    for (var i = 0; i < secondaryLinks.length; i++) {
      secondaryLinks[i].addEventListener("click", editor.listenLoadEditForm, false);
    }
    var addNewPostLink = helpers.getEditorAddNewPost();
    addNewPostLink.addEventListener("click", editor.listenLoadNewPostForm, false);
    var deletePostLink = helpers.getDeletePostLink();
    deletePostLink.addEventListener("click", editor.listenDeletePost, false);
    console.log(deletePostLink);
  },
  showEditPanel: function() {
    editor.clearEditForm();
    var post = editor.currentPost;
    var editNav = helpers.getEditorEditNav();
    editNav.classList.toggle("active");
    editor.currentMenu = "edit";
    editor.updateNavTitle();
    editor.fillEditForm();
    var editForm = helpers.getEditorForm();
    editForm.addEventListener('submit', editor.listenUpdatePost, false);
    var deleteBtn = helpers.getDeletePostLink();
    deleteBtn.addEventListener('click', editor.listenDeletePost, false);
  },
  fillEditForm: function() {
    var post = editor.currentPost;
    var editTitle = document.getElementById("editTitle");
    var postTitle = helpers.getPostTitle();
    var titleField = helpers.getEditorTitleField();

    editTitle.value = post.title;
    editContent.value = post.content;

    wysiwyg = wysiwygEditor(document.getElementById("editContent"));
    if( post.type != "setting") {
      titleField.addEventListener("input", function(){
        editor.currentPost.title = this.value;
        view.updateTitle(this.value);
      }, false);
      wysiwyg.onUpdate(function () {
        view.updateContent( wysiwyg.read() );
        editor.currentPost.content = wysiwyg.read();
      });
    } else {
      if (  post.slug == "site-name" ) {
        wysiwyg.onUpdate(function () {
          view.updateSiteName( wysiwyg.read() );
          editor.currentPost.content = wysiwyg.read();
        });
      } else if( post.slug == "site-description" ) {
        wysiwyg.onUpdate(function () {
          view.updateSiteDescription( wysiwyg.read() );
          editor.currentPost.content = wysiwyg.read();
        });
      } else {

      }
    }
  },
  clearEditForm: function() {
    var editTitle = document.getElementById("editTitle");
    editTitle.value = "";
    editContent.value = "";
    var wysiwyg = helpers.getEditorWysiwyg();
    if(wysiwyg !== null) wysiwyg.remove();
  },
  clearMenus: function(){
    var editorEl = helpers.getEditorEl();
    //remove active class from all navs
    var navs = editorEl.getElementsByTagName("nav");
    for (var j = 0; j < navs.length; j++) {
      var nav = navs[j];
      nav.classList.remove("active");
    }
    //remove all children from #editor nav.secondary ul
    var navUl = helpers.getEditorSecondaryNavUl();
    while(navUl.firstChild) navUl.removeChild(navUl.firstChild);

    var navlinks = navUl.getElementsByTagName("a");
    for (var i = 0; i < navlinks.length; i++) {
      editorLinks[i].removeEventListener("click", refreshMenu, false);
    }
  },
  toggle: function() {
    editor.clearMenus();

    editor.currentPost = view.currentPost;
    editor.currentPostType = view.currentPost.type;
    editor.currentMenu = "edit";

    var editorEl = helpers.getEditorEl();
    editorEl.classList.toggle("hidden");

    var toggleEl = helpers.getEditorToggleEl();
    toggleEl.classList.toggle("hidden");

    var mainNav = helpers.getMainNavEl();
    mainNav.classList.toggle("inactive");

    if( toggleEl.classList.contains("hidden") === false ) {
      editor.showEditPanel();
      var navTitleLink = helpers.getEditorNavTitleLink();
      navTitleLink.addEventListener("click", editor.listenSecondaryNavTitle, false);
      view.listenDisableMainNavLinks();
    } else {
      if(view.currentPost.type === "post") {
        router.updateHash("blog/" + view.currentPost.slug);
      } else {
        router.updateHash(view.currentPost.slug);
      }
      view.listenMainNavLinksUpdatePage();
    }

  },
  updateNavTitle: function() {

    var postType = editor.currentPostType;
    var currentMenu = editor.currentMenu;
    var homeLink = helpers.getEditorHomeLinkEl(currentMenu);
    homeLink.addEventListener("click", editor.listenAdminHomeLink, false);

    if( currentMenu == "secondary" ) {
      var navTitleEl = helpers.getEditorNavTitleEl(currentMenu);
      navTitleEl.innerHTML = postType + "s";
    } else {
      var navTitleLink = helpers.getEditorNavTitleLink();
      navTitleLink.textContent = postType + "s";
      navTitleLink.addEventListener("click", editor.listenSecondaryNavTitle, false);
    }

  },
  updateSaveBtnText: function(text) {
    //say saving, wait a sec
    var btn = helpers.getEditorEditUpdateBtn();
    var saving = function() {
      setTimeout(function () {
        spinner.stop();
        btn.innerText = "Saved!";
        saved();
      }, 900);
    };
    var saved = function(){
      setTimeout(function () {
        btn.innerText = "Update";
      }, 1000);
    };

    btn.innerText = "Saving...";
    var spinnerOpts = {
      color:'#fff',
      lines: 8,
      length: 4,
      radius: 3,
      width: 1,
      left: '10%'
    };
    var spinner = new Spinner(spinnerOpts).spin(btn);

    saving();
    //say saved
    //go back to Update
  }
};

module.exports = editor;
