/**
 * 界面注册中心 — 模块请通过 Yummi.module.define() 注册（见 js/modules/README.md）
 *
 * 低层 API：Yummi.screens.register / show / hide / mount / unmount
 * ctx: { id, app, foods, navigate(tabId) }
 */
(function (global) {
  "use strict";

  var registry = {};
  var instances = {};
  var activeId = null;

  function createContext(id) {
    var yummi = global.Yummi || {};
    return {
      id: id,
      app: yummi.app || null,
      foods: yummi.foods || null,
      navigate: function (tabId) {
        if (yummi.app && typeof yummi.app.setActiveTab === "function") {
          yummi.app.setActiveTab(tabId);
        }
      }
    };
  }

  function getDef(id) {
    return registry[id] || null;
  }

  function getInstance(id) {
    if (!instances[id]) {
      instances[id] = { mounted: false, container: null };
    }
    return instances[id];
  }

  function screensApi() {
    return {
      /**
       * @param {object} def
       * @param {string} def.id
       * @param {object} def.meta
       * @param {function(HTMLElement, object):void} def.mount
       * @param {function(HTMLElement, object):void} [def.unmount]
       * @param {function(HTMLElement, object):void} [def.onShow]
       * @param {function(HTMLElement, object):void} [def.onHide]
       */
      register: function (def) {
        if (!def || !def.id) {
          throw new Error("[Yummi.screens] register: id is required");
        }
        if (typeof def.mount !== "function") {
          throw new Error("[Yummi.screens] register: mount() is required for id=" + def.id);
        }
        registry[def.id] = def;
        return def.id;
      },

      unregister: function (id) {
        var inst = instances[id];
        if (inst && inst.mounted && inst.container) {
          screensApi().unmount(id, inst.container);
        }
        delete registry[id];
        delete instances[id];
      },

      has: function (id) {
        return Boolean(registry[id]);
      },

      get: function (id) {
        return getDef(id);
      },

      getAll: function () {
        return Object.keys(registry).map(function (id) {
          return { id: id, meta: registry[id].meta || {} };
        });
      },

      getActiveId: function () {
        return activeId;
      },

      mount: function (id, container) {
        var def = getDef(id);
        if (!def || !container) return false;

        var inst = getInstance(id);
        var ctx = createContext(id);

        if (!inst.mounted) {
          def.mount(container, ctx);
          inst.mounted = true;
          inst.container = container;
        }

        return true;
      },

      unmount: function (id, container) {
        var def = getDef(id);
        var inst = getInstance(id);
        var host = container || (inst && inst.container);
        if (!def || !host) return false;

        var ctx = createContext(id);
        if (typeof def.unmount === "function") {
          def.unmount(host, ctx);
        } else {
          host.innerHTML = "";
        }

        inst.mounted = false;
        inst.container = null;
        return true;
      },

      show: function (id, container) {
        var def = getDef(id);
        if (!def) return false;

        if (activeId && activeId !== id) {
          screensApi().hide(activeId);
        }

        screensApi().mount(id, container);

        var inst = getInstance(id);
        var host = container || inst.container;
        var ctx = createContext(id);

        if (typeof def.onShow === "function" && host) {
          def.onShow(host, ctx);
        }

        activeId = id;
        return true;
      },

      hide: function (id) {
        var def = getDef(id);
        var inst = getInstance(id);
        if (!def || !inst.container) return false;

        var ctx = createContext(id);
        if (typeof def.onHide === "function") {
          def.onHide(inst.container, ctx);
        }

        if (activeId === id) {
          activeId = null;
        }
        return true;
      }
    };
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.screens = screensApi();
})(typeof window !== "undefined" ? window : this);
