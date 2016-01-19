var router = require( "./router.js" );
var view = require( "./view.js" );
var editor = require( "./editor.js" );

var vanillaPress = {
  init: function() {
    router.init();    
    view.init();
    editor.init();
  }
};
vanillaPress.init();
