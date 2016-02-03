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
