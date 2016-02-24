(function() {

'use strict';

/**
 * Main app file.  Initializes app components.
 */

var page = require( 'page' ),
    router = require( './router.js' ),
    model = require( './model.js' ),
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
}());
