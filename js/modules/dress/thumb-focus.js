(function (global) {
  "use strict";

  var root = global.Yummi.modules.dress;
  var THUMB_SCALE = 1.5;
  var ALPHA_THRESHOLD = 12;
  var SAMPLE_MAX = 256;

  /* 各部位底图 alpha 边界框中心（百分比），图片未加载完时作兜底 */
  var CATEGORY_FOCUS = {
    "头部": { x: 24.7, y: 22.9 },
    "躯干": { x: 42.4, y: 46.7 },
    "四肢": { x: 43.9, y: 72.4 },
    "尾巴": { x: 80.3, y: 57.3 },
    "毯子": { x: 44.5, y: 83.6 },
    "饮品": { x: 42, y: 50 }
  };

  function fallbackFor(category) {
    return CATEGORY_FOCUS[category] || { x: 50, y: 50 };
  }

  function setFocus(img, focus) {
    img.style.setProperty("--thumb-focus-x-num", String(focus.x));
    img.style.setProperty("--thumb-focus-y-num", String(focus.y));
    img.dataset.thumbFocusReady = "true";
  }

  function canUseCrossOrigin() {
    return global.location && global.location.protocol !== "file:";
  }

  function loadMeasurableImage(src) {
    return new Promise(function (resolve) {
      var image;

      if (!src) {
        resolve(null);
        return;
      }

      image = new Image();
      if (canUseCrossOrigin()) {
        image.crossOrigin = "anonymous";
      }
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        resolve(null);
      };
      image.src = src;
    });
  }

  function measureImage(img) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    var width = img.naturalWidth;
    var height = img.naturalHeight;
    var scale;
    var sampleW;
    var sampleH;
    var data;
    var minX;
    var minY;
    var maxX;
    var maxY;
    var x;
    var y;
    var alpha;
    var cx;
    var cy;

    if (!ctx || !width || !height) {
      return null;
    }

    scale = Math.min(1, SAMPLE_MAX / Math.max(width, height));
    sampleW = Math.max(1, Math.round(width * scale));
    sampleH = Math.max(1, Math.round(height * scale));
    canvas.width = sampleW;
    canvas.height = sampleH;

    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    try {
      data = ctx.getImageData(0, 0, sampleW, sampleH).data;
    } catch (error) {
      return null;
    }
    minX = sampleW;
    minY = sampleH;
    maxX = -1;
    maxY = -1;

    for (y = 0; y < sampleH; y += 1) {
      for (x = 0; x < sampleW; x += 1) {
        alpha = data[(y * sampleW + x) * 4 + 3];
        if (alpha > ALPHA_THRESHOLD) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0) {
      return null;
    }

    cx = (minX + maxX + 1) / 2;
    cy = (minY + maxY + 1) / 2;

    return {
      x: Math.round((cx / sampleW) * 1000) / 10,
      y: Math.round((cy / sampleH) * 1000) / 10
    };
  }

  function applyThumb(img, category) {
    var fallback = fallbackFor(category);

    if (!img || img.tagName !== "IMG") {
      return;
    }

    setFocus(img, fallback);

    function commitMeasured(sourceImg) {
      var measured = measureImage(sourceImg);
      if (measured) {
        setFocus(img, measured);
      }
    }

    function measureFromSrc() {
      var src = img.currentSrc || img.src;

      if (!src) {
        return;
      }

      loadMeasurableImage(src).then(function (loaded) {
        if (loaded) {
          commitMeasured(loaded);
        }
      });
    }

    if (canUseCrossOrigin()) {
      if (img.complete && img.naturalWidth) {
        measureFromSrc();
      } else {
        img.addEventListener("load", measureFromSrc, { once: true });
      }
      return;
    }

    if (img.complete && img.naturalWidth) {
      commitMeasured(img);
      return;
    }

    img.addEventListener("load", function () {
      commitMeasured(img);
    }, { once: true });
  }

  function applyAll(scope) {
    var rootEl = scope || document;
    var buttons = rootEl.querySelectorAll("[data-dress-wardrobe-item]");
    var i;
    var btn;
    var img;
    var category;

    for (i = 0; i < buttons.length; i += 1) {
      btn = buttons[i];
      img = btn.querySelector(".dress-wardrobe-card__thumb");
      category = btn.getAttribute("data-category") || "";
      if (img) {
        applyThumb(img, category);
      }
    }
  }

  root.thumbFocus = {
    THUMB_SCALE: THUMB_SCALE,
    apply: applyThumb,
    applyAll: applyAll,
    measure: measureImage,
    fallbackFor: fallbackFor
  };
})(typeof window !== "undefined" ? window : this);
