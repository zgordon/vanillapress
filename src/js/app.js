var vanillaPress = {
  init: function() {
    router.init();
    view.init();
    editor.loadMenu();
    editor.setupToggle();

  }
};
vanillaPress.init();
