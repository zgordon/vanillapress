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
