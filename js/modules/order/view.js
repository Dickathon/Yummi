(function (global) {
  "use strict";

  var util = global.Yummi.util;
  var root = global.Yummi.modules.order;
  var runtime = null;

  function getCapAssetBase() {
    var tb = root.config && root.config.turntable;
    return (tb && tb.capAssetsBase) || "assets/modules/order/turntable-cats/";
  }

  function getCapSideImages() {
    var base = getCapAssetBase();
    return [
      base + "IMG_20260530_125819-10kb.webp",
      base + "IMG_20260530_125904-10kb.webp",
      base + "IMG_20260530_125935-10kb.webp",
      base + "IMG_20260530_125618-10kb.webp",
      base + "IMG_20260530_125748-10kb.webp",
      base + "IMG_20260530_125756-10kb.webp",
      base + "IMG_20260530_125605-10kb.webp",
      base + "IMG_20260530_125740-10kb.webp"
    ];
  }

  function getCapTopTexture() {
    return getCapAssetBase() + "top-texture-cat-10kb.webp";
  }

  var PLACARD_TAP_THRESHOLD_SQ = 400;
  var PLACARD_LONG_PRESS_MS = 320;

  function escapeAttr(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  var foodImageIndex = null;

  function buildFoodImageIndex() {
    var catalog;
    var base;
    var keys;
    var i;
    var j;
    var paths;
    var path;
    var name;

    if (foodImageIndex) {
      return foodImageIndex;
    }

    foodImageIndex = {};
    catalog = root.itemsCatalog || {};
    base = (root.config && root.config.itemsBase) || "source/compressed/10kb/";
    keys = Object.keys(catalog);

    for (i = 0; i < keys.length; i += 1) {
      paths = catalog[keys[i]];
      if (!paths) {
        continue;
      }
      for (j = 0; j < paths.length; j += 1) {
        path = paths[j];
        name = path.split("/").pop().replace(/-10kb\.webp$/i, "").replace(/\.webp$/i, "");
        if (name && !foodImageIndex[name]) {
          foodImageIndex[name] = base + path;
        }
      }
    }

    return foodImageIndex;
  }

  function getFoodImageUrl(name) {
    var index = buildFoodImageIndex();
    return index[name] || "";
  }

  function getPointerTravelSq(event, startX, startY) {
    var dx = event.clientX - startX;
    var dy = event.clientY - startY;
    return (dx * dx) + (dy * dy);
  }


function formatNumber(value) {
        return Number(value.toFixed(3));
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

      function normalizeAngle(angle) {
        var next = angle % 360;
        return next < 0 ? next + 360 : next;
      }

      function angleDelta(nextAngle, prevAngle) {
        var delta = nextAngle - prevAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        return delta;
      }

      function createCirclePath(radius) {
        return [
          "M", formatNumber(radius), 0,
          "A", formatNumber(radius), formatNumber(radius), 0, 1, 0, formatNumber(-radius), 0,
          "A", formatNumber(radius), formatNumber(radius), 0, 1, 0, formatNumber(radius), 0,
          "Z"
        ].join(" ");
      }

      function createRingPath(outerRadius, innerRadius) {
        if (!innerRadius || innerRadius <= 0) {
          return createCirclePath(outerRadius);
        }
        return createCirclePath(outerRadius) + " " + createCirclePath(innerRadius);
      }

      function createSidePath(geometry) {
        var left = geometry.cx - geometry.rx;
        var right = geometry.cx + geometry.rx;
        var top = geometry.cy;
        var bottom = geometry.cy + geometry.height;

        return [
          "M", formatNumber(left), formatNumber(top),
          "L", formatNumber(left), formatNumber(bottom),
          "A", formatNumber(geometry.rx), formatNumber(geometry.ry), 0, 0, 0, formatNumber(right), formatNumber(bottom),
          "L", formatNumber(right), formatNumber(top),
          "A", formatNumber(geometry.rx), formatNumber(geometry.ry), 0, 0, 1, formatNumber(left), formatNumber(top),
          "Z"
        ].join(" ");
      }

      function createSideOutlinePath(geometry) {
        var left = geometry.cx - geometry.rx;
        var right = geometry.cx + geometry.rx;
        var top = geometry.cy;
        var bottom = geometry.cy + geometry.height;

        return [
          "M", formatNumber(left), formatNumber(top),
          "L", formatNumber(left), formatNumber(bottom),
          "A", formatNumber(geometry.rx), formatNumber(geometry.ry), 0, 0, 0, formatNumber(right), formatNumber(bottom),
          "L", formatNumber(right), formatNumber(top)
        ].join(" ");
      }

      function createSideHitPath(geometry) {
        return createSidePath(geometry);
      }

      function createFrontArcPath(cx, cy, rx, ry) {
        return [
          "M", formatNumber(cx - rx), formatNumber(cy),
          "A", formatNumber(rx), formatNumber(ry), 0, 0, 0, formatNumber(cx + rx), formatNumber(cy)
        ].join(" ");
      }

      function createSideBandPath(rx, ry, height, startX, endX) {
        return [
          "M", formatNumber(startX), 0,
          "L", formatNumber(startX), formatNumber(height),
          "A", formatNumber(rx), formatNumber(ry), 0, 0, 0, formatNumber(endX), formatNumber(height),
          "L", formatNumber(endX), 0,
          "Z"
        ].join(" ");
      }

      function createDonutSectorPath(innerRadius, outerRadius, startAngle, endAngle) {
        var startOuter = polarToCartesian(outerRadius, startAngle);
        var endOuter = polarToCartesian(outerRadius, endAngle);
        var startInner = polarToCartesian(innerRadius, endAngle);
        var endInner = polarToCartesian(innerRadius, startAngle);
        var largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return [
          "M", formatNumber(startOuter.x), formatNumber(startOuter.y),
          "A", formatNumber(outerRadius), formatNumber(outerRadius), 0, largeArc, 1, formatNumber(endOuter.x), formatNumber(endOuter.y),
          "L", formatNumber(startInner.x), formatNumber(startInner.y),
          "A", formatNumber(innerRadius), formatNumber(innerRadius), 0, largeArc, 0, formatNumber(endInner.x), formatNumber(endInner.y),
          "Z"
        ].join(" ");
      }

      function renderSectorMarkup(disc, geometry) {
        if (!disc.sectorColors.length) {
          return "";
        }
        var outerRadius = geometry.rx - 6;
        var innerRadius = Math.max(geometry.sectorInnerRadius, 12);
        var sectorCount = disc.sectorColors.length;
        var step = 360 / sectorCount;
        var parts = [];
        var i;

        for (i = 0; i < sectorCount; i += 1) {
          var start = i * step;
          var end = start + step;
          parts.push(
            '<path d="' + createDonutSectorPath(innerRadius, outerRadius, start, end) + '"' +
              ' fill="' + disc.sectorColors[i] + '"' +
              ' stroke="#5c4b3a" stroke-opacity="0.12" stroke-width="1"></path>'
          );
        }

        for (i = 0; i < sectorCount; i += 1) {
          var tickOuter = polarToCartesian(outerRadius - 1, i * step);
          var tickInner = polarToCartesian(innerRadius + 6, i * step);
          parts.push(
            '<line x1="' + formatNumber(tickInner.x) + '" y1="' + formatNumber(tickInner.y) +
            '" x2="' + formatNumber(tickOuter.x) + '" y2="' + formatNumber(tickOuter.y) +
            '" stroke="#5c4b3a" stroke-opacity="0.46" stroke-width="1.4" stroke-linecap="round"></line>'
          );
        }

        parts.push(
          '<circle r="' + formatNumber(innerRadius - 2) + '" fill="none" stroke="#5c4b3a" stroke-opacity="0.18" stroke-width="1.2"></circle>'
        );
        parts.push(
          '<circle r="' + formatNumber(outerRadius - 4) + '" fill="none" stroke="#5c4b3a" stroke-opacity="0.18" stroke-width="1.2"></circle>'
        );
        parts.push(
          '<path d="' + createDonutSectorPath(innerRadius + 8, outerRadius - 14, 318, 394) +
          '" fill="rgba(255,255,255,0.34)"></path>'
        );

        return parts.join("");
      }

      function createSectorAngleRanges(count, angle) {
        var ranges = [];
        var step = 360 / count;
        var i;

        for (i = 0; i < count; i += 1) {
          ranges.push({
            index: i,
            start: normalizeAngle(i * step + angle),
            end: normalizeAngle((i + 1) * step + angle)
          });
        }

        return ranges;
      }

      function normalizeFrontAngle(angle) {
        var next = normalizeAngle(angle);
        if (next < 90) next += 360;
        return next;
      }

      function getVisibleSectorSegments(range) {
        var segments = [];
        var start = normalizeAngle(range.start);
        var end = normalizeAngle(range.end);
        var candidateOffsets = [-360, 0, 360];
        var visibleWindows = [
          { start: 90, end: 270 },
          { start: 450, end: 630 },
          { start: -270, end: -90 }
        ];
        var i;
        var j;

        if (end <= start) {
          end += 360;
        }

        for (i = 0; i < candidateOffsets.length; i += 1) {
          var shiftedStart = start + candidateOffsets[i];
          var shiftedEnd = end + candidateOffsets[i];

          for (j = 0; j < visibleWindows.length; j += 1) {
            var overlapStart = Math.max(shiftedStart, visibleWindows[j].start);
            var overlapEnd = Math.min(shiftedEnd, visibleWindows[j].end);

            if (overlapEnd - overlapStart > 0.001) {
              while (overlapStart > 270) {
                overlapStart -= 360;
                overlapEnd -= 360;
              }
              while (overlapEnd < 90) {
                overlapStart += 360;
                overlapEnd += 360;
              }
              segments.push({
                start: overlapStart,
                end: overlapEnd
              });
            }
          }
        }

        segments.sort(function (a, b) {
          return a.start - b.start;
        });

        return segments.filter(function (segment, index) {
          if (index === 0) return true;
          var prev = segments[index - 1];
          return Math.abs(prev.start - segment.start) > 0.001 || Math.abs(prev.end - segment.end) > 0.001;
        });
      }

      function ellipsePointOnFrontArc(angleDeg, geometry, offsetY) {
        var radians = angleDeg * Math.PI / 180;
        return {
          x: geometry.rx * Math.sin(radians),
          y: -geometry.ry * Math.cos(radians) + offsetY
        };
      }

      function angleToEllipseX(angleDeg, rx) {
        var radians = angleDeg * Math.PI / 180;
        return rx * Math.sin(radians);
      }

      function sampleFrontArc(geometry, startAngle, endAngle, offsetY, reverse) {
        var points = [];
        var sweep = Math.max(2, Math.ceil(Math.abs(endAngle - startAngle) / 12));
        var i;

        for (i = 0; i <= sweep; i += 1) {
          var t = i / sweep;
          var angle = reverse
            ? endAngle + ((startAngle - endAngle) * t)
            : startAngle + ((endAngle - startAngle) * t);
          points.push(ellipsePointOnFrontArc(angle, geometry, offsetY));
        }

        return points;
      }

      function buildSideSectorPath(geometry, startAngle, endAngle) {
        var topPoints = sampleFrontArc(geometry, startAngle, endAngle, 0, false);
        var bottomPoints = sampleFrontArc(geometry, startAngle, endAngle, geometry.height, true);
        var parts = [];
        var i;

        parts.push("M", formatNumber(topPoints[0].x), formatNumber(topPoints[0].y));

        for (i = 1; i < topPoints.length; i += 1) {
          parts.push("L", formatNumber(topPoints[i].x), formatNumber(topPoints[i].y));
        }

        for (i = 0; i < bottomPoints.length; i += 1) {
          parts.push("L", formatNumber(bottomPoints[i].x), formatNumber(bottomPoints[i].y));
        }

        parts.push("Z");
        return parts.join(" ");
      }

      function renderTopFace(disc, geometry) {
        var scaleY = geometry.ry / geometry.rx;

        if (disc.id === "cap") {
          return (
            '<defs>' +
              '<clipPath id="cap-texture-clip">' +
                '<ellipse cx="0" cy="0" rx="' + formatNumber(geometry.rx - 2) + '" ry="' + formatNumber(geometry.rx - 2) + '"></ellipse>' +
              "</clipPath>" +
            "</defs>" +
            '<g transform="translate(' + formatNumber(geometry.cx) + " " + formatNumber(geometry.cy) + ') scale(1 ' + formatNumber(scaleY) + ')">' +
              '<circle r="' + formatNumber(geometry.rx) + '" fill="' + geometry.topColor + '"></circle>' +
              '<g data-rotor="' + disc.id + '" transform="rotate(' + formatNumber(geometry.angle) + ')">' +
                '<g clip-path="url(#cap-texture-clip)">' +
                  '<image class="turntable-face-image" href="' + getCapTopTexture() + '" x="' + formatNumber(-geometry.rx * 1.08) + '" y="' + formatNumber(-geometry.rx * 1.08) + '" width="' + formatNumber(geometry.rx * 2.16) + '" height="' + formatNumber(geometry.rx * 2.16) + '" preserveAspectRatio="xMidYMid slice"></image>' +
                "</g>" +
              "</g>" +
              '<circle r="' + formatNumber(geometry.rx - 2) + '" fill="none" stroke="#5c4b3a" stroke-opacity="0.22" stroke-width="1.2"></circle>' +
            "</g>"
          );
        }

        return (
          '<g transform="translate(' + formatNumber(geometry.cx) + " " + formatNumber(geometry.cy) + ') scale(1 ' + formatNumber(scaleY) + ')">' +
            '<circle r="' + formatNumber(geometry.rx) + '" fill="' + geometry.topColor + '"></circle>' +
            '<g data-rotor="' + disc.id + '" transform="rotate(' + formatNumber(geometry.angle) + ')">' +
              renderSectorMarkup(disc, geometry) +
            "</g>" +
          "</g>"
        );
      }

function renderCapSideImageBands(disc, geometry) {
        var segmentCount = 6;
        var angleRanges = createSectorAngleRanges(segmentCount, geometry.angle);
        var markup = [];
        var i;

        for (i = 0; i < angleRanges.length; i += 1) {
          var visibleRanges = getVisibleSectorSegments(angleRanges[i]);
          visibleRanges.forEach(function (segment, segmentIndex) {
            var path = buildSideSectorPath(geometry, segment.start, segment.end);
            var clipId = "cap-side-segment-" + i + "-" + segmentIndex;
            var x0 = Math.min(angleToEllipseX(segment.start, geometry.rx), angleToEllipseX(segment.end, geometry.rx));
            var x1 = Math.max(angleToEllipseX(segment.start, geometry.rx), angleToEllipseX(segment.end, geometry.rx));
            var width = Math.max(2, x1 - x0);
            var imagePadding = Math.max(0, geometry.rx * 0.06 * (1 - (width / (geometry.rx * 0.9))));
            var imageX = x0 - imagePadding;
            var imageWidth = width + imagePadding * 2;

            markup.push(
              '<defs>' +
                '<clipPath id="' + clipId + '">' +
                  '<path d="' + path + '"></path>' +
                "</clipPath>" +
              '</defs>'
            );

            markup.push(
              '<g clip-path="url(#' + clipId + ')">' +
                '<image class="turntable-side-band" href="' + getCapSideImages()[i % getCapSideImages().length] + '" x="' + formatNumber(imageX - imageWidth * 0.1) + '" y="10" width="' + formatNumber(imageWidth * 1.2) + '" height="' + formatNumber(geometry.height * 1.2) + '" preserveAspectRatio="xMidYMid slice"></image>' +
              '</g>'
            );

            markup.push(
              '<path d="' + path + '" fill="none" stroke="#5c4b3a" stroke-opacity="0.22" stroke-width="0.9"></path>'
            );
          });
        }

        return '<g class="turntable-side-carousel" data-side-rotor="' + geometry.id + '" transform="translate(' + formatNumber(geometry.cx) + ' ' + formatNumber(geometry.cy) + ')">' + markup.join("") + '</g>';
      }

      function renderSideColorBands(disc, geometry) {
        if (!disc.sectorColors || !disc.sectorColors.length) {
          return "";
        }

        var angleRanges = createSectorAngleRanges(disc.sectorColors.length, geometry.angle);
        var markup = [];
        var i;

        for (i = 0; i < angleRanges.length; i += 1) {
          var visibleRanges = getVisibleSectorSegments(angleRanges[i]);
          visibleRanges.forEach(function (segment) {
            var path = buildSideSectorPath(geometry, segment.start, segment.end);
            markup.push(
              '<path d="' + path + '" fill="' + disc.sectorColors[i] + '" fill-opacity="0.44"></path>'
            );
            markup.push(
              '<path d="' + path + '" fill="none" stroke="#5c4b3a" stroke-opacity="0.18" stroke-width="0.9"></path>'
            );
          });
        }

        return '<g class="turntable-side-colors" data-side-colors="' + disc.id + '" transform="translate(' + formatNumber(geometry.cx) + ' ' + formatNumber(geometry.cy) + ')">' + markup.join("") + '</g>';
      }

      function getDiscGeometry(disc) {
        if (!runtime || !runtime.state) return null;
        var g = runtime.state.global;
        var scale = g.globalScale * disc.scale;
        var layerUnit = (disc.baseCy - 148) / 64;

        return {
          id: disc.id,
          label: disc.label,
          colorClass: disc.colorClass,
          cx: disc.baseCx + g.offsetX + disc.x,
          cy: 148 + (layerUnit * 64 * g.layerGap) + g.offsetY + disc.y,
          rx: disc.baseRx * scale,
          ry: disc.baseRy * scale * g.ellipseRatio,
          height: 42 * g.discHeight * disc.heightScale * scale * (disc.baseRx / 72),
          angle: disc.angle,
          hitInnerRadius: disc.hitInnerRadius > 0 ? disc.hitInnerRadius * scale : 0,
          sectorInnerRadius: disc.sectorInnerRadius * scale,
          topColor: disc.topColor,
          capColor: disc.capColor,
          sideGradientId: disc.sideGradientId
        };
      }

      function getTurntableStackTopY() {
        var topY = 398;
        var i;
        var geometry;

        if (!runtime || !runtime.state) {
          return 0;
        }

        for (i = 0; i < runtime.state.discs.length; i += 1) {
          geometry = getDiscGeometry(runtime.state.discs[i]);
          if (!geometry) {
            continue;
          }
          topY = Math.min(topY, geometry.cy - geometry.ry);
        }

        return Math.max(0, topY - 8);
      }

      function renderTurntable() {
        runtime.svg.innerHTML =
          '<defs>' +
            '<linearGradient id="turntable-base-side" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#e8dfd1"></stop>' +
              '<stop offset="100%" stop-color="#c4a882"></stop>' +
            "</linearGradient>" +
            '<linearGradient id="turntable-mid-side" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#f7ecec"></stop>' +
              '<stop offset="100%" stop-color="#e8dfd1"></stop>' +
            "</linearGradient>" +
            '<linearGradient id="turntable-top-side" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#c8d8ba"></stop>' +
              '<stop offset="100%" stop-color="#8fbc8f"></stop>' +
            "</linearGradient>" +
            '<linearGradient id="turntable-cap-side" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#f5d8bb"></stop>' +
              '<stop offset="100%" stop-color="#d7a773"></stop>' +
            "</linearGradient>" +
            '<radialGradient id="turntable-floor-shadow" cx="50%" cy="50%" r="50%">' +
              '<stop offset="0%" stop-color="#5c4b3a" stop-opacity="0.16"></stop>' +
              '<stop offset="100%" stop-color="#5c4b3a" stop-opacity="0"></stop>' +
            "</radialGradient>" +
          "</defs>";

        var baseGeometry = getDiscGeometry(runtime.state.discs[0]);
        runtime.svg.innerHTML +=
          '<ellipse cx="' + formatNumber(baseGeometry.cx) + '"' +
          ' cy="' + formatNumber(baseGeometry.cy + baseGeometry.height + 12) + '"' +
          ' rx="' + formatNumber(baseGeometry.rx + 8) + '"' +
          ' ry="' + formatNumber(Math.max(18, baseGeometry.ry * 0.64)) + '"' +
          ' fill="url(#turntable-floor-shadow)"></ellipse>';

        var stageDragTop = getTurntableStackTopY();
        if (stageDragTop > 0) {
          runtime.svg.innerHTML +=
            '<rect class="turntable-stage-hit" data-hit="top"' +
            ' x="0" y="0" width="380" height="' + formatNumber(stageDragTop) + '"' +
            ' fill="rgba(255,255,255,0.001)"></rect>';
        }

        runtime.state.discs.forEach(function (disc) {
          var geometry = getDiscGeometry(disc);
          var scaleY = geometry.ry / geometry.rx;
          var capRx = Math.max(8, geometry.rx * 0.16);
          var capRy = Math.max(4, geometry.ry * 0.34);
          var topHitPath = disc.id === "base"
            ? createRingPath(geometry.rx, 0)
            : createRingPath(geometry.rx, geometry.hitInnerRadius);
          var centerCapMarkup = disc.id === "cap"
            ? ""
            : (
              '<g transform="translate(' + formatNumber(geometry.cx) + " " + formatNumber(geometry.cy) + ')">' +
                '<ellipse rx="' + formatNumber(capRx) + '" ry="' + formatNumber(capRy) + '" fill="' + geometry.capColor + '" stroke="#5c4b3a" stroke-width="1.5"></ellipse>' +
                '<ellipse rx="' + formatNumber(capRx * 0.52) + '" ry="' + formatNumber(capRy * 0.52) + '" fill="#ffffff" fill-opacity="0.66"></ellipse>' +
              "</g>"
            );

          runtime.svg.innerHTML +=
            '<g data-disc="' + disc.id + '">' +
              '<path d="' + createSidePath(geometry) + '" fill="url(#' + geometry.sideGradientId + ')"></path>' +
              (disc.id === "cap" ? renderCapSideImageBands(disc, geometry) : renderSideColorBands(disc, geometry)) +
              '<path d="' + createSideOutlinePath(geometry) + '" fill="none" stroke="#5c4b3a" stroke-width="2.2" stroke-linejoin="round"></path>' +
              renderTopFace(disc, geometry) +
              '<ellipse cx="' + formatNumber(geometry.cx) + '" cy="' + formatNumber(geometry.cy) + '" rx="' + formatNumber(geometry.rx) + '" ry="' + formatNumber(geometry.ry) + '" fill="none" stroke="#5c4b3a" stroke-width="2.2"></ellipse>' +
              centerCapMarkup +
              '<g transform="translate(' + formatNumber(geometry.cx) + " " + formatNumber(geometry.cy) + ') scale(1 ' + formatNumber(scaleY) + ')">' +
                '<path class="turntable-hit" data-hit="' + disc.id + '" d="' + topHitPath + '" fill="rgba(255,255,255,0.001)" fill-rule="evenodd"></path>' +
              "</g>" +
              '<path class="turntable-hit-side" data-hit-side="' + disc.id + '" d="' + createSideHitPath(geometry) + '" fill="rgba(255,255,255,0.001)"></path>' +
            "</g>";
        });

        runtime.svg.innerHTML += TurntablePlacards.renderStack(runtime.state.discs);

        runtime.state.discs.forEach(function (disc) {
          runtime.rotors[disc.id] = runtime.svg.querySelector('[data-rotor="' + disc.id + '"]');
          runtime.sideColorGroups = runtime.sideColorGroups || {};
          runtime.sideColorGroups[disc.id] = runtime.svg.querySelector('[data-side-colors="' + disc.id + '"]');
          runtime.sideRotors = runtime.sideRotors || {};
          runtime.sideRotors[disc.id] = runtime.svg.querySelector('[data-side-rotor="' + disc.id + '"]');
        });

        TurntablePlacards.afterRender(runtime.svg, runtime.state.discs);
      }

      function updateRotor(disc) {
        if (!runtime.rotors[disc.id]) return;
        runtime.rotors[disc.id].setAttribute("transform", "rotate(" + formatNumber(disc.angle) + ")");
        if (runtime.sideColorGroups && runtime.sideColorGroups[disc.id]) {
          var geometry = getDiscGeometry(disc);
          runtime.sideColorGroups[disc.id].outerHTML = renderSideColorBands(disc, geometry);
          runtime.sideColorGroups[disc.id] = runtime.svg.querySelector('[data-side-colors="' + disc.id + '"]');
        }
        if (runtime.sideRotors && runtime.sideRotors[disc.id]) {
          var sideGeometry = getDiscGeometry(disc);
          runtime.sideRotors[disc.id].outerHTML = renderCapSideImageBands(disc, sideGeometry);
          runtime.sideRotors[disc.id] = runtime.svg.querySelector('[data-side-rotor="' + disc.id + '"]');
        }

        if (disc.id !== "cap") {
          TurntablePlacards.updateDisc(disc);
        }
      }

      function getDraggingDisc(pointerId) {
        return runtime.state.discs.find(function (item) {
          return item.pointerId === pointerId && item.dragging;
        }) || null;
      }

      function startTurntableDrag(disc, pointerId, pointerAngle, eventTime) {
        runtime.state.discs.forEach(function (item) {
          item.dragging = item.id === disc.id;
          item.pointerId = item.id === disc.id ? pointerId : null;
          item.lastPointerAngle = item.id === disc.id ? pointerAngle : null;
          item.lastMoveTime = item.id === disc.id ? eventTime : null;
          item.angularVelocity = 0;
        });
        runtime.state.activeDiscId = disc.id;
      }

      function rotateTurntable(deltaAngle, angularVelocity) {
        runtime.state.discs.forEach(function (item) {
          item.angle = normalizeAngle(item.angle + deltaAngle);
          item.angularVelocity = angularVelocity;
          updateRotor(item);
        });
      }

      function getPersonalityApi() {
        return global.Yummi && global.Yummi.foodPersonality;
      }

      function getDressStateApi() {
        return global.Yummi &&
          global.Yummi.modules &&
          global.Yummi.modules.dress &&
          global.Yummi.modules.dress.state;
      }

      function getDressExporter() {
        return global.Yummi &&
          global.Yummi.modules &&
          global.Yummi.modules.dress &&
          global.Yummi.modules.dress.exporter;
      }

      function getPetRevealApi() {
        return global.Yummi &&
          global.Yummi.modules &&
          global.Yummi.modules.order &&
          global.Yummi.modules.order.petReveal;
      }

      function capturePetSnapshot() {
        var dressState = getDressStateApi();
        if (dressState && typeof dressState.captureSnapshot === "function") {
          return dressState.captureSnapshot();
        }
        return { layers: [], drink: null, petDisplayName: "yummy的哈基米" };
      }

      function clearDressState() {
        var dressState = getDressStateApi();
        if (dressState && typeof dressState.resetAll === "function") {
          dressState.resetAll();
        }
      }

      function renderReportLayer(item) {
        var zClass = item.zClass || item.className || "layer";
        return (
          '<img class="order-report-pet__layer order-report-pet__layer--' + util.escapeHtml(zClass) +
            ' order-report-pet__layer--' + util.escapeHtml(item.className || "layer") + '"' +
            ' src="' + escapeAttr(item.src) + '"' +
            ' alt="' + escapeAttr(item.label || "") + '"' +
            ' decoding="async">'
        );
      }

      function renderReportDrink(drink) {
        if (!drink) return "";
        return (
          '<div class="order-report-pet__drink" aria-label="' + escapeAttr(drink.name) + '饮品">' +
            '<img class="order-report-pet__drink-img" src="' + escapeAttr(drink.src) +
              '" alt="' + escapeAttr(drink.name) + '" decoding="async">' +
            '<span class="order-report-pet__drink-label">' + util.escapeHtml(drink.name) + "</span>" +
          "</div>"
        );
      }

      function renderReportRoom(snapshot) {
        var background = snapshot && snapshot.activeBackground;

        return (
          '<div class="order-report-pet__room" aria-hidden="true">' +
            (background ?
              '<img class="order-report-pet__room-bg" src="' + escapeAttr(background.src) + '" alt="" decoding="async">' :
              '<div class="order-report-pet__room-paper"></div>') +
          "</div>"
        );
      }

      function renderPetSnapshot(snapshot) {
        var layers = (snapshot && snapshot.layers) || [];
        return (
          '<section class="order-report-pet" aria-label="确认点餐时的宠物快照">' +
            renderReportRoom(snapshot || {}) +
            '<div class="order-report-pet__aura" aria-hidden="true"></div>' +
            '<div class="order-report-pet__stage">' +
              layers.map(renderReportLayer).join("") +
            "</div>" +
            renderReportDrink(snapshot && snapshot.drink) +
            '<p class="order-report-pet__name">' +
              util.escapeHtml((snapshot && snapshot.petDisplayName) || "yummy的哈基米") +
            "</p>" +
          "</section>"
        );
      }

      function renderTasteIcon(key) {
        var common = ' class="order-report-taste__svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false"';
        var icons = {
          sweet: '<svg' + common + '><path d="M14 18 8 14l4 10-4 10 6-4"></path><path d="M34 18l6-4-4 10 4 10-6-4"></path><rect x="14" y="16" width="20" height="16" rx="8"></rect><path d="M20 20c3 3 5 3 8 0"></path></svg>',
          salty: '<svg' + common + '><path d="M17 14h14l-2 6H19l-2-6Z"></path><path d="M18 20h12l3 20H15l3-20Z"></path><path d="M20 10h8"></path><path d="M21 27h6"></path><path d="M20 33h8"></path></svg>',
          sour: '<svg' + common + '><circle cx="24" cy="24" r="15"></circle><path d="M24 9v30"></path><path d="M11 24h26"></path><path d="m15 15 18 18"></path><path d="m33 15-18 18"></path></svg>',
          spicy: '<svg' + common + '><path d="M31 9c-2 5-1 8 3 11"></path><path d="M16 35c13 2 21-8 16-18-8 9-20 4-21 15 0 2 2 3 5 3Z"></path><path d="M17 35c-1 3 2 5 6 3"></path></svg>',
          bitter: '<svg' + common + '><path d="M15 29c-2-8 2-16 9-18 7 2 11 10 9 18-2 7-7 10-9 10s-7-3-9-10Z"></path><path d="M24 13c-3 8-2 15 3 23"></path><path d="M18 25c4 0 8-2 12-6"></path></svg>',
          umami: '<svg' + common + '><path d="M10 24c1-9 8-14 14-14s13 5 14 14H10Z"></path><path d="M19 24h10l3 15H16l3-15Z"></path><path d="M16 18h.1"></path><path d="M25 15h.1"></path><path d="M32 20h.1"></path></svg>',
          oily: '<svg' + common + '><path d="M24 8c8 10 12 17 12 24a12 12 0 0 1-24 0c0-7 4-14 12-24Z"></path><path d="M19 34c3 3 8 3 11-1"></path></svg>',
          fresh: '<svg' + common + '><path d="M39 10C22 9 12 18 11 35c17 1 27-8 28-25Z"></path><path d="M12 34c8-8 15-13 24-20"></path><path d="M20 29c0-4-1-7-3-10"></path><path d="M27 24c-4 0-7-1-10-3"></path></svg>'
        };
        return icons[key] || icons.umami;
      }

      function renderTasteOverview(report) {
        var items = (report && report.topTastes) || [];
        return (
          '<section class="order-report-section order-report-section--taste">' +
            '<div class="order-report-section__head">' +
              '<span class="order-report-section__kicker">前三口味</span>' +
              '<h4 class="order-report-section__title">Taste Signal</h4>' +
            "</div>" +
            '<div class="order-report-taste-grid">' +
              items.map(function (item) {
                return (
                  '<article class="order-report-taste">' +
                    '<span class="order-report-taste__icon">' + renderTasteIcon(item.key) + "</span>" +
                    '<span class="order-report-taste__name">' + util.escapeHtml(item.label) + "</span>" +
                    '<strong class="order-report-taste__percent">' + item.percent + "%</strong>" +
                  "</article>"
                );
              }).join("") +
            "</div>" +
          "</section>"
        );
      }

      function renderTasteInsights(report) {
        var insights = (report && report.tasteInsights) || [];
        return (
          '<section class="order-report-section">' +
            '<div class="order-report-section__head">' +
              '<span class="order-report-section__kicker">Top 4 分析</span>' +
              '<h4 class="order-report-section__title">你点出了什么</h4>' +
            "</div>" +
            '<div class="order-report-insights">' +
              insights.map(function (item) {
                return (
                  '<article class="order-report-insight">' +
                    '<span class="order-report-insight__label">' + util.escapeHtml(item.label) + "</span>" +
                    '<p class="order-report-insight__text">' + util.escapeHtml(item.summary) + "</p>" +
                    (item.sourceText ?
                      '<p class="order-report-insight__source">' + util.escapeHtml(item.sourceText) + "</p>" :
                      "") +
                  "</article>"
                );
              }).join("") +
            "</div>" +
          "</section>"
        );
      }

      function renderRegionInsight(report) {
        var primary = report && report.region && report.region.primary;
        var supportFoods = (primary && primary.supportFoods) || [];
        if (!primary) return "";
        return (
          '<section class="order-report-section order-report-section--region">' +
            '<div class="order-report-section__head">' +
              '<span class="order-report-section__kicker">地域风味</span>' +
              '<h4 class="order-report-section__title">' +
                util.escapeHtml(primary.label) + " " + primary.percent + "%" +
              "</h4>" +
            "</div>" +
            '<p class="order-report-region__text">' + util.escapeHtml(primary.summary) + "</p>" +
            (supportFoods.length ?
              '<div class="order-report-region__foods" aria-label="地域来源菜品">' +
                supportFoods.map(function (item) {
                  return '<span class="order-report-region__food">' + util.escapeHtml(item.name) + "</span>";
                }).join("") +
              "</div>" :
              "") +
          "</section>"
        );
      }

      function renderReportCard(report, snapshot) {
        var personality = report.personality;
        var core = report.corePersonality;
        var special = report.isRegionSpecial;

        return (
          '<div class="order-report-card" data-order-report-card>' +
            '<div class="order-report-card__wash" aria-hidden="true"></div>' +
            '<header class="order-report-card__header">' +
              '<p class="order-report-card__eyebrow">YUMMI TASTE FILE</p>' +
              '<h2 class="order-report-card__title">你的口味人格报告</h2>' +
              '<div class="order-report-card__badge" aria-label="人格编码">' +
                util.escapeHtml(personality.code) +
              "</div>" +
            "</header>" +
            renderPetSnapshot(snapshot) +
            '<section class="order-report-identity">' +
              '<p class="order-report-identity__code">' + util.escapeHtml((report.coreLabels || []).join(" · ")) + "</p>" +
              '<h3 class="order-report-identity__name">' + util.escapeHtml(personality.name) + "</h3>" +
              '<p class="order-report-identity__line">' + util.escapeHtml(personality.oneLiner) + "</p>" +
              '<p class="order-report-identity__desc">' + util.escapeHtml(personality.description) + "</p>" +
              (report.reasonSummary ?
                '<p class="order-report-identity__reason">' + util.escapeHtml(report.reasonSummary) + "</p>" :
                "") +
              (special && core ?
                '<p class="order-report-identity__sub">底层口味核：' +
                  util.escapeHtml(core.code + " · " + core.name) + "</p>" :
                "") +
            "</section>" +
            renderTasteOverview(report) +
            '<section class="order-report-section">' +
              '<div class="order-report-section__head">' +
                '<span class="order-report-section__kicker">人格总评</span>' +
                '<h4 class="order-report-section__title">Flavor MBTI</h4>' +
              "</div>" +
              '<p class="order-report-section__body">' + util.escapeHtml(personality.detail) + "</p>" +
              '<p class="order-report-section__note">' + util.escapeHtml(personality.regionAffinity) + "</p>" +
            "</section>" +
            renderTasteInsights(report) +
            renderRegionInsight(report) +
            '<footer class="order-report-card__footer">此报告仅代表你的胃，不代表你的身份证所在地。</footer>' +
          "</div>"
        );
      }

      function setExportStatus(text, tone) {
        if (!runtime || !runtime.exportStatus) return;
        runtime.exportStatus.textContent = text || "";
        runtime.exportStatus.setAttribute("data-tone", tone || "");
      }

      function renderReportUi(options) {
        if (!runtime || !runtime.reportMount) return;

        var deferVisible = options && options.deferVisible;

        updateOrderMode();

        if (!runtime.state.confirmed || !runtime.state.report || !runtime.state.report.ok) {
          runtime.reportMount.hidden = true;
          runtime.reportMount.innerHTML = "";
          runtime.reportCard = null;
          runtime.exportStatus = null;
          return;
        }

        runtime.reportMount.hidden = !!deferVisible;
        runtime.reportMount.innerHTML =
          renderReportCard(runtime.state.report, runtime.state.petSnapshot) +
          '<div class="order-report-actions" data-export-ignore>' +
            '<button type="button" class="order-report-export" data-order-report-export>导出图片</button>' +
            '<p class="order-report-export__status" data-order-export-status aria-live="polite"></p>' +
          "</div>";
        runtime.reportCard = runtime.reportMount.querySelector("[data-order-report-card]");
        runtime.exportStatus = runtime.reportMount.querySelector("[data-order-export-status]");
      }

      function showReportMount() {
        if (runtime && runtime.reportMount) {
          runtime.reportMount.hidden = false;
        }
      }

      function scrollToPersonalityReport() {
        var target;

        if (!runtime || !runtime.reportMount) {
          return;
        }

        target = runtime.reportMount.querySelector(".order-report-identity") ||
          runtime.reportMount.querySelector("[data-order-report-card]");

        if (target && typeof target.scrollIntoView === "function") {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        if (typeof runtime.reportMount.scrollIntoView === "function") {
          runtime.reportMount.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      function updateOrderMode() {
        var confirmed = Boolean(runtime && runtime.state && runtime.state.confirmed);
        if (runtime && runtime.orderRoot) {
          runtime.orderRoot.classList.toggle("is-confirmed", confirmed);
        }
        if (runtime && runtime.selectionPanel) {
          runtime.selectionPanel.classList.toggle("is-confirmed", confirmed);
        }
      }

      function waitForImage(img) {
        return new Promise(function (resolve) {
          if (!img || img.complete) {
            resolve();
            return;
          }
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      }

      function imageUrlToDataUrl(src) {
        return new Promise(function (resolve) {
          var img;
          if (!src || src.indexOf("data:") === 0) {
            resolve(src || "");
            return;
          }

          img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = function () {
            var canvas;
            var ctx;
            try {
              canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            } catch (err) {
              resolve(src);
            }
          };
          img.onerror = function () {
            resolve(src);
          };
          img.src = src;
        });
      }

      function inlineCloneImages(source, clone) {
        var sourceImgs = Array.prototype.slice.call(source.querySelectorAll("img"));
        var cloneImgs = Array.prototype.slice.call(clone.querySelectorAll("img"));
        return Promise.all(sourceImgs.map(function (img, index) {
          var src = img.currentSrc || img.src || img.getAttribute("src");
          return imageUrlToDataUrl(src).then(function (dataUrl) {
            if (cloneImgs[index] && dataUrl) {
              cloneImgs[index].setAttribute("src", dataUrl);
            }
          });
        }));
      }

      function copyComputedStyles(source, target) {
        var computed = global.getComputedStyle(source);
        var css = [];
        var i;
        var prop;

        for (i = 0; i < computed.length; i += 1) {
          prop = computed[i];
          css.push(prop + ":" + computed.getPropertyValue(prop) + (computed.getPropertyPriority(prop) ? " !important" : ""));
        }
        css.push("box-sizing:border-box");
        target.setAttribute("style", css.join(";"));

        Array.prototype.slice.call(source.children).forEach(function (child, index) {
          if (target.children[index]) {
            copyComputedStyles(child, target.children[index]);
          }
        });
      }

      function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 1000);
      }

      function exportReportAsPng() {
        var source = runtime && runtime.reportCard;
        var rect;
        var width;
        var height;
        var clone;
        var wrapper;

        if (!source) {
          return Promise.reject(new Error("missing_report"));
        }

        rect = source.getBoundingClientRect();
        width = Math.ceil(rect.width);
        height = Math.ceil(rect.height);

        return Promise.all(Array.prototype.slice.call(source.querySelectorAll("img")).map(waitForImage))
          .then(function () {
            clone = source.cloneNode(true);
            copyComputedStyles(source, clone);
            clone.style.width = width + "px";
            clone.style.minHeight = height + "px";
            clone.style.margin = "0";
            return inlineCloneImages(source, clone);
          })
          .then(function () {
            var svgText;
            var img;
            var canvas;
            var ctx;

            wrapper = document.createElement("div");
            wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
            wrapper.appendChild(clone);
            svgText =
              '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                '<foreignObject width="100%" height="100%">' +
                  new XMLSerializer().serializeToString(wrapper) +
                "</foreignObject>" +
              "</svg>";

            return new Promise(function (resolve, reject) {
              img = new Image();
              img.onload = function () {
                canvas = document.createElement("canvas");
                canvas.width = width * 2;
                canvas.height = height * 2;
                ctx = canvas.getContext("2d");
                ctx.scale(2, 2);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(function (blob) {
                  if (!blob) {
                    reject(new Error("empty_blob"));
                    return;
                  }
                  downloadBlob(blob, "Yummi-口味人格报告.png");
                  resolve();
                }, "image/png");
              };
              img.onerror = function () {
                reject(new Error("svg_render_failed"));
              };
              img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
            });
          });
      }

      function handleExportReport(event) {
        event.preventDefault();
        event.stopPropagation();

        if (runtime.exporting) return;
        runtime.exporting = true;
        setExportStatus("正在生成图片...", "loading");

        exportReportAsPng()
          .then(function () {
            setExportStatus("图片已导出", "success");
          })
          .catch(function () {
            setExportStatus("图片生成失败，请稍后再试", "error");
          })
          .then(function () {
            runtime.exporting = false;
          });
      }

      function confirmOrderFlow() {
        var sel = global.Yummi && global.Yummi.foodSelection;
        var personality = getPersonalityApi();
        var dressState = getDressStateApi();
        var exporter = getDressExporter();
        var petReveal = getPetRevealApi();
        var primary = sel && typeof sel.getPrimaryFood === "function" ? sel.getPrimaryFood() : "";
        var roastInfo = { text: "" };
        var result;
        var report;

        if (!sel || !personality || typeof personality.analyze !== "function") {
          return;
        }

        if (dressState && typeof dressState.applyOrderConfirm === "function") {
          dressState.applyOrderConfirm(null, { primaryFood: primary });
        }

        result = sel.confirm();
        if (!result.ok) {
          return;
        }

        report = personality.analyze(result.names);
        if (!report.ok) {
          return;
        }

        runtime.state.confirmed = true;
        runtime.state.confirmedNames = result.names.slice();
        runtime.state.report = report;
        runtime.state.petSnapshot = capturePetSnapshot();

        if (exporter && typeof exporter.pickRoastForState === "function") {
          roastInfo = exporter.pickRoastForState(dressState && typeof dressState.create === "function" ? dressState.create() : null);
        }

        renderReportUi({ deferVisible: true });
        updateSelectionPanel();

        function finishConfirmOnOrderTab() {
          showReportMount();
          scrollToPersonalityReport();
        }

        if (petReveal && typeof petReveal.play === "function") {
          petReveal.play({
            snapshot: runtime.state.petSnapshot,
            roastText: roastInfo.text,
            onComplete: finishConfirmOnOrderTab
          });
        } else {
          finishConfirmOnOrderTab();
        }
      }

      function resetOrderFlow() {
        var sel = global.Yummi && global.Yummi.foodSelection;
        var petReveal = getPetRevealApi();

        if (petReveal && typeof petReveal.cancel === "function") {
          petReveal.cancel();
        }

        runtime.state.confirmed = false;
        runtime.state.confirmedNames = [];
        runtime.state.report = null;
        runtime.state.petSnapshot = null;

        clearDressState();
        if (sel) {
          sel.clear();
        }

        renderReportUi();
        refreshSelectionUi();
        if (runtime.orderRoot) {
          runtime.orderRoot.scrollTop = 0;
        }
      }

      function refreshSelectionUi() {
        global.TurntablePlacards.refreshSelectionVisuals();
        updateSelectionPanel();
      }

      function handleExternalFoodSelectionChange() {
        if (!runtime || runtime.state.confirmed) {
          return;
        }
        refreshSelectionUi();
      }

      function renderSelectionStrip(names) {
        var html = [];
        var i;
        var name;
        var imageUrl;
        var locked = runtime && runtime.state && runtime.state.confirmed;

        if (!runtime.selectionStrip) {
          return;
        }

        for (i = 0; i < names.length; i += 1) {
          name = names[i];
          imageUrl = getFoodImageUrl(name);
          html.push(
            '<article class="order-selection-chip' + (locked ? " is-locked" : "") +
              '" role="listitem" data-order-selection-chip="' +
              escapeAttr(name) + '">' +
              '<div class="order-selection-chip__media">' +
                (imageUrl ?
                  '<img class="order-selection-chip__img" src="' + escapeAttr(imageUrl) + '"' +
                    ' alt="' + escapeAttr(name) + '" width="56" height="56" loading="lazy" decoding="async">' :
                  '<span class="order-selection-chip__placeholder" aria-hidden="true"></span>') +
                (locked ? "" :
                  '<button type="button" class="order-selection-chip__remove"' +
                    ' data-order-selection-remove="' + escapeAttr(name) + '"' +
                    ' aria-label="移除 ' + escapeAttr(name) + '">' +
                    '<span aria-hidden="true">×</span>' +
                  "</button>") +
              "</div>" +
              '<p class="order-selection-chip__name">' + util.escapeHtml(name) + "</p>" +
            "</article>"
          );
        }

        runtime.selectionStrip.innerHTML = html.join("");
      }

      function removeSelectionItem(name) {
        var sel = global.Yummi && global.Yummi.foodSelection;
        var result;

        if (!sel || !name || (runtime && runtime.state && runtime.state.confirmed)) {
          return;
        }

        result = sel.remove(name);
        if (result.ok) {
          refreshSelectionUi();
        }
      }

      function updateSelectionPanel() {
        var sel = global.Yummi && global.Yummi.foodSelection;
        var names = sel ? sel.getNames() : [];
        var count = names.length;
        var confirmed = runtime && runtime.state && runtime.state.confirmed;

        if (!runtime.selectionCount) {
          return;
        }

        updateOrderMode();
        runtime.selectionCount.textContent = confirmed ? "已锁定 " + count + " 道" : "已选 " + count + " 道";

        if (runtime.selectionConfirm) {
          runtime.selectionConfirm.hidden = count === 0 && !confirmed;
          runtime.selectionConfirm.textContent = confirmed ? "重新点餐" : "确定";
        }

        if (runtime.selectionClear) {
          runtime.selectionClear.hidden = count === 0 || confirmed;
        }

        if (runtime.selectionScroll) {
          runtime.selectionScroll.hidden = count === 0;
        }

        renderSelectionStrip(names);
      }

      function renderConfirmPetPreview(petAppearance) {
        var placeholder = petAppearance && petAppearance.placeholder;
        var label = placeholder && placeholder.label ? placeholder.label : "";
        var message = placeholder && placeholder.message ? placeholder.message : "宠物形象即将呈现";

        return (
          '<div class="order-confirm-modal__pet-frame" aria-hidden="false">' +
            '<div class="order-confirm-modal__pet-placeholder">' +
              '<span class="order-confirm-modal__pet-icon" aria-hidden="true">🐾</span>' +
            "</div>" +
            '<p class="order-confirm-modal__pet-label">' + util.escapeHtml(label) + "</p>" +
            '<p class="order-confirm-modal__pet-hint">' + util.escapeHtml(message) + "</p>" +
          "</div>"
        );
      }

      function openConfirmModal(result) {
        var pet = result.petAppearance;

        if (!runtime.confirmModal || !pet || !pet.ok) {
          return;
        }

        if (runtime.confirmPet) {
          runtime.confirmPet.innerHTML = renderConfirmPetPreview(pet);
        }

        if (runtime.confirmFood) {
          runtime.confirmFood.textContent = "第一选择：" + result.primaryFood;
        }

        runtime.confirmModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }

      function closeConfirmModal() {
        if (!runtime.confirmModal) {
          return;
        }
        runtime.confirmModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }

      function handleConfirmSelection(event) {
        event.stopPropagation();

        if (runtime.state.confirmed) {
          resetOrderFlow();
          return;
        }

        confirmOrderFlow();
      }

      function handlePlacardSelect(slotNode) {
        var foodName = slotNode.getAttribute("data-food-name");
        var sel = global.Yummi && global.Yummi.foodSelection;
        var names;
        var result;

        if (!foodName || !sel || (runtime && runtime.state && runtime.state.confirmed)) {
          return;
        }

        if (sel.has(foodName)) {
          names = sel.getNames();
          if (names.length && names[names.length - 1] === foodName) {
            result = sel.remove(foodName);
          } else if (typeof sel.touchLast === "function") {
            result = sel.touchLast(foodName);
          } else {
            result = sel.toggle(foodName);
          }
        } else {
          result = sel.record(foodName);
        }

        if (!result.ok) {
          return;
        }

        refreshSelectionUi();
      }

      function cancelPlacardLongPressTimer(tap) {
        if (tap && tap.longPressTimer) {
          clearTimeout(tap.longPressTimer);
          tap.longPressTimer = null;
        }
      }

      function beginPlacardLongPressDrag(tap) {
        var disc;
        var pointerAngle;

        if (!tap || tap.dragStarted) {
          return;
        }

        disc = getDiscById(tap.dragDiscId) || getDiscById("top") || getDiscById("base");
        if (!disc) {
          return;
        }

        pointerAngle = tap.startPointerAngle;
        if (pointerAngle == null) {
          pointerAngle = getExtendedPointerAngle(disc, getSvgPoint({
            clientX: tap.x,
            clientY: tap.y
          }), tap.dragHitType || "top");
        }
        if (pointerAngle == null) {
          return;
        }

        tap.dragStarted = true;
        startTurntableDrag(disc, tap.pointerId, pointerAngle, performance.now());
        if (typeof runtime.stage.setPointerCapture === "function") {
          runtime.stage.setPointerCapture(tap.pointerId);
          runtime.hitTarget = runtime.stage;
        } else {
          runtime.hitTarget = null;
        }
      }

      function schedulePlacardLongPress(tap) {
        cancelPlacardLongPressTimer(tap);
        tap.longPressTimer = window.setTimeout(function () {
          tap.longPressTimer = null;
          if (!runtime.pendingPlacardTap || runtime.pendingPlacardTap !== tap) {
            return;
          }
          beginPlacardLongPressDrag(tap);
        }, PLACARD_LONG_PRESS_MS);
      }

      function clearPendingPlacardTap(pointerId) {
        if (!runtime.pendingPlacardTap) {
          return;
        }
        if (pointerId == null || runtime.pendingPlacardTap.pointerId === pointerId) {
          cancelPlacardLongPressTimer(runtime.pendingPlacardTap);
          runtime.pendingPlacardTap = null;
        }
      }

      function releaseHitTargetPointerCapture(pointerId) {
        if (runtime.hitTarget && typeof runtime.hitTarget.releasePointerCapture === "function") {
          try {
            runtime.hitTarget.releasePointerCapture(pointerId);
          } catch (err) {
            /* ignore */
          }
        }
      }

      function getSvgPoint(event) {
        var point = runtime.svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        var ctm = runtime.svg.getScreenCTM();
        return ctm ? point.matrixTransform(ctm.inverse()) : null;
      }

      function getDiscById(discId) {
        return runtime.state.discs.find(function (disc) {
          return disc.id === discId;
        }) || null;
      }

      function getDiscFromSlotNode(slotNode) {
        var discId = slotNode && slotNode.getAttribute("data-disc-id");
        return discId ? getDiscById(discId) : null;
      }

      function getPointerAngle(disc, svgPoint) {
        if (!disc || !svgPoint) return null;

        var geometry = getDiscGeometry(disc);
        var scaleY = geometry.ry / geometry.rx;
        var localX = svgPoint.x - geometry.cx;
        var localY = (svgPoint.y - geometry.cy) / scaleY;
        var radius = Math.sqrt((localX * localX) + (localY * localY));

        if (radius < Math.max(10, geometry.sectorInnerRadius * 0.32)) {
          return null;
        }

        return normalizeAngle((Math.atan2(localY, localX) * 180 / Math.PI) + 90);
      }

      function getExtendedPointerAngle(disc, svgPoint, hitType) {
        if (hitType === "side") {
          var geometry = getDiscGeometry(disc);
          var sideY = Math.max(geometry.cy, Math.min(svgPoint.y, geometry.cy + geometry.height));
          return getPointerAngle(disc, { x: svgPoint.x, y: sideY });
        }
        return getPointerAngle(disc, svgPoint);
      }

      function releaseDisc(pointerId) {
        runtime.state.discs.forEach(function (disc) {
          if (disc.pointerId !== pointerId) return;
          disc.dragging = false;
          disc.pointerId = null;
          disc.lastPointerAngle = null;
          disc.lastMoveTime = null;
        });
        runtime.state.activeDiscId = null;
        runtime.hitTarget = null;
      }

      function isTurntableStageDragTarget(event) {
        var target = event.target;

        if (!runtime || !runtime.stage || !runtime.svg) {
          return false;
        }

        if (!runtime.stage.contains(target)) {
          return false;
        }

        if (target.closest(
          "[data-order-footer], [data-order-selection-panel], [data-order-confirm-modal], [data-order-report]"
        )) {
          return false;
        }

        return true;
      }

      function pickDiscForStageDrag(svgPoint) {
        var candidates = ["cap", "top", "mid", "base"];
        var bestDisc = null;
        var bestScore = Infinity;
        var i;
        var disc;
        var geometry;
        var dx;
        var dy;
        var score;

        if (!svgPoint) {
          return getDiscById("top") || getDiscById("base");
        }

        for (i = 0; i < candidates.length; i += 1) {
          disc = getDiscById(candidates[i]);
          geometry = disc && getDiscGeometry(disc);
          if (!geometry) {
            continue;
          }

          dx = svgPoint.x - geometry.cx;
          dy = svgPoint.y - geometry.cy;
          score = (dx * dx) + (dy * dy * 1.8);
          if (svgPoint.y < geometry.cy) {
            score *= 0.72;
          }
          if (score < bestScore) {
            bestScore = score;
            bestDisc = disc;
          }
        }

        return bestDisc || getDiscById("top") || getDiscById("base");
      }

      function startStageTurntableDrag(event) {
        var svgPoint = getSvgPoint(event);
        var disc = pickDiscForStageDrag(svgPoint);
        var pointerAngle;

        if (!disc || !svgPoint) {
          return false;
        }

        pointerAngle = getExtendedPointerAngle(disc, svgPoint, "top");
        if (pointerAngle == null) {
          return false;
        }

        startTurntableDrag(disc, event.pointerId, pointerAngle, event.timeStamp || performance.now());
        runtime.hitTarget = runtime.stage;

        if (typeof runtime.stage.setPointerCapture === "function") {
          runtime.stage.setPointerCapture(event.pointerId);
        }

        event.preventDefault();
        return true;
      }

      function handlePointerDown(event) {
        var placardHit = event.target.closest("[data-placard-hit], [data-placard-image]");
        var slotNode;
        var slotDisc;

        if (placardHit) {
          slotNode = placardHit.closest("[data-placard-slot]");
          if (slotNode && slotNode.getAttribute("data-placard-interactive") === "true") {
            slotDisc = getDiscFromSlotNode(slotNode) || getDiscById("top") || getDiscById("base");
            runtime.pendingPlacardTap = {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              slotNode: slotNode,
              dragDiscId: slotDisc ? slotDisc.id : "",
              dragHitType: "top",
              startPointerAngle: slotDisc ? getExtendedPointerAngle(slotDisc, getSvgPoint(event), "top") : null,
              startTime: event.timeStamp || performance.now(),
              longPressTimer: null,
              dragStarted: false
            };
            schedulePlacardLongPress(runtime.pendingPlacardTap);
            event.preventDefault();
          }
          return;
        }

        var hit = event.target.closest("[data-hit], [data-hit-side]");
        if (!hit) {
          if (isTurntableStageDragTarget(event)) {
            startStageTurntableDrag(event);
          }
          return;
        }

        var hitType = hit.hasAttribute("data-hit-side") ? "side" : "top";
        var discId = hitType === "side" ? hit.getAttribute("data-hit-side") : hit.getAttribute("data-hit");
        var disc = getDiscById(discId);
        var svgPoint;
        var pointerAngle;

        if (!disc) return;

        svgPoint = getSvgPoint(event);
        pointerAngle = getExtendedPointerAngle(disc, svgPoint, hitType);
        if (pointerAngle == null) return;

        startTurntableDrag(disc, event.pointerId, pointerAngle, event.timeStamp || performance.now());
        runtime.hitTarget = hit;

        if (typeof hit.setPointerCapture === "function") {
          hit.setPointerCapture(event.pointerId);
        }

        event.preventDefault();
      }

      function handlePointerMove(event) {
        var tap = runtime.pendingPlacardTap;

        if (tap && tap.pointerId === event.pointerId && !tap.dragStarted) {
          if (getPointerTravelSq(event, tap.x, tap.y) > PLACARD_TAP_THRESHOLD_SQ) {
            cancelPlacardLongPressTimer(tap);
          }
        }

        var disc = getDraggingDisc(event.pointerId);
        if (!disc) return;

        var svgPoint = getSvgPoint(event);
        var hitType = runtime.hitTarget && runtime.hitTarget.hasAttribute("data-hit-side") ? "side" : "top";
        var pointerAngle = getExtendedPointerAngle(disc, svgPoint, hitType);
        if (pointerAngle == null) return;

        var deltaAngle = angleDelta(pointerAngle, disc.lastPointerAngle);
        var now = event.timeStamp || performance.now();
        var elapsed = Math.max(8, now - (disc.lastMoveTime || now));
        var angularVelocity = deltaAngle / (elapsed / 1000);

        rotateTurntable(deltaAngle, angularVelocity);
        disc.lastPointerAngle = pointerAngle;
        disc.lastMoveTime = now;
        event.preventDefault();
      }

      function handlePointerUp(event) {
        var tap = runtime.pendingPlacardTap;
        var dx;
        var dy;

        if (tap && tap.pointerId === event.pointerId) {
          cancelPlacardLongPressTimer(tap);
          releaseHitTargetPointerCapture(event.pointerId);

          if (tap.dragStarted) {
            releaseDisc(event.pointerId);
            runtime.hitTarget = null;
            clearPendingPlacardTap(event.pointerId);
            event.preventDefault();
            return;
          }

          dx = event.clientX - tap.x;
          dy = event.clientY - tap.y;
          if (event.type === "pointerup" && (dx * dx) + (dy * dy) <= PLACARD_TAP_THRESHOLD_SQ) {
            handlePlacardSelect(tap.slotNode);
          }
          runtime.hitTarget = null;
          clearPendingPlacardTap(event.pointerId);
          event.preventDefault();
          return;
        }

        releaseHitTargetPointerCapture(event.pointerId);
        releaseDisc(event.pointerId);
        clearPendingPlacardTap(event.pointerId);
      }

      function tick(timestamp) {
        if (!runtime || !runtime.running) return;
        if (!runtime.state.lastTick) {
          runtime.state.lastTick = timestamp;
        }

        var delta = Math.min((timestamp - runtime.state.lastTick) / 1000, 0.04);
        runtime.state.lastTick = timestamp;

        if (runtime.state.discs.some(function (disc) {
          return disc.dragging;
        })) {
          runtime.rafId = window.requestAnimationFrame(tick);
          return;
        }

        runtime.state.discs.forEach(function (disc) {
          if (Math.abs(disc.angularVelocity) > 0.01) {
            disc.angle = normalizeAngle(disc.angle + (disc.angularVelocity * delta * disc.inertiaBoost));
            disc.angularVelocity *= Math.pow(0.88, delta * 60);
          } else {
            disc.angularVelocity = 0;
            disc.angle = normalizeAngle(disc.angle + (disc.autoSpeed * delta));
          }
          updateRotor(disc);
        });

        runtime.rafId = window.requestAnimationFrame(tick);
      }

  function render(state) {
    return (
      '<div class="order-root">' +
        '<section class="order-turntable-stage" data-order-turntable-stage data-order-stage>' +
          '<svg class="turntable" data-order-svg viewBox="0 0 380 398" preserveAspectRatio="xMidYMid meet" role="img" aria-label="椭圆转盘"></svg>' +
        "</section>" +
        '<aside class="order-footer" data-order-footer>' +
          '<div class="order-selection-panel" data-order-selection-panel>' +
            '<div class="order-selection-panel__head">' +
              '<span class="order-selection-panel__count" data-order-selection-count>已选 0 道</span>' +
              '<div class="order-selection-panel__actions">' +
                '<button type="button" class="order-selection-panel__confirm" data-order-selection-confirm hidden>确定</button>' +
                '<button type="button" class="order-selection-panel__clear" data-order-selection-clear hidden>清空</button>' +
              "</div>" +
            "</div>" +
            '<div class="order-selection-panel__scroll" data-order-selection-scroll hidden>' +
              '<div class="order-selection-strip" data-order-selection-strip role="list"></div>' +
            "</div>" +
          "</div>" +
        "</aside>" +
        '<section class="order-report-mount" data-order-report hidden></section>' +
        '<div class="order-confirm-modal" data-order-confirm-modal aria-hidden="true">' +
          '<div class="order-confirm-modal__overlay" data-order-confirm-overlay></div>' +
          '<div class="order-confirm-modal__card" role="dialog" aria-modal="true" aria-labelledby="order-confirm-title">' +
            '<button type="button" class="order-confirm-modal__close" data-order-confirm-close aria-label="关闭">' +
              '<span aria-hidden="true">×</span>' +
            "</button>" +
            '<h2 class="order-confirm-modal__title" id="order-confirm-title">你的宠物</h2>' +
            '<div class="order-confirm-modal__pet" data-order-confirm-pet></div>' +
            '<p class="order-confirm-modal__food" data-order-confirm-food></p>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function startAnimation() {
    if (!runtime || runtime.running) return;
    runtime.running = true;
    runtime.state.lastTick = 0;
    runtime.rafId = window.requestAnimationFrame(tick);
  }

  function stopAnimation() {
    if (!runtime) return;
    runtime.running = false;
    runtime.state.lastTick = 0;
    if (runtime.rafId) {
      window.cancelAnimationFrame(runtime.rafId);
      runtime.rafId = 0;
    }
  }

  function bind(container, ctx, state) {
    var orderRoot = container.querySelector(".order-root");
    var stage = container.querySelector("[data-order-stage]");
    var svg = container.querySelector("[data-order-svg]");
    var selectionPanel = container.querySelector("[data-order-selection-panel]");
    var selectionCount = container.querySelector("[data-order-selection-count]");
    var selectionConfirm = container.querySelector("[data-order-selection-confirm]");
    var selectionClear = container.querySelector("[data-order-selection-clear]");
    var selectionScroll = container.querySelector("[data-order-selection-scroll]");
    var selectionStrip = container.querySelector("[data-order-selection-strip]");
    var reportMount = container.querySelector("[data-order-report]");
    var confirmModal = container.querySelector("[data-order-confirm-modal]");
    var confirmOverlay = container.querySelector("[data-order-confirm-overlay]");
    var confirmClose = container.querySelector("[data-order-confirm-close]");
    var confirmPet = container.querySelector("[data-order-confirm-pet]");
    var confirmFood = container.querySelector("[data-order-confirm-food]");
    var unbinds = [];

    runtime = {
      container: container,
      ctx: ctx,
      state: state,
      orderRoot: orderRoot,
      stage: stage,
      svg: svg,
      selectionPanel: selectionPanel,
      selectionCount: selectionCount,
      selectionConfirm: selectionConfirm,
      selectionClear: selectionClear,
      selectionScroll: selectionScroll,
      selectionStrip: selectionStrip,
      reportMount: reportMount,
      reportCard: null,
      exportStatus: null,
      confirmModal: confirmModal,
      confirmOverlay: confirmOverlay,
      confirmClose: confirmClose,
      confirmPet: confirmPet,
      confirmFood: confirmFood,
      rotors: {},
      sideColorGroups: {},
      sideRotors: {},
      hitTarget: null,
      pendingPlacardTap: null,
      running: false,
      rafId: 0,
      exporting: false,
      unbinds: unbinds
    };

    global.TurntablePlacards.attach({
      getDiscGeometry: getDiscGeometry,
      formatNumber: formatNumber,
      normalizeAngle: normalizeAngle
    });
    global.TurntablePlacards.applyFoodToDiscs(state.discs);

    renderTurntable();
    renderReportUi();
    updateSelectionPanel();

    unbinds.push(util.on(stage, "pointerdown", handlePointerDown));
    unbinds.push(util.on(stage, "pointermove", handlePointerMove));
    unbinds.push(util.on(stage, "pointerup", handlePointerUp));
    unbinds.push(util.on(stage, "pointercancel", handlePointerUp));
    unbinds.push(util.on(stage, "lostpointercapture", handlePointerUp));

    if (selectionStrip) {
      unbinds.push(util.on(selectionStrip, "click", function (event) {
        var removeBtn = event.target.closest("[data-order-selection-remove]");
        var name;

        if (!removeBtn || state.confirmed) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        name = removeBtn.getAttribute("data-order-selection-remove");
        removeSelectionItem(name);
      }));
    }

    if (reportMount) {
      unbinds.push(util.on(reportMount, "click", function (event) {
        var exportBtn = event.target.closest("[data-order-report-export]");
        if (!exportBtn) {
          return;
        }
        handleExportReport(event);
      }));
    }

    if (selectionConfirm) {
      unbinds.push(util.on(selectionConfirm, "click", handleConfirmSelection));
    }

    if (selectionClear) {
      unbinds.push(util.on(selectionClear, "click", function (event) {
        var sel = global.Yummi && global.Yummi.foodSelection;

        event.stopPropagation();
        if (!sel || state.confirmed) {
          return;
        }
        sel.clear();
        refreshSelectionUi();
      }));
    }

    if (confirmOverlay) {
      unbinds.push(util.on(confirmOverlay, "click", closeConfirmModal));
    }

    if (confirmClose) {
      unbinds.push(util.on(confirmClose, "click", closeConfirmModal));
    }

    unbinds.push(function () {
      global.removeEventListener("yummi:food-selection-change", handleExternalFoodSelectionChange);
    });
    global.addEventListener("yummi:food-selection-change", handleExternalFoodSelectionChange);

    startAnimation();

    if (root.guide && typeof root.guide.openOnEnter === "function") {
      root.guide.openOnEnter();
    }
  }

  function unbind() {
    if (!runtime) return;
    if (root.guide && typeof root.guide.unmount === "function") {
      root.guide.unmount();
    }
    closeConfirmModal();
    clearPendingPlacardTap(null);
    stopAnimation();
    runtime.unbinds.forEach(function (off) {
      if (typeof off === "function") off();
    });
    global.TurntablePlacards.reset();
    runtime = null;
  }

  root.view = {
    render: render,
    bind: bind,
    unbind: unbind,
    pause: stopAnimation,
    resume: startAnimation
  };
})(typeof window !== "undefined" ? window : this);
