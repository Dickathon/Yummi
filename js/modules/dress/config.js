(function (global) {
  "use strict";

  global.Yummi.modules = global.Yummi.modules || {};
  var root = global.Yummi.modules.dress = global.Yummi.modules.dress || {};

  root.config = {
    id: "dress",
    assetsBase: "assets/modules/dress/",
    petLayersBase: "assets/modules/dress/pet-layers/10kb/",
    petBaseBase: "assets/modules/dress/pet-base/10kb/base/",
    drinkBase: "source/compressed/10kb/food3/",
    meta: {
      label: "装扮",
      title: "装扮",
      desc: "yummy的哈基米",
      heroClass: "hero--dress",
      heroHidden: true
    },
    guide: {
      mascotUrl: "assets/modules/dress/pet-base/10kb/base/head_full-10kb.webp",
      storageKey: "yummi.dress.welcomeDismissed"
    }
  };
})(typeof window !== "undefined" ? window : this);
