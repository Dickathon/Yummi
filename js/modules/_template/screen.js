(function (global) {
  "use strict";

  var mod = global.Yummi.modules.MODULE_ID;

  mod.screen = {
    create: function (ctx) {
      var state = mod.state.create();
      return {
        mount: function (container, mountCtx) {
          container.classList.add("MODULE_ID-module");
          container.innerHTML = mod.view.render(state);
          mod.view.bind(container, mountCtx || ctx, state);
        },
        unmount: function (container) {
          mod.view.unbind();
          container.classList.remove("MODULE_ID-module");
          container.innerHTML = "";
          mod.state.reset(state);
        },
        onShow: function () {},
        onHide: function () {}
      };
    }
  };
})(typeof window !== "undefined" ? window : this);
