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
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],3:[function(require,module,exports){
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

},{"debounce-fn":4,"dom-classes":5,"make-editable":7,"pubsub":8}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"indexof":6}],6:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
/**
 * Main app file.  Initializes app components.
 */

var model = require('./model.js'),
    router = require('./router.js'),
    view = require('./view.js'),
    editor = require('./editor.js');

/**
 * The main app object.
 *
 * @namespace
 */
var vanillaPress = {

  init: function () {

    model.init();
    router.init();
    view.init();
    editor.init();
  }
};

vanillaPress.init();

},{"./editor.js":11,"./model.js":13,"./router.js":14,"./view.js":15}],10:[function(require,module,exports){
/**
 * Main JSON object of posts, pages and settings
 */
var jsonData = [{
  posts: [{
    id: 1,
    date: "2016-01-09T22:05:09",
    modified: "2016-01-09T22:05:09",
    slug: "hello-world",
    type: "post",
    title: "Hello world!",
    content: "<p>Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p> "
  }, {
    id: 2,
    date: "2016-01-10T22:05:09",
    modified: "2016-01-10T22:05:09",
    slug: "learning-javascript",
    type: "post",
    title: "Learning JavaScript!",
    content: "<p>I'm learning JavaScript and super excited!!!</p> "
  }, {
    id: 3,
    date: "2016-01-11T22:05:09",
    modified: "2016-01-11T22:05:09",
    slug: "rest-api",
    type: "post",
    title: "The REST API!",
    content: "<p>I've started working with the REST API in WordPress, what fun!</p> "
  }, {
    id: 4,
    date: "2016-01-12T22:05:09",
    modified: "2016-01-12T22:05:09",
    slug: "json-data",
    type: "post",
    title: "JSON Data!",
    content: "<p>So, with the REST API it is posible to pull in WordPress data as pure JSON.  Now I'm figuring out what to do with the data</p> "
  }, {
    id: 5,
    date: "2016-01-13T22:05:09",
    modified: "2016-01-13T22:05:09",
    slug: "javascript-project",
    type: "post",
    title: "JavaScript Project",
    content: "<p>I've started working with the REST API in WordPress, what fun!</p> "
  }],
  pages: [{
    id: 40,
    date: "2016-01-07T22:05:09",
    modified: "2016-01-07T22:05:09",
    slug: "home",
    type: "page",
    title: "Home",
    content: "<p>Welcome!</p><p>Reprehenderit sit sunt nisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>"
  }, {
    id: 41,
    date: "2016-01-09T22:05:09",
    modified: "2016-01-09T22:05:09",
    slug: "about",
    type: "page",
    title: "About Me",
    content: "<p>Hi!  I'm me :)</p><p>Sisi excepteur deserunt officia ipsum eu reprehenderits deserunt aliqua incididunt cillum dolore.</p><p>Dolor sit amet, consectetur adipisicing elit. Makingsum Lorem look coolsum.</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>"
  }, {
    id: 42,
    date: "2016-01-09T22:05:09",
    modified: "2016-01-09T22:05:09",
    slug: "blog",
    type: "page",
    title: "Blog",
    content: "<p>Welcome to my blog page, please enjoy!</p>"
  }, {
    id: 43,
    date: "2016-01-19T22:06:09",
    modified: "2016-01-19T22:06:09",
    slug: "contact",
    type: "page",
    title: "Contact",
    content: "<p>Please get in touch!</p><p>Sit temporibus sunt doloremque enim alias pariatur debitis dolorum excepturi fugiat assumenda at, totam delectus, possimus reprehenderit earum aliquid nihil, esse voluptatem.</p>"
  }],
  settings: [{
    id: 991,
    date: "2016-01-09T22:05:09",
    modified: "2016-01-09T22:05:09",
    slug: "site-name",
    type: "setting",
    title: "Site Name",
    content: "VanillaPress"
  }, {
    id: 992,
    date: "2016-01-09T22:05:09",
    modified: "2016-01-09T22:05:09",
    slug: "site-description",
    type: "setting",
    title: "Site Description",
    content: "A JS Front & Back End"
  }]
}];

module.exports = jsonData;

},{}],11:[function(require,module,exports){
/**
 * Contains the properties and methods for the editor.
 *
 * @exports editor
 */

var Spinner = require('spin.js'),
    h = require('./lib/helpers.js'),
    router = require('./router.js'),
    model = require('./model.js'),
    view = require('./view.js'),
    wysiwygEditor = require('wysiwyg'),
    wysiwyg;

/**
 * Main editor panel.
 *
 * @namespace
 */
var editor = {
  init: function () {
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
  listenAdminHomeLink: function () {
    editor.clearMenus();
    editor.showPrimaryMenu();
    event.preventDefault();
  },

  /**
   * Listeners for links in the primary menu
   * Loads seconday menu
   *
   */
  listenPrimaryLinks: function () {
    var urlSegments = h.getAfterHash(this.href);
    var currentPost = urlSegments[0].substring(0, urlSegments[0].length - 1);
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
  listenSecondaryNavTitle: function () {
    editor.clearMenus();
    editor.showSecondaryMenu();
    event.preventDefault();
  },

  /**
   * Listener to load the post edit field.
   *
  */
  listenLoadEditForm: function () {
    editor.clearMenus();
    var slugs = h.getAfterHash(this.href),
        post = model.getPostBySlugs(slugs);

    editor.currentPost = post;
    editor.currentPostType = post.type;

    if (editor.currentPostType !== 'setting') {
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
  listenLoadNewPostForm: function () {
    var post = { slug: '_new', title: '', content: '' },
        updateBtn = h.getEditorEditUpdateBtn(),
        deleteBtn = h.getDeletePostLink();

    event.preventDefault();
    editor.clearMenus();
    editor.currentPost = post;

    if (editor.currentPostType !== 'setting') {
      // Clear the view
      view.clearContent();
    }

    editor.showEditPanel();
    deleteBtn.classList.add('hidden');
    updateBtn.innerText = 'Save';
  },

  /**
   * Listener for the editor toggle button
   *
   */
  listenEditorToggle: function () {
    var editorToggleEl = h.getEditorToggleLink();
    editorToggleEl.addEventListener('click', function () {
      editor.toggle();
      event.preventDefault();
    }, false);
  },

  /**
   * Listener to update content from the post add / edit
   * form.
   *
   * @todo Make sure url slug is unique
   */
  listenUpdatePost: function () {
    var newPost = false,
        postType = editor.currentPostType,
        store = model.getLocalStore(),
        localStore = model.getLocalStore(),
        storePosts;

    event.preventDefault();

    // If new post add to local store
    if (editor.currentPost.slug === '_new') {
      var postIds = [],
          highestId;

      newPost = true;
      editor.currentPost.type = 'post';

      // Slugify title
      editor.currentPost.slug = h.slugifyTitle(editor.currentPost.title);
      // Make sure slug is unique
      editor.currentPost.slug = model.uniqueifySlug(editor.currentPost.slug);

      // Get a new post id
      editor.currentPost.id = model.getNewPostId();

      // Set the date
      editor.currentPost.date = Date();
      editor.currentPost.modified = Date();
    }

    // Get temp store of posts based on type
    if (postType === 'post') {
      storePosts = store.posts;
    } else if (postType === 'page') {
      storePosts = store.pages;
    } else {
      storePosts = store.settings;
    }

    // Get the current item to edit from store.
    if (newPost === true) {
      storePosts.push(editor.currentPost);
    } else {
      storePosts.forEach(function (item) {
        if (editor.currentPost.id == item.id) {
          item.title = editor.currentPost.title;
          item.content = editor.currentPost.content;
          item.modified = Date();
        }
      });
    }

    // Add temp store data back
    if (postType === 'post') {
      store.posts = storePosts;
    } else if (postType === 'page') {
      store.pages = storePosts;
    } else {
      store.settings = storePosts;
    }
    model.updateLocalStore(store);

    // Update url and current post
    if (postType === 'post') {
      router.updateHash('blog/' + editor.currentPost.slug);
    } else if (postType === 'page') {
      router.updateHash(editor.currentPost.slug);
    } else {}

    view.update();
    editor.updateSaveBtnText();
  },

  /**
   * Listener to delete post
   *
   */
  listenDeletePost: function () {
    var store = model.getLocalStore(),
        storePosts = store.posts,
        confirmation = confirm('Are you sure you want to delete this post?'),
        deleteId,
        deleteIdIndex;

    // Get the index of the item to delete from store
    for (var i = 0, max = storePosts.length; i < max; i++) {
      if (editor.currentPost.id === storePosts[i].id) {
        deleteIdIndex = i;
      }
    }

    // Only procude with delete if confirmation
    if (confirmation === true) {
      // Remove item from store
      storePosts.splice(deleteIdIndex, 1);
      store.posts = storePosts;
      model.updateLocalStore(store);

      // Update current post to empty, show blog posts
      editor.currentPost = {};
      view.currentPost = model.getPostBySlug('blog', 'pages');
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
  showPrimaryMenu: function () {
    var primaryNav = h.getEditorPrimaryNav(),
        primaryLinks = h.getEditorPrimaryNavLinks();

    primaryNav.classList.add('active');

    // Add event listeners to primary links
    for (var i = 0, max = primaryLinks.length; i < max; i++) {
      primaryLinks[i].addEventListener('click', editor.listenPrimaryLinks, false);
    }
    editor.currentMenu = 'primary';
  },

  /**
   * Displays the secondary menu
   *
   */
  showSecondaryMenu: function () {
    var secondaryNav = h.getEditorSecondaryNav(),
        postType = editor.currentPostType,
        menuItems = model.getPostsByType(postType),
        secondaryUl = h.getEditorSecondaryNavUl(),
        secondaryLinks = secondaryUl.getElementsByTagName('a'),
        addNewPostLink = h.getEditorAddNewPost(),
        deletePostLink = h.getDeletePostLink();

    // Display secondary menu
    secondaryNav.classList.add('active');
    editor.currentMenu = 'secondary';
    editor.updateNavTitle();
    h.addMenuItems(menuItems, postType);

    // Add listeners to secondary links
    for (var i = 0, max = secondaryLinks.length; i < max; i++) {
      secondaryLinks[i].addEventListener('click', editor.listenLoadEditForm, false);
    }

    // Check if need to show new post button
    if (editor.currentPostType === 'post') {
      addNewPostLink.classList.remove('hidden');
      // Add listener to new post link
      addNewPostLink.addEventListener('click', editor.listenLoadNewPostForm, false);
    } else {
      addNewPostLink.classList.add('hidden');
    }
  },

  /**
   * Displays the edit post panel
   *
   */
  showEditPanel: function () {
    var post = editor.currentPost,
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
    editForm.addEventListener('submit', editor.listenUpdatePost, false);

    if (editor.currentPostType === 'post') {
      deleteBtn.classList.remove('hidden');
      // Add event listener to delete post
      deleteBtn.addEventListener('click', editor.listenDeletePost, false);
    } else {
      deleteBtn.classList.add('hidden');
    }
  },

  /**
   * Dynamically fill the edit post form based on the
   * current post.
   *
   */
  fillEditForm: function () {
    var post = editor.currentPost,
        editTitle = document.getElementById('editTitle'),
        postTitle = h.getPostTitle(),
        titleField = h.getEditorTitleField();

    // Update the title and content fields
    editTitle.value = post.title;
    editContent.value = post.content;

    // Initialize the wysiwyg editor
    wysiwyg = wysiwygEditor(document.getElementById('editContent'));

    //  Add listeners to update the view on field changes
    if (post.type !== 'setting') {
      // Actions if not editing a setting
      titleField.addEventListener('input', function () {
        editor.currentPost.title = this.value;
        view.updateTitle(this.value);
      }, false);
      wysiwyg.onUpdate(function () {
        view.updateContent(wysiwyg.read());
        editor.currentPost.content = wysiwyg.read();
      });
    } else {
      // Live update controls for settings
      if (post.slug === 'site-name') {
        wysiwyg.onUpdate(function () {
          view.updateSiteName(wysiwyg.read());
          editor.currentPost.content = wysiwyg.read();
        });
      } else if (post.slug == 'site-description') {
        wysiwyg.onUpdate(function () {
          view.updateSiteDescription(wysiwyg.read());
          editor.currentPost.content = wysiwyg.read();
        });
      } else {}
    }
  },

  /**
   * Clears the edit form.
   * Must call before loading data to form.
   *
   */
  clearEditForm: function () {
    var editTitle = document.getElementById('editTitle'),
        wysiwyg = h.getEditorWysiwyg();

    // Set the edit fields blank
    editTitle.value = '';
    editContent.value = '';
    // Remove the wysiwyg editor
    if (wysiwyg !== null) {
      wysiwyg.remove();
    }
  },

  /**
   * Clears the current menu.
   * Must call before loading a menu.
   *
   */
  clearMenus: function () {
    var navs = h.getEditorNavs(),
        navUl = h.getEditorSecondaryNavUl(),
        navlinks = navUl.getElementsByTagName('a');

    // Remove active class from all navs
    for (var j = 0, max = navs.length; j < max; j++) {
      var nav = navs[j];
      nav.classList.remove('active');
    }

    // Remove event listeners from all previous nav links
    for (var i = 0, navMax = navlinks.length; i < navMax; i++) {
      navlinks[i].removeEventListener('click', editor.refreshMenu, false);
    }

    // Remove all list items from secondary nav ul tag
    while (navUl.firstChild) {
      navUl.removeChild(navUl.firstChild);
    }
  },

  /**
   * Main control for the editor toggle.
   *
   */
  toggle: function () {
    var editorEl = h.getEditorEl(),
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
    if (toggleEl.classList.contains('hidden') === false) {
      // If opening editor
      var navTitleLink = h.getEditorNavTitleLink();
      editor.showEditPanel();
      navTitleLink.addEventListener('click', editor.listenSecondaryNavTitle, false);
      view.listenDisableMainNavLinks();
    } else {
      // If closing editor
      if (view.currentPost.type === 'post') {
        router.updateHash('blog/' + view.currentPost.slug);
      } else {
        if (editor.currentPost.slug === '_new') {
          // If closing a new post editor
          router.updateHash('blog');
          router.setCurrentPost();
        } else {
          router.updateHash(view.currentPost.slug);
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
  updateNavTitle: function () {
    var postType = editor.currentPostType,
        currentMenu = editor.currentMenu,
        homeLink = h.getEditorHomeLinkEl(currentMenu);

    // Add event listener to Admin home link
    homeLink.addEventListener('click', editor.listenAdminHomeLink, false);

    // Add secondary link based on current nav and post type
    if (currentMenu === 'secondary') {
      // If on secondary nav
      var navTitleEl = h.getEditorNavTitleEl(currentMenu);
      navTitleEl.innerHTML = postType + 's';
    } else {
      // If editing post
      var navTitleLink = h.getEditorNavTitleLink();
      navTitleLink.textContent = postType + 's';
      navTitleLink.addEventListener('click', editor.listenSecondaryNavTitle, false);
    }
  },

  /**
   * Saves post in edit form.
   * Mimics live updating text: "Saving, Saved!"
   *
   */
  updateSaveBtnText: function () {
    var btn = h.getEditorEditUpdateBtn(),
        finalText = 'Udpate',
        savedText = 'Saved!',
        spinnerOpts = {
      color: '#fff',
      lines: 8,
      length: 4,
      radius: 3,
      width: 1,
      left: '10%'
    },
        spinner = new Spinner(spinnerOpts).spin(btn),

    // Displays save text
    saving = function () {
      setTimeout(function () {
        spinner.stop();
        btn.innerText = savedText;
        saved();
      }, 900);
    },

    // Displays final text
    saved = function () {
      setTimeout(function () {
        btn.innerText = finalText;
      }, 1000);
    };

    // Update btn text and start saving
    btn.innerText = 'Saving...';
    saving();
  }
};

module.exports = editor;

},{"./lib/helpers.js":12,"./model.js":13,"./router.js":14,"./view.js":15,"spin.js":1,"wysiwyg":3}],12:[function(require,module,exports){
(function () {

  'use strict';

  Array.prototype.isArray = true;
  const _ = require('underscore'),
        h = {

    getAfterHash(url) {
      let urlSegments = [],
          pageUrl;

      url = url || '';

      if (url !== '') {
        url = url.substring(url.indexOf('#') + 1);
        urlSegments = url.split('/');
      } else {
        pageUrl = window.location.hash.substr(1);
        urlSegments = pageUrl.split('/');
      }

      return urlSegments;
    },

    addMenuItems(menuItems, contentType) {
      _.map(menuItems, item => {
        let link = h.createLink(item.title, contentType, item.slug);
        h.addMenuItem(link);
      });
    },

    addMenuItem(menuItem) {
      let ul = document.querySelector('#editor nav#secondary ul'),
          li = document.createElement('li');

      li.appendChild(menuItem);
      ul.appendChild(li);
    },

    createLink(text, postType, slug) {
      const linkText = document.createTextNode(text);
      let link = document.createElement('a');

      link.appendChild(linkText);

      if (postType === 'post') {
        link.href = '#blog/' + slug;
      } else if (postType === 'setting') {
        link.href = '#settings/' + slug;
      } else {
        link.href = '#' + slug;
      }

      return link;
    },

    createPostMarkup(post) {
      const title = document.createTextNode(post.title);
      let articleEl = document.createElement('article'),
          titleEl = document.createElement('h3'),
          titleLink = document.createElement('a'),
          contentDiv,
          excerpt;

      titleLink.appendChild(title);
      titleLink.href = '#blog/' + post.slug;
      titleEl.appendChild(titleLink);

      contentDiv = document.createElement('div');
      excerpt = post.content;

      if (excerpt.length > 100) {
        excerpt = excerpt.substr(0, 60) + '\u2026';
      }

      contentDiv.innerHTML = excerpt;

      articleEl.appendChild(titleEl);
      articleEl.appendChild(contentDiv);

      return articleEl;
    },

    getEditorEl() {
      return document.getElementById('editor');
    },

    getEditorToggleEl() {
      return document.getElementById('editorToggle');
    },

    getEditorToggleLink() {
      return document.querySelector('#editorToggle a');
    },

    getEditorNavs() {
      var editorEl = h.getEditorEl();
      return editorEl.getElementsByTagName('nav');
    },

    getEditorPrimaryNav() {
      return document.querySelector('#editor nav#primary');
    },

    getEditorPrimaryNavLinks() {
      return h.getEditorPrimaryNav().getElementsByTagName('a');
    },

    getEditorSecondaryNav() {
      return document.querySelector('#editor nav#secondary');
    },

    getEditorSecondaryNavUl() {
      return h.getEditorSecondaryNav().querySelector('ul');
    },

    getEditorAddNewPost() {
      return document.querySelector('#editor #addNew a');
    },

    getDeletePostLink() {
      return document.querySelector('#deletePost a');
    },

    getCurrentNavEl(currentMenu) {
      let nav;

      if (currentMenu === 'edit') {
        nav = h.getEditorEditNav();
      } else if (currentMenu === 'secondary') {
        nav = h.getEditorSecondaryNav();
      } else {
        nav = h.getEditorPrimaryNav();
      }

      return nav;
    },

    getEditorEditNav() {
      return document.querySelector('#editor nav#edit');
    },

    getEditorHomeLinkEl(currentMenu) {
      return h.getCurrentNavEl(currentMenu).querySelector('h3 .go-home');
    },

    getEditorNavTitleEl(currentMenu) {
      return h.getCurrentNavEl(currentMenu).querySelector('h3 span');
    },

    getEditorNavTitleLink() {
      return h.getEditorEditNav().querySelector('h3 span a');
    },

    getEditorTitleField() {
      return document.getElementById('editTitle');
    },

    slugifyTitle(title) {
      return title.trim().replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase().replace(/\s/g, '-');
    },

    getEditorWysiwyg() {
      return h.getEditorEditNav().querySelector('form iframe');
    },

    getEditorForm() {
      return h.getEditorEditNav().querySelector('form');
    },

    getEditorEditUpdateBtn() {
      return document.getElementById('editUpdateBtn');
    },

    getSiteName() {
      return document.getElementById('siteName').querySelector('a');
    },

    getSiteDescription() {
      return document.getElementById('siteDesription');
    },

    getMainNavEl() {
      return document.getElementById('mainNav');
    },

    getMainNavLinks() {
      return document.getElementById('mainNav').getElementsByTagName('a');
    },

    getPostTitle() {
      return document.getElementById('pageTitle');
    },

    getPrimaryContentEl() {
      return document.querySelector('#view .content .primary');
    }

  };

  module.exports = h;
})();

},{"underscore":2}],13:[function(require,module,exports){
(function () {

  'use strict';

  /**
   * This file contains methods having to do with
   * getting and setting of data.  Leverages local
   * store.
   *
   * @exports model
   *
   */

  const _ = require('underscore'),
        h = require('./lib/helpers.js'),
        jsonData = require('./data.js');

  /**
   * Main model object.
   *
   * @namespace
   */
  const model = {
    // Init function to load data into local store
    init() {
      let localStore = model.getLocalStore();
      if (_.isNull(localStore)) {
        localStorage.setItem('vanillaPress', JSON.stringify(jsonData));
        localStore = model.getLocalStore();
      }
    },

    /**
     * Gets posts based on post type.
     *
     * @param postType {string} The type of content needed (post, page, etc)
     * @return posts {array} Posts matching post type (Posts, Pages, etc)
     */
    getPostsByType(postType) {
      // Get content from local store
      const data = model.getLocalStore();
      // Return just data.postType ie data.posts
      return data[postType + 's'];
    },

    /**
     * Get a single post based on url slugs
     *
     * @param slugs {array} The url slugs for the post
     * @return post {object} Single post based on url slugs
     *
     */
    getPostBySlugs(slugs) {
      let post;

      if (slugs.length > 1 && slugs[0] === 'blog') {
        // If blog post
        post = model.getPostBySlug(slugs[1], 'posts');
      } else if (slugs.length > 1 && slugs[0] === 'settings') {
        // If setting
        post = model.getPostBySlug(slugs[1], 'settings');
      } else {
        // If page
        if (slugs[0] === '') slugs[0] = 'home';
        post = model.getPostBySlug(slugs[0], 'pages');
      }

      return post;
    },

    /**
     * Get single post slug and post type
     *
     * @param slug {string} The url slug for the post
     * @param postType {string} The post type for the post
     * @return post {object} Single post based on url slugs
     *
     */
    getPostBySlug(slug, postType) {
      const store = model.getLocalStore();
      let posts, post;

      // Get posts from local storage
      posts = store[postType];
      // Filter the posts to match the slug
      post = _.filter(posts, post => {
        return post.slug == slug;
      });

      return post[0];
    },

    /**
     * Gets content from local store
     *
     * @return store {object} Local storage object with all content
     */
    getLocalStore() {
      const store = JSON.parse(localStorage.getItem('vanillaPress'));
      let newStore = {};

      if (_.isNull(store)) {
        newStore = store;
      } else {
        newStore = store[0];
      }
      return newStore;
    },

    /**
     * Gets a unique id for a new post
     *
     * @return next highest id based on existing posts
     */
    getNewPostId() {
      const store = model.getLocalStore();

      // Get the current highest post id
      let latestPost = _.max(store.posts, post => {
        return post.id;
      });
      // Return new unique id
      return latestPost.id + 1;
    },

    /**
     * Checks if slug exists.
     * Adds a number to the end of the slug
     * until finds a unique slug.
     *
     * @param slug {string}
     * @return next highest id based on existing posts
     */
    uniqueifySlug: function (slug) {
      let slugExists,
          n = 1;

      // Check if slug exists
      slugExists = model.checkIfSlugExists(slug);

      // If slug exists, get unique string
      if (slugExists === true) {
        // Append -n to end of url
        slug = slug + '-' + n;
        // Keep adding -n++ until get unique slug
        while (slugExists === true) {
          slug = slug.substring(0, slug.lastIndexOf('-'));
          slug = slug + '-' + n;
          slugExists = model.checkIfSlugExists(slug);
          n++;
        }
      }

      return slug;
    },

    /**
     * Checks if slug exists.
     *
     * @param slug {string}
     * @return true if slug exists or false if does not exist
     */
    checkIfSlugExists: function (slug) {
      const store = model.getLocalStore();

      // Check if filtering posts for slug is empty
      return _.isEmpty(_.filter(store.posts, post => {
        return post.slug === slug;
      })) ? false : true;
    },

    /**
     * Saves temporary store to local storage.
     *
     * @param store {object} Temporary store to update
     */
    updateLocalStore: function (store) {
      let newStore = [store];
      // Makes sure to stringify store object before saving
      localStorage.setItem('vanillaPress', JSON.stringify(newStore));
    },

    /**
     * Deletes data from local storage.
     *
     */
    removeLocalStore: function () {
      localStorage.removeItem('vanillaPress');
    }
  };

  module.exports = model;
})();

},{"./data.js":10,"./lib/helpers.js":12,"underscore":2}],14:[function(require,module,exports){
(function () {

  'use strict';

  /**
   * The router object takes actions based on the
   * hash in the url (i.e. #content-here)
   *
   * @exports router
   */

  const _ = require('underscore'),
        h = require('./lib/helpers.js'),
        model = require('./model.js'),
        view = require('./view.js');

  /**
   * The main router object.
   *
   * @namespace
   */
  var router = {
    init() {
      router.setCurrentPost();
      view.update();
      router.listenPageChange();
    },

    // Add listener to url changes
    listenPageChange() {
      window.addEventListener('hashchange', router.setCurrentPost, false);
    },

    // Updates the the current post based on url
    setCurrentPost() {
      const slugs = h.getAfterHash(),
            post = model.getPostBySlugs(slugs);

      if (_.isUndefined(post)) {
        // If page does not exist set 404 page
        view.currentPost = {
          title: '404',
          content: '<p>Oops! Please try a different url</p>',
          slug: '404'
        };
      } else {
        view.currentPost = post;
      }

      view.update();
    },

    // Helper function to update hash based on slug
    updateHash(slug) {
      window.location.hash = slug;
    }

  };

  module.exports = router;
})();

},{"./lib/helpers.js":12,"./model.js":13,"./view.js":15,"underscore":2}],15:[function(require,module,exports){

/**
 * This file controls the main front end view
 * of the app.
 *
 *
 * @exports view
 */
var h = require('./lib/helpers.js'),
    model = require('./model.js');

/**
 * Main view object
 *
 * @namespace
 */
var view = {
  init: function () {
    view.listenMainNavLinksUpdatePage();
    view.loadMainHeader();
  },

  currentPost: '',

  /**
   * Listener activate and deactivate main nav.
   * @function
  */
  listenMainNavLinksUpdatePage: function () {
    var mainNav = document.getElementById('mainNav'),
        links = mainNav.getElementsByTagName('a');
    for (var i = 0, max = links.length; i < max; i++) {
      // Add listener to activate main nav
      links[i].addEventListener('click', view.mainNavControl, false);
      // Remove listener that disables main nav
      links[i].removeEventListener('click', view.disableNav);
    }
  },

  /**
   * Listener to disable the main nav while the
   * editor is open.
   *
   */
  listenDisableMainNavLinks: function () {
    var links = h.getMainNavLinks();
    for (var i = 0, len = links.length; i < len; i++) {
      // Add listener to deactivate main nav
      links[i].removeEventListener('click', view.mainNavControl);
      // Remove listener to disable main nav
      links[i].addEventListener('click', view.disableNav, false);
    }
  },

  /**
   * Main nav listener to load proper page
   *
   */
  mainNavControl: function () {
    var newPageSlugs = h.getAfterHash(this.href),
        post = model.getPostBySlugs(newPageSlugs);
    view.currentPost = post;
    view.update();
  },

  /**
   * Updates the view based on current post
   *
   */
  update: function () {
    view.updateTitle(view.currentPost.title);
    view.updateContent(view.currentPost.content);

    view.removeBlogPosts();
    if (view.currentPost.slug === 'blog') {
      // Append blog posts to blog page
      view.loadBlogPosts();
    }
  },

  /**
   * Loads the main header based on settings data in local store.
   *
   */
  loadMainHeader: function () {
    // Get site name and description from store
    var siteName = model.getPostBySlug('site-name', 'settings'),
        siteDescription = model.getPostBySlug('site-description', 'settings');
    view.updateSiteName(siteName.content);
    view.updateSiteDescription(siteDescription.content);
  },

  /**
   * Helper function to update to post content in the view.
   *
   * @param content {string} The site name to display
   */
  updateSiteName: function (content) {
    var siteName = h.getSiteName();
    siteName.innerHTML = content;
  },

  /**
   * Helper function to update to the site description in the view.
   *
   * @param content {string} The site description to display
   */
  updateSiteDescription: function (content) {
    var siteDescription = h.getSiteDescription();
    siteDescription.innerHTML = content;
  },

  /**
   * Helper function to update main page title in the view.
   *
   * @param title {string} The title to display
   */
  updateTitle: function (title) {
    var titleEl = document.getElementById('pageTitle');
    titleEl.innerHTML = title;
  },

  /**
   * Helper function to update main page content in the view.
   *
   * @param content {string} The content to display
   */
  updateContent: function (content) {
    var contentEl = document.getElementById('pageContent');
    contentEl.innerHTML = content;
  },

  /**
   * Helper function to clear title and content
   * in the main view
   *
   */
  clearContent: function () {
    var titleEl = document.getElementById('pageTitle'),
        contentEl = document.getElementById('pageContent');

    titleEl.innerHTML = '';
    contentEl.innerHTML = '';
  },

  /**
   * Gets blog posts and appends them to the page.
   *
   */
  loadBlogPosts: function () {
    var posts = model.getPostsByType('post'),
        postsMarkup = document.createElement('section'),
        primaryContentEL;

    postsMarkup.id = 'blogPosts';
    // Get markup for each post
    for (var i = 0, max = posts.length; i < max; i++) {
      postsMarkup.appendChild(h.createPostMarkup(posts[i]));
    }
    primaryContentEL = h.getPrimaryContentEl();
    // Append posts to page
    primaryContentEL.appendChild(postsMarkup);
  },

  /**
   * Remove blog posts from page
   *
   */
  removeBlogPosts: function () {
    var blogPost = document.getElementById('blogPosts');
    if (blogPost) {
      blogPost.remove();
    }
  },

  /**
   * Prevents main nav from working. Used when editor is open.
   *
   */
  disableNav: function () {
    event.preventDefault();
  }
};
module.exports = view;

},{"./lib/helpers.js":12,"./model.js":13}]},{},[9]);
