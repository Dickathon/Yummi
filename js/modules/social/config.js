(function (global) {
  "use strict";

  global.Yummi.modules = global.Yummi.modules || {};
  var root = global.Yummi.modules.social = global.Yummi.modules.social || {};

  root.config = {
    id: "social",
    assetsBase: "assets/modules/social/",
    meta: {
      label: "社交",
      title: "社交",
      desc: "与好友分享，宁静而不打扰的相聚",
      heroClass: "hero--social"
    }
  };
})(typeof window !== "undefined" ? window : this);
