/**
 * order 转盘 — dress-preview.html 调试入口
 */
(function (global) {
  "use strict";

  var mod = global.Yummi.modules.order;
  var runtime = null;

  function getMeta() {
    return (mod && mod.config && mod.config.meta) || {};
  }

  function setText(selector, value) {
    var node = document.querySelector(selector);
    if (!node) return;
    node.textContent = value || "";
  }

  function fillMeta() {
    var meta = getMeta();
    setText("[data-preview-title]", meta.title || "点餐");
    setText("[data-preview-desc]", meta.desc || "");
  }

  function getMountNode() {
    return document.querySelector("[data-dress-preview-mount]");
  }

  function unmountScreen() {
    if (!runtime || !runtime.instance || !runtime.mountNode) return;

    if (typeof runtime.instance.onHide === "function") {
      runtime.instance.onHide();
    }

    runtime.instance.unmount(runtime.mountNode);
    runtime.instance = null;
  }

  function mountScreen() {
    var mountNode = getMountNode();
    if (!mountNode) return;

    unmountScreen();

    runtime = runtime || {};
    runtime.mountNode = mountNode;
    runtime.instance = mod.screen.create({});
    runtime.instance.mount(mountNode, {});

    if (typeof runtime.instance.onShow === "function") {
      runtime.instance.onShow();
    }
  }

  function setToggleLabel(paused) {
    var btn = document.querySelector('[data-preview-action="toggle"]');
    if (!btn) return;
    btn.textContent = paused ? "恢复动效" : "暂停动效";
  }

  function toggleAnimation() {
    if (!runtime || !runtime.instance) return;

    runtime.paused = !runtime.paused;

    if (runtime.paused) {
      runtime.instance.onHide();
    } else {
      runtime.instance.onShow();
    }

    setToggleLabel(runtime.paused);
  }

  function handleActionClick(event) {
    var btn = event.target.closest("[data-preview-action]");
    if (!btn) return;

    var action = btn.getAttribute("data-preview-action");

    if (action === "remount") {
      runtime.paused = false;
      mountScreen();
      setToggleLabel(false);
      return;
    }

    if (action === "toggle") {
      toggleAnimation();
    }
  }

  function handleVisibilityChange() {
    if (!runtime || !runtime.instance) return;

    if (document.hidden) {
      runtime.instance.onHide();
      return;
    }

    if (!runtime.paused) {
      runtime.instance.onShow();
    }
  }

  function init() {
    if (!mod || !mod.screen) return;

    runtime = {
      instance: null,
      mountNode: null,
      paused: false
    };

    fillMeta();
    mountScreen();
    setToggleLabel(false);

    document.addEventListener("click", handleActionClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    global.addEventListener("beforeunload", unmountScreen);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
