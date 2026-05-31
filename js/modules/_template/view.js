(function (global) {
  "use strict";

  var util = global.Yummi.util;
  var root = global.Yummi.modules.MODULE_ID;
  var unbind = null;

  root.view = {
    render: function (state) {
      return (
        '<div class="MODULE_ID-root">' +
          '<div class="card"><p class="caption">模板视图</p></div>' +
        "</div>"
      );
    },
    bind: function (container, ctx, state) {
      unbind = util.on(container, "click", function () {});
    },
    unbind: function () {
      if (unbind) unbind();
      unbind = null;
    }
  };
})(typeof window !== "undefined" ? window : this);
