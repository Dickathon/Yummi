/* 复制到 js/modules/<your-id>/config.js 并修改 */
(function (global) {
  "use strict";

  global.Yummi.modules = global.Yummi.modules || {};
  var root = global.Yummi.modules.MODULE_ID = global.Yummi.modules.MODULE_ID || {};

  root.config = {
    id: "MODULE_ID",
    assetsBase: "assets/modules/MODULE_ID/",
    meta: {
      label: "模块名",
      title: "模块名",
      desc: "模块描述",
      heroClass: "hero--MODULE_ID"
    }
  };
})(typeof window !== "undefined" ? window : this);
