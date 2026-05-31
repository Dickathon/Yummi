/**
 * 装扮模块 — 欢迎引导（head_full 右侧 + 左侧气泡）
 */
(function (global) {
  "use strict";

  var util = global.Yummi && global.Yummi.util;
  var root = global.Yummi.modules.dress;
  var cfg = root.config && root.config.guide;
  var mounted = false;
  var layer = null;
  var unbinds = [];

  function getStorageKey() {
    return (cfg && cfg.storageKey) || "yummi.dress.welcomeDismissed";
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
      /* ignore */
    }
  }

  function renderHtml() {
    var mascot = util ? util.escapeHtml(getMascotUrl()) : getMascotUrl();

    return (
      '<div class="dress-guide" data-dress-guide aria-hidden="true">' +
        '<button type="button" class="dress-guide__overlay" data-dress-guide-overlay aria-label="关闭引导"></button>' +
        '<div class="dress-guide__stage" role="dialog" aria-modal="true" aria-labelledby="dress-guide-text-1">' +
          '<div class="dress-guide__bubble">' +
            '<span class="dress-guide__bubble-tail" aria-hidden="true"></span>' +
            '<p class="dress-guide__text" id="dress-guide-text-1">左上角定制专属萌喵装扮，打造独属于你的口味哈基米。</p>' +
            '<p class="dress-guide__text">底部一键导出个人形象，测测你们是不是天生美食搭档</p>' +
            '<button type="button" class="dress-guide__confirm" data-dress-guide-confirm>确定</button>' +
          "</div>" +
          '<div class="dress-guide__mascot-wrap">' +
            '<img class="dress-guide__mascot" src="' + mascot + '" width="280" height="280" alt="" decoding="async" />' +
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
    global.document.documentElement.classList.remove("dress-guide-open");
  }

  function show(force) {
    if (!layer) {
      return;
    }
    if (!force && !shouldShow()) {
      return;
    }
    layer.setAttribute("aria-hidden", "false");
    global.document.documentElement.classList.add("dress-guide-open");
    var confirmBtn = layer.querySelector("[data-dress-guide-confirm]");
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
      event.target.closest("[data-dress-guide-confirm]") ||
      event.target.closest("[data-dress-guide-overlay]")
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
    global.document.documentElement.classList.remove("dress-guide-open");
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
