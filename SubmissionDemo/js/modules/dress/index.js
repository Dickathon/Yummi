(function (global) {
  "use strict";

  var mod = global.Yummi.modules.dress;
  var cfg = mod.config;

  function initPanel() {
    if (mod.view && typeof mod.view.initPanel === "function") {
      mod.view.initPanel();
    }
  }

  global.Yummi.module.define({
    id: cfg.id,
    meta: cfg.meta,
    create: function (ctx) {
      return global.Yummi.modules.dress.screen.create(ctx);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPanel);
  } else {
    initPanel();
  }
})(typeof window !== "undefined" ? window : this);
