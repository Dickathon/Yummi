/**
 * 点餐模块 — 入口（仅注册，勿写业务逻辑）
 */
(function (global) {
  "use strict";

  var cfg = global.Yummi.modules.order.config;

  global.Yummi.module.define({
    id: cfg.id,
    meta: cfg.meta,
    create: function (ctx) {
      return global.Yummi.modules.order.screen.create(ctx);
    }
  });
})(typeof window !== "undefined" ? window : this);
