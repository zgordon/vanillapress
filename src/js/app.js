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
