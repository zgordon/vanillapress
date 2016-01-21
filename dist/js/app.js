(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var editable = require("make-editable");
var pubsub = require("pubsub");
var debounce = require("debounce-fn");
var classes = require("dom-classes");

var counter = 1;

module.exports = create;

function create (textarea) {
  var iframe = replace(textarea);
  var api = editable(iframe.contentWindow.document);

  api.iframe = iframe;
  api.onUpdate = pubsub();
  api.read = read;

  watch(api, function () {
    textarea.value = read();
    api.onUpdate.publish();
  });

  return api;

  function read () {
    return iframe.contentWindow.document.body.innerHTML;
  };
}

function replace (textarea) {
  var id = counter++;
  var iframe = document.createElement('iframe');
  iframe.setAttribute('class', 'wysiwyg wysiwyg-' + id);

  textarea.style.display = 'none';
  textarea.parentNode.insertBefore(iframe, textarea);

  iframe.contentWindow.document.body.innerHTML = textarea.value;

  iframe.contentWindow.addEventListener('focus', function () {
    classes.add(iframe, 'focus');
  }, false);

  iframe.contentWindow.addEventListener('blur', function () {
    classes.remove(iframe, 'focus');
  }, false);

  return iframe;
}

function watch (api, callback) {
  api.iframe.contentWindow.document.body.addEventListener('input', debounce(callback, 500), false);
}

},{"debounce-fn":2,"dom-classes":3,"make-editable":5,"pubsub":6}],2:[function(require,module,exports){
module.exports = debounce;

function debounce (fn, wait) {
  var timer;
  var args;

  return function () {
    if (timer != undefined) {
      clearTimeout(timer);
      timer = undefined;
    }

    args = arguments;

    timer = setTimeout(function () {
      fn.apply(undefined, args);
    }, wait);
  };
}

},{}],3:[function(require,module,exports){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var whitespaceRe = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

module.exports = classes;
module.exports.add = add;
module.exports.contains = has;
module.exports.has = has;
module.exports.toggle = toggle;
module.exports.remove = remove;
module.exports.removeMatching = removeMatching;

function classes (el) {
  if (el.classList) {
    return el.classList;
  }

  var str = el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(whitespaceRe);
  if ('' === arr[0]) arr.shift();
  return arr;
}

function add (el, name) {
  // classList
  if (el.classList) {
    el.classList.add(name);
    return;
  }

  // fallback
  var arr = classes(el);
  var i = index(arr, name);
  if (!~i) arr.push(name);
  el.className = arr.join(' ');
}

function has (el, name) {
  return el.classList
    ? el.classList.contains(name)
    : !! ~index(classes(el), name);
}

function remove (el, name) {
  if ('[object RegExp]' == toString.call(name)) {
    return removeMatching(el, name);
  }

  // classList
  if (el.classList) {
    el.classList.remove(name);
    return;
  }

  // fallback
  var arr = classes(el);
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  el.className = arr.join(' ');
}

function removeMatching (el, re, ref) {
  var arr = Array.prototype.slice.call(classes(el));
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      remove(el, arr[i]);
    }
  }
}

