/**
 * 转盘食物立牌 — order 模块（主应用 + wmx-temporary/转盘 共用）
 */
(function (global) {
  "use strict";

  var deps = null;
  var runtime = null;
  var imageSizeCache = {};

  var PLACARD_LAYER_ORDER = ["top", "mid", "base"];
  var FOOD_DISC_IDS = ["base", "mid", "top"];
  var CELL_RADIUS_RATIO = 0.58;
  var PLACARD_PRESENCE = {
    minScale: 0,
    maxScale: 1,
    minOpacity: 0,
    maxOpacity: 1,
    maxBlurPx: 4,
    solidStartDeg: 90,
    solidEndDeg: 100,
    fadeStartDeg: 244,
    fadeEndDeg: 284,
    swapDeg: 289,
    swapRearmDeg: 90,
    tapMinT: 0.35
  };

  var DEFAULT_CONFIG = {
    itemsBase: "source/compressed/10kb/",
    sectorCount: 6,
    poolSizePerDisc: 15,
    discs: {
      base: { catalogKey: "food1", itemSize: 90, placardDrop: 12, sectorCount: 8 },
      mid: { catalogKey: "food2", itemSize: 74, placardDrop: 11, sectorCount: 8 },
      top: { catalogKey: "food3", itemSize: 64, placardDrop: 9, sectorCount: 7 },
    }
  };

  function getOrderConfig() {
    var order = global.Yummi && global.Yummi.modules && global.Yummi.modules.order;
    return (order && order.config) || null;
  }

  function getCatalog() {
    var order = global.Yummi && global.Yummi.modules && global.Yummi.modules.order;
    return (order && order.itemsCatalog) || {};
  }

  function cfg() {
    var orderCfg = getOrderConfig();
    if (orderCfg) {
      return {
        itemsBase: orderCfg.itemsBase || DEFAULT_CONFIG.itemsBase,
        sectorCount: orderCfg.sectorCount || DEFAULT_CONFIG.sectorCount,
        poolSizePerDisc: orderCfg.poolSizePerDisc || DEFAULT_CONFIG.poolSizePerDisc,
        discs: orderCfg.discs || DEFAULT_CONFIG.discs
      };
    }
    return (deps && deps.config) ? Object.assign({}, DEFAULT_CONFIG, deps.config) : DEFAULT_CONFIG;
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function lerp(min, max, t) {
    return min + (max - min) * t;
  }

  function escapeAttr(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeText(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /** 从 catalog 路径解析食物名，如 food1/九转大肠-10kb.webp → 九转大肠 */
  function getFoodNameFromUrl(url) {
    var filename;
    var name;

    if (!url) return "";

    filename = url.split("/").pop() || url;
    name = filename.replace(/-10kb\.webp$/i, "").replace(/\.webp$/i, "");
    return name;
  }

  function getFoodNameForSlot(disc, slot) {
    var url = disc.itemUrls && disc.itemUrls[Number(slot.imageIndex)];
    return getFoodNameFromUrl(url);
  }

  function getSlotNodeFromImage(imageEl) {
    return imageEl ? imageEl.closest("[data-placard-slot]") : null;
  }

  function layoutFoodLabel(slotNode, imageEl) {
    var labelGroup = slotNode && slotNode.querySelector("[data-placard-label]");
    var textEl = slotNode && slotNode.querySelector("[data-placard-label-text]");
    var bgEl = slotNode && slotNode.querySelector("[data-placard-label-bg]");

    if (!labelGroup || !textEl || !bgEl || !imageEl) return;

    var imgH = parseFloat(imageEl.getAttribute("height")) || 0;
    var imgY = parseFloat(imageEl.getAttribute("y")) || 0;
    var maxDim = parseFloat(imageEl.getAttribute("data-max-dim")) || 24;
    var fontSize = Math.max(6, Math.round(maxDim * 0.16));
    var padX = Math.max(4, fontSize * 0.55);
    var padY = Math.max(2, fontSize * 0.3);
    var gap = Math.max(2, fontSize * 0.22);
    var bbox;
    var width;
    var height;
    var x;
    var y;

    textEl.setAttribute("font-size", formatNumber(fontSize));
    textEl.setAttribute("x", "0");

    try {
      bbox = textEl.getBBox();
      width = bbox.width + padX * 2;
      height = bbox.height + padY * 2;
    } catch (err) {
      width = Math.max(28, (textEl.textContent || "").length * fontSize * 0.92 + padX * 2);
      height = fontSize + padY * 2;
    }

    y = imgY + imgH + gap;
    x = -width / 2;

    bgEl.setAttribute("x", formatNumber(x));
    bgEl.setAttribute("y", formatNumber(y));
    bgEl.setAttribute("width", formatNumber(width));
    bgEl.setAttribute("height", formatNumber(height));
    bgEl.setAttribute("rx", formatNumber(height / 2));

    textEl.setAttribute("y", formatNumber(y + padY + fontSize * 0.88));
  }

  function syncSlotLabel(disc, slot, slotNode, reveal) {
    var textEl;
    var bgEl;
    var imageEl;
    var name;

    if (!slotNode || !disc) return;

    textEl = slotNode.querySelector("[data-placard-label-text]");
    bgEl = slotNode.querySelector("[data-placard-label-bg]");
    imageEl = getSlotImageEl(disc, slot, slotNode);

    if (!textEl || !bgEl || !imageEl) return;

    name = getFoodNameForSlot(disc, slot);
    textEl.textContent = name || "";
    layoutFoodLabel(slotNode, imageEl);

    if (reveal) {
      textEl.removeAttribute("opacity");
      bgEl.removeAttribute("opacity");
    } else {
      textEl.setAttribute("opacity", "0");
      bgEl.setAttribute("opacity", "0");
    }

    slotNode.setAttribute("data-food-name", name || "");
    syncSlotSelectionVisual(slotNode, name);
  }

  function syncSlotSelectionVisual(slotNode, foodName) {
    var sel = global.Yummi && global.Yummi.foodSelection;
    var selected = !!(sel && foodName && sel.has(foodName));

    if (selected) {
      slotNode.classList.add("turntable-slot--selected");
      slotNode.setAttribute("aria-pressed", "true");
    } else {
      slotNode.classList.remove("turntable-slot--selected");
      slotNode.setAttribute("aria-pressed", "false");
    }
  }

  function refreshSelectionVisuals() {
    if (!runtime || !runtime.svg) {
      return;
    }

    runtime.svg.querySelectorAll("[data-placard-slot]").forEach(function (slotNode) {
      syncSlotSelectionVisual(slotNode, slotNode.getAttribute("data-food-name") || "");
    });
  }

  function formatNumber(value) {
    return deps && deps.formatNumber ? deps.formatNumber(value) : Number(value.toFixed(3));
  }

  function normalizeAngle(angle) {
    if (deps && deps.normalizeAngle) {
      return deps.normalizeAngle(angle);
    }
    var next = angle % 360;
    return next < 0 ? next + 360 : next;
  }

  function getDiscGeometry(disc) {
    return deps.getDiscGeometry(disc);
  }

  function resolveItemUrls(relativePaths) {
    var base = cfg().itemsBase || "";
    return relativePaths.map(function (path) {
      return base + path;
    });
  }

  function subsamplePaths(paths, count) {
    var copy = paths.slice();
    var i;
    var j;
    var tmp;

    for (i = copy.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }

    return copy.slice(0, count);
  }

  function resolveDiscItemPaths(discCfg) {
    var catalog = getCatalog();
    var key = discCfg.catalogKey;
    var paths = catalog[key] ? catalog[key].slice() : [];
    var poolSize = cfg().poolSizePerDisc;

    if (!poolSize || poolSize >= paths.length) {
      return paths;
    }

    return subsamplePaths(paths, poolSize);
  }

  function getSlotDeckOffset(slotIndex, poolSize, sectorCount) {
    var step = Math.max(1, Math.floor(poolSize / sectorCount));
    return (slotIndex * step) % poolSize;
  }

  function createShuffledPlayOrder(count, avoidIndex) {
    var order = [];
    var i;
    var j;
    var tmp;
    var guard;

    for (i = 0; i < count; i += 1) {
      order.push(i);
    }

    for (i = count - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }

    if (count <= 1 || avoidIndex === undefined || avoidIndex === null || isNaN(avoidIndex)) {
      return order;
    }

    guard = 0;
    while (Number(order[0]) === Number(avoidIndex) && guard < 12) {
      j = Math.floor(Math.random() * count);
      tmp = order[0];
      order[0] = order[j];
      order[j] = tmp;
      guard += 1;
    }

    return order;
  }

  function getOrderIndexAt(disc, slot, cursor) {
    var order = disc.playOrder;
    var n = order ? order.length : 0;
    var offset = slot.deckOffset || 0;

    if (!n) {
      return 0;
    }

    return Number(order[(cursor + offset) % n]);
  }

  function isFoodIndexTakenOnDisc(disc, slot, idx) {
    var slots = disc.sectorSlots;
    var i;
    var other;

    if (!slots || slots.length < 2) {
      return false;
    }

    for (i = 0; i < slots.length; i += 1) {
      other = slots[i];
      if (!other || other === slot) {
        continue;
      }
      if (Number(other.imageIndex) === Number(idx)) {
        return true;
      }
    }

    return false;
  }

  function pickNextFoodIndex(disc, slot, leavingIndex) {
    var order = disc.playOrder;
    var n = order ? order.length : 0;
    var prevCursor;
    var cursor;
    var idx;
    var current;
    var guard;

    if (!n) {
      return 0;
    }

    if (n === 1) {
      return Number(order[0]);
    }

    current = Number(leavingIndex);
    if (isNaN(current)) {
      current = Number(slot.imageIndex);
    }

    cursor = typeof slot.deckCursor === "number" ? slot.deckCursor : 0;
    prevCursor = cursor;
    cursor = (cursor + 1) % n;

    if (cursor === 0 && prevCursor === n - 1) {
      disc.playOrder = createShuffledPlayOrder(n, current);
      order = disc.playOrder;
      slot.roundsCompleted = (slot.roundsCompleted || 0) + 1;
    }

    idx = getOrderIndexAt(disc, slot, cursor);
    guard = 0;

    while ((idx === current || isFoodIndexTakenOnDisc(disc, slot, idx)) && guard < n) {
      cursor = (cursor + 1) % n;
      idx = getOrderIndexAt(disc, slot, cursor);
      guard += 1;
    }

    if (idx === current || isFoodIndexTakenOnDisc(disc, slot, idx)) {
      disc.playOrder = createShuffledPlayOrder(n, current);
      order = disc.playOrder;
      cursor = 0;
      idx = getOrderIndexAt(disc, slot, cursor);
      guard = 0;
      while ((idx === current || isFoodIndexTakenOnDisc(disc, slot, idx)) && guard < n) {
        cursor = (cursor + 1) % n;
        idx = getOrderIndexAt(disc, slot, cursor);
        guard += 1;
      }
    }

    slot.deckCursor = cursor;
    slot.playOrderLength = n;
    return idx;
  }

  function createSectorSlots(sectorCount, disc) {
    var step = 360 / sectorCount;
    var order = disc.playOrder || [];
    var slots = [];
    var i;
    var imageIndex;
    var cursor;

    for (i = 0; i < sectorCount; i += 1) {
      var offset = getSlotDeckOffset(i, order.length, sectorCount);

      cursor = 0;
      imageIndex = order.length ? Number(order[(cursor + offset) % order.length]) : i;
      slots.push({
        index: i,
        centerAngle: i * step + step / 2,
        imageIndex: imageIndex,
        deckCursor: cursor,
        deckOffset: offset,
        playOrderLength: order.length,
        roundsCompleted: 0,
        swapArmed: true,
        swapGeneration: 0
      });
    }

    return slots;
  }

  function applyDiscItems(disc) {
    var discCfg = cfg().discs[disc.id];
    var relativePaths;
    var itemCount;
    var sectorCount;

    if (!discCfg) {
      disc.itemUrls = [];
      disc.itemSize = 0;
      disc.placardDrop = 0;
      disc.playOrder = [];
      disc.sectorSlots = [];
      return;
    }

    relativePaths = resolveDiscItemPaths(discCfg);

    if (!relativePaths.length) {
      disc.itemUrls = [];
      disc.itemSize = 0;
      disc.placardDrop = 0;
      disc.playOrder = [];
      disc.sectorSlots = [];
      return;
    }

    sectorCount = discCfg.sectorCount || cfg().sectorCount || 6;
    itemCount = relativePaths.length;
    disc.itemSize = discCfg.itemSize || 24;
    disc.placardDrop = discCfg.placardDrop || 0;
    disc.itemUrls = resolveItemUrls(relativePaths);
    disc.playOrder = createShuffledPlayOrder(itemCount);
    disc.sectorSlots = createSectorSlots(sectorCount, disc);
  }

  function getSlotOrbitDeg(disc, centerAngle) {
    return normalizeAngle(centerAngle + disc.angle);
  }

  function getPlacardPresenceT(disc, centerAngle) {
    var p = PLACARD_PRESENCE;
    var deg = getSlotOrbitDeg(disc, centerAngle);
    var solidSpan = p.solidEndDeg - p.solidStartDeg;
    var fadeSpan = p.fadeEndDeg - p.fadeStartDeg;

    if (deg >= p.solidStartDeg && deg <= p.solidEndDeg) {
      return clamp01((deg - p.solidStartDeg) / solidSpan);
    }

    if (deg >= p.fadeStartDeg && deg <= p.fadeEndDeg) {
      return clamp01(1 - (deg - p.fadeStartDeg) / fadeSpan);
    }

    if (deg > p.solidEndDeg && deg < p.fadeStartDeg) {
      return 1;
    }

    return 0;
  }

  function getSlotKey(discId, slotIndex) {
    return discId + "-" + slotIndex;
  }

  function getSectorColor(disc, slotIndex) {
    var colors = disc && disc.sectorColors;
    var idx = Number(slotIndex);

    if (!colors || !colors.length || isNaN(idx)) {
      return "#c4a882";
    }

    return colors[((idx % colors.length) + colors.length) % colors.length];
  }

  function getSectorRadii(geometry) {
    return {
      outer: geometry.rx - 6,
      inner: Math.max(geometry.sectorInnerRadius, 12)
    };
  }

  function degToRad(angle) {
    return (angle - 90) * Math.PI / 180;
  }

  function polarToCartesian(radius, angle) {
    var rad = degToRad(angle);
    return {
      x: radius * Math.cos(rad),
      y: radius * Math.sin(rad)
    };
  }

  function getSlotCenterOnDisc(slot, innerRadius, outerRadius) {
    var slotRadius = innerRadius + (outerRadius - innerRadius) * CELL_RADIUS_RATIO;
    var pos = polarToCartesian(slotRadius, slot.centerAngle);

    return {
      x: pos.x,
      y: pos.y,
      centerAngle: slot.centerAngle
    };
  }

  function getSlotPositionInProject(disc, localX, localY) {
    var rad = disc.angle * Math.PI / 180;
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);

    return {
      x: localX * cos - localY * sin,
      y: localX * sin + localY * cos
    };
  }

  function getSlotPositionInViewBox(disc, localX, localY, geometry) {
    var pos = getSlotPositionInProject(disc, localX, localY);
    var scaleY = geometry.ry / geometry.rx;

    return {
      x: geometry.cx + pos.x,
      y: geometry.cy + pos.y * scaleY
    };
  }

  function getItemSrcForSlot(disc, slot) {
    var idx = slot.imageIndex;

    if (idx === undefined || idx === null) {
      idx = slot.index;
    }

    if (!disc.itemUrls || !disc.itemUrls[idx]) {
      return "";
    }

    return disc.itemUrls[idx];
  }

  function getImageHref(imageEl) {
    if (!imageEl) return "";
    return imageEl.getAttribute("href") ||
      imageEl.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
      "";
  }

  function hrefMatches(imageHref, targetUrl) {
    if (!imageHref || !targetUrl) return false;
    if (imageHref === targetUrl) return true;
    if (imageHref.endsWith(targetUrl) || targetUrl.endsWith(imageHref)) return true;

    try {
      return new URL(imageHref, window.location.href).href ===
        new URL(targetUrl, window.location.href).href;
    } catch (err) {
      return false;
    }
  }

  function buildPlacardImageUrl(url, swapGeneration) {
    if (!url) return "";
    if (swapGeneration === undefined || swapGeneration === null) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + swapGeneration;
  }

  function setPlacardImageHref(imageEl, url, swapGeneration) {
    var src;

    if (!imageEl || !url) return;

    src = buildPlacardImageUrl(url, swapGeneration);
    imageEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", src);
    imageEl.setAttribute("href", src);
  }

  function rememberImageSize(url, naturalW, naturalH) {
    if (!url || !naturalW || !naturalH) return;
    imageSizeCache[url] = { w: naturalW, h: naturalH };
  }

  function lookupImageSize(href) {
    if (!href) return null;
    if (imageSizeCache[href]) return imageSizeCache[href];

    var key;
    for (key in imageSizeCache) {
      if (hrefMatches(href, key)) return imageSizeCache[key];
    }

    return null;
  }

  function scaleImageToMax(naturalW, naturalH, maxDim) {
    if (!naturalW || !naturalH) {
      return { w: maxDim, h: maxDim };
    }

    var scale = maxDim / Math.max(naturalW, naturalH);
    return {
      w: naturalW * scale,
      h: naturalH * scale
    };
  }

  function applyPlacardImageLayout(imageEl, naturalW, naturalH, keepHidden) {
    if (!imageEl) return;

    var cached = lookupImageSize(getImageHref(imageEl));
    var maxDim;
    var size;
    var slotNode;
    if ((!naturalW || !naturalH) && cached) {
      naturalW = cached.w;
      naturalH = cached.h;
    }

    if (!naturalW || !naturalH) return;

    maxDim = parseFloat(imageEl.getAttribute("data-max-dim")) || 24;
    size = scaleImageToMax(naturalW, naturalH, maxDim);

    imageEl.setAttribute("x", formatNumber(-size.w / 2));
    imageEl.setAttribute("y", formatNumber(-size.h));
    imageEl.setAttribute("width", formatNumber(size.w));
    imageEl.setAttribute("height", formatNumber(size.h));
    imageEl.removeAttribute("preserveAspectRatio");

    if (!keepHidden) {
      imageEl.removeAttribute("opacity");
    }

    slotNode = getSlotNodeFromImage(imageEl);
    if (slotNode) {
      layoutFoodLabel(slotNode, imageEl);
      layoutSlotSelectionFrame(slotNode, size.w, size.h);
    }
  }

  function layoutSlotSelectionFrame(slotNode, imageW, imageH) {
    var frameEl;
    var pad;

    if (!slotNode || !imageW || !imageH) {
      return;
    }

    frameEl = slotNode.querySelector("[data-placard-frame]");
    if (!frameEl) {
      return;
    }

    pad = 3;
    frameEl.setAttribute("x", formatNumber(-imageW / 2 - pad));
    frameEl.setAttribute("y", formatNumber(-imageH - pad));
    frameEl.setAttribute("width", formatNumber(imageW + pad * 2));
    frameEl.setAttribute("height", formatNumber(imageH + pad * 2));
  }

  function getSlotImageEl(disc, slot, slotNode) {
    var key = getSlotKey(disc.id, slot.index);

    if (runtime && runtime.slotImages && runtime.slotImages[key]) {
      return runtime.slotImages[key];
    }

    return slotNode ? slotNode.querySelector("[data-placard-image]") : null;
  }

  function ensureSlotImageMatchesState(disc, slot, slotNode, reveal) {
    var imageEl = getSlotImageEl(disc, slot, slotNode);
    var url;
    var cached;

    if (!imageEl || !disc.itemUrls) return;

    url = disc.itemUrls[Number(slot.imageIndex)];
    if (!url) return;

    if (!hrefMatches(getImageHref(imageEl), url) || slot.pendingReveal) {
      setPlacardImageHref(imageEl, url, slot.swapGeneration);
      cached = lookupImageSize(url);

      if (cached) {
        applyPlacardImageLayout(imageEl, cached.w, cached.h, !reveal);
      }

      slot.pendingReveal = false;
    }

    if (reveal) {
      imageEl.removeAttribute("opacity");
    } else {
      imageEl.setAttribute("opacity", "0");
    }

    syncSlotLabel(disc, slot, slotNode, reveal);
  }

  function cycleSlotItem(disc, slot, slotNode) {
    var urls = disc.itemUrls;
    var imageEl;
    var url;
    var cached;
    var previousIndex;
    var nextIndex;

    if (!urls || !urls.length || !slotNode) return;

    imageEl = getSlotImageEl(disc, slot, slotNode);
    if (!imageEl) return;

    previousIndex = Number(slot.imageIndex);
    nextIndex = pickNextFoodIndex(disc, slot, previousIndex);

    if (nextIndex === previousIndex) return;

    slot.imageIndex = nextIndex;
    slot.swapGeneration = (slot.swapGeneration || 0) + 1;
    slot.pendingReveal = true;
    url = urls[nextIndex];
    setPlacardImageHref(imageEl, url, slot.swapGeneration);
    imageEl.setAttribute("opacity", "0");

    cached = lookupImageSize(url);
    if (cached) {
      applyPlacardImageLayout(imageEl, cached.w, cached.h, true);
      syncSlotLabel(disc, slot, slotNode, false);
      return;
    }

    var loader = new Image();
    loader.decoding = "async";
    loader.onload = function () {
      if (!hrefMatches(getImageHref(imageEl), url)) return;
      rememberImageSize(url, loader.naturalWidth, loader.naturalHeight);
      applyPlacardImageLayout(imageEl, loader.naturalWidth, loader.naturalHeight, true);
      syncSlotLabel(disc, slot, slotNode, false);
    };
    loader.src = url;
  }

  function maybeCycleSlotItemAtSwapAngle(disc, slot, slotNode, orbitDeg) {
    var p = PLACARD_PRESENCE;

    if (orbitDeg < p.swapRearmDeg) {
      slot.swapArmed = true;
    }

    if (!slot.swapArmed || orbitDeg < p.swapDeg) return;

    slot.swapArmed = false;
    cycleSlotItem(disc, slot, slotNode);
  }

  function applyPlacardPresence(slotNode, disc) {
    var presence = slotNode && slotNode.querySelector(".turntable-placard-presence");
    var hidden;
    var centerAngle;
    var t;
    var scale;
    var opacity;
    var blur;
    var shadowAlpha;
    var slotIndex;
    var slot;

    if (!presence || !slotNode) return;

    centerAngle = parseFloat(slotNode.getAttribute("data-slot-center-angle") || "0");
    t = getPlacardPresenceT(disc, centerAngle);
    hidden = t <= 0.0001;
    scale = lerp(PLACARD_PRESENCE.minScale, PLACARD_PRESENCE.maxScale, t);
    opacity = lerp(PLACARD_PRESENCE.minOpacity, PLACARD_PRESENCE.maxOpacity, t);
    blur = lerp(PLACARD_PRESENCE.maxBlurPx, 0, t);
    shadowAlpha = 0.08 + 0.14 * t;

    presence.setAttribute("transform", "scale(" + formatNumber(scale) + ")");
    presence.setAttribute("opacity", formatNumber(opacity));

    if (hidden) {
      presence.setAttribute("visibility", "hidden");
      slotNode.setAttribute("visibility", "hidden");
      slotNode.removeAttribute("data-placard-interactive");
      presence.style.filter = "none";
      if (disc.sectorSlots) {
        slotIndex = parseInt(slotNode.getAttribute("data-slot-index") || "0", 10);
        slot = disc.sectorSlots[slotIndex];
        if (slot) ensureSlotImageMatchesState(disc, slot, slotNode, false);
      }
      return;
    }

    presence.removeAttribute("visibility");
    slotNode.removeAttribute("visibility");
    presence.style.filter =
      "blur(" + blur.toFixed(2) + "px) drop-shadow(0 3px 6px rgba(92, 75, 58, " + shadowAlpha.toFixed(2) + "))";

    if (t >= PLACARD_PRESENCE.tapMinT) {
      slotNode.setAttribute("data-placard-interactive", "true");
    } else {
      slotNode.removeAttribute("data-placard-interactive");
    }

    if (disc.sectorSlots) {
      slotIndex = parseInt(slotNode.getAttribute("data-slot-index") || "0", 10);
      slot = disc.sectorSlots[slotIndex];
      if (slot) ensureSlotImageMatchesState(disc, slot, slotNode, true);
    }
  }

  function renderHotpotPlacard(disc, slot, innerRadius, outerRadius, geometry) {
    var center = getSlotCenterOnDisc(slot, innerRadius, outerRadius);
    var anchor = getSlotPositionInViewBox(disc, center.x, center.y, geometry);
    var src = getItemSrcForSlot(disc, slot);
    var slotKey = getSlotKey(disc.id, slot.index);
    var maxDim = disc.itemSize || 24;
    var drop = disc.placardDrop || 0;
    var baseRx = Math.max(3, Math.round(maxDim * 0.2));
    var baseRy = Math.max(2, Math.round(maxDim * 0.09));
    var hitR = Math.max(14, Math.round(maxDim * 0.52));
    var hitCy = Math.round(drop - maxDim * 0.12);
    var foodName = getFoodNameFromUrl(src);
    var sectorColor = getSectorColor(disc, slot.index);

    return (
      '<g class="turntable-slot" data-placard-slot="' + slotKey + '"' +
        ' data-slot-index="' + slot.index + '"' +
        ' data-disc-id="' + disc.id + '"' +
        ' style="--sector-color:' + sectorColor + '"' +
        ' data-food-name="' + escapeAttr(foodName) + '"' +
        ' data-slot-center-angle="' + formatNumber(slot.centerAngle) + '"' +
        ' data-slot-x="' + formatNumber(center.x) + '"' +
        ' data-slot-y="' + formatNumber(center.y) + '"' +
        ' data-depth-view="' + formatNumber(anchor.y) + '"' +
        ' role="button" tabindex="-1" aria-pressed="false"' +
        ' transform="translate(' + formatNumber(anchor.x) + " " + formatNumber(anchor.y) + ')">' +
        '<g class="turntable-placard-presence">' +
          '<ellipse class="turntable-slot-base" cx="0" cy="0"' +
            ' rx="' + formatNumber(baseRx) + '" ry="' + formatNumber(baseRy) + '"></ellipse>' +
          '<g class="turntable-placard-rise" transform="translate(0 ' + formatNumber(drop) + ')">' +
            '<g class="turntable-placard-body">' +
              '<image class="turntable-slot-image" data-placard-image="' + slotKey + '"' +
                ' data-max-dim="' + formatNumber(maxDim) + '"' +
                ' href="' + escapeAttr(src) + '"' +
                ' opacity="0"></image>' +
              '<rect class="turntable-slot-frame" data-placard-frame="' + slotKey + '"' +
                ' x="0" y="0" width="1" height="1" rx="8" ry="8"' +
                ' fill="none" vector-effect="non-scaling-stroke"></rect>' +
              '<circle class="turntable-placard-hit" data-placard-hit="' + slotKey + '"' +
                ' cx="0" cy="' + formatNumber(hitCy) + '" r="' + formatNumber(hitR) + '"></circle>' +
              '<g class="turntable-food-tag turntable-food-tag--' + disc.id + '" data-placard-label="' + slotKey + '">' +
                '<rect class="turntable-food-tag__bg" data-placard-label-bg' +
                  ' x="0" y="0" width="1" height="1" rx="4" opacity="0"></rect>' +
                '<text class="turntable-food-tag__text" data-placard-label-text' +
                  ' text-anchor="middle" opacity="0">' + escapeText(foodName) + "</text>" +
              "</g>" +
            "</g>" +
          "</g>" +
        "</g>" +
      "</g>"
    );
  }

  function renderPlacardSlots(disc) {
    if (!disc.sectorSlots || !disc.sectorSlots.length || !disc.itemUrls || !disc.itemUrls.length) {
      return "";
    }

    var geometry = getDiscGeometry(disc);
    var radii = getSectorRadii(geometry);
    var markup = [
      '<g class="turntable-slots" data-disc-placards="' + disc.id + '">'
    ];

    disc.sectorSlots.forEach(function (slot) {
      markup.push(renderHotpotPlacard(disc, slot, radii.inner, radii.outer, geometry));
    });
    markup.push("</g>");
    return markup.join("");
  }

  function renderPlacardStack(discs) {
    var markup = ['<g class="turntable-placard-stack" data-placard-stack>'];
    var i;
    var disc;

    for (i = 0; i < PLACARD_LAYER_ORDER.length; i += 1) {
      disc = discs.find(function (item) {
        return item.id === PLACARD_LAYER_ORDER[i];
      });
      if (disc) markup.push(renderPlacardSlots(disc));
    }

    markup.push("</g>");
    return markup.join("");
  }

  function collectSlotRefs(svg) {
    var slotImages = {};

    svg.querySelectorAll("[data-placard-image]").forEach(function (imageEl) {
      var key = imageEl.getAttribute("data-placard-image");
      if (key) slotImages[key] = imageEl;
    });

    return slotImages;
  }

  function layoutPlacardImages(svg) {
    if (!svg) return;

    svg.querySelectorAll("[data-placard-image]").forEach(function (imageEl) {
      var href = getImageHref(imageEl);
      var cached = lookupImageSize(href);
      var slotNode;

      function layoutFromDimensions(naturalW, naturalH) {
        rememberImageSize(href, naturalW, naturalH);
        applyPlacardImageLayout(imageEl, naturalW, naturalH);
        slotNode = getSlotNodeFromImage(imageEl);
        if (slotNode) layoutFoodLabel(slotNode, imageEl);
      }

      if (cached) {
        layoutFromDimensions(cached.w, cached.h);
        return;
      }

      function layoutFromElement() {
        if (imageEl.naturalWidth && imageEl.naturalHeight) {
          layoutFromDimensions(imageEl.naturalWidth, imageEl.naturalHeight);
        }
      }

      if (imageEl.complete) {
        layoutFromElement();
      }

      imageEl.addEventListener("load", layoutFromElement, { once: true });
    });
  }

  function layoutPlacardsForUrl(svg, url, naturalW, naturalH) {
    if (!svg || !url || !naturalW || !naturalH) return;

    rememberImageSize(url, naturalW, naturalH);
    svg.querySelectorAll("[data-placard-image]").forEach(function (imageEl) {
      var slotNode;

      if (!hrefMatches(getImageHref(imageEl), url)) return;
      applyPlacardImageLayout(imageEl, naturalW, naturalH);
      slotNode = getSlotNodeFromImage(imageEl);
      if (slotNode) layoutFoodLabel(slotNode, imageEl);
    });
  }

  function preloadDiscItems(discs, svg) {
    var seen = {};

    discs.forEach(function (disc) {
      if (!disc.itemUrls) return;
      disc.itemUrls.forEach(function (url) {
        if (!url || seen[url]) return;
        seen[url] = true;

        var cached = imageSizeCache[url];
        if (cached) {
          layoutPlacardsForUrl(svg, url, cached.w, cached.h);
          return;
        }

        var img = new Image();
        img.decoding = "async";
        img.onload = function () {
          layoutPlacardsForUrl(svg, url, img.naturalWidth, img.naturalHeight);
        };
        img.src = url;
      });
    });
  }

  function updatePlacardPositions(disc) {
    if (!runtime) return;

    var bucket = runtime.placardBuckets[disc.id];
    if (!bucket) return;

    bucket.querySelectorAll("[data-placard-slot]").forEach(function (slotNode) {
      var localX = parseFloat(slotNode.getAttribute("data-slot-x") || "0");
      var localY = parseFloat(slotNode.getAttribute("data-slot-y") || "0");
      var geometry = getDiscGeometry(disc);
      var anchor = getSlotPositionInViewBox(disc, localX, localY, geometry);

      slotNode.setAttribute(
        "transform",
        "translate(" + formatNumber(anchor.x) + " " + formatNumber(anchor.y) + ")"
      );
      slotNode.setAttribute("data-depth-view", formatNumber(anchor.y));

      if (disc.sectorSlots) {
        var slotIndex = parseInt(slotNode.getAttribute("data-slot-index") || "0", 10);
        var slot = disc.sectorSlots[slotIndex];
        var centerAngle = parseFloat(slotNode.getAttribute("data-slot-center-angle") || "0");
        var orbitDeg = getSlotOrbitDeg(disc, centerAngle);

        if (slot) {
          maybeCycleSlotItemAtSwapAngle(disc, slot, slotNode, orbitDeg);
        }
      }

      applyPlacardPresence(slotNode, disc);
    });
  }

  function sortPlacardDepth(disc) {
    var bucket = runtime && runtime.placardBuckets[disc.id];
    if (!bucket) return;

    var slots = Array.prototype.slice.call(bucket.querySelectorAll("[data-placard-slot]"));
    slots.sort(function (a, b) {
      return parseFloat(a.getAttribute("data-depth-view") || "0") -
        parseFloat(b.getAttribute("data-depth-view") || "0");
    });

    slots.forEach(function (node) {
      bucket.appendChild(node);
    });
  }

  function ensurePlacardLayerOrder() {
    if (!runtime || !runtime.placardStack) return;

    var i;
    for (i = 0; i < PLACARD_LAYER_ORDER.length; i += 1) {
      var bucket = runtime.placardBuckets[PLACARD_LAYER_ORDER[i]];
      if (bucket) runtime.placardStack.appendChild(bucket);
    }
  }

  function collectRuntimeRefs(svg) {
    var placardBucketMap = {};
    var i;

    for (i = 0; i < FOOD_DISC_IDS.length; i += 1) {
      var discId = FOOD_DISC_IDS[i];
      var bucket = svg.querySelector('[data-disc-placards="' + discId + '"]');
      if (bucket) placardBucketMap[discId] = bucket;
    }

    runtime = {
      svg: svg,
      placardStack: svg.querySelector("[data-placard-stack]"),
      placardBuckets: placardBucketMap,
      slotImages: collectSlotRefs(svg)
    };
  }

  global.TurntablePlacards = {
    attach: function (options) {
      deps = options || {};
      if (options && options.config) {
        deps.config = Object.assign({}, DEFAULT_CONFIG, options.config);
      }
    },

    applyFoodToDiscs: function (discs) {
      discs.forEach(function (disc) {
        if (disc.id === "cap") {
          disc.itemUrls = [];
          disc.sectorSlots = [];
          return;
        }
        applyDiscItems(disc);
      });
    },

    renderStack: function (discs) {
      return renderPlacardStack(discs);
    },

    afterRender: function (svg, discs) {
      collectRuntimeRefs(svg);
      discs.forEach(function (disc) {
        if (disc.id === "cap") return;
        updatePlacardPositions(disc);
        sortPlacardDepth(disc);
      });
      ensurePlacardLayerOrder();
      preloadDiscItems(discs, svg);
      layoutPlacardImages(svg);
      refreshSelectionVisuals();
    },

    updateDisc: function (disc) {
      updatePlacardPositions(disc);
      sortPlacardDepth(disc);
      ensurePlacardLayerOrder();
    },

    refreshSelectionVisuals: refreshSelectionVisuals,

    reset: function () {
      runtime = null;
    }
  };
})(typeof window !== "undefined" ? window : this);
