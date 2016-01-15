var Posts = [
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
    content:"My VanillaPress Site"
  },
  {
    id:992,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"site-description",
    type:"setting",
    title:"Site Description",
    content:"Not Just Another WP Site"
  }
];
;/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20150312
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

// Full polyfill for browsers with no classList support
// Including IE < Edge missing SVGElement.classList
if (!("classList" in document.createElement("_")) || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (index !== -1) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	testElement = null;
}());

}

}
;Array.prototype.isArray = true;

function getAfterHash(url) {
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
}

function addMenuItems(menuItems, contentType) {
  menuItems.forEach(function(item){
    var a = createLink(item.title, contentType, item.slug);
    addMenuItem(a);
  });
}
function addMenuItem(menuItem) {
  var ul = document.querySelector("#editor nav.secondary ul");
  var li = document.createElement("li");
  li.appendChild(menuItem);
  ul.appendChild(li);
}
function createLink(text, contentType, slug) {
  var a = document.createElement('a');
  var aText = document.createTextNode(text);
  a.appendChild(aText);
  a.href = "#edit/" + contentType + "/" + slug;
  return a;
}

function getEditorEl() {
  var el = document.getElementById("editor");
  return el;
}
function getEditorToggleEl() {
  var el = document.getElementById("editorToggle");
  return el;
}
function getCurrentContentObj() {

  var newPageSlugs = getAfterHash();  
  var pageContent;
  if( newPageSlugs.length > 1 ) {
    pageContent = getContentBySlug(newPageSlugs[1], 'posts');
  } else {
    if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
    pageContent = getContentBySlug(newPageSlugs[0], 'pages');
  }
  return pageContent;
}
;var router = {
  init: function() {
    var mainNav = document.getElementById("mainNav");
    var links = mainNav.getElementsByTagName("a");
    for(var i = 0, len = links.length; i < len; i++) {
        links[i].addEventListener("click", view.update, false);
    }    
    //view.update();

  }
};
;
function getContent(type) {
  var content;
  switch (type) {
    case "posts":
      content = Posts;
      break;
    case "pages":
      content = Pages;
      break;
    case "settings":
      content = Settings;
      break;
    default:
      content =  [{type:"404",title:"404 Error"}];
  }
  return content;
}

function getContentBySlug(slug, contentType){
  var content;
  switch (contentType) {
    case "posts":
      content = Posts;
      break;
    case "pages":
      content = Pages;
      break;
    case "settings":
      content = Settings;
      break;
    default:
      content =  [{type:"404",title:"404 Error"}];
  }
  var item = content.filter( function( obj ) {
    return obj.slug == slug;
  });
  return item[0];
}
;var wysiwyg = require('wysiwyg');
var editor = {
  //posts: get_posts(),
  loadMenu: function(){
    editor.clearMenus();
    editor.showCurrentMenu();
  },
  showCurrentMenu: function() {

    var urlSegments = getAfterHash();
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
    var currentSecondaryMenu = getAfterHash()[1];
    var menuItems = getContent(currentSecondaryMenu);
    addMenuItems(menuItems, currentSecondaryMenu);
  },
  showEditPanel: function(slug, contentType){
    this.updateMenuTitle();
    var itt;
    var post = getContentBySlug(slug, contentType);
    if( contentType == "posts" || contentType == "pages" ) {
        this.fillEditForm(post);
    }
  },
  fillEditForm: function(post) {
    editor.clearEditForm();
    var editTitle = document.getElementById("editTitle");
    var editContent = document.getElementById("editContent");
    editTitle.value = post.title;
    editContent.value = post.content;
    var contentEditor = wysiwyg(post.content);
    contentEditor.bold();
    //contentEditor.selectAll();
    contentEditor.onUpdate(function () {
      //console.log(contentEditor.read());
    });
  },
  clearEditForm: function() {
    editTitle.value = "";
    editContent.value = "";
  },
  clearMenus: function(){
    var editorEl = getEditorEl();
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
    var editorEl = getEditorEl();
    editorEl.classList.toggle("hidden");
    var toggleBtn = document.querySelector("#editorToggle");
    toggleBtn.classList.toggle("hidden");
    if( toggleBtn.classList.contains("hidden") === false ) {
      var viewContent = getCurrentContentObj();
      editor.fillEditForm(viewContent);
    }
  },
  updateMenuTitle: function() {
    var title = null,
        titleEl,
        urlSegments = getAfterHash();
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
;var view = {
  init: function() {
    var viewContent = getCurrentContentObj();
    view.updateTitle( viewContent.title );
    view.updateContent( viewContent.content );

  },
  update: function() {
    var newPageSlugs = getAfterHash(this.href);
    var viewContent;
    if( newPageSlugs.length > 1 ) {
      viewContent = getContentBySlug(newPageSlugs[1], 'posts');
    } else {
      if( newPageSlugs[0] === "") newPageSlugs[0] = "home";
      viewContent = getContentBySlug(newPageSlugs[0], 'pages');
    }

    view.updateTitle( viewContent.title );
    view.updateContent( viewContent.content );
  },
  updateTitle: function(title) {
    var titleEl = document.getElementById("pageTitle");    
    titleEl.innerHTML = title;
  },
  updateContent: function(content) {
    var contentEl = document.getElementById("pageContent");
    contentEl.innerHTML = content;
  }
};
;var vanillaPress = {
  init: function() {
    router.init();
    view.init();
    editor.loadMenu();
    editor.setupToggle();

  }
};
vanillaPress.init();
