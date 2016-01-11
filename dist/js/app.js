(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    id:41,
    date:"2016-01-09T22:05:09",
    modified:"2016-01-09T22:05:09",
    slug:"about",
    type:"page",
    title:"About Me",
    content:"<p>Hi!  I'm me :)</p> ",
  },
  {
    id:42,
    date:"2016-01-09T22:06:09",
    modified:"2016-01-09T22:06:09",
    slug:"portfolio",
    type:"page",
    title:"Portfolio",
    content:"<p>Here's my work :)</p> ",
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
;function getAfterHash(url) {
  url = typeof url !== 'undefined' ? url : null;
  returnArray = typeof returnArray !== 'undefined' ? returnArray : null;
  var urlSegments;
  if (url === null){
      urlSegments = window.location.hash.substr(1);
  } else {
      urlSegments = url.split('#')[1];
  }
  return urlSegments.split("/");
}

function refreshMenu(){

  //console.log(this);
  //urlSegments = getAfterHash();
  //console.log(this);
  //ffwindow.location.hash = window.location.hash;

  //editor.loadMenu();
  //event.preventDefault();
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
    if( urlSegments[0] == "edit" && urlSegments.length == 2 ) {
      currentMenu = "secondary";
      this.showSecondaryMenu();
    }
    //if editing content
    if( urlSegments[0] == "edit" && urlSegments.length == 3 ) {
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
    var editTitle = document.getElementById("editTitle");
    var editContent = document.getElementById("editContent");
    editTitle.value = post.title;
    editContent.value = post.content;
    var contentEditor = wysiwyg(editContent);
    contentEditor.selectAll();
    contentEditor.onUpdate(function () {
      //console.log(contentEditor.read());
    });
  },
  clearMenus: function(){
    var editorEl = document.getElementById("editor");
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
      titleEl.addEventListener("click", refreshMenu, false);
    }

    var homeLink = document.querySelector("#editor nav.edit h3 .go-home");
    if( homeLink ) addEventListener("click", refreshMenu, false);

    titleEl.textContent = title;
  }
};
;function init() {

  editor.loadMenu();

}
init();

},{"wysiwyg":2}],2:[function(require,module,exports){
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

},{"debounce-fn":3,"dom-classes":4,"make-editable":6,"pubsub":7}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{"indexof":5}],5:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}]},{},[1]);
