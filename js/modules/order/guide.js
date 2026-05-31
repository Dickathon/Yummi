/**
 * 点餐模块 — 全局欢迎引导（head_full 遮罩 + 气泡）
 */
(function (global) {
  "use strict";

  var util = global.Yummi && global.Yummi.util;
  var root = global.Yummi.modules.order;
  var cfg = root.config && root.config.guide;
  var mounted = false;
  var layer = null;
  var unbinds = [];

  function getStorageKey() {
    return (cfg && cfg.storageKey) || "yummi.order.welcomeDismissed";
  }

  function getMascotUrl() {
    return (cfg && cfg.mascotUrl) || "assets/modules/dress/pet-base/10kb/base/head_full-10kb.webp";
  }

  function shouldShow() {
    try {
      return !global.localStorage.getItem(getStorageKey());
    } catch (err) {
      return true;
    }
  }

  function markDismissed() {
    try {
      global.localStorage.setItem(getStorageKey(), "1");
    } catch (err) {
      /* ignore quota / private mode */
    }
  }

  function renderHtml() {
    var mascot = util ? util.escapeHtml(getMascotUrl()) : getMascotUrl();

    return (
      '<div class="order-guide" data-order-guide aria-hidden="true">' +
        '<button type="button" class="order-guide__overlay" data-order-guide-overlay aria-label="关闭引导"></button>' +
        '<div class="order-guide__stage" role="dialog" aria-modal="true" aria-labelledby="order-guide-title">' +
          '<div class="order-guide__mascot-wrap">' +
            '<img class="order-guide__mascot" src="' + mascot + '" width="280" height="280" alt="" decoding="async" />' +
          "</div>" +
          '<div class="order-guide__bubble">' +
            '<span class="order-guide__bubble-tail" aria-hidden="true"></span>' +
            '<p class="order-guide__title" id="order-guide-title">哈基米yummy来袭！</p>' +
            '<p class="order-guide__text">在这里挑选美食匹配口味同好，点击确定查看口味报告，生成专属哈基米形象</p>' +
            '<button type="button" class="order-guide__confirm" data-order-guide-confirm>确定</button>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function hide() {
    if (!layer) {
      return;
    }
    layer.setAttribute("aria-hidden", "true");
    global.document.documentElement.classList.remove("order-guide-open");
  }

  function show(force) {
    if (!layer) {
      return;
    }
    if (!force && !shouldShow()) {
      return;
    }
    layer.setAttribute("aria-hidden", "false");
    global.document.documentElement.classList.add("order-guide-open");
    var confirmBtn = layer.querySelector("[data-order-guide-confirm]");
    if (confirmBtn && typeof confirmBtn.focus === "function") {
      confirmBtn.focus({ preventScroll: true });
    }
  }

  function replayAll() {
    mount();
    global.requestAnimationFrame(function () {
      show(true);
    });
  }

  function dismiss() {
    markDismissed();
    hide();
  }

  function handleLayerClick(event) {
    if (
      event.target.closest("[data-order-guide-confirm]") ||
      event.target.closest("[data-order-guide-overlay]")
    ) {
      dismiss();
    }
  }

  function mount() {
    if (mounted || !global.document || !global.document.body) {
      return;
    }

    layer = global.document.createElement("div");
    layer.innerHTML = renderHtml();
    layer = layer.firstElementChild;
    global.document.body.appendChild(layer);

    if (util) {
      unbinds.push(util.on(layer, "click", handleLayerClick));
    } else {
      layer.addEventListener("click", handleLayerClick);
      unbinds.push(function () {
        layer.removeEventListener("click", handleLayerClick);
      });
    }

    mounted = true;
  }

  function unmount() {
    hide();
    unbinds.forEach(function (off) {
      if (typeof off === "function") {
        off();
      }
    });
    unbinds = [];

    if (layer && layer.parentElement) {
      layer.parentElement.removeChild(layer);
    }
    layer = null;
    mounted = false;
    global.document.documentElement.classList.remove("order-guide-open");
  }

  function openOnEnter() {
    mount();
    if (!shouldShow()) {
      return;
    }
    global.requestAnimationFrame(function () {
      show(false);
    });
  }

  root.guide = {
    mount: mount,
    unmount: unmount,
    show: show,
    hide: hide,
    dismiss: dismiss,
    shouldShow: shouldShow,
    replayAll: replayAll,
    openOnEnter: openOnEnter
  };
})(typeof window !== "undefined" ? window : this);
