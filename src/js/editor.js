var models = require( "./models.js" );
var helpers = require( "./lib/helpers.js" );
var view = require( "./view.js" );
var wysiwygEditor = require('wysiwyg');


var wysiwyg;

var editor = {
  init: function() {
    //var contentwysiwyg = wysiwyg(document.querySelector('#editContent'));

    //wysiwyg = document.getElementById("editContent");
    // wysiwyg = new SimpleMDE({
    //   element: document.getElementById("editContent"),
    //   toolbar: false,
    //   spellChecker: false,
    //   status: false,
    // });
    // wysiwyg.codemirror.on( "change", function() {
    //   view.updateContent( wysiwyg.value() );
    //   console.log( wysiwyg.value() );
    // });
    editor.loadMenu();
    editor.setupToggle();
  },
  //posts: get_posts(),
  loadMenu: function(){
    editor.clearMenus();
    editor.showCurrentMenu();
  },
  showCurrentMenu: function() {

    var urlSegments = helpers.getAfterHash();
    var currentMenu;

    //if url #edit/
    if( urlSegments[0] == "edit" && urlSegments.length == 1  ) {
      currentMenu = "primary";
      this.showPrimaryMenu();
    }
    //if url #edit/secondary
    else if( urlSegments[0] == "edit" && urlSegments.length == 2 ) {
      currentMenu = "secondary";
      this.showSecondaryMenu();
    }
    //if editing content
    else {//( urlSegments[0] == "edit" && urlSegments.length == 3 ) {
      currentMenu = "edit";
      this.showEditPanel(urlSegments[2], urlSegments[1]);
    }

    var queryCurrentNav = "#editor nav." + currentMenu;
    var currentNav = document.querySelector(queryCurrentNav);
    currentNav.classList.add("active");

    // var currentUl = document.querySelector(queryStr + " ul");
    // var currentLinks = currentUl.getElementsByTagName("a");
    // for (var i = 0; i < currentLinks.length; i++) {
    //   currentLinks[i].addEventListener("click", refreshMenu(), false);
    // }

  },
  showPrimaryMenu: function(){

  },
  showSecondaryMenu: function(){
    this.updateMenuTitle();
    //figure out what secondary navigation we're loading
    var currentSecondaryMenu = helpers.getAfterHash()[1];
    var menuItems = getContent(currentSecondaryMenu);
    helpers.addMenuItems(menuItems, currentSecondaryMenu);
  },
  showEditPanel: function(slug, contentType){
    this.updateMenuTitle();
    var itt;
    var post = models.getContentBySlug(slug, contentType);
    if( contentType == "posts" || contentType == "pages" ) {
        this.fillEditForm(post);
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
      view.updateContent( wysiwyg.read() );
    });
  },
  clearEditForm: function() {
    editTitle.value = "";
    editContent.value = "";
    var wysiwyg = document.querySelector("nav.edit form iframe");
    console.log(wysiwyg);
    if(wysiwyg != null) wysiwyg.remove();
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
  setupToggle: function() {
    var editorToggleEl = document.querySelector("#editorToggle a");
    editorToggleEl.addEventListener("click", editor.toggleView, false);
  },
  toggleView: function() {
    var editorEl = helpers.getEditorEl();
    editorEl.classList.toggle("hidden");
    var toggleBtn = document.querySelector("#editorToggle");
    toggleBtn.classList.toggle("hidden");
    if( toggleBtn.classList.contains("hidden") === false ) {
      var viewContent = helpers.getCurrentContentObj();
      editor.fillEditForm(viewContent);
    }
  },
  updateMenuTitle: function() {
    var title = null,
        titleEl,
        urlSegments = helpers.getAfterHash();
    if(urlSegments.length == 2 && urlSegments[0] == "edit") {
      title = urlSegments[urlSegments.length-1];
      titleEl = document.querySelector("#editor nav.secondary h3 span");
    }
    if(urlSegments.length == 3 && urlSegments[0] == "edit") {
      title = urlSegments[urlSegments.length-2];
      titleEl = document.querySelector("#editor nav.edit h3 span a");
      titleEl.href = "#edit/" + title;
      //titleEl.addEventListener("click", refreshMenu, false);
    }

    var homeLink = document.querySelector("#editor nav.edit h3 .go-home");
    //if( homeLink ) addEventListener("click", refreshMenu, false);

    //titleEl.textContent = title;
  }
};

module.exports = editor;
