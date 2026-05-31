/**
 * 点餐模块 — 生命周期（mount / unmount / onShow / onHide）
 */
(function (global) {
  "use strict";

  var mod = global.Yummi.modules.order;

  mod.screen = {
    create: function (ctx) {
      var state = mod.state.create();

      return {
        mount: function (container, mountCtx) {
          container.classList.add("order-module");
          container.innerHTML = mod.view.render(state);
          mod.view.bind(container, mountCtx || ctx, state);
        },
        unmount: function (container) {
          mod.view.unbind();
          container.classList.remove("order-module");
          container.innerHTML = "";
          mod.state.reset(state);
        },
        onShow: function () {
          mod.view.resume();
        },
        onHide: function () {
          mod.view.pause();
        }
      };
    }
  };
})(typeof window !== "undefined" ? window : this);
