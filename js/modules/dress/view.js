/**
 * 装扮模块 — 分层猫展示 + 衣柜面板
 */
(function (global) {
  "use strict";

  var root = global.Yummi.modules.dress;
  var runtime = null;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function renderLayer(item) {
    var zClass = item.zClass || item.className;
    return (
      '<img class="dress-cat-layer dress-cat-layer--' + escapeHtml(zClass) +
        ' dress-cat-layer--' + escapeHtml(item.className) + '"' +
        ' src="' + escapeHtml(item.src) + '"' +
        ' alt="' + escapeHtml(item.label) + '"' +
        ' decoding="async"' +
      ">"
    );
  }

  function renderLayers(state) {
    return ((state && state.layers) || []).map(renderLayer).join("");
  }

  function renderDrink(state) {
    var drink = state && state.drink;
    if (!drink) {
      return "";
    }

    return (
      '<div class="dress-drink-float" role="img" aria-label="' + escapeHtml(drink.name) + '饮品">' +
        '<img class="dress-drink-float__img" src="' + escapeHtml(drink.src) + '" alt="' + escapeHtml(drink.name) + '" decoding="async">' +
        '<span class="dress-drink-float__label">' + escapeHtml(drink.name) + "</span>" +
      "</div>"
    );
  }

  function renderRoomBackground(state) {
    var background = state && state.activeBackground;

    if (!background) {
      return '<div class="dress-room-bg dress-room-bg--paper"></div>';
    }

    return (
      '<img class="dress-room-bg__img" src="' + escapeHtml(background.src) +
        '" alt="" loading="lazy" decoding="async">'
    );
  }

  function renderRoomLayer(state) {
    return (
      '<div class="dress-room-layer" aria-hidden="true">' +
        renderRoomBackground(state) +
      "</div>"
    );
  }

  function renderPencilIcon() {
    return (
      '<svg class="dress-name-edit__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M4.5 16.9 4 20l3.1-.5 10.3-10.3-2.6-2.6L4.5 16.9Z"></path>' +
        '<path d="m15.8 5.6 1.1-1.1a1.7 1.7 0 0 1 2.4 0l.2.2a1.7 1.7 0 0 1 0 2.4l-1.1 1.1"></path>' +
      "</svg>"
    );
  }

  function renderNameEditor(state) {
    var displayName = state && state.petDisplayName ? state.petDisplayName : "yummy的哈基米";

    return (
      '<button type="button" class="dress-name-edit" data-dress-name-edit' +
        ' aria-label="修改名字，当前为' + escapeHtml(displayName) + '">' +
        '<span class="dress-name-edit__line">' +
          '<span class="dress-name-edit__value" data-dress-name-value>' + escapeHtml(displayName) + "</span>" +
        "</span>" +
        '<span class="dress-name-edit__icon">' + renderPencilIcon() + "</span>" +
      "</button>"
    );
  }

  function getActiveDecorTab() {
    return runtime && runtime.activeDecorTab === "background" ? "background" : "house";
  }

  function renderDecorTab(tab, label, activeTab) {
    var active = tab === activeTab;

    return (
      '<button type="button" class="dress-decor-tab' + (active ? " is-active" : "") + '"' +
        ' data-dress-decor-tab="' + escapeHtml(tab) + '"' +
        ' role="tab" aria-selected="' + (active ? "true" : "false") + '">' +
        escapeHtml(label) +
      "</button>"
    );
  }

  function renderDecorThumb(item, type) {
    if (type === "background") {
      return (
        '<img class="dress-decor-option__img" src="' + escapeHtml(item.src) +
          '" alt="" loading="lazy" decoding="async">'
      );
    }

    if (item.src) {
      return (
        '<img class="dress-decor-option__img" src="' + escapeHtml(item.src) +
          '" alt="" loading="lazy" decoding="async">'
      );
    }

    return (
      '<span class="dress-decor-option__house" aria-hidden="true">' +
        '<span class="dress-decor-option__house-roof"></span>' +
        '<span class="dress-decor-option__house-door"></span>' +
      "</span>"
    );
  }

  function renderDecorOption(item, type) {
    var classes = ["dress-decor-option"];
    if (item.active) classes.push("is-active");

    return (
      '<button type="button" class="' + classes.join(" ") + '"' +
        ' data-dress-decor-option="true"' +
        ' data-option-type="' + escapeHtml(type) + '"' +
        ' data-option-id="' + escapeHtml(item.id) + '"' +
        ' aria-pressed="' + (item.active ? "true" : "false") + '">' +
        '<span class="dress-decor-option__frame">' + renderDecorThumb(item, type) + "</span>" +
        '<span class="dress-decor-option__label">' + escapeHtml(item.name) + "</span>" +
      "</button>"
    );
  }

  function renderDecorPanel(state) {
    var activeTab = getActiveDecorTab();
    var type = activeTab === "background" ? "background" : "house";
    var options = type === "background" ? ((state && state.backgrounds) || []) : ((state && state.catHouses) || []);
    var hint = type === "background"
      ? "复用社交商铺室内背景，叠在猫咪最底层。"
      : "与宠物图层同位置叠放，位于毯子之下、背景之上。";

    return (
      '<div class="dress-decor-panel" role="tabpanel">' +
        '<p class="dress-decor-panel__hint">' + escapeHtml(hint) + "</p>" +
        '<div class="dress-decor-options">' +
          options.map(function (item) {
            return renderDecorOption(item, type);
          }).join("") +
        "</div>" +
      "</div>"
    );
  }

  function renderCustomizer(state) {
    var activeTab = getActiveDecorTab();

    return (
      renderNameEditor(state) +
      '<section class="dress-decor-dock" aria-label="底层装饰">' +
        '<div class="dress-decor-tabs" role="tablist" aria-label="底层装饰分类">' +
          renderDecorTab("house", "猫屋", activeTab) +
          renderDecorTab("background", "背景", activeTab) +
        "</div>" +
        renderDecorPanel(state) +
      "</section>"
    );
  }

  function renderExportDock() {
    return (
      '<section class="dress-export-dock" aria-label="导出宠物形象与 YUMMY码">' +
        '<button type="button" class="dress-export-btn dress-export-btn--code" data-dress-share-code>' +
          '<span class="dress-export-btn__kicker">YUMMY码</span>' +
          '<span class="dress-export-btn__text">导出 YUMMY码</span>' +
          '<span class="dress-export-btn__sub">分享猫名字、食物和当前装扮</span>' +
        "</button>" +
        '<button type="button" class="dress-export-btn" data-dress-export>' +
          '<span class="dress-export-btn__kicker">PNG 海报</span>' +
          '<span class="dress-export-btn__text">导出宠物形象</span>' +
          '<span class="dress-export-btn__sub">带背景、装扮、名字和今日自嘲</span>' +
        "</button>" +
        '<p class="dress-export-status" data-dress-export-status aria-live="polite"></p>' +
      "</section>"
    );
  }

  function renderExportModal() {
    return (
      '<div class="dress-export-modal" data-dress-export-modal aria-hidden="true">' +
        '<button type="button" class="dress-export-modal__overlay" data-dress-export-close aria-label="关闭预览"></button>' +
        '<section class="dress-export-modal__card" role="dialog" aria-modal="true" aria-labelledby="dress-export-title">' +
          '<button type="button" class="dress-export-modal__close" data-dress-export-close aria-label="关闭">×</button>' +
          '<p class="dress-export-modal__eyebrow">YUMMI DRESS SNAP</p>' +
          '<h2 class="dress-export-modal__title" id="dress-export-title">宠物形象已生成</h2>' +
          '<div class="dress-export-preview">' +
            '<img class="dress-export-preview__img" data-dress-export-preview alt="导出的宠物形象预览">' +
          "</div>" +
          '<p class="dress-export-modal__caption" data-dress-export-caption></p>' +
          '<div class="dress-export-modal__actions">' +
            '<a class="dress-export-modal__save" data-dress-export-download href="#" download="yummi-宠物形象.png">保存图片</a>' +
            '<button type="button" class="dress-export-modal__secondary" data-dress-export-close>继续装扮</button>' +
          "</div>" +
          '<p class="dress-export-modal__hint">移动端也可以长按预览图保存。</p>' +
        "</section>" +
      "</div>"
    );
  }

  function renderShareModal() {
    return (
      '<div class="dress-share-modal" data-dress-share-modal aria-hidden="true">' +
        '<button type="button" class="dress-share-modal__overlay" data-dress-share-close aria-label="关闭分享"></button>' +
        '<section class="dress-share-modal__card" role="dialog" aria-modal="true" aria-labelledby="dress-share-title">' +
          '<button type="button" class="dress-share-modal__close" data-dress-share-close aria-label="关闭">×</button>' +
          '<p class="dress-share-modal__eyebrow">YUMMY CODE</p>' +
          '<h2 class="dress-share-modal__title" id="dress-share-title">你的 YUMMY码 已生成</h2>' +
          '<p class="dress-share-modal__desc">发给朋友，让 Ta 去食物圈里看看你的猫和口味。</p>' +
          '<label class="dress-share-modal__label" for="dressShareCodeField">分享码</label>' +
          '<textarea class="dress-share-modal__code" id="dressShareCodeField" data-dress-share-code-field readonly rows="3"></textarea>' +
          '<div class="dress-share-modal__actions">' +
            '<button type="button" class="dress-share-modal__copy" data-dress-share-copy>复制 YUMMY码</button>' +
            '<button type="button" class="dress-share-modal__secondary" data-dress-share-close>继续装扮</button>' +
          "</div>" +
          '<p class="dress-share-modal__hint" data-dress-share-feedback aria-live="polite"></p>' +
        "</section>" +
      "</div>"
    );
  }

  function renderCardThumb(item) {
    if (!item.name) {
      return '<span class="dress-wardrobe-card__empty" aria-hidden="true">无</span>';
    }

    return (
      '<img class="dress-wardrobe-card__thumb" src="' + escapeHtml(item.src) +
        '" alt="" loading="lazy" decoding="async">'
    );
  }

  function getWardrobeStatusText(item) {
    if (item.status === "wearing") return "穿着中";
    if (item.status === "locked") return (item.price || 2) + "小鱼干";
    if (!item.name) return "可选择";
    return "已购买";
  }

  function getWardrobeAriaLabel(item, label) {
    if (item.status === "wearing") return label + "，正在穿着";
    if (item.status === "locked") return label + "，未购买，点击花费" + (item.price || 2) + "个小鱼干购买并穿上";
    return label + "，已购买，点击穿上";
  }

  function renderWardrobeItem(item) {
    var classes = ["dress-wardrobe-card"];
    var label = item.label || item.name;
    var statusText = getWardrobeStatusText(item);

    if (item.active) classes.push("is-active");
    if (item.locked) classes.push("is-locked");
    if (item.status === "owned") classes.push("is-owned");
    if (!item.name) classes.push("is-none");

    return (
      '<button type="button" class="' + classes.join(" ") + '"' +
        ' data-dress-wardrobe-item="true"' +
        ' data-category="' + escapeHtml(item.category) + '"' +
        ' data-name="' + escapeHtml(item.name) + '"' +
        ' data-status="' + escapeHtml(item.status || "") + '"' +
        ' data-price="' + escapeHtml(item.price || 0) + '"' +
        ' aria-label="' + escapeHtml(getWardrobeAriaLabel(item, label)) + '"' +
        ' aria-pressed="' + (item.active ? "true" : "false") + '">' +
        '<span class="dress-wardrobe-card__frame">' +
          renderCardThumb(item) +
          (item.locked ? '<span class="dress-wardrobe-card__veil">' + escapeHtml(statusText) + "</span>" : "") +
          (item.active ? '<span class="dress-wardrobe-card__badge">使用中</span>' : "") +
        "</span>" +
        '<span class="dress-wardrobe-card__label">' + escapeHtml(label) + "</span>" +
        '<span class="dress-wardrobe-card__state">' + escapeHtml(statusText) + "</span>" +
      "</button>"
    );
  }

  function renderWardrobeCategory(group) {
    var items = group.items || [];
    var realItems = items.filter(function (item) { return item.name; });
    var ownedCount = realItems.filter(function (item) { return item.owned; }).length;

    return (
      '<section class="dress-wardrobe-row" aria-label="' + escapeHtml(group.category) + '">' +
        '<div class="dress-wardrobe-row__head">' +
          '<h3 class="dress-wardrobe-row__title">' + escapeHtml(group.category) + "</h3>" +
          '<span class="dress-wardrobe-row__count">已购 ' + ownedCount + " / " + realItems.length + "</span>" +
        "</div>" +
        '<div class="dress-wardrobe-row__items">' +
          items.map(renderWardrobeItem).join("") +
        "</div>" +
      "</section>"
    );
  }

  function renderWardrobe(state) {
    var groups = (state && state.wardrobe) || [];

    return (
      '<section class="dress-wardrobe" aria-label="装扮衣柜">' +
        '<p class="dress-wardrobe__hint">点餐选中的菜会自动解锁对应装扮；每类前 2 件默认拥有，其余每件 2 个小鱼干。</p>' +
        '<div class="dress-wardrobe__rows">' +
          groups.map(renderWardrobeCategory).join("") +
        "</div>" +
      "</section>"
    );
  }

  function escapeSelector(value) {
    if (typeof global.CSS !== "undefined" && typeof global.CSS.escape === "function") {
      return global.CSS.escape(String(value));
    }
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  }

  function findWardrobeButton(category, name) {
    var buttons;
    var i;
    var btnName;

    if (!runtime || !runtime.panelBody) {
      return null;
    }

    buttons = runtime.panelBody.querySelectorAll(
      '[data-dress-wardrobe-item][data-category="' + escapeSelector(category) + '"]'
    );

    for (i = 0; i < buttons.length; i += 1) {
      btnName = buttons[i].getAttribute("data-name") || "";
      if (btnName === (name || "")) {
        return buttons[i];
      }
    }

    return null;
  }

  function patchWardrobeCard(btn, item) {
    var label = item.label || item.name;
    var statusText = getWardrobeStatusText(item);
    var classes = ["dress-wardrobe-card"];
    var frame = btn.querySelector(".dress-wardrobe-card__frame");
    var badge = btn.querySelector(".dress-wardrobe-card__badge");
    var veil = btn.querySelector(".dress-wardrobe-card__veil");
    var stateEl = btn.querySelector(".dress-wardrobe-card__state");

    if (item.active) classes.push("is-active");
    if (item.locked) classes.push("is-locked");
    if (item.status === "owned") classes.push("is-owned");
    if (!item.name) classes.push("is-none");

    btn.className = classes.join(" ");
    btn.setAttribute("data-status", item.status || "");
    btn.setAttribute("data-price", String(item.price || 0));
    btn.setAttribute("aria-pressed", item.active ? "true" : "false");
    btn.setAttribute("aria-label", getWardrobeAriaLabel(item, label));

    if (item.active) {
      if (!badge && frame) {
        badge = document.createElement("span");
        badge.className = "dress-wardrobe-card__badge";
        frame.appendChild(badge);
      }
      if (badge) badge.textContent = "使用中";
    } else if (badge) {
      badge.parentElement.removeChild(badge);
    }

    if (item.locked) {
      if (!veil && frame) {
        veil = document.createElement("span");
        veil.className = "dress-wardrobe-card__veil";
        frame.appendChild(veil);
      }
      if (veil) veil.textContent = statusText;
    } else if (veil) {
      veil.parentElement.removeChild(veil);
    }

    if (stateEl) {
      stateEl.textContent = statusText;
    }
  }

  function patchWardrobe(state) {
    var synced = root.state.sync(state);
    var groups = synced.wardrobe || [];
    var allPatched = true;

    groups.forEach(function (group) {
      (group.items || []).forEach(function (item) {
        var btn = findWardrobeButton(item.category, item.name);
        if (!btn) {
          allPatched = false;
          return;
        }
        patchWardrobeCard(btn, item);
      });
    });

    if (!allPatched) {
      refreshWardrobeFull(synced);
    }
  }

  function captureWardrobeScroll(panelBody) {
    if (!panelBody) {
      return [];
    }

    return Array.prototype.map.call(
      panelBody.querySelectorAll(".dress-wardrobe-row__items"),
      function (row) {
        return row.scrollLeft;
      }
    );
  }

  function restoreWardrobeScroll(panelBody, positions) {
    var rows;
    var index;

    if (!panelBody || !positions) {
      return;
    }

    rows = panelBody.querySelectorAll(".dress-wardrobe-row__items");
    for (index = 0; index < rows.length; index += 1) {
      if (positions[index] != null) {
        rows[index].scrollLeft = positions[index];
      }
    }
  }

  function refreshWardrobeFull(state) {
    var synced = root.state.sync(state);
    var scrollPositions;

    if (!runtime || !runtime.panelBody) {
      return;
    }

    scrollPositions = captureWardrobeScroll(runtime.panelBody);
    runtime.panelBody.innerHTML = renderWardrobe(synced);
    restoreWardrobeScroll(runtime.panelBody, scrollPositions);
  }

  function refresh(container, state, options) {
    var synced = root.state.sync(state);
    var stage = container && container.querySelector(".dress-cat-stage");
    var drinkMount = container && container.querySelector("[data-dress-drink-mount]");
    var roomMount = container && container.querySelector("[data-dress-room-mount]");
    var customizerMount = container && container.querySelector("[data-dress-customizer-mount]");
    var wardrobeMode = options && options.wardrobe;

    if (stage) {
      stage.innerHTML = renderLayers(synced);
    }

    if (roomMount) {
      roomMount.innerHTML = renderRoomLayer(synced);
    }

    if (drinkMount) {
      drinkMount.innerHTML = renderDrink(synced);
    }

    if (customizerMount) {
      customizerMount.innerHTML = renderCustomizer(synced);
    }

    if (wardrobeMode === "skip") {
      return;
    }

    if (wardrobeMode === "patch") {
      patchWardrobe(state);
      return;
    }

    refreshWardrobeFull(synced);
  }

  function ensureRuntime(state) {
    if (!runtime) {
      runtime = {
        container: null,
        panelBody: null,
        state: state || root.state.create(),
        activeDecorTab: "house",
        exporting: false,
        exportObjectUrl: "",
        exportModal: null,
        exportModalBound: false,
        shareCodeValue: "",
        shareModal: null,
        shareModalBound: false,
        containerBound: false,
        panelBound: false,
        globalBound: false
      };
    }
    if (state) {
      runtime.state = state;
    }
    return runtime;
  }

  function bindContainer(container) {
    var rt = ensureRuntime();

    if (rt.container && rt.container !== container && rt.containerBound) {
      rt.container.removeEventListener("click", handleContainerClick);
      rt.containerBound = false;
    }

    rt.container = container;

    if (rt.container && !rt.containerBound) {
      rt.container.addEventListener("click", handleContainerClick);
      rt.containerBound = true;
    }

    bindExportModalPortal();
    bindShareModalPortal();
  }

  function bindExportModalPortal() {
    var rt = ensureRuntime();
    var modal = rt.container && rt.container.querySelector("[data-dress-export-modal]");

    if (!modal || rt.exportModal === modal) {
      return;
    }

    if (rt.exportModal && rt.exportModalBound) {
      rt.exportModal.removeEventListener("click", handleContainerClick);
    }
    if (rt.exportModal && rt.exportModal.parentElement) {
      rt.exportModal.parentElement.removeChild(rt.exportModal);
    }

    rt.exportModal = modal;
    rt.exportModalBound = false;

    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    modal.addEventListener("click", handleContainerClick);
    rt.exportModalBound = true;
  }

  function bindShareModalPortal() {
    var rt = ensureRuntime();
    var modal = rt.container && rt.container.querySelector("[data-dress-share-modal]");

    if (!modal || rt.shareModal === modal) {
      return;
    }

    if (rt.shareModal && rt.shareModalBound) {
      rt.shareModal.removeEventListener("click", handleContainerClick);
    }
    if (rt.shareModal && rt.shareModal.parentElement) {
      rt.shareModal.parentElement.removeChild(rt.shareModal);
    }

    rt.shareModal = modal;
    rt.shareModalBound = false;

    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    modal.addEventListener("click", handleContainerClick);
    rt.shareModalBound = true;
  }

  function bindPanel(state) {
    var rt = ensureRuntime(state);
    var panelBody = document.getElementById("dressPanelBody");

    if (!panelBody) return;

    if (rt.panelBody !== panelBody) {
      if (rt.panelBody && rt.panelBound) {
        rt.panelBody.removeEventListener("click", handleWardrobeClick);
      }
      rt.panelBody = panelBody;
      rt.panelBound = false;
    }

    if (!rt.panelBound) {
      rt.panelBody.addEventListener("click", handleWardrobeClick);
      rt.panelBound = true;
    }

    rt.panelBody.innerHTML = renderWardrobe(rt.state);
  }

  function bindGlobalSelectionEvent() {
    var rt = ensureRuntime();
    if (rt.globalBound) return;
    global.addEventListener("yummi:food-selection-change", handleFoodSelectionChange);
    rt.globalBound = true;
  }

  function handleWardrobeClick(event) {
    var btn = event.target.closest("[data-dress-wardrobe-item]");
    var category;
    var name;
    var status;
    var result;

    if (!btn || !runtime) {
      return;
    }

    event.preventDefault();
    category = btn.getAttribute("data-category") || "";
    name = btn.getAttribute("data-name") || "";
    status = btn.getAttribute("data-status") || "";

    if (status === "locked") {
      result = root.state.purchaseAndSelect(runtime.state, category, name);
      if (!result || !result.ok) {
        showPurchaseFailure(result);
        return;
      }
      if (result.purchased) {
        refreshFishCoins();
      }
    } else {
      root.state.select(runtime.state, category, name);
    }

    refresh(runtime.container, runtime.state, { wardrobe: "patch" });
  }

  function refreshFishCoins() {
    var wallet = global.Yummi && global.Yummi.fishCoins;
    if (wallet && typeof wallet.render === "function") {
      wallet.render("fishCoinBar");
    }
  }

  function showPurchaseFailure(result) {
    var price = result && result.price ? result.price : 2;
    var message = result && result.reason === "wallet_unavailable"
      ? "小鱼干钱包还没有加载完成，请稍后再试。"
      : "小鱼干不够啦，需要 " + price + " 个小鱼干才能购买这个装扮。";

    if (typeof global.alert === "function") {
      global.alert(message);
    }
  }

  function handleContainerClick(event) {
    var exportClose = event.target.closest("[data-dress-export-close]");
    var exportBtn = event.target.closest("[data-dress-export]");
    var shareBtn = event.target.closest("[data-dress-share-code]");
    var shareClose = event.target.closest("[data-dress-share-close]");
    var shareCopy = event.target.closest("[data-dress-share-copy]");
    var nameBtn = event.target.closest("[data-dress-name-edit]");
    var tabBtn = event.target.closest("[data-dress-decor-tab]");
    var optionBtn = event.target.closest("[data-dress-decor-option]");
    var tab;
    var type;
    var id;

    if (!runtime) return;

    if (exportClose) {
      closeExportModal();
      return;
    }

    if (shareClose) {
      closeShareModal();
      return;
    }

    if (exportBtn) {
      handleExportClick(event);
      return;
    }

    if (shareBtn) {
      handleShareCodeClick(event);
      return;
    }

    if (shareCopy) {
      handleShareCopy(event);
      return;
    }

    if (nameBtn) {
      handleNameEdit();
      return;
    }

    if (tabBtn) {
      tab = tabBtn.getAttribute("data-dress-decor-tab") || "house";
      runtime.activeDecorTab = tab === "background" ? "background" : "house";
      refresh(runtime.container, runtime.state, { wardrobe: "skip" });
      return;
    }

    if (optionBtn) {
      type = optionBtn.getAttribute("data-option-type") || "";
      id = optionBtn.getAttribute("data-option-id") || "";
      if (type === "background") {
        root.state.selectBackground(runtime.state, id);
      } else if (type === "house") {
        root.state.selectCatHouse(runtime.state, id);
      }
      refresh(runtime.container, runtime.state, { wardrobe: "skip" });
    }
  }

  function getExportButton() {
    return runtime && runtime.container ? runtime.container.querySelector("[data-dress-export]") : null;
  }

  function getExportStatus() {
    return runtime && runtime.container ? runtime.container.querySelector("[data-dress-export-status]") : null;
  }

  function getExportModal() {
    return runtime && runtime.exportModal
      ? runtime.exportModal
      : (runtime && runtime.container ? runtime.container.querySelector("[data-dress-export-modal]") : null);
  }

  function getShareModal() {
    return runtime && runtime.shareModal
      ? runtime.shareModal
      : (runtime && runtime.container ? runtime.container.querySelector("[data-dress-share-modal]") : null);
  }

  function setExportState(exporting, message, tone) {
    var btn = getExportButton();
    var status = getExportStatus();

    if (!runtime) return;
    runtime.exporting = exporting;

    if (btn) {
      btn.disabled = exporting;
      btn.classList.toggle("is-loading", exporting);
    }

    if (status) {
      status.textContent = message || "";
      status.classList.toggle("is-error", tone === "error");
    }
  }

  function setShareFeedback(message, tone) {
    var modal = getShareModal();
    var feedback = modal ? modal.querySelector("[data-dress-share-feedback]") : null;

    if (!feedback) {
      return;
    }

    feedback.textContent = message || "";
    feedback.classList.toggle("is-error", tone === "error");
    feedback.classList.toggle("is-success", tone === "success");
  }

  function revokeExportObjectUrl() {
    if (!runtime || !runtime.exportObjectUrl) {
      return;
    }

    if (global.URL && typeof global.URL.revokeObjectURL === "function") {
      global.URL.revokeObjectURL(runtime.exportObjectUrl);
    }
    runtime.exportObjectUrl = "";
  }

  function openExportModal(result) {
    var modal = getExportModal();
    var preview = modal ? modal.querySelector("[data-dress-export-preview]") : null;
    var download = modal ? modal.querySelector("[data-dress-export-download]") : null;
    var caption = modal ? modal.querySelector("[data-dress-export-caption]") : null;
    var drawn = result.foodName ? "本次抽中：" + result.foodName + "。 " : "";

    if (!modal || !preview || !download) {
      return;
    }

    revokeExportObjectUrl();
    runtime.exportObjectUrl = result.objectUrl || "";

    preview.src = result.src;
    download.href = result.downloadUrl || result.src;
    download.download = result.filename || "yummi-宠物形象.png";

    if (caption) {
      caption.textContent = drawn + result.roastText;
    }

    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeExportModal() {
    var modal = getExportModal();
    var preview = modal ? modal.querySelector("[data-dress-export-preview]") : null;
    var download = modal ? modal.querySelector("[data-dress-export-download]") : null;

    if (!modal) {
      return;
    }

    modal.setAttribute("aria-hidden", "true");
    if (preview) preview.removeAttribute("src");
    if (download) download.setAttribute("href", "#");
    revokeExportObjectUrl();
    document.body.style.overflow = "";
  }

  function openShareModal(code) {
    var modal = getShareModal();
    var field = modal ? modal.querySelector("[data-dress-share-code-field]") : null;

    if (!modal || !field) {
      return;
    }

    runtime.shareCodeValue = code || "";
    field.value = runtime.shareCodeValue;
    setShareFeedback("复制后发给朋友，让 Ta 去食物圈里输入查看。", "");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    field.focus();
    field.select();
  }

  function closeShareModal() {
    var modal = getShareModal();
    var field = modal ? modal.querySelector("[data-dress-share-code-field]") : null;

    if (!modal) {
      return;
    }

    modal.setAttribute("aria-hidden", "true");
    if (field) {
      field.blur();
    }
    document.body.style.overflow = "";
  }

  function exportFailureMessage(error) {
    var message = error && error.message ? error.message : "";

    if (message.indexOf("image_load_failed") !== -1 || message === "pet_layers_empty") {
      return "生成失败：宠物图层资源没有加载成功，请稍后重试。";
    }
    if (message === "canvas_context_unavailable") {
      return "生成失败：当前浏览器不支持 Canvas。";
    }
    return "生成失败：图片导出遇到问题，请重试一次。";
  }

  function handleExportClick(event) {
    var exporter = root.exporter;

    event.preventDefault();
    if (!runtime || runtime.exporting) {
      return;
    }

    if (!exporter || typeof exporter.exportPoster !== "function") {
      setExportState(false, "生成失败：导出模块还没有加载完成。", "error");
      return;
    }

    setExportState(true, "正在把哈基米压成一张 PNG...", "");
    exporter.exportPoster(runtime.state).then(function (result) {
      setExportState(false, "已生成预览，可以保存图片。", "");
      openExportModal(result);
    }).catch(function (error) {
      setExportState(false, exportFailureMessage(error), "error");
    });
  }

  function handleShareCodeClick(event) {
    var yummy = global.Yummi && global.Yummi.yummyCode;
    var payload;
    var encoded;

    event.preventDefault();
    if (!runtime || runtime.exporting) {
      return;
    }

    if (!yummy || typeof yummy.buildSharePayload !== "function" || typeof yummy.encodeShare !== "function") {
      setExportState(false, "生成失败：YUMMY码 模块还没有加载完成。", "error");
      return;
    }

    payload = yummy.buildSharePayload();
    if (!payload.ok) {
      if (payload.error === "empty_foods") {
        setExportState(false, "先去点餐，至少选 1 个食物再导出 YUMMY码。", "error");
        return;
      }
      setExportState(false, "生成失败：当前分享信息还不完整。", "error");
      return;
    }

    encoded = yummy.encodeShare(payload.payload);
    if (!encoded.ok) {
      setExportState(false, "生成失败：YUMMY码 编码没有成功，请重试。", "error");
      return;
    }

    setExportState(false, "YUMMY码 已生成，可以复制给朋友。", "");
    openShareModal(encoded.code);
  }

  function copyText(text) {
    if (!text) {
      return Promise.resolve(false);
    }

    if (global.navigator && global.navigator.clipboard && typeof global.navigator.clipboard.writeText === "function") {
      return global.navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }

    return Promise.resolve(false);
  }

  function handleShareCopy(event) {
    var modal = getShareModal();
    var field = modal ? modal.querySelector("[data-dress-share-code-field]") : null;
    var value = runtime && runtime.shareCodeValue ? runtime.shareCodeValue : (field ? field.value : "");

    event.preventDefault();
    if (!value) {
      setShareFeedback("这次没有拿到可复制的 YUMMY码。", "error");
      return;
    }

    copyText(value).then(function (ok) {
      if (ok) {
        setShareFeedback("已复制 YUMMY码，现在可以发给朋友了。", "success");
        return;
      }

      if (field) {
        field.focus();
        field.select();
      }
      setShareFeedback("已帮你选中这串码，长按或手动复制也可以。", "");
    });
  }

  function handleNameEdit() {
    var current;
    var next;

    if (!runtime || !runtime.state || typeof global.prompt !== "function") {
      return;
    }

    current = runtime.state.petName || "yummy";
    next = global.prompt("输入名字，系统会显示为「名字的哈基米」", current);
    if (next === null) return;

    root.state.setPetName(runtime.state, next);
    refresh(runtime.container, runtime.state, { wardrobe: "skip" });
  }

  function handleFoodSelectionChange() {
    if (!runtime) return;
    refresh(runtime.container, runtime.state);
  }

  root.view = {
    render: function (state) {
      root.state.sync(state);

      return (
        '<section class="dress-root" aria-label="装扮页面">' +
          '<header class="dress-root__header">' +
            '<h2 class="dress-root__title">装扮</h2>' +
            '<p class="dress-root__subtitle">LAYERED CAT</p>' +
          "</header>" +

          '<section class="dress-cat-wrap" aria-label="由多个图层拼成的猫">' +
            '<div class="dress-room-mount" data-dress-room-mount>' + renderRoomLayer(state) + "</div>" +
            '<div class="dress-cat-aura" aria-hidden="true"></div>' +
            '<div class="dress-cat-stage" role="img" aria-label="由装扮图层拼成的猫">' +
              renderLayers(state) +
            "</div>" +
            '<div class="dress-drink-mount" data-dress-drink-mount>' + renderDrink(state) + "</div>" +
          "</section>" +

          '<section class="dress-customizer" data-dress-customizer-mount>' + renderCustomizer(state) + "</section>" +
          renderExportDock() +
        "</section>" +
        renderExportModal() +
        renderShareModal()
      );
    },
    bind: function (container, ctx, state) {
      ensureRuntime(state);
      bindContainer(container);
      bindPanel(state);
      bindGlobalSelectionEvent();
      refresh(container, state);

      if (root.guide && typeof root.guide.openOnEnter === "function") {
        root.guide.openOnEnter();
      }
    },
    unbind: function () {
      if (!runtime) return;
      if (root.guide && typeof root.guide.unmount === "function") {
        root.guide.unmount();
      }
      closeExportModal();
      closeShareModal();
      if (runtime.exportModal && runtime.exportModalBound) {
        runtime.exportModal.removeEventListener("click", handleContainerClick);
      }
      if (runtime.exportModal && runtime.exportModal.parentElement) {
        runtime.exportModal.parentElement.removeChild(runtime.exportModal);
      }
      runtime.exportModal = null;
      runtime.exportModalBound = false;
      if (runtime.shareModal && runtime.shareModalBound) {
        runtime.shareModal.removeEventListener("click", handleContainerClick);
      }
      if (runtime.shareModal && runtime.shareModal.parentElement) {
        runtime.shareModal.parentElement.removeChild(runtime.shareModal);
      }
      runtime.shareModal = null;
      runtime.shareModalBound = false;
      if (runtime.container && runtime.containerBound) {
        runtime.container.removeEventListener("click", handleContainerClick);
      }
      runtime.container = null;
      runtime.containerBound = false;
    },
    pause: function () {},
    resume: function () {
      if (!runtime) return;
      refresh(runtime.container, runtime.state);
    },
    initPanel: function () {
      var state = root.state.create();
      ensureRuntime(state);
      bindPanel(state);
      bindGlobalSelectionEvent();
      refresh(runtime.container, runtime.state);
    }
  };
})(typeof window !== "undefined" ? window : this);
