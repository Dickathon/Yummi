(function (global) {
  "use strict";

  var root = global.Yummi.modules.order;

  function cloneTurntableGlobal() {
    var src = root.config && root.config.turntable && root.config.turntable.global;
    return src ? Object.assign({}, src) : {};
  }

  function createDiscs() {
    var layout = (root.config && root.config.turntable && root.config.turntable.discLayout) || {};
    var bases = [
      {
        id: "base",
        label: "底盘",
        colorClass: "base",
        baseCx: 190,
        baseCy: 286,
        baseRx: 150,
        baseRy: 38,
        x: 0,
        y: 0,
        scale: 1,
        heightScale: 1,
        angle: 8,
        autoSpeed: 8,
        hitInnerRadius: 116,
        sectorInnerRadius: 36,
        dragging: false,
        pointerId: null,
        lastPointerAngle: null,
        lastMoveTime: null,
        angularVelocity: 0,
        inertiaBoost: 1,
        topColor: "#f5f0e8",
        capColor: "#e8dfd1",
        sideGradientId: "turntable-base-side",
        sectorColors: ["#f5f0e8", "#f0e7d9", "#e8dfd1", "#f3ebe0", "#c4a882", "#efe3d4", "#ede5d8", "#d9c9a8"]
      },
      {
        id: "mid",
        label: "中盘",
        colorClass: "mid",
        baseCx: 190,
        baseCy: 212,
        baseRx: 108,
        baseRy: 28,
        x: 0,
        y: 0,
        scale: 1,
        heightScale: 1,
        angle: 24,
        autoSpeed: 8,
        hitInnerRadius: 78,
        sectorInnerRadius: 28,
        dragging: false,
        pointerId: null,
        lastPointerAngle: null,
        lastMoveTime: null,
        angularVelocity: 0,
        inertiaBoost: 1,
        topColor: "#f4e1e1",
        capColor: "#f7eeee",
        sideGradientId: "turntable-mid-side",
        sectorColors: ["#f4e1e1", "#f9efef", "#f1d7d7", "#ead1d1", "#e8dfd1", "#f8f3f1", "#f6e4e4", "#f0dcdc"]
      },
      {
        id: "top",
        label: "顶盘",
        colorClass: "top",
        baseCx: 190,
        baseCy: 148,
        baseRx: 72,
        baseRy: 19,
        x: 0,
        y: 0,
        scale: 1,
        heightScale: 1,
        angle: 48,
        autoSpeed: 8,
        hitInnerRadius: 0,
        sectorInnerRadius: 20,
        dragging: false,
        pointerId: null,
        lastPointerAngle: null,
        lastMoveTime: null,
        angularVelocity: 0,
        inertiaBoost: 1,
        topColor: "#8fbc8f",
        capColor: "#e8dfd1",
        sideGradientId: "turntable-top-side",
        sectorColors: ["#8fbc8f", "#a7c7a3", "#dfe9d8", "#c9dbbf", "#9caf88", "#b7d0aa", "#c5ddb8"]
      },
      {
        id: "cap",
        label: "顶柱",
        colorClass: "cap",
        baseCx: 190,
        baseCy: 102,
        baseRx: 48,
        baseRy: 13,
        x: 0,
        y: 0,
        scale: 1,
        heightScale: 1,
        angle: 0,
        autoSpeed: 8,
        hitInnerRadius: 0,
        sectorInnerRadius: 0,
        dragging: false,
        pointerId: null,
        lastPointerAngle: null,
        lastMoveTime: null,
        angularVelocity: 0,
        inertiaBoost: 1,
        topColor: "#f0caa7",
        capColor: "#fff1df",
        sideGradientId: "turntable-cap-side",
        sectorColors: [],
        itemUrls: [],
        sectorSlots: []
      }
    ];

    return bases.map(function (disc) {
      var patch = layout[disc.id] || {};
      return Object.assign({}, disc, {
        x: patch.x != null ? patch.x : disc.x,
        y: patch.y != null ? patch.y : disc.y,
        scale: patch.scale != null ? patch.scale : disc.scale,
        heightScale: patch.heightScale != null ? patch.heightScale : disc.heightScale,
        baseRx: patch.baseRx != null ? patch.baseRx : disc.baseRx,
        baseRy: patch.baseRy != null ? patch.baseRy : disc.baseRy,
        baseCy: patch.baseCy != null ? patch.baseCy : disc.baseCy
      });
    });
  }

  root.state = {
    create: function () {
      return {
        global: cloneTurntableGlobal(),
        discs: createDiscs(),
        activeDiscId: null,
        lastTick: 0,
        confirmed: false,
        report: null,
        petSnapshot: null,
        confirmedNames: []
      };
    },
    reset: function (state) {
      if (!state) return;
      state.global = cloneTurntableGlobal();
      state.discs = createDiscs();
      state.activeDiscId = null;
      state.lastTick = 0;
      state.confirmed = false;
      state.report = null;
      state.petSnapshot = null;
      state.confirmedNames = [];
    }
  };
})(typeof window !== "undefined" ? window : this);
