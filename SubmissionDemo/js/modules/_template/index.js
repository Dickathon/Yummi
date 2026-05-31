(function (global) {
  "use strict";

  var cfg = global.Yummi.modules.MODULE_ID.config;

  global.Yummi.module.define({
    id: cfg.id,
    meta: cfg.meta,
    create: function (ctx) {
      return global.Yummi.modules.MODULE_ID.screen.create(ctx);
    }
  });
})(typeof window !== "undefined" ? window : this);
