/**
 * 点餐模块 — 配置（wmx-temporary/转盘 固化参数 + 食物轮换池）
 */
(function (global) {
  "use strict";

  global.Yummi.modules = global.Yummi.modules || {};
  var root = global.Yummi.modules.order = global.Yummi.modules.order || {};

  root.config = {
    id: "order",
    assetsBase: "assets/modules/order/",
    itemsBase: "source/compressed/10kb/",
    sectorCount: 6,
    poolSizePerDisc: 15,
    discs: {
      base: {
        catalogKey: "food1",
        itemSize: 90,
        placardDrop: 12,
        sectorCount: 8
      },
      mid: {
        catalogKey: "food2",
        itemSize: 74,
        placardDrop: 11,
        sectorCount: 8
      },
      top: {
        catalogKey: "food3",
        itemSize: 64,
        placardDrop: 9,
        sectorCount: 7
      }
    },
    meta: {
      label: "点餐",
      title: "点餐",
      desc: "回转式选菜：每格一道菜，立牌随转盘旋转",
      heroClass: "hero--order"
    },
    guide: {
      mascotUrl: "assets/modules/dress/pet-base/10kb/base/head_full-10kb.webp",
      storageKey: "yummi.order.welcomeDismissed"
    },
    turntable: {
      global: {
        offsetX: -1,
        offsetY: -42,
        globalScale: 1.3,
        ellipseRatio: 0.8,
        discHeight: 1.02,
        layerGap: 1
      },
      discLayout: {
        base: { x: 0, y: 79, scale: 1.12, heightScale: 1, baseRx: 150, baseRy: 38, baseCy: 286 },
        mid: { x: 0, y: 37, scale: 1.21, heightScale: 1, baseRx: 108, baseRy: 28, baseCy: 212 },
        top: { x: 0, y: 7, scale: 1.43, heightScale: 1, baseRx: 72, baseRy: 19, baseCy: 148 },
        cap: { x: 0, y: -14, scale: 1.18, heightScale: 1.4, baseRx: 48, baseRy: 13, baseCy: 102 }
      },
      capAssetsBase: "assets/modules/order/turntable-cats/"
    }
  };
})(typeof window !== "undefined" ? window : this);
