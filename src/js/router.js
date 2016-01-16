var view = require( "./view.js" );
var router = {
  init: function() {
    var mainNav = document.getElementById("mainNav");
    var links = mainNav.getElementsByTagName("a");
    for(var i = 0, len = links.length; i < len; i++) {
        links[i].addEventListener("click", view.update, false);
    }
    //view.update();

  }
};
module.exports = router;
