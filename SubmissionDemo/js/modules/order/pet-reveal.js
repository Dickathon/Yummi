/**
 * 点餐确认 — 宠物完整形象显现动画
 */
(function (global) {
  "use strict";

  var root = global.Yummi.modules.order = global.Yummi.modules.order || {};

  var CANVAS_SIZE = 360;
  var REVEAL_MS = 1000;
  var HOLD_MS = 3000;
  var FLY_MS = 650;

  var active = null;

  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function loadImage(src) {
    return new Promise(function (resolve) {
      var image;

      if (!src) {
        resolve(null);
        return;
      }

      image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        resolve(null);
      };
      image.src = src;
    });
  }

  function drawImageContain(ctx, image, x, y, width, height) {
    var iw;
    var ih;
    var scale;
    var drawWidth;
    var drawHeight;
    var drawX;
    var drawY;

    if (!image) {
      return;
    }

    iw = image.naturalWidth || image.width || 1;
    ih = image.naturalHeight || image.height || 1;
    scale = Math.min(width / iw, height / ih);
    drawWidth = iw * scale;
    drawHeight = ih * scale;
    drawX = x + (width - drawWidth) / 2;
    drawY = y + (height - drawHeight) / 2;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  function drawImageCover(ctx, image, x, y, width, height) {
    var iw;
    var ih;
    var scale;
    var drawWidth;
    var drawHeight;
    var drawX;
    var drawY;

    if (!image) {
      return;
    }

    iw = image.naturalWidth || image.width || 1;
    ih = image.naturalHeight || image.height || 1;
    scale = Math.max(width / iw, height / ih);
    drawWidth = iw * scale;
    drawHeight = ih * scale;
    drawX = x + (width - drawWidth) / 2;
    drawY = y + (height - drawHeight) / 2;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  function drawPaperFallback(ctx, size) {
    var gradient = ctx.createRadialGradient(size * 0.5, size * 0.22, 8, size * 0.5, size * 0.22, size * 0.72);
    gradient.addColorStop(0, "rgba(255, 250, 242, 0.92)");
    gradient.addColorStop(1, "rgba(232, 223, 209, 0.55)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  function buildContentCanvas(snapshot, assets) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var size = CANVAS_SIZE;
    var roomPad = size * 0.04;
    var roomSize = size - roomPad * 2;
    var petBox = size * 0.88;
    var petX = (size - petBox) / 2;
    var petY = size * 0.06;

    canvas.width = size;
    canvas.height = size;

    if (!ctx) {
      return canvas;
    }

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.globalAlpha = 0.42;
    if (assets.background) {
      drawImageCover(ctx, assets.background, roomPad, roomPad, roomSize, roomSize * 0.82);
    } else {
      drawPaperFallback(ctx, size);
    }
    ctx.restore();

    ctx.save();
    ctx.shadowColor = "rgba(92, 75, 58, 0.12)";
    ctx.shadowBlur = size * 0.06;
    ctx.shadowOffsetY = size * 0.02;

    assets.layers.forEach(function (entry) {
      if (entry && entry.image) {
        var zClass = entry.layer && (entry.layer.zClass || entry.layer.className);
        var offsetX = zClass === "house" ? petBox * 0.12 : 0;

        drawImageContain(ctx, entry.image, petX + offsetX, petY, petBox, petBox);
      }
    });
    ctx.restore();

    if (assets.drink) {
      drawImageContain(ctx, assets.drink, size * 0.62, size * 0.58, size * 0.28, size * 0.28);
    }

    return canvas;
  }

  function loadAssets(snapshot) {
    var layers = (snapshot && snapshot.layers) || [];
    var bgSrc = snapshot && snapshot.activeBackground && snapshot.activeBackground.src;
    var drinkSrc = snapshot && snapshot.drink && snapshot.drink.src;

    return Promise.all([
      loadImage(bgSrc),
      loadImage(drinkSrc)
    ].concat(layers.map(function (layer) {
      return loadImage(layer.src).then(function (image) {
        return { layer: layer, image: image };
      });
    }))).then(function (results) {
      return {
        background: results[0],
        drink: results[1],
        layers: results.slice(2)
      };
    });
  }

  function drawRevealFrame(displayCtx, contentCanvas, maskCanvas, progress) {
    var size = CANVAS_SIZE;
    var maskCtx = maskCanvas.getContext("2d");
    var radial;
    var linear;
    var shimmerY;
    var i;

    if (!displayCtx || !maskCtx) {
      return;
    }

    maskCtx.clearRect(0, 0, size, size);

    radial = maskCtx.createRadialGradient(
      size * 0.5, size * 0.46, size * 0.02,
      size * 0.5, size * 0.46, size * (0.18 + progress * 0.78)
    );
    radial.addColorStop(0, "rgba(255,255,255,1)");
    radial.addColorStop(Math.min(0.92, 0.45 + progress * 0.35), "rgba(255,255,255,0.88)");
    radial.addColorStop(1, "rgba(255,255,255,0)");
    maskCtx.fillStyle = radial;
    maskCtx.fillRect(0, 0, size, size);

    linear = maskCtx.createLinearGradient(0, size * (1.05 - progress * 1.15), 0, size);
    linear.addColorStop(0, "rgba(255,255,255,0)");
    linear.addColorStop(0.35, "rgba(255,255,255,0.55)");
    linear.addColorStop(1, "rgba(255,255,255,1)");
    maskCtx.globalCompositeOperation = "source-in";
    maskCtx.fillStyle = linear;
    maskCtx.fillRect(0, 0, size, size);
    maskCtx.globalCompositeOperation = "source-over";

    for (i = 0; i < 3; i += 1) {
      shimmerY = size * (0.15 + progress * 0.85) + i * 18;
      maskCtx.strokeStyle = "rgba(255,255,255," + (0.08 * (1 - i * 0.25) * progress) + ")";
      maskCtx.lineWidth = 2 + i;
      maskCtx.beginPath();
      maskCtx.moveTo(size * 0.18, shimmerY);
      maskCtx.lineTo(size * 0.82, shimmerY - 24);
      maskCtx.stroke();
    }

    displayCtx.clearRect(0, 0, size, size);
    displayCtx.save();
    displayCtx.globalAlpha = 0.12 + progress * 0.88;
    displayCtx.drawImage(contentCanvas, 0, 0);
    displayCtx.globalCompositeOperation = "destination-in";
    displayCtx.drawImage(maskCanvas, 0, 0);
    displayCtx.restore();
    displayCtx.globalCompositeOperation = "source-over";
  }

  function getTabDressTarget() {
    var tab = document.getElementById("tab-dress");
    if (!tab) {
      return null;
    }
    return tab.querySelector(".tab-bar__icon-wrap") || tab;
  }

  function pulseDressTab() {
    var tab = document.getElementById("tab-dress");
    if (!tab) {
      return;
    }
    tab.classList.remove("tab-bar__item--pet-received");
    void tab.offsetWidth;
    tab.classList.add("tab-bar__item--pet-received");
    global.setTimeout(function () {
      tab.classList.remove("tab-bar__item--pet-received");
    }, 520);
  }

  function cleanupSession(session) {
    if (!session) {
      return;
    }
    if (session.rafId) {
      global.cancelAnimationFrame(session.rafId);
    }
    if (session.overlay && session.overlay.parentElement) {
      session.overlay.parentElement.removeChild(session.overlay);
    }
    document.body.style.overflow = "";
    if (session === active) {
      active = null;
    }
  }

  function finishSession(session) {
    var onComplete = session && session.onComplete;
    cleanupSession(session);
    pulseDressTab();
    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  function runFly(session, startTime) {
    var card = session.card;
    var target = getTabDressTarget();

    function frame(now) {
      var elapsed;
      var t;
      var cardRect;
      var targetRect;

      if (session !== active) {
        return;
      }

      elapsed = now - startTime;
      t = clamp(elapsed / FLY_MS, 0, 1);
      t = easeInOutCubic(t);

      if (!target) {
        card.style.opacity = String(1 - t);
        if (t >= 1) {
          finishSession(session);
          return;
        }
        session.rafId = global.requestAnimationFrame(frame);
        return;
      }

      cardRect = card.getBoundingClientRect();
      targetRect = target.getBoundingClientRect();

      if (!session.flyOrigin) {
        session.flyOrigin = {
          x: cardRect.left + cardRect.width / 2,
          y: cardRect.top + cardRect.height / 2
        };
        session.flyDelta = {
          x: (targetRect.left + targetRect.width / 2) - session.flyOrigin.x,
          y: (targetRect.top + targetRect.height / 2) - session.flyOrigin.y
        };
      }

      card.style.transform =
        "translate(" + (session.flyDelta.x * t) + "px," + (session.flyDelta.y * t) + "px) " +
        "scale(" + (1 - t * 0.88) + ")";
      card.style.opacity = String(1 - t * 0.92);

      if (t >= 1) {
        finishSession(session);
        return;
      }

      session.rafId = global.requestAnimationFrame(frame);
    }

    session.rafId = global.requestAnimationFrame(frame);
  }

  function runTimeline(session) {
    var displayCanvas = session.displayCanvas;
    var displayCtx = displayCanvas.getContext("2d");
    var reduced = prefersReducedMotion();
    var revealEnd = reduced ? 180 : REVEAL_MS;
    var holdEnd = revealEnd + (reduced ? 400 : HOLD_MS);

    function frame(now) {
      var elapsed;
      var progress;

      if (session !== active) {
        return;
      }

      elapsed = now - session.startTime;

      if (elapsed < revealEnd) {
        progress = easeOutCubic(elapsed / revealEnd);
        drawRevealFrame(displayCtx, session.contentCanvas, session.maskCanvas, progress);
        session.roastEl.style.opacity = String(progress);
        session.nameEl.style.opacity = String(progress);
        session.rafId = global.requestAnimationFrame(frame);
        return;
      }

      if (elapsed < holdEnd) {
        drawRevealFrame(displayCtx, session.contentCanvas, session.maskCanvas, 1);
        session.roastEl.style.opacity = "1";
        session.nameEl.style.opacity = "1";
        session.rafId = global.requestAnimationFrame(frame);
        return;
      }

      if (reduced) {
        session.overlay.style.opacity = "0";
        global.setTimeout(function () {
          finishSession(session);
        }, 180);
        return;
      }

      if (!session.flyStarted) {
        session.flyStarted = true;
        session.card.style.transition = "none";
        runFly(session, now);
      }
    }

    session.rafId = global.requestAnimationFrame(frame);
  }

  function createOverlay(snapshot, roastText) {
    var overlay = document.createElement("div");
    var backdrop = document.createElement("div");
    var card = document.createElement("div");
    var roastEl = document.createElement("p");
    var canvasWrap = document.createElement("div");
    var displayCanvas = document.createElement("canvas");
    var nameEl = document.createElement("p");
    var displayName = (snapshot && snapshot.petDisplayName) || "yummy的哈基米";

    overlay.className = "order-pet-reveal";
    overlay.setAttribute("aria-hidden", "false");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "宠物形象显现");

    backdrop.className = "order-pet-reveal__backdrop";

    card.className = "order-pet-reveal__card";

    roastEl.className = "order-pet-reveal__roast";
    roastEl.textContent = roastText || "";

    canvasWrap.className = "order-pet-reveal__canvas-wrap";

    displayCanvas.className = "order-pet-reveal__canvas";
    displayCanvas.width = CANVAS_SIZE;
    displayCanvas.height = CANVAS_SIZE;
    displayCanvas.setAttribute("aria-hidden", "true");

    nameEl.className = "order-pet-reveal__name";
    nameEl.textContent = displayName;

    canvasWrap.appendChild(displayCanvas);
    card.appendChild(roastEl);
    card.appendChild(canvasWrap);
    card.appendChild(nameEl);
    overlay.appendChild(backdrop);
    overlay.appendChild(card);

    return {
      overlay: overlay,
      card: card,
      roastEl: roastEl,
      nameEl: nameEl,
      displayCanvas: displayCanvas
    };
  }

  function play(options) {
    var snapshot = options && options.snapshot;
    var onComplete = options && options.onComplete;
    var roastText = options && options.roastText;
    var ui;
    var maskCanvas;
    var session;

    cancel();

    if (!snapshot) {
      if (typeof onComplete === "function") {
        onComplete();
      }
      return;
    }

    ui = createOverlay(snapshot, roastText);
    maskCanvas = document.createElement("canvas");
    maskCanvas.width = CANVAS_SIZE;
    maskCanvas.height = CANVAS_SIZE;

    document.body.appendChild(ui.overlay);
    document.body.style.overflow = "hidden";

    session = {
      overlay: ui.overlay,
      card: ui.card,
      roastEl: ui.roastEl,
      nameEl: ui.nameEl,
      displayCanvas: ui.displayCanvas,
      maskCanvas: maskCanvas,
      contentCanvas: null,
      onComplete: onComplete,
      startTime: 0,
      rafId: 0,
      flyStarted: false
    };
    active = session;

    loadAssets(snapshot).then(function (assets) {
      if (session !== active) {
        return;
      }
      session.contentCanvas = buildContentCanvas(snapshot, assets);
      session.startTime = performance.now();
      runTimeline(session);
    }).catch(function () {
      if (session !== active) {
        return;
      }
      cleanupSession(session);
      if (typeof onComplete === "function") {
        onComplete();
      }
    });
  }

  function cancel() {
    if (!active) {
      return;
    }
    cleanupSession(active);
  }

  root.petReveal = {
    play: play,
    cancel: cancel
  };
})(typeof window !== "undefined" ? window : this);
