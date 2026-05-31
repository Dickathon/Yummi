(function (global) {
  "use strict";

  var root = global.Yummi.modules.MODULE_ID;

  root.state = {
    create: function () {
      return { phase: "idle" };
    },
    reset: function (state) {
      if (!state) return;
      state.phase = "idle";
    }
  };
})(typeof window !== "undefined" ? window : this);
