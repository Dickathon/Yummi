(function (global) {
  "use strict";

  var root = global.Yummi.modules.social;

  root.state = {
    create: function () {
      return {
        phase: "idle",
        friends: []
      };
    },
    reset: function (state) {
      if (!state) return;
      state.phase = "idle";
      state.friends = [];
    }
  };
})(typeof window !== "undefined" ? window : this);
