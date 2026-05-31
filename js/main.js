/**
 * Yummi 应用壳 — 三栏路由 + 界面生命周期调度
 */
(function (global) {
  "use strict";

  var root = null;
  var currentTab = "order";
  var DEFAULT_TAB = "order";

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getScreens() {
    return global.Yummi && global.Yummi.screens;
  }

  function renderHero(meta) {
    if (meta.heroHidden) {
      return "";
    }

    var heroClass = meta.heroClass || "";
    return (
      '<header class="hero ' + escapeHtml(heroClass) + '">' +
        '<div class="hero__content">' +
          '<h1 class="panel-title">' + escapeHtml(meta.title || "") + "</h1>" +
          '<p class="panel-desc caption">' + escapeHtml(meta.desc || "") + "</p>" +
        "</div>" +
        '<div class="hero__visual" aria-hidden="true"></div>' +
      "</header>"
    );
  }

  function buildPanelShell(screen) {
    var id = screen.id;
    var meta = screen.meta || {};
    var hidden = id !== currentTab ? " hidden" : "";

    return (
      '<section class="panel" data-panel="' + escapeHtml(id) + '" role="tabpanel"' + hidden + ">" +
        renderHero(meta) +
        '<div class="panel-body" data-screen-mount="' + escapeHtml(id) + '"></div>' +
      "</section>"
    );
  }

  function getMountHost(tabId) {
    if (!root) return null;
    return root.querySelector('[data-screen-mount="' + tabId + '"]');
  }

  function renderShells() {
    var screens = getScreens();
    if (!root || !screens) return;

    var list = screens.getAll();
    if (!list.length) {
      root.innerHTML = '<div class="card"><p class="caption">未注册任何界面模块。</p></div>';
      return;
    }

    root.innerHTML = list.map(buildPanelShell).join("");
  }

  function mountTab(tabId) {
    var screens = getScreens();
    var host = getMountHost(tabId);
    if (!screens || !host) return;
    screens.show(tabId, host);
  }

  function syncPageHelpButton(tabId) {
    var btn = document.getElementById("topOrderHelpBtn");
    var active = tabId || (global.Yummi && global.Yummi.app && global.Yummi.app.getActiveTab());

    if (!btn) {
      return;
    }
    btn.hidden = active !== "order" && active !== "dress";
  }

  function replayActiveTabGuides() {
    var modules = global.Yummi && global.Yummi.modules;
    var tab = global.Yummi && global.Yummi.app && global.Yummi.app.getActiveTab();

    if (tab === "order" && modules && modules.order && modules.order.guide) {
      modules.order.guide.replayAll();
      return;
    }
    if (tab === "dress" && modules && modules.dress && modules.dress.guide) {
      modules.dress.guide.replayAll();
    }
  }

  function syncOrderImmersive(tabId) {
    document.body.classList.toggle("order-immersive", tabId === "order");
    syncPageHelpButton(tabId);
  }

  function setActiveTab(tabId) {
    var screens = getScreens();

    /* 社交栏：跳转 ljh 分支「美食街区」独立页 */
    if (tabId === "social") {
      window.location.href = "social-map.html";
      return;
    }

    if (!screens || !screens.has(tabId)) return;
    if (tabId === currentTab) {
      mountTab(tabId);
      return;
    }

    currentTab = tabId;

    root.querySelectorAll(".panel").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-panel") !== tabId;
    });

    document.querySelectorAll(".tab-bar__item").forEach(function (btn) {
      var active = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("tab-bar__item--active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    syncOrderImmersive(tabId);
    mountTab(tabId);
  }

  function onTabActivate(tabId) {
    if (tabId) setActiveTab(tabId);
  }

  function setupTabBar() {
    var tabBar = document.getElementById("tab-bar");
    if (!tabBar) return;

    tabBar.querySelectorAll(".tab-bar__item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onTabActivate(btn.getAttribute("data-tab"));
      });
    });

    tabBar.querySelectorAll(".tab-bar__icon").forEach(function (img) {
      img.addEventListener("error", function () {
        var wrap = img.parentElement;
        if (!wrap) return;
        img.remove();
        wrap.classList.add("tab-bar__icon-wrap--fallback");
      });
    });

    // 右上角装扮按钮 — 打开装扮面板
    var dressBtn = document.getElementById("topDressBtn");
    var dressPanel = document.getElementById("dressPanel");
    var dressOverlay = document.getElementById("dressPanelOverlay");
    var dressClose = document.getElementById("dressPanelClose");
    var dressPanelTimer = null;

    function openDressPanel() {
      if (!dressPanel) return;
      if (dressPanelTimer) {
        clearTimeout(dressPanelTimer);
      }
      dressPanel.setAttribute("aria-hidden", "false");
      dressPanel.classList.add("is-open");
      dressPanel.classList.remove("is-open-complete");
      dressPanelTimer = setTimeout(function () {
        dressPanel.classList.add("is-open-complete");
        dressPanelTimer = null;
      }, 460);
      document.body.style.overflow = "hidden";
    }

    function closeDressPanel() {
      if (!dressPanel) return;
      if (dressPanelTimer) {
        clearTimeout(dressPanelTimer);
        dressPanelTimer = null;
      }
      dressPanel.setAttribute("aria-hidden", "true");
      dressPanel.classList.remove("is-open");
      dressPanel.classList.remove("is-open-complete");
      document.body.style.overflow = "";
    }

    if (dressBtn) dressBtn.addEventListener("click", openDressPanel);
    if (dressOverlay) dressOverlay.addEventListener("click", closeDressPanel);
    if (dressClose) dressClose.addEventListener("click", closeDressPanel);

    var helpBtn = document.getElementById("topOrderHelpBtn");
    if (helpBtn) {
      helpBtn.addEventListener("click", function (event) {
        event.preventDefault();
        replayActiveTabGuides();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dressPanel && dressPanel.getAttribute("aria-hidden") === "false") {
        closeDressPanel();
      }
    });
  }

  function setupScrollNav() {
    var tabBar = document.getElementById("tab-bar");
    if (!tabBar) return;

    function onScroll() {
      var scrolled = (window.scrollY || document.documentElement.scrollTop) > 8;
      tabBar.classList.toggle("tab-bar--scrolled", scrolled);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function getParam(name) {
    var search = window.location.search;
    if (!search) return "";
    var pairs = search.slice(1).split("&");
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      if (decodeURIComponent(pair[0]) === name) {
        return decodeURIComponent(pair[1] || "");
      }
    }
    return "";
  }

  function initScreens() {
    var screens = getScreens();
    if (!screens) return;

    var list = screens.getAll();
    var urlTab = getParam("tab");
    var initial = (urlTab && screens.has(urlTab)) ? urlTab : (screens.has(DEFAULT_TAB) ? DEFAULT_TAB : (list[0] && list[0].id));
    if (!initial) return;

    currentTab = initial;
    renderShells();
    syncOrderImmersive(initial);

    // 如果 URL 指定了非默认 tab，同步激活样式
    if (urlTab && urlTab !== DEFAULT_TAB) {
      document.querySelectorAll(".tab-bar__item").forEach(function (btn) {
        var active = btn.getAttribute("data-tab") === urlTab;
        btn.classList.toggle("tab-bar__item--active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    mountTab(initial);
  }

  function init() {
    root = document.getElementById("screen-root");
    if (!root) return;
    initScreens();
    setupTabBar();
    setupScrollNav();

    syncPageHelpButton();
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.app = {
    init: init,
    setActiveTab: setActiveTab,
    getActiveTab: function () {
      return currentTab;
    },
    getScreens: getScreens
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
