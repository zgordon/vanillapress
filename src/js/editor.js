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
  currentMenu: "primary",
  currentConentType: "",
  currentPost: "",
  listenSecondaryNavTitle: function(){
    var url = this.href;
    var urlSegments = helpers.getAfterHash(url);
    event.preventDefault();
  },
  listenNavTitle: function(){
    editor.clearMenus();
    editor.showSecondaryMenu();
  },
  listenEditorToggle: function(){
    var editorToggleEl = helpers.getEditorToggleLink();
    editorToggleEl.addEventListener("click", function(){
      editor.toggle();
      event.preventDefault();
    }, false);
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
    var primaryNav = document.querySelector("#editor nav.primary");
    secondaryNav.classList.add("active");
  },
  showSecondaryMenu: function(contentType){
    var secondaryNav = document.querySelector("#editor nav.secondary");
    secondaryNav.classList.add("active");
    editor.updateNavTitle(contentType, "secondary");
    var menuItems = model.getContent(contentType);
    helpers.addMenuItems(menuItems, contentType);
    var secondaryUl =  document.querySelector("#editor nav.secondary ul");
    var secondaryLinks = secondaryUl.getElementsByTagName("a");
    for (var i = 0; i < secondaryLinks.length; i++) {
      secondaryLinks[i].addEventListener("click", editor.listenSecondaryNavTitle, false);
    }
  },
  showEditPanel: function(post) {
    var editNav = document.querySelector("#editor nav.edit");
    editNav.classList.add("active");
    editor.updateNavTitle(post.type, "edit");
    if( post.type == "post" || post.type == "page" ) {
        editor.fillEditForm(post);
    }
  },
  fillEditForm: function(post) {
    editor.clearEditForm();
    var editTitle = document.getElementById("editTitle");
    editTitle.value = post.title;
    //console.log(wysiwyg.value());
    //wysiwyg.value( markdown.toHTML(post.content) );
    editContent.value = post.content;
    wysiwyg = wysiwygEditor(document.getElementById("editContent"));
    wysiwyg.onUpdate(function () {
      //make sure view is loaded
      view.updateContent( wysiwyg.read() );
    });

  },
  clearEditForm: function() {
    var editTitle = document.getElementById("editTitle");
    editTitle.value = "";
    editContent.value = "";
    var wysiwyg = document.querySelector("nav.edit form iframe");
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
    var navUl = document.querySelector("#editor nav.secondary ul");
    while(navUl.firstChild) navUl.removeChild(navUl.firstChild);

    var navlinks = navUl.getElementsByTagName("a");
    for (var i = 0; i < navlinks.length; i++) {
      editorLinks[i].removeEventListener("click", refreshMenu, false);
    }
  },
  toggle: function() {
    editor.clearMenus();
    var editorEl = helpers.getEditorEl();
    editorEl.classList.toggle("hidden");

    var toggleBtn = document.querySelector("#editorToggle");
    toggleBtn.classList.toggle("hidden");

    var mainNav = document.getElementById("mainNav");
    mainNav.classList.toggle("inactive");

    if( toggleBtn.classList.contains("hidden") === false ) {
      var post = model.getCurrentContentObj();
      router.updateHash("edit/" + post.type + "s/" + post.slug);
      editor.showEditPanel(post);
      view.listenDisableMainNavLinks();
    } else {
      view.listenMainNavLinksUpdatePage();
      router.updateHash("");
    }

  },
  updateNavTitle: function(contentType, currentMenu) {

    var homeLink = document.querySelector("#editor nav.edit h3 .go-home");
    var titleEl;

    if( currentMenu == "secondary" ) {
      titleEl = document.querySelector("#editor nav.edit h3 span");
      titleEl.innerHTML = contentType + "s";
    } else {
      titleEl = document.querySelector("#editor nav.edit h3 span a");
      titleEl.textContent = contentType + "s";
      titleEl.href = "#edit/" + contentType + "s";

      titleEl.addEventListener("click", editor.listenNavTitle, false);
    }

  }
};

module.exports = editor;
