/**
 * 美食街区 — 欢迎引导弹窗
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "yummi.socialMap.welcomeDismissed";
  var MASCOT_URL = "assets/modules/dress/pet-base/10kb/base/head_full-10kb.webp";
  var mounted = false;
  var layer = null;

  function escapeHtml(text) {
    var div = global.document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function shouldShow() {
    try {
      return !global.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return true;
    }
  }

  function markDismissed() {
    try {
      global.localStorage.setItem(STORAGE_KEY, "1");
    } catch (err) {
      /* ignore */
    }
  }

  function renderHtml() {
    return (
      '<div class="map-guide" data-map-guide aria-hidden="true">' +
        '<button type="button" class="map-guide__overlay" data-map-guide-overlay aria-label="关闭引导"></button>' +
        '<section class="map-guide__card" role="dialog" aria-modal="true" aria-labelledby="map-guide-text-1">' +
          '<img class="map-guide__mascot" src="' + escapeHtml(MASCOT_URL) + '" width="120" height="120" alt="" decoding="async" />' +
          '<div class="map-guide__content">' +
            '<p class="map-guide__text" id="map-guide-text-1">这里是 Yummi 的美食街区，宁静小巷里藏着 16 家风味店铺。</p>' +
            '<p class="map-guide__text">点击店铺可以预览详情，进入店内还能遇见可爱的小猫食客。</p>' +
            '<p class="map-guide__text">投喂、抚摸小猫，和它们成为好朋友吧 ~</p>' +
            '<p class="map-guide__text">右上角可以进入「食物圈」查看你的美食偏好，信件，和小猫互动，或者去「好友」页面拜访伙伴。</p>' +
            '<button type="button" class="map-guide__confirm" data-map-guide-confirm>确定</button>' +
          "</div>" +
        "</section>" +
      "</div>"
    );
  }

  function hide() {
    if (!layer) {
      return;
    }
    layer.setAttribute("aria-hidden", "true");
    global.document.documentElement.classList.remove("map-guide-open");
  }

  function show(force) {
    if (!layer) {
      return;
    }
    if (!force && !shouldShow()) {
      return;
    }
    layer.setAttribute("aria-hidden", "false");
    global.document.documentElement.classList.add("map-guide-open");
    var confirmBtn = layer.querySelector("[data-map-guide-confirm]");
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
      event.target.closest("[data-map-guide-confirm]") ||
      event.target.closest("[data-map-guide-overlay]")
    ) {
      dismiss();
    }
  }

  function bindHelpButton() {
    var btn = global.document.getElementById("topOrderHelpBtn");
    if (!btn || btn.getAttribute("data-map-help-bound") === "1") {
      return;
    }
    btn.hidden = false;
    btn.setAttribute("data-map-help-bound", "1");
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      var guides = global.Yummi && global.Yummi.guides;
      if (guides && typeof guides.refreshAll === "function") {
        guides.refreshAll();
        return;
      }
      replayAll();
    });
  }

  function mount() {
    if (mounted || !global.document || !global.document.body) {
      return;
    }

    layer = global.document.createElement("div");
    layer.innerHTML = renderHtml();
    layer = layer.firstElementChild;
    global.document.body.appendChild(layer);
    layer.addEventListener("click", handleLayerClick);
    bindHelpButton();
    mounted = true;
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

  global.Yummi = global.Yummi || {};
  global.Yummi.socialMapGuide = {
    mount: mount,
    show: show,
    hide: hide,
    dismiss: dismiss,
    replayAll: replayAll,
    openOnEnter: openOnEnter
  };
})(typeof window !== "undefined" ? window : this);