function toggle (el, name) {
  // classList
  if (el.classList) {
    return el.classList.toggle(name);
  }

  // fallback
  if (has(el, name)) {
    remove(el, name);
  } else {
    add(el, name);
  }
}

},{"indexof":4}],4:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],5:[function(require,module,exports){
module.exports = enable;

function enable (doc) {
  doc.body.contentEditable = true;

  return {
    exec: call(doc),
    bold: call(doc, 'bold'),
    italic: call(doc, 'italic'),
    underline: call(doc, 'underline'),
    color: call(doc, 'foreColor'),
    bgcolor: call(doc, 'backColor'),
    img: call(doc, 'insertImage'),
    link: call(doc, 'createLink'),
    unlink: call(doc, 'unlink'),
    plain: call(doc, 'removeFormat'),
    undo: call(doc, 'undo'),
    redo: call(doc, 'redo'),
    indent: call(doc, 'indent'),
    outdent: call(doc, 'outdent'),
    selectAll: call(doc, 'selectAll'),
    orderedList: call(doc, 'insertOrderedList'),
    unorderedList: call(doc, 'insertUnorderedList'),
    copy: call(doc, 'copy'),
    paste: call(doc, 'paste'),
    delete: call(doc, 'delete'),
    fontName: call(doc, 'fontName'),
    fontSize: call(doc, 'fontSize'),
    center: call(doc, 'justifyCenter'),
    justify: call(doc, 'justifyFull'),
    left: call(doc, 'justifyLeft'),
    right: call(doc, 'justifyRight'),
    heading: call(doc, 'heading')
  };
}

function exec (doc, cmd, value, showDefaultUI) {
  doc.execCommand(cmd, showDefaultUI || false, value);
};

function call (doc, commandName) {
  return arguments.length == 1 ? custom : command;

  function custom (commandName, value, ui) {
    return exec(doc, commandName, value, ui);
  }

  function command (value, ui) {
    return exec(doc, commandName, value, ui);
  }
}

},{}],6:[function(require,module,exports){
module.exports = pubsub;

function pubsub (mix) {
  var subscribers;
  var subscribersForOnce;

  mix || (mix = function (fn) {
    if (fn) mix.subscribe(fn);
  });

  mix.subscribe = function (fn) {
    if (!subscribers) return subscribers = fn;
    if (typeof subscribers == 'function') subscribers = [subscribers];
    subscribers.push(fn);
  };

  mix.subscribe.once = function (fn) {
    if (!subscribersForOnce) return subscribersForOnce = fn;
    if (typeof subscribersForOnce == 'function') subscribersForOnce = [subscribersForOnce];
    subscribersForOnce.push(fn);
  };

  mix.unsubscribe = function (fn) {
    if (!subscribers) return;

    if (typeof subscribers == 'function') {
      if (subscribers != fn) return;
      subscribers = undefined;
      return;
    }

    var i = subscribers.length;

    while (i--) {
      if (subscribers[i] && subscribers[i] == fn){
        subscribers[i] = undefined;
        return;
      }
    }
  };

  mix.unsubscribe.once = function (fn) {
    if (!subscribersForOnce) return;

    if (typeof subscribersForOnce == 'function') {
      if (subscribersForOnce != fn) return;
      subscribersForOnce = undefined;
      return;
    }

    var i = subscribersForOnce.length;

    while (i--) {
      if (subscribersForOnce[i] && subscribersForOnce[i] == fn){
        subscribersForOnce[i] = undefined;
        return;
      }
    }
  };

  mix.publish = function () {
    var params = arguments;
    var i, len;

    if (subscribers && typeof subscribers != 'function' && subscribers.length) {
      i = -1;
      len = subscribers.length;

      while (++i < len) {
        if (!subscribers[i] || typeof subscribers[i] != 'function') continue;

        try {
          subscribers[i].apply(undefined, params);
        } catch(err) {
          setTimeout(function () { throw err; }, 0);
        }
      };
    } else if (typeof subscribers == 'function') {
      try {
        subscribers.apply(undefined, params);
      } catch(err) {
        setTimeout(function () { throw err; }, 0);
      }
    }

    if (subscribersForOnce && typeof subscribersForOnce != 'function' && subscribersForOnce.length) {
      i = -1;
      len = subscribersForOnce.length;

      while (++i < len) {
        if (!subscribersForOnce[i] || typeof subscribersForOnce[i] != 'function') continue;

        try {
          subscribersForOnce[i].apply(undefined, params);
        } catch(err) {
          setTimeout(function () { throw err; }, 0);
        }
      };

      subscribersForOnce = undefined;
    } else if (typeof subscribersForOnce == 'function') {
      try {
        subscribersForOnce.apply(undefined, params);
      } catch(err) {
        setTimeout(function () { throw err; }, 0);
      }
      subscribersForOnce = undefined;
    }
  };

  return mix;
}

},{}],7:[function(require,module,exports){
var model = require( "./model.js" );
var router = require( "./router.js" );
var view = require( "./view.js" );
var editor = require( "./editor.js" );

var vanillaPress = {
  init: function() {
    model.init();
    router.init();
    view.init();
    editor.init();
  }
};
vanillaPress.init();

},{"./editor.js":9,"./model.js":12,"./router.js":13,"./view.js":14}],8:[function(require,module,exports){
var Posts = [
  {
    id:1,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"hello-world",
    type:"post",
    title:"Hello world!",
    content:"Welcome to WordPress.\nThis is your first post.\nEdit or delete it, then start writing!",
  },
  {
    id:2,
    date:"2016-01-10T22:05:09",
    modified:"2016-01-10T22:05:09",
    slug:"learning-javascript",
    type:"post",
    title:"Learning JavaScript!",
    content:"<p>I'm learning JavaScript and super excited!!!</p> ",
  },
  {
    id:3,
    date:"2016-01-11T22:05:09",
    modified:"2016-01-11T22:05:09",
    slug:"rest-api",
    type:"post",
    title:"The REST API!",
    content:"<p>I've started working with the REST API in WordPress, what fun!</p> ",
  },
  {
    id:4,
    date:"2016-01-12T22:05:09",
    modified:"2016-01-12T22:05:09",
    slug:"json-data",
    type:"post",
    title:"JSON Data!",
    content:"<p>So, with the REST API it is posible to pull in WordPress data as pure JSON.  Now I'm figuring out what to do with the data</p> ",
  },
  {
    id:5,
    date:"2016-01-13T22:05:09",
    modified:"2016-01-13T22:05:09",
    slug:"javascript-project",
    type:"post",
    title:"JavaScript Project",
    content:"<p>I've started working with the REST API in WordPress, what fun!</p> "
  }
];

var Pages = [
  {
    id:40,
    date:"2016-01-07T22:05:09",
    modified:"2016-01-07T22:05:09",
    slug:"home",
    type:"page",
    title:"Home",
    content:"<p>Welcome!</p><p>Reprehenderit sit sunt nisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
  },
  {
    id:41,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"about",
    type:"page",
    title:"About Me",
    content:"<p>Hi!  I'm me :)</p><p>Sisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
  },
  {
    id:42,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"blog",
    type:"page",
    title:"Blog",
    content:"<p>Welcome to my blog page, please enjoy!</p>",
  },
  {
    id:43,
    date:"2016-01-19T22:06:09",
    modified:"2016-01-19T22:06:09",
    slug:"contact",
    type:"page",
    title:"Contact",
    content:"<p>Please get in touch!</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
  }
];

var Settings = [
  {
    id:991,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"site-name",
    type:"setting",
    title:"Site Name",
    content:"VanillaPress"
  },
  {
    id:992,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"site-description",
    type:"setting",
    title:"Site Description",
    content:"A JS Front & Back End"
  }
];

var data = [Posts, Pages, Settings];

module.exports = data;

},{}],9:[function(require,module,exports){
// var addClass = require('amp-add-class');
// var removeClass = require('amp-remove-class');
// var toggleClass = require('amp-toggle-class');

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
  listenEditorToggle: function(){
    var editorToggleEl = helpers.getEditorToggleLink();
    editorToggleEl.addEventListener("click", function(){
      editor.toggle();
      event.preventDefault();
    }, false);
  },
  listenUpdatePost: function() {
    event.preventDefault();
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
    storePosts.forEach(function(item){
      if(editor.currentPost.id == item.id){
        item.title = editor.currentPost.title;
        item.content = editor.currentPost.content;
      }
    });
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
  },
  showEditPanel: function() {
    editor.clearEditForm();
    var post = editor.currentPost;
    var editNav = helpers.getEditorEditNav();
    var editorEl = helpers.getEditorEditNav();
    editorEl.classList.toggle("active");
    editor.currentMenu = "edit";
    editor.updateNavTitle();
    editor.fillEditForm();
    var editForm = helpers.getEditorForm();
    editForm.addEventListener('submit', editor.listenUpdatePost, false);
    //}
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
      router.updateHash(view.currentPost.slug);
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

  }
};

module.exports = editor;

},{"./lib/helpers.js":11,"./model.js":12,"./router.js":13,"./view.js":14,"wysiwyg":1}],10:[function(require,module,exports){
var jsonData = [
  {
    posts: [
      {
        id:1,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"hello-world",
        type:"post",
        title:"Hello world!",
        content:"<p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p> ",
      },
      {
        id:2,
        date:"2016-01-10T22:05:09",
        modified:"2016-01-10T22:05:09",
        slug:"learning-javascript",
        type:"post",
        title:"Learning JavaScript!",
        content:"<p>I'm learning JavaScript and super excited!!!</p> ",
      },
      {
        id:3,
        date:"2016-01-11T22:05:09",
        modified:"2016-01-11T22:05:09",
        slug:"rest-api",
        type:"post",
        title:"The REST API!",
        content:"<p>I've started working with the REST API in WordPress, what fun!</p> ",
      },
      {
        id:4,
        date:"2016-01-12T22:05:09",
        modified:"2016-01-12T22:05:09",
        slug:"json-data",
        type:"post",
        title:"JSON Data!",
        content:"<p>So, with the REST API it is posible to pull in WordPress data as pure JSON.  Now I'm figuring out what to do with the data</p> ",
      },
      {
        id:5,
        date:"2016-01-13T22:05:09",
        modified:"2016-01-13T22:05:09",
        slug:"javascript-project",
        type:"post",
        title:"JavaScript Project",
        content:"<p>I've started working with the REST API in WordPress, what fun!</p> ",
      }
    ],
    pages: [
      {
        id:40,
        date:"2016-01-07T22:05:09",
        modified:"2016-01-07T22:05:09",
        slug:"home",
        type:"page",
        title:"Home",
        content:"<p>Welcome!</p><p>Reprehenderit sit sunt nisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
      },
      {
        id:41,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"about",
        type:"page",
        title:"About Me",
        content:"<p>Hi!  I'm me :)</p><p>Sisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
      },
      {
        id:42,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"blog",
        type:"page",
        title:"Blog",
        content:"<p>Welcome to my blog page, please enjoy!</p>",
      },
      {
        id:43,
        date:"2016-01-19T22:06:09",
        modified:"2016-01-19T22:06:09",
        slug:"contact",
        type:"page",
        title:"Contact",
        content:"<p>Please get in touch!</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
      }
    ],
    settings: [
      {
        id:991,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"site-name",
        type:"setting",
        title:"Site Name",
        content:"VanillaPress"
      },
      {
        id:992,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"site-description",
        type:"setting",
        title:"Site Description",
        content:"A JS Front & Back End"
      }
    ]
  },
];

module.exports = jsonData;

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
var data = require( "./data.js" );
var jsonData = require( "./json.js" );
var helpers = require( "./lib/helpers.js" );

var model = {
  init: function() {
    var localStore = model.getLocalStore();
    if(typeof localStore === "undefined" || localStore === null | localStore === "") {
      localStorage.setItem('vanillaPress', JSON.stringify(jsonData) );
      localStore = model.getLocalStore();
    }
  },
  getContent: function(type) {
    var data = model.getLocalStore();
    type = type + "s";
    switch (type) {
      case "posts":
        content = data.posts;
        break;
      case "pages":
        content = data.pages;
        break;
      case "settings":
        content = data.settings;
        break;
      default:
        content =  [{type:"404",title:"404 Error"}];
    }
    return content;
  },
  getPostBySlugs: function(slugs) {
    var post;
    if( slugs.length > 1 && (slugs[0] == "posts" || slugs[0] == "blog")) {
      post = model.getPostBySlug(slugs[1], 'posts');
    } else if(slugs.length > 1 && slugs[0] == "settings"){
      post = model.getPostBySlug(slugs[1], 'settings');
    } else {
      if( slugs[0] === "") slugs[0] = "home";
      post = model.getPostBySlug(slugs[0], 'pages');
    }
    return post;
  },
  getPostBySlug: function(slug, contentType){
    //get contet from local storage
    var data = model.getLocalStore();
    var content;
    switch (contentType) {
      case "posts":
        content = data.posts;
        break;
      case "pages":
        content = data.pages;
        break;
      case "settings":
        content = data.settings;
        break;
      default:
        content =  [{type:"404",title:"404 Error"}];
    }
    var item = content.filter( function( obj ) {
      return obj.slug == slug;
    });
    return item[0];
  },
  getCurrentContentObj: function() {
    var newPageSlugs = helpers.getAfterHash();
    var post;
    if( newPageSlugs.length > 1 ) {
      post = model.getPostBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      post = model.getPostBySlug(newPageSlugs[0], 'pages');
    }
    return post;
  },
  getLocalStore: function() {
    var store = JSON.parse(localStorage.getItem('vanillaPress'));    
    if(store === null) {
      store = [""];
    }
    return store[0];
  },
  updateLocalStore: function(store) {
    //console.log( JSON.stringify(store) );
    var newStore = [store];
    localStorage.setItem('vanillaPress', JSON.stringify(newStore) );
  },
  removeLocalStore: function() {
    localStorage.removeItem('vanillaPress');
  }
};

module.exports = model;

},{"./data.js":8,"./json.js":10,"./lib/helpers.js":11}],13:[function(require,module,exports){
var helpers = require( "./lib/helpers.js" );
var model = require( "./model.js" );
var view = require( "./view.js" );

var router = {
  init: function() {
    router.setCurrentPost();
    view.update();
    router.listenPageChange();
  },
  listenPageChange: function() {
    window.addEventListener("hashchange", router.setCurrentPost, false);
  },
  setCurrentPost: function() {
    var slugs = helpers.getAfterHash();
    var post = model.getPostBySlugs(slugs);
    view.currentPost = post;
  },
  updateHash: function(slug) {
    window.location.hash = slug;
  }
};
module.exports = router;

},{"./lib/helpers.js":11,"./model.js":12,"./view.js":14}],14:[function(require,module,exports){
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
    view.updateTitle( view.currentPost.title );
    view.updateContent( view.currentPost.content );
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
  disableNav: function(){
    event.preventDefault();
  }
};
module.exports = view;

},{"./lib/helpers.js":11,"./model.js":12}]},{},[7]);
