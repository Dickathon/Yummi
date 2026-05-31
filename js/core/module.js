/**
 * 模块工厂 — 统一三栏模块的注册与生命周期
 * 各模块在 js/modules/<name>/ 下开发，仅 index.js 调用 define()
 */
(function (global) {
  "use strict";

  var MODULE_IDS = ["order", "dress", "social"];

  global.Yummi = global.Yummi || {};
  global.Yummi.modules = global.Yummi.modules || {};

  function define(spec) {
    if (!global.Yummi || !global.Yummi.screens) {
      throw new Error("[Yummi.module] screens 未加载，请检查 index.html 脚本顺序");
    }

    if (!spec || !spec.id) {
      throw new Error("[Yummi.module] define: id is required");
    }

    if (MODULE_IDS.indexOf(spec.id) === -1) {
      console.warn("[Yummi.module] 非标准模块 id:", spec.id, "（约定为 order | dress | social）");
    }

    if (typeof spec.create !== "function") {
      throw new Error("[Yummi.module] define: create() is required for id=" + spec.id);
    }

    var instance = null;

    global.Yummi.screens.register({
      id: spec.id,
      meta: spec.meta || {},
      mount: function (container, ctx) {
        instance = spec.create(ctx);
        if (!instance || typeof instance.mount !== "function") {
          throw new Error("[Yummi.module] " + spec.id + ": create() 须返回带 mount() 的实例");
        }
        instance.mount(container, ctx);
      },
      unmount: function (container, ctx) {
        if (instance && typeof instance.unmount === "function") {
          instance.unmount(container, ctx);
        } else if (container) {
          container.innerHTML = "";
        }
        instance = null;
      },
      onShow: function (container, ctx) {
        if (instance && typeof instance.onShow === "function") {
          instance.onShow(container, ctx);
        }
      },
      onHide: function (container, ctx) {
        if (instance && typeof instance.onHide === "function") {
          instance.onHide(container, ctx);
        }
      }
    });

    /* 保留 config/state/view/screen（各模块在 index.js 之前已挂到 modules.<id>） */
    var mod = global.Yummi.modules[spec.id] = global.Yummi.modules[spec.id] || {};
    mod.id = spec.id;
    mod.meta = spec.meta || mod.meta || (mod.config && mod.config.meta) || {};
    mod.getInstance = function () {
      return instance;
    };

    return spec.id;
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.module = {
    define: define,
    IDS: MODULE_IDS.slice()
  };
})(typeof window !== "undefined" ? window : this);
