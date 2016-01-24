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
var model = require( './model.js' ),
    router = require( './router.js' ),
    view = require( './view.js' ),
    editor = require( './editor.js' );

var vanillaPress = {
  init: function() {
    model.init();
    router.init();
    view.init();
    editor.init();
  }
};

vanillaPress.init();

},{"./editor.js":10,"./model.js":13,"./router.js":14,"./view.js":15}],9:[function(require,module,exports){
var Posts = [
  {
    id:1,
    date:'2016-01-09T22:05:09',
    modified:'2016-01-09T22:05:09',
    slug:'hello-world',
    type:'post',
    title:'Hello world!',
    content:'Welcome to WordPress.\nThis is your first post.\nEdit or delete it, then start writing!',
  },
  {
    id:2,
    date:'2016-01-10T22:05:09',
    modified:'2016-01-10T22:05:09',
    slug:'learning-javascript',
    type:'post',
    title:'Learning JavaScript!',
    content:'<p>I\'m learning JavaScript and super excited!!!</p> ',
  },
  {
    id:3,
    date:'2016-01-11T22:05:09',
    modified:'2016-01-11T22:05:09',
    slug:'rest-api',
    type:'post',
    title:'The REST API!',
    content:'<p>I\'ve started working with the REST API in WordPress, what fun!</p> ',
  },
  {
    id:4,
    date:'2016-01-12T22:05:09',
    modified:'2016-01-12T22:05:09',
    slug:'json-data',
    type:'post',
    title:'JSON Data!',
    content:'<p>So, with the REST API it is posible to pull in WordPress data as pure JSON.  Now I\'m figuring out what to do with the data</p> ',
  },
  {
    id:5,
    date:'2016-01-13T22:05:09',
    modified:'2016-01-13T22:05:09',
    slug:'javascript-project',
    type:'post',
    title:'JavaScript Project',
    content:'<p>I\'ve started working with the REST API in WordPress, what fun!</p> '
  }
];

var Pages = [
  {
    id:40,
    date:'2016-01-07T22:05:09',
    modified:'2016-01-07T22:05:09',
    slug:'home',
    type:'page',
    title:'Home',
    content:'<p>Welcome!</p><p>Reprehenderit sit sunt nisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>',
  },
  {
    id:41,
    date:'2016-01-09T22:05:09',
    modified:'2016-01-09T22:05:09',
    slug:'about',
    type:'page',
    title:'About Me',
    content:'<p>Hi!  I\'m me :)</p><p>Sisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>',
  },
  {
    id:42,
    date:'2016-01-09T22:05:09',
    modified:'2016-01-09T22:05:09',
    slug:'blog',
    type:'page',
    title:'Blog',
    content:'<p>Welcome to my blog page, please enjoy!</p>',
  },
  {
    id:43,
    date:'2016-01-19T22:06:09',
    modified:'2016-01-19T22:06:09',
    slug:'contact',
    type:'page',
    title:'Contact',
    content:'<p>Please get in touch!</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>',
  }
];

var Settings = [
  {
    id:991,
    date:'2016-01-09T22:05:09',
    modified:'2016-01-09T22:05:09',
    slug:'site-name',
    type:'setting',
    title:'Site Name',
    content:'VanillaPress'
  },
  {
    id:992,
    date:'2016-01-09T22:05:09',
    modified:'2016-01-09T22:05:09',
    slug:'site-description',
    type:'setting',
    title:'Site Description',
    content:'A JS Front & Back End'
  }
];

var data = [Posts, Pages, Settings];

module.exports = data;

},{}],10:[function(require,module,exports){
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

},{"./lib/helpers.js":12,"./model.js":13,"./router.js":14,"./view.js":15,"spin.js":1,"wysiwyg":2}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

  addMenuItems: function( menuItems, contentType ) {
    menuItems.forEach( function( item ){

      var a = helpers.createLink( item.title, contentType, item.slug );
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

    if ( postType === 'post' ) {
      a.href = '#blog/' + slug;
    } else if ( postType === 'setting' ) {
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
    var slug = title;

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
    var editBtn = document.getElementById( 'editUpdateBtn' );
    return editBtn;
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

},{}],13:[function(require,module,exports){
var data = require( './data.js' ),
    jsonData = require( './json.js' ),
    helpers = require( './lib/helpers.js' );

var model = {
  init: function() {
    var localStore = model.getLocalStore();
    if( typeof localStore === 'undefined' || localStore === null ||
        localStore === '' ) {
      localStorage.setItem(
        'vanillaPress',
        JSON.stringify( jsonData )
      );
      localStore = model.getLocalStore();
    }
  },

  getContent: function( postType ) {
    var data = model.getLocalStore();

    if ( postType === 'post' ) {
      content = data.posts;
    } else if ( postType === 'page' ) {
      content = data.pages;
    } else if ( postType === 'setting' ) {
      content = data.settings;
    } else {
      content =  [{type:'404',title:'404 Error'}];
    }

    return content;
  },

  getPostBySlugs: function( slugs ) {
    var post;

    if ( slugs.length > 1 && ( slugs[0] === 'posts' || slugs[0] === 'blog' ) ) {
      post = model.getPostBySlug( slugs[1], 'posts' );
    } else if ( slugs.length > 1 && slugs[0] === 'settings' ) {
      post = model.getPostBySlug( slugs[1], 'settings' );
    } else {
      if( slugs[0] === '') slugs[0] = 'home';
      post = model.getPostBySlug( slugs[0], 'pages');
    }
    return post;
  },

  getPostBySlug: function( slug, postType ){
    // Get contet from local storage
    var data = model.getLocalStore(),
        content,
        item;

    if ( postType === 'posts' ) {
      content = data.posts;
    } else if ( postType === 'pages' ) {
      content = data.pages;
    } else if ( postType === 'settings' ) {
      content = data.settings;
    } else {
      content =  [{type:'404',title:'404 Error'}];
    }

    item = content.filter( function( obj ) {
      return obj.slug == slug;
    });
    return item[0];
  },

  getCurrentContentObj: function() {
    var newPageSlugs = helpers.getAfterHash(),
        post;

    if ( newPageSlugs.length > 1 ) {
      post = model.getPostBySlug( newPageSlugs[1], 'posts' );
    } else {
      if ( newPageSlugs[0] === '' ) newPageSlugs[0] = 'home';
      post = model.getPostBySlug( newPageSlugs[0], 'pages' );
    }
    return post;
  },

  getLocalStore: function() {
    var store = JSON.parse( localStorage.getItem( 'vanillaPress' ) );
    if( store === null ) {
      store = [''];
    }
    return store[0];
  },

  updateLocalStore: function(store) {
    var newStore = [ store ];
    localStorage.setItem( 'vanillaPress', JSON.stringify( newStore ) );
  },
  removeLocalStore: function() {
    localStorage.removeItem( 'vanillaPress' );
  }
};

module.exports = model;

},{"./data.js":9,"./json.js":11,"./lib/helpers.js":12}],14:[function(require,module,exports){
var helpers = require( './lib/helpers.js' ),
    model = require( './model.js' ),
    view = require( './view.js' );

var router = {
  init: function() {
    router.setCurrentPost();
    view.update();
    router.listenPageChange();
  },

  listenPageChange: function() {
    window.addEventListener(
      'hashchange',
      router.setCurrentPost,
      false
    );
  },

  setCurrentPost: function() {
    var slugs = helpers.getAfterHash(),
        post = model.getPostBySlugs( slugs );

    view.currentPost = post;
    view.update();
  },

  updateHash: function(slug) {
    window.location.hash = slug;
  }

};

module.exports = router;

},{"./lib/helpers.js":12,"./model.js":13,"./view.js":15}],15:[function(require,module,exports){
var helpers = require( './lib/helpers.js' ),
    model = require( './model.js' );

var view = {
  init: function() {
    view.listenMainNavLinksUpdatePage();
    view.loadMainHeader();
  },

  currentPost: '',

  listenMainNavLinksUpdatePage: function() {
    var mainNav = document.getElementById( 'mainNav' ),
        links = mainNav.getElementsByTagName( 'a' );
    for ( var i = 0, max = links.length; i < max; i++ ) {
      links[i].addEventListener('click',view.mainNavControl,false);
      links[i].removeEventListener('click',view.disableNav );
    }
  },

  listenDisableMainNavLinks: function() {
    var links = helpers.getMainNavLinks();
    for ( var i = 0, len = links.length; i < len; i++ ) {
      links[i].removeEventListener('click', view.mainNavControl);
      links[i].addEventListener('click', view.disableNav, false);
    }
  },

  mainNavControl: function() {
    var newPageSlugs = helpers.getAfterHash( this.href ),
        post = model.getPostBySlugs( newPageSlugs );
    view.currentPost = post;
    view.update();
  },

  update: function() {
    view.removeBlogPosts();
    view.updateTitle( view.currentPost.title );
    view.updateContent( view.currentPost.content );

    if ( view.currentPost.slug === 'blog' ) {
      view.loadBlogPosts();
    }
  },

  push: function( post ) {
    router.updateHash( post );
    view.updateTitle( post.title );
    view.updateContent( post.content );
  },

  loadMainHeader: function() {
    var siteName = model.getPostBySlug( 'site-name', 'settings' ),
        siteDescription = model.getPostBySlug( 'site-description', 'settings' );
    view.updateSiteName( siteName.content );
    view.updateSiteDescription( siteDescription.content );
  },

  updateSiteName: function( content ) {
    var siteName = helpers.getSiteName();
    siteName.innerHTML = content;
  },

  updateSiteDescription: function( content ) {
    var siteDescription = helpers.getSiteDescription();
    siteDescription.innerHTML = content;
  },

  updateTitle: function(title) {
    var titleEl = document.getElementById( 'pageTitle' );
    titleEl.innerHTML = title;
  },

  updateContent: function(content) {
    var contentEl = document.getElementById( 'pageContent' );
    contentEl.innerHTML = content;
  },
  loadBlogPosts: function() {
    var posts = model.getContent( 'post' ),
        postContent = document.createElement( 'section' ),
        primaryContentEL;

    postContent.id = 'blogPosts';
    for ( var i = 0, max = posts.length; i < max; i++ ) {
      postContent.appendChild( helpers.createPostMarkup( posts[i] ) );
    }
    primaryContentEL = helpers.getPrimaryContentEl();
    primaryContentEL.appendChild( postContent );
  },

  removeBlogPosts: function(){
    var blogPost = document.getElementById( 'blogPosts' );
    if( blogPost )  {
      blogPost.remove();
    }
  },

  disableNav: function(){
    event.preventDefault();
  }
};
module.exports = view;

},{"./lib/helpers.js":12,"./model.js":13}]},{},[8]);
