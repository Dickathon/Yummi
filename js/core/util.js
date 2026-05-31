/**
 * 共享工具（各模块可直接使用，勿写业务逻辑）
 */
(function (global) {
  "use strict";

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function on(el, type, handler) {
    if (!el || !handler) return function () {};
    el.addEventListener(type, handler);
    return function off() {
      el.removeEventListener(type, handler);
    };
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.util = {
    escapeHtml: escapeHtml,
    on: on
  };
})(typeof window !== "undefined" ? window : this);
