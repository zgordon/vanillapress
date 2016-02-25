(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 * http://spin.js.org/
 *
 * Example:
    var opts = {
      lines: 12             // The number of lines to draw
    , length: 7             // The length of each line
    , width: 5              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 1.0            // Scales overall size of the spinner
    , corners: 1            // Roundness (0..1)
    , color: '#000'         // #rgb or #rrggbb
    , opacity: 1/4          // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 1              // Rounds per second
    , trail: 100            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '50%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
    }
    var target = document.getElementById('foo')
    var spinner = new Spinner(opts).spin(target)
 */
;(function (root, factory) {

  /* CommonJS */
  if (typeof module == 'object' && module.exports) module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}(this, function () {
  "use strict"

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */
    , sheet /* A stylesheet to hold the @keyframe or VML rules. */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl (tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for (n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins (parent /* child1, child2, ...*/) {
    for (var i = 1, n = arguments.length; i < n; i++) {
      parent.appendChild(arguments[i])
    }

    return parent
  }

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation (alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor (el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    if (s[prop] !== undefined) return prop
    for (i = 0; i < prefixes.length; i++) {
      pp = prefixes[i]+prop
      if (s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css (el, prop) {
    for (var n in prop) {
      el.style[vendor(el, n) || n] = prop[n]
    }

    return el
  }

  /**
   * Fills in default values.
   */
  function merge (obj) {
    for (var i = 1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def) {
        if (obj[n] === undefined) obj[n] = def[n]
      }
    }
    return obj
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor (color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12             // The number of lines to draw
  , length: 7             // The length of each line
  , width: 5              // The line thickness
  , radius: 10            // The radius of the inner circle
  , scale: 1.0            // Scales overall size of the spinner
  , corners: 1            // Roundness (0..1)
  , color: '#000'         // #rgb or #rrggbb
  , opacity: 1/4          // Opacity of the lines
  , rotate: 0             // Rotation offset
  , direction: 1          // 1: clockwise, -1: counterclockwise
  , speed: 1              // Rounds per second
  , trail: 100            // Afterglow percentage
  , fps: 20               // Frames per second when using setTimeout()
  , zIndex: 2e9           // Use a high z-index by default
  , className: 'spinner'  // CSS class to assign to the element
  , top: '50%'            // center vertically
  , left: '50%'           // center horizontally
  , shadow: false         // Whether to render a shadow
  , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
  , position: 'absolute'  // Element positioning
  }

  /** The constructor */
  function Spinner (o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function (target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = createEl(null, {className: o.className})

      css(el, {
        position: o.position
      , width: 0
      , zIndex: o.zIndex
      , left: o.left
      , top: o.top
      })

      if (target) {
        target.insertBefore(el, target.firstChild || null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps / o.speed
          , ostep = (1 - o.opacity) / (f * o.trail / 100)
          , astep = f / o.lines

        ;(function anim () {
          i++
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
        })()
      }
      return self
    }

    /**
     * Stops and removes the Spinner.
     */
  , stop: function () {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    }

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
  , lines: function (el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill (color, shadow) {
        return css(createEl(), {
          position: 'absolute'
        , width: o.scale * (o.length + o.width) + 'px'
        , height: o.scale * o.width + 'px'
        , background: color
        , boxShadow: shadow
        , transformOrigin: 'left'
        , transform: 'rotate(' + ~~(360/o.lines*i + o.rotate) + 'deg) translate(' + o.scale*o.radius + 'px' + ',0)'
        , borderRadius: (o.corners * o.scale * o.width >> 1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute'
        , top: 1 + ~(o.scale * o.width / 2) + 'px'
        , transform: o.hwaccel ? 'translate3d(0,0,0)' : ''
        , opacity: o.opacity
        , animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px #000'), {top: '2px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    }

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
  , opacity: function (el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML () {

    /* Utility function to create a VML tag */
    function vml (tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function (el, o) {
      var r = o.scale * (o.length + o.width)
        , s = o.scale * 2 * r

      function grp () {
        return css(
          vml('group', {
            coordsize: s + ' ' + s
          , coordorigin: -r + ' ' + -r
          })
        , { width: s, height: s }
        )
      }

      var margin = -(o.width + o.length) * o.scale * 2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg (i, dx, filter) {
        ins(
          g
        , ins(
            css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx})
          , ins(
              css(
                vml('roundrect', {arcsize: o.corners})
              , { width: r
                , height: o.scale * o.width
                , left: o.scale * o.radius
                , top: -o.scale * o.width >> 1
                , filter: filter
                }
              )
            , vml('fill', {color: getColor(o.color, i), opacity: o.opacity})
            , vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++) {
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
        }

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function (el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i + o < c.childNodes.length) {
        c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  if (typeof document !== 'undefined') {
    sheet = (function () {
      var el = createEl('style', {type : 'text/css'})
      ins(document.getElementsByTagName('head')[0], el)
      return el.sheet || el.styleSheet
    }())

    var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

    if (!vendor(probe, 'transform') && probe.adj) initVML()
    else useCssAnimations = vendor(probe, 'animation')
  }

  return Spinner

}));

},{}],2:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){

/**
 * Main app file.  Initializes app components.
 */

var model = require( './model.js' ),
    router = require( './router.js' ),
    view = require( './view.js' ),
    editor = require( './editor.js' );


/**
 * The main app object.
 *
 * @namespace
 */
var vanillaPress = {
  init: function() {
    model.init();
    router.init();
    view.init();
    editor.init();
  }
};

vanillaPress.init();

},{"./editor.js":10,"./model.js":12,"./router.js":13,"./view.js":14}],9:[function(require,module,exports){
/**
 * Main JSON object of posts, pages and settings
 */
var jsonData =
  {
    posts: [
      {
        id:1,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"hello-world",
        type:"posts",
        title:"Hello world!",
        content:"<p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p> ",
      },
      {
        id:2,
        date:"2016-01-10T22:05:09",
        modified:"2016-01-10T22:05:09",
        slug:"learning-javascript",
        type:"posts",
        title:"Learning JavaScript!",
        content:"<p>I'm learning JavaScript and super excited!!!</p> ",
      },
      {
        id:3,
        date:"2016-01-11T22:05:09",
        modified:"2016-01-11T22:05:09",
        slug:"rest-api",
        type:"posts",
        title:"The REST API!",
        content:"<p>I've started working with the REST API in WordPress, what fun!</p> ",
      },
      {
        id:4,
        date:"2016-01-12T22:05:09",
        modified:"2016-01-12T22:05:09",
        slug:"json-data",
        type:"posts",
        title:"JSON Data!",
        content:"<p>So, with the REST API it is posible to pull in WordPress data as pure JSON.  Now I'm figuring out what to do with the data</p> ",
      },
      {
        id:5,
        date:"2016-01-13T22:05:09",
        modified:"2016-01-13T22:05:09",
        slug:"javascript-project",
        type:"posts",
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
        type:"pages",
        title:"Home",
        content:"<p>Welcome!</p><p>Reprehenderit sit sunt nisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
      },
      {
        id:41,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"about",
        type:"pages",
        title:"About Me",
        content:"<p>Hi!  I'm me :)</p><p>Sisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>",
      },
      {
        id:42,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"blog",
        type:"pages",
        title:"Blog",
        content:"<p>Welcome to my blog page, please enjoy!</p>",
      },
      {
        id:43,
        date:"2016-01-19T22:06:09",
        modified:"2016-01-19T22:06:09",
        slug:"contact",
        type:"pages",
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
        type:"settings",
        title:"Site Name",
        content:"VanillaPress"
      },
      {
        id:992,
        date:"2016-01-09T22:05:09",
        modified:"2016-01-09T22:05:09",
        slug:"site-description",
        type:"settings",
        title:"Site Description",
        content:"A JS Front & Back End"
      }
    ]
  };

module.exports = jsonData;

},{}],10:[function(require,module,exports){
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
    editor.currentPostType = urlSegments[0];
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
    var slugs = helpers.getAfterHash( this.href ),
        post = model.getPostBySlugs( slugs );

    editor.currentPost = post;
    editor.currentPostType = post.type;

    if ( editor.currentPostType !== 'settings' ) {
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
        updateBtn = helpers.getEditorEditUpdateBtn(),
        deleteBtn = helpers.getDeletePostLink();

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
      editor.currentPost.type = 'posts';

      // Slugify title
      editor.currentPost.slug = helpers.slugifyTitle( editor.currentPost.title );
      // Make sure slug is unique
      editor.currentPost.slug = model.uniqueifySlug( editor.currentPost.slug );

      // Get a new post id
      editor.currentPost.id = model.getNewPostId();

      // Set the date
      editor.currentPost.date = Date();
      editor.currentPost.modified = Date();
    }

    // Get temp store of posts based on type
    if ( postType === 'posts' ) {
      storePosts = store.posts;
    } else if ( postType === 'pages' ) {
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
    if ( postType === 'posts' ) {
      store.posts = storePosts;
    } else if ( postType === 'pages' ) {
      store.pages = storePosts;
    } else {
      store.settings = storePosts;
    }
    model.updateLocalStore( store );

    // Update url and current post
    if ( postType === 'posts' ) {
      router.updateHash( 'blog/' + editor.currentPost.slug );
    } else if ( postType === 'pages' ) {
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
    helpers.addMenuItems( menuItems, postType );

    // Add listeners to secondary links
    for ( var i = 0, max = secondaryLinks.length; i < max; i++ ) {
      secondaryLinks[i].addEventListener(
        'click',
        editor.listenLoadEditForm,
        false);
    }

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
  showEditPanel: function() {
    var post = editor.currentPost,
        editNav = helpers.getEditorEditNav(),
        editForm = helpers.getEditorForm(),
        titleField = helpers.getEditorTitleField();
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

    titleField.removeAttribute( 'readonly', 'readonly' );

    if ( editor.currentPostType === 'posts' ) {
      deleteBtn.classList.remove( 'hidden' );
      // Add event listener to delete post
      deleteBtn.addEventListener(
        'click',
        editor.listenDeletePost,
        false
      );
    } else if ( editor.currentPostType === 'settings' ) {
      // Make title input read only
      titleField.setAttribute( 'readonly', 'readonly' );
      deleteBtn.classList.add( 'hidden' );
    } else {
      deleteBtn.classList.add( 'hidden' );
    }
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
    } else if (  post.slug === 'site-name' ) {
    // Live update controls for settings
      wysiwyg.onUpdate(function () {
        view.updateSiteName( wysiwyg.read() );
        editor.currentPost.content = wysiwyg.read();
      });
    } else if( post.slug == 'site-description' ) {
      wysiwyg.onUpdate( function () {
        view.updateSiteDescription( wysiwyg.read() );
        editor.currentPost.content = wysiwyg.read();
      });
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
        viewEl = helpers.getViewEl();

    // Clear menus and load edit panel
    editor.clearMenus();
    editor.currentPost = view.currentPost;
    editor.currentPostType = view.currentPost.type;
    editor.currentMenu = 'edit';

    // Toggle editor and nav hidden classes
    editorEl.classList.toggle('hidden');
    toggleEl.classList.toggle('hidden');
    // Toggle whether view nav is disabled
    viewEl.classList.toggle('inactive');

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
      view.listenDisableViewLinks();
    } else {
      // If closing editor
      if ( view.currentPost.type === 'posts' ) {
        router.updateHash( 'blog/' + view.currentPost.slug );
      } else {
        if ( editor.currentPost.slug === '_new' ) {
          // If closing a new post editor
          router.updateHash( 'blog' );
          router.setCurrentPost();
        } else {
          router.updateHash( view.currentPost.slug );
        }
      }
      view.listenEnableViewLinks();
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
      navTitleEl.innerHTML = postType;
    } else {
      // If editing post
      var navTitleLink = helpers.getEditorNavTitleLink();
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

},{"./lib/helpers.js":11,"./model.js":12,"./router.js":13,"./view.js":14,"spin.js":1,"wysiwyg":2}],11:[function(require,module,exports){
Array.prototype.isArray = true;

var helpers = {

  getAfterHash: function( url ) {
    url = url || '';
    var urlSegments = [];

    if( url !== '' ) {
      url = url.substring( url.indexOf( '#' ) + 1 );
      urlSegments = url.split( '/' );
    } else {
      var pageUrl = window.location.hash.substr( 1 );
      urlSegments = pageUrl.split( '/' );
    }

    return urlSegments;
  },

  addMenuItems: function( menuItems, postType ) {
    menuItems.forEach( function( item ){

      var a = helpers.createLink( item.title, postType, item.slug );
      helpers.addMenuItem( a );

    });
  },

  addMenuItem: function( menuItem ) {
    var ul = document.querySelector( '#editor nav#secondary ul' ),
        li = document.createElement( 'li' );

    li.appendChild( menuItem );
    ul.appendChild( li );
  },

  createLink: function( text, postType, slug ) {
    var a = document.createElement( 'a' ),
        aText = document.createTextNode( text );

    a.appendChild( aText );

    if ( 'posts' === postType  ) {
      a.href = '#blog/' + slug;
    } else if ( 'settings' === postType ) {
      a.href = '#settings/' + slug;
    } else {
      a.href = '#' + slug;
    }

    return a;
  },

  createPostMarkup: function( post ) {
    var articleEl = document.createElement( 'article' ),
        titleEl = document.createElement( 'h3' ),
        titleLink = document.createElement( 'a' ),
        title = document.createTextNode( post.title ),
        contentDiv,
        excerpt;

    titleLink.appendChild( title );
    titleLink.href = '#blog/' + post.slug;
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

  getEditorEl: function() {
    return document.getElementById( 'editor' );
  },

  getEditorToggleEl: function() {
    return document.getElementById( 'editorToggle' );
  },

  getEditorToggleLink: function() {
    return document.querySelector( '#editorToggle a' );
  },

  getEditorNavs: function() {
    var editorEl = helpers.getEditorEl(),
        navs = editorEl.getElementsByTagName( 'nav' );
    return  navs;
  },

  getEditorPrimaryNav: function() {
    return  document.querySelector( '#editor nav#primary' );
  },

  getEditorPrimaryNavLinks: function() {
    var primaryNav = helpers.getEditorPrimaryNav();
    return  primaryNav.getElementsByTagName( 'a' );
  },

  getEditorSecondaryNav: function() {
    return  document.querySelector( '#editor nav#secondary' );
  },

  getEditorSecondaryNavUl: function() {
    var secondaryNav = helpers.getEditorSecondaryNav();
    return  secondaryNav.querySelector( 'ul' );
  },

  getEditorAddNewPost: function() {
    return  document.querySelector( '#editor #addNew a' );
  },

  getDeletePostLink: function() {
    return document.querySelector( '#deletePost a' );
  },

  getCurrentNavEl: function( currentMenu ) {
    var nav;

    if ( currentMenu === 'edit' ) {
      nav = helpers.getEditorEditNav();
    } else if ( currentMenu === 'secondary' ) {
      nav = helpers.getEditorSecondaryNav();
    } else {
      nav = helpers.getEditorPrimaryNav();
    }

    return nav;
  },

  getEditorEditNav: function() {
    return  document.querySelector( '#editor nav#edit' );
  },

  getEditorHomeLinkEl: function( currentMenu ) {
    var nav = helpers.getCurrentNavEl( currentMenu );
    return nav.querySelector( 'h3 .go-home' );
  },

  getEditorNavTitleEl: function( currentMenu ) {
    var nav = helpers.getCurrentNavEl( currentMenu );
    return nav.querySelector( 'h3 span' );
  },

  getEditorNavTitleLink: function() {
    var editNav = helpers.getEditorEditNav();
    return editNav.querySelector( 'h3 span a' );
  },

  getEditorTitleField: function() {
    return document.getElementById( 'editTitle' );
  },

  slugifyTitle: function( title ) {
    var slug = title.trim();

    slug = slug.replace(/[^a-zA-Z0-9\s]/g,"");
    slug = slug.toLowerCase();
    slug = slug.replace(/\s/g,'-');

    return slug;
  },

  getEditorWysiwyg: function() {
    var editNav = helpers.getEditorEditNav();
    return editNav.querySelector( 'form iframe' );
  },

  getEditorForm: function() {
    var editNav = helpers.getEditorEditNav();
    return editNav.querySelector( 'form' );
  },

  getEditorEditUpdateBtn: function() {
    return document.getElementById( 'editUpdateBtn' );

  },

  getViewEl: function() {
    return document.getElementById( 'view' );
  },

  getViewLinks: function() {
    return document.querySelectorAll( '#view a' );
  },

  getSiteName: function() {
    var siteNameEl = document.getElementById( 'siteName' );
    return siteNameEl.querySelector( 'a' );
  },

  getSiteDescription: function() {
    return document.getElementById( 'siteDesription' );
  },

  getMainNavEl: function() {
    var mainNavEl = document.getElementById( 'mainNav' );
    return mainNavEl;
  },

  getMainNavLinks: function() {
    var mainNav = document.getElementById( 'mainNav' ),
        links = mainNav.getElementsByTagName( 'a' );
    return links;
  },

  getPostTitle: function() {
    var titleEl = document.getElementById( 'pageTitle' );
    return titleEl;
  },

  getPrimaryContentEl: function(){
    var primaryContentEL = document.querySelector( '#view .content .primary' );
    return primaryContentEL;
  }

};

module.exports = helpers;

},{}],12:[function(require,module,exports){
/**
 * This file contains methods having to do with
 * getting and setting of data.  Leverages local
 * store.
 *
 * @exports model
 *
 */

var jsonData = require( './data.js' ),
    error404 = {type:'404',title:'404 Error', content: 'Please try another page'};


/**
 * Main model object.
 *
 * @namespace
 */
var model = {
  /**
   * Initializes model and sets local store if empty
   *
   */
  init: function() {
    var localStore = model.getLocalStore();
    if( typeof localStore === 'undefined' || localStore === null ||
        localStore === '' ) {
      localStorage.setItem(
        'vanillaPress',
        JSON.stringify( jsonData )
      );
    }
  },

  /**
   * Gets posts based on post type.
   *
   * @param postType {string} The type of content needed (post, page, etc)
   * @return posts {array} Posts matching post type (Posts, Pages, etc)
   */
  getPostsByType: function( postType ) {
    // Get content from local store
    var data = model.getLocalStore(),
        posts;

    // Get posts from local store
    if ( 'posts' === postType ) {
      return data.posts;
    } else if ( 'pages' === postType ) {
      return data.pages;
    } else if ( 'settings' === postType ) {
      return data.settings;
    } else {
      return  [ error404 ];
    }
  },

  /**
   * Get a single post based on url slugs
   *
   * @param slugs {array} The url slugs for the post
   * @return post {object} Single post based on url slugs
   *
   */
  getPostBySlugs: function( slugs ) {
    var post;

    if ( slugs.length > 1 && 'blog' === slugs[0] ) {
      // If blog post
      return model.getPostBySlug( slugs[1], 'posts' );
    } else if ( slugs.length > 1 && 'settings' === slugs[0] ) {
      // If setting
      return model.getPostBySlug( slugs[1], 'settings' );
    } else {
      // If page
      if( '' === slugs[0] ) slugs[0] = 'home';
      return model.getPostBySlug( slugs[0], 'pages');
    }
  },

  /**
   * Get single post slug and post type
   *
   * @param slug {string} The url slug for the post
   * @param postType {string} The post type for the post
   * @return post {object} Single post based on url slugs
   *
   */
  getPostBySlug: function( slug, postType ){
    // Get contet from local storage
    var data = model.getLocalStore(),
        posts = model.getPostsByType ( postType ),
        post;

    // Get the post from store based on the slug
    post = posts.filter( function( post ) {
      return post.slug == slug;
    });

    return post[0];
  },

  /**
   * Gets a unique id for a new post
   *
   * @return next highest id based on existing posts
   */
  getNewPostId: function() {
    var localStore = model.getLocalStore(),
        postIds = [],
        newId,
        highestId;

    localStore.posts.forEach(function( post ) {
      postIds.push( Number( post.id ) );
    });
    highestId = Math.max.apply( Math, postIds );
    newId = highestId + 1;
    return newId;
  },

  /**
   * Checks if slug exists.
   * Adds a number to the end of the slug
   * until finds a unique slug.
   *
   * @param slug {string}
   * @return next highest id based on existing posts
   */
  uniqueifySlug: function( slug ) {
    var slugExists,
        n = 1,
        uniqueSlug = slug;

    // Check if slug exists
    slugExists = model.checkIfSlugExists( slug );
    while ( slugExists ) {
      uniqueSlug = slug + '-' + n;
      slugExists = model.checkIfSlugExists( uniqueSlug );
      n++;
    }

    return uniqueSlug;
  },

  /**
   * Checks if slug exists.
   *
   * @param slug {string}
   * @return true if slug exists or false if does not exist
   */
  checkIfSlugExists: function( slug ) {
    var localStore = model.getLocalStore(),
        slugs = [],
        slugExists;

    localStore.posts.forEach(function( post ) {
      slugs.push( post.slug );
    });

    slugExists = ( slugs.indexOf( slug ) > -1 );

    return slugExists;
  },

  /**
   * Gets content from local store
   *
   * @return store {object} Local storage object with all content
   */
  getLocalStore: function() {
    return JSON.parse( localStorage.getItem( 'vanillaPress' ) );
  },

  /**
   * Saves temporary store to local storage.
   *
   * @param store {object} Temporary store to update
   */
  updateLocalStore: function( store ) {
    // Makes sure to stringify store object before saving
    localStorage.setItem( 'vanillaPress', JSON.stringify( store ) );
  },

  /**
   * Deletes data from local storage.
   *
   */
  removeLocalStore: function() {
    localStorage.removeItem( 'vanillaPress' );
  }
};

module.exports = model;

},{"./data.js":9}],13:[function(require,module,exports){
/**
 * The router object takes actions based on the
 * hash in the url (i.e. #content-here)
 *
 * @exports router
 */

var helpers = require( './lib/helpers.js' ),
    model = require( './model.js' ),
    view = require( './view.js' ),
    error404 = {type:'404',title:'404 Error', content: 'Please try another page'};

/**
 * The main router object.
 *
 * @namespace
 */
var router = {
  init: function() {
    router.refreshCurrentPost();
    router.listenPageChange();
  },

  /**
   * Add listener to url changes
   *
   */
  listenPageChange: function() {
    window.addEventListener(
      'hashchange',
      router.refreshCurrentPost,
      false
    );
  },

  /**
   * Updates the the current post based on url
   *
   */
  refreshCurrentPost: function() {
    var slugs = helpers.getAfterHash(),
        post = model.getPostBySlugs( slugs );

    if( post ) {
      view.setCurrentPost( post );
    } else {
      // If page does not exist set 404 page
      view.setCurrentPost( error404 );
    }


  },

  /**
   * Helper function to update hash based on slug
   *
   */
  updateHash: function(slug) {
    window.location.hash = slug;
  }

};

module.exports = router;

},{"./lib/helpers.js":11,"./model.js":12,"./view.js":14}],14:[function(require,module,exports){

/**
 * This file controls the main front end view
 * of the app.
 *
 *
 * @exports view
 */
var helpers = require( './lib/helpers.js' ),
    model = require( './model.js' );


/**
 * Main view object
 *
 * @namespace
 */
var view = {
  init: function() {
    view.loadMainHeader();
  },

  currentPost: '',

  /**
   * Listener to disable view navigation while
   * editor is open.
   *
   */
  listenDisableViewLinks: function() {
    var links = helpers.getViewLinks();
    for ( var i = 0, len = links.length; i < len; i++ ) {
      // Add listener to deactivate main nav
      links[i].addEventListener('click', view.disableNav, false);
    }
  },

  /**
   * Listener to disable links in the view while the
   * editor is open.
   *
   */
  listenEnableViewLinks: function() {
    var links = helpers.getViewLinks();
    for ( var i = 0, len = links.length; i < len; i++ ) {
      // Add listener to deactivate main nav
      links[i].removeEventListener('click', view.disableNav, false);
    }
  },


  /**
   * Sets the current post and updates the view
   *
   * @param post {object} The new current post
   */
   setCurrentPost: function( post ) {
     view.currentPost = post;
     view.update();
   },

  /**
   * Updates the view based on current post
   *
   */
  update: function() {
    view.updateTitle( view.currentPost.title );
    view.updateContent( view.currentPost.content );

    view.removeBlogPosts();
    if ( 'blog' === view.currentPost.slug ) {
      // Append blog posts to blog page
      view.loadBlogPosts();
    }
  },

  /**
   * Loads the main header based on settings data in local store.
   *
   */
  loadMainHeader: function() {
    // Get site name and description from store
    var siteName = model.getPostBySlug( 'site-name', 'settings' ),
        siteDescription = model.getPostBySlug(
          'site-description',
          'settings'
        );
    view.updateSiteName( siteName.content );
    view.updateSiteDescription( siteDescription.content );
  },

  /**
   * Helper function to update to post content in the view.
   *
   * @param content {string} The site name to display
   */
  updateSiteName: function( content ) {
    var siteName = helpers.getSiteName();
    siteName.innerHTML = content;
  },

  /**
   * Helper function to update to the site description in the view.
   *
   * @param content {string} The site description to display
   */
  updateSiteDescription: function( content ) {
    var siteDescription = helpers.getSiteDescription();
    siteDescription.innerHTML = content;
  },

  /**
   * Helper function to update main page title in the view.
   *
   * @param title {string} The title to display
   */
  updateTitle: function(title) {
    var titleEl = document.getElementById( 'pageTitle' );
    titleEl.innerHTML = title;
  },

  /**
   * Helper function to update main page content in the view.
   *
   * @param content {string} The content to display
   */
  updateContent: function(content) {
    var contentEl = document.getElementById( 'pageContent' );
    contentEl.innerHTML = content;
  },

  /**
   * Helper function to clear title and content
   * in the main view
   *
   */
  clearContent: function() {
    var titleEl = document.getElementById( 'pageTitle' ),
        contentEl = document.getElementById( 'pageContent' );

    titleEl.innerHTML = '';
    contentEl.innerHTML = '';
  },

  /**
   * Gets blog posts and appends them to the page.
   *
   */
  loadBlogPosts: function() {
    var posts = model.getPostsByType( 'posts' ),
        postsMarkup = document.createElement( 'section' ),
        primaryContentEL;

    postsMarkup.id = 'blogPosts';
    // Get markup for each post
    for ( var i = 0, max = posts.length; i < max; i++ ) {
      postsMarkup.appendChild( helpers.createPostMarkup( posts[i] ) );
    }
    primaryContentEL = helpers.getPrimaryContentEl();
    // Append posts to page
    primaryContentEL.appendChild( postsMarkup );
  },

  /**
   * Remove blog posts from page
   *
   */
  removeBlogPosts: function(){
    var blogPost = document.getElementById( 'blogPosts' );
    if( blogPost )  {
      blogPost.remove();
    }
  },

  /**
   * Prevents main nav from working. Used when editor is open.
   *
   */
  disableNav: function(){
    event.preventDefault();
  }
};
module.exports = view;

},{"./lib/helpers.js":11,"./model.js":12}]},{},[8]);
