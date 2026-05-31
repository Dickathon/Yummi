/**
 * 教程引导 — 全局同步（重置全部已读 + 重播当前页）
 */
(function (global) {
  "use strict";

  var DEFAULT_KEYS = [
    "yummi.order.welcomeDismissed",
    "yummi.dress.welcomeDismissed",
    "yummi.socialMap.welcomeDismissed"
  ];

  function uniqueKeys(keys) {
    var seen = {};
    return keys.filter(function (key) {
      if (!key || seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });
  }

  function getStorageKeys() {
    var keys = DEFAULT_KEYS.slice();
    var modules = global.Yummi && global.Yummi.modules;

    if (modules && modules.order && modules.order.config && modules.order.config.guide) {
      keys.push(modules.order.config.guide.storageKey);
    }
    if (modules && modules.dress && modules.dress.config && modules.dress.config.guide) {
      keys.push(modules.dress.config.guide.storageKey);
    }

    return uniqueKeys(keys);
  }

  function resetAllDismissed() {
    getStorageKeys().forEach(function (key) {
      try {
        global.localStorage.removeItem(key);
      } catch (err) {
        /* ignore quota / private mode */
      }
    });
  }

  function isSocialMapPage() {
    var path = global.location && global.location.pathname;
    return Boolean(path && path.indexOf("social-map") !== -1);
  }

  function replayCurrentGuide() {
    if (isSocialMapPage()) {
      var mapGuide = global.Yummi && global.Yummi.socialMapGuide;
      if (mapGuide && typeof mapGuide.replayAll === "function") {
        mapGuide.replayAll();
      }
      return;
    }

    var modules = global.Yummi && global.Yummi.modules;
    var app = global.Yummi && global.Yummi.app;
    var tab = app && typeof app.getActiveTab === "function" ? app.getActiveTab() : "order";

    if (tab === "order" && modules && modules.order && modules.order.guide) {
      modules.order.guide.replayAll();
      return;
    }
    if (tab === "dress" && modules && modules.dress && modules.dress.guide) {
      modules.dress.guide.replayAll();
    }
  }

  /** 清除全部教程已读状态，并立即展示当前页引导 */
  function refreshAll() {
    resetAllDismissed();
    replayCurrentGuide();
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.guides = {
    getStorageKeys: getStorageKeys,
    resetAllDismissed: resetAllDismissed,
    replayCurrentGuide: replayCurrentGuide,
    refreshAll: refreshAll
  };
})(typeof window !== "undefined" ? window : this);
