var helpers = require( "./lib/helpers.js" );

var router = {
  init: function() {
    var urlSegments = helpers.getAfterHash();    
  },
  updateHash: function(slug) {
    window.location.hash = slug;
  }
};
module.exports = router;
