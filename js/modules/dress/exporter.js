/**
 * 装扮导出器 — 将当前宠物形象合成为可保存 PNG 海报
 */
(function (global) {
  "use strict";

  var root = global.Yummi.modules.dress;
  var POSTER_WIDTH = 1080;
  var POSTER_HEIGHT = 1440;
  var FALLBACK_ROAST = "今天没穿搭，主打一个原生态社恐哈基米。";

  var FOOD_ROASTS = {
    "炸酱面": "表面拌得很匀，实际人生全靠自己和稀泥。",
    "北京烤鸭": "皮是脆的，嘴是硬的，钱包是被片得最薄的。",
    "春卷": "外表金黄酥脆，内心一卷起来就不想营业。",
    "刀削面": "每天都像被生活削一刀，幸好还能保持宽面条的体面。",
    "锅包肉": "酸甜都沾一点，主打一个情绪挂糊再下锅。",
    "小鸡炖蘑菇": "看着很东北硬菜，其实只是被生活炖到入味。",
    "红烧肉": "油光水滑，实际全靠糖色硬撑。",
    "糖醋排骨": "酸甜比例刚好，骨子里还是有点难啃。",
    "海蛎煎": "摊得很开，糊得也很自然，像我的日程表。",
    "蒸螃蟹": "横着走不是嚣张，是我真的不会正面处理问题。",
    "瓦罐汤": "慢火熬着不吭声，一开盖全是老派养生焦虑。",
    "炒腊肉": "越炒越香，越放越咸，越社交越想回冰箱。",
    "九转大肠": "有些内味藏不住，但我已经努力九转成熟了。",
    "胡辣汤": "一早就把自己搅成一锅糊，醒没醒全靠辣。",
    "酸辣粉": "又酸又辣还很粉，主打一个情绪弹性拉满。",
    "剁椒鱼头": "头很大，想法很多，真正能动的部分不多。",
    "小炒黄牛肉": "脾气很爆，出锅很快，冷静下来只剩一点点。",
    "臭豆腐": "闻起来很有攻击性，其实只是想被夸一句香。",
    "烧鹅": "外皮很体面，内心全是被烤出来的焦虑。",
    "肠粉": "薄得像我的防线，卷一下就把话全憋回去了。",
    "螺蛳粉": "还没开口，味道已经替我完成了社交。",
    "火锅": "表面沸腾，内心只想捞点自己。",
    "麻辣小龙虾": "剥半天才有一点肉，像我努力后的有效产出。",
    "回锅肉": "被生活回锅好几次，终于炒出一点像样的油光。",
    "酸菜鱼": "又酸又菜又多余，但至少汤底很有存在感。",
    "羊肉泡馍": "碎成小块才敢下锅，主打一个慢慢泡回自信。",
    "兰州拉面": "被拉扯得很长，牛肉却少得像我的安全感。",
    "手抓羊肉": "看着豪放，其实一被拿捏就露馅。",
    "大盘鸡": "盘子很大，重点很多，最后还是土豆最像我。",
    "烤串": "排队等着被翻面，人生熟没熟全看火候。",
    "牛排": "装得很西餐，内心熟度经常五分混乱。",
    "披萨": "被切成八块还要分享，边角料人格稳定发挥。",
    "汉堡": "层次很多，夹得很满，重点是快要散架。",
    "薯条": "刚出锅很支棱，放一会儿就软给你看。",
    "炸鸡": "外壳很脆，内心很嫩，压力一大就掉渣。",
    "蔬菜沙拉": "看起来很自律，实际只是没有热量也没有热情。",
    "刺身": "主打原生态冷静，其实只是懒得加热人生。",
    "石锅拌饭": "越烫越要拌匀，锅巴是我最后的倔强。",
    "冬阴功汤": "酸辣鲜香全有，情绪也跟着东一阴西一功。",
    "咖喱饭": "把一切盖住就算解决，米饭本人很懂沉默。",
    "鹅肝": "听起来很高级，实际压力大到肝都在加班。",
    "奶油蛋糕": "甜得很努力，但一碰压力就开始塌边。",
    "焦糖布丁": "表面焦香很高级，内心晃一下就露怯。",
    "香草冰淇淋": "看着经典稳定，太阳一晒就开始融化摆烂。",
    "芒果冰沙": "清爽只是人设，脑子其实已经被打成冰沙。",
    "黑巧克力": "苦但装高级，像我把熬夜说成成熟。",
    "固体杨枝甘露": "名字很满，状态很散，芒果和西柚都比我会发光。",
    "芝士奶酪块": "能拉丝不代表会拉关系，我只是很会黏住问题。",
    "葡式蛋挞": "外壳很酥，中心很软，焦斑是我努力过的证据。",
    "黄油曲奇": "一碰就掉屑，偏偏还要装成精致小饼干。",
    "话梅": "越含越有味，越想越酸，嘴硬程度刚好回甘。",
    "水果捞": "什么都想捞一点，结果把自己拌得五颜六色。",
    "榴莲制品": "争议很大，存在感更大，路过都像在开发布会。",
    "酸嘢": "酸得很直接，嘴硬得很清爽，适合给情绪开胃。",
    "冰红茶": "看着很冰，心里很红，拧开还是老同学味。",
    "珍珠奶茶": "快乐全靠加料，嚼到最后才发现是我在硬撑。",
    "冰镇酸梅汤": "越冰越酸，越喝越像把夏天的嘴硬吞下去。",
    "青岛啤酒": "泡沫很多，豪言也很多，醒来只剩一点麦香。",
    "鸡尾酒": "颜色很会混，状态也很会混，微醺全靠氛围。",
    "抹茶奶茶": "苦味被奶盖住了，就像我把疲惫说成松弛。",
    "美式咖啡": "喝完只是更清醒地困，嘴上还说我很可以。",
    "龙井茶": "装得很清雅，其实只是把焦虑泡淡了再喝。",
    "姜糖水": "又辣又甜，专治嘴硬发凉的精神状态。",
    "碳酸": "气很多，开盖三秒就泄了。",
    "酸奶": "表面顺滑健康，内心正在默默发酵。",
    "牛奶": "看着纯良无害，实际一热就容易起皮。"
  };

  function warnMissingRoasts() {
    var foods = global.Yummi && global.Yummi.foods;
    var list = foods && typeof foods.getAll === "function" ? foods.getAll() : [];
    var missing = [];

    list.forEach(function (food) {
      if (!FOOD_ROASTS[food.name]) {
        missing.push(food.name);
      }
    });

    if (missing.length && global.console && typeof global.console.warn === "function") {
      global.console.warn("[dress/exporter] FOOD_ROASTS missing:", missing.join(", "));
    }
  }

  function createCanvas() {
    var canvas = document.createElement("canvas");
    canvas.width = POSTER_WIDTH;
    canvas.height = POSTER_HEIGHT;
    return canvas;
  }

  function roundRectPath(ctx, x, y, width, height, radius) {
    var r = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function fillRoundRect(ctx, x, y, width, height, radius, fillStyle) {
    ctx.save();
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
  }

  function strokeRoundRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth) {
    ctx.save();
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  function imageSize(image) {
    return {
      width: image.naturalWidth || image.width || 1,
      height: image.naturalHeight || image.height || 1
    };
  }

  function drawImageCover(ctx, image, x, y, width, height) {
    var size = imageSize(image);
    var scale = Math.max(width / size.width, height / size.height);
    var drawWidth = size.width * scale;
    var drawHeight = size.height * scale;
    var drawX = x + (width - drawWidth) / 2;
    var drawY = y + (height - drawHeight) / 2;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  function drawImageContain(ctx, image, x, y, width, height) {
    var size = imageSize(image);
    var scale = Math.min(width / size.width, height / size.height);
    var drawWidth = size.width * scale;
    var drawHeight = size.height * scale;
    var drawX = x + (width - drawWidth) / 2;
    var drawY = y + (height - drawHeight) / 2;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image;

      if (!src) {
        reject(new Error("missing_image_src"));
        return;
      }

      image = new Image();
      if (global.location && global.location.protocol !== "file:" && src.indexOf("data:") !== 0) {
        image.crossOrigin = "anonymous";
      }
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error("image_load_failed:" + src));
      };
      image.src = src;
    });
  }

  function loadOptionalImage(src) {
    if (!src) {
      return Promise.resolve(null);
    }
    return loadImage(src).catch(function () {
      return null;
    });
  }

  function drawPaperBackdrop(ctx, x, y, width, height, radius) {
    var warm = ctx.createLinearGradient(x, y, x, y + height);
    var glow = ctx.createRadialGradient(x + width * 0.5, y + height * 0.24, 20, x + width * 0.5, y + height * 0.24, width * 0.62);

    warm.addColorStop(0, "#fffaf2");
    warm.addColorStop(0.58, "#f2eadc");
    warm.addColorStop(1, "#e3d5bf");
    fillRoundRect(ctx, x, y, width, height, radius, warm);

    ctx.save();
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.clip();

    glow.addColorStop(0, "rgba(255,255,255,0.92)");
    glow.addColorStop(0.42, "rgba(244,225,225,0.32)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = "rgba(92,75,58,0.055)";
    ctx.lineWidth = 1;
    for (var offsetY = y + 18; offsetY < y + height; offsetY += 26) {
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x + width, offsetY + 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawScene(ctx, snapshot, assets) {
    var scene = { x: 112, y: 162, width: 856, height: 852, radius: 56 };
    var overlay;

    drawPaperBackdrop(ctx, scene.x, scene.y, scene.width, scene.height, scene.radius);

    if (assets.background) {
      ctx.save();
      roundRectPath(ctx, scene.x, scene.y, scene.width, scene.height, scene.radius);
      ctx.clip();
      ctx.globalAlpha = 0.82;
      drawImageCover(ctx, assets.background, scene.x, scene.y, scene.width, scene.height);
      ctx.globalAlpha = 1;
      overlay = ctx.createLinearGradient(scene.x, scene.y, scene.x, scene.y + scene.height);
      overlay.addColorStop(0, "rgba(255,255,255,0.2)");
      overlay.addColorStop(0.55, "rgba(255,250,242,0.08)");
      overlay.addColorStop(1, "rgba(232,223,209,0.72)");
      ctx.fillStyle = overlay;
      ctx.fillRect(scene.x, scene.y, scene.width, scene.height);
      ctx.restore();
    }

    strokeRoundRect(ctx, scene.x, scene.y, scene.width, scene.height, scene.radius, "rgba(92,75,58,0.16)", 2);

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.beginPath();
    ctx.ellipse(540, 846, 310, 82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  }

  function drawCatHousePlaceholder(ctx, x, y, width, height) {
    var roof = ctx.createLinearGradient(x, y, x + width, y + height);

    roof.addColorStop(0, "rgba(255,255,255,0.72)");
    roof.addColorStop(0.48, "rgba(244,225,225,0.62)");
    roof.addColorStop(1, "rgba(196,168,130,0.38)");

    ctx.save();
    ctx.shadowColor = "rgba(92,75,58,0.12)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 16;
    fillRoundRect(ctx, x + 76, y + 42, width - 152, height - 86, 88, roof);
    ctx.restore();

    fillRoundRect(ctx, x + 214, y + 120, 152, 122, 68, "rgba(92,75,58,0.16)");
    fillRoundRect(ctx, x + 92, y + 226, width - 184, 34, 999, "rgba(255,255,255,0.54)");

    ctx.save();
    ctx.strokeStyle = "rgba(139,115,85,0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 160, y + 96);
    ctx.lineTo(x + width - 160, y + 96);
    ctx.stroke();
    ctx.restore();
  }

  function drawPetLayers(ctx, assets) {
    var layerBox = { x: 122, y: 255, size: 836 };

    ctx.save();
    ctx.shadowColor = "rgba(92,75,58,0.16)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 28;
    fillRoundRect(ctx, 318, 806, 444, 86, 999, "rgba(92,75,58,0.06)");
    ctx.restore();

    assets.layers.forEach(function (entry) {
      var zClass = entry.layer && (entry.layer.zClass || entry.layer.className);
      var offsetX = zClass === "house" ? 72 : 0;

      drawImageContain(ctx, entry.image, layerBox.x + offsetX, layerBox.y, layerBox.size, layerBox.size);
    });
  }

  function drawDrink(ctx, snapshot, drinkImage) {
    var label;

    if (!snapshot.drink || !drinkImage) {
      return;
    }

    ctx.save();
    ctx.translate(180, 630);
    ctx.rotate(-Math.PI / 28);
    ctx.shadowColor = "rgba(92,75,58,0.18)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 14;
    fillRoundRect(ctx, -78, -78, 156, 156, 34, "rgba(255,255,255,0.76)");
    drawImageContain(ctx, drinkImage, -68, -68, 136, 136);
    ctx.restore();

    label = snapshot.drink.name;
    ctx.save();
    ctx.font = "500 24px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fillRoundRect(ctx, 108, 724, 144, 42, 999, "rgba(255,250,242,0.9)");
    ctx.fillStyle = "#5c4b3a";
    ctx.fillText(label, 180, 746, 118);
    ctx.restore();
  }

  function drawHeader(ctx) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#8b7355";
    ctx.font = "600 24px Georgia, 'Times New Roman', serif";
    ctx.fillText("YUMMI DRESS SNAP", 540, 116);
    ctx.fillStyle = "rgba(92,75,58,0.34)";
    ctx.fillRect(354, 134, 372, 2);
    ctx.restore();
  }

  function drawNameAndRoast(ctx, snapshot, roastInfo) {
    var name = snapshot.petDisplayName || ((snapshot.petName || "yummy") + "的哈基米");
    var bubbleX = 138;
    var bubbleY = 1168;
    var bubbleW = 804;
    var bubbleH = 152;
    var tag = roastInfo.foodName ? "今日抽中：" + roastInfo.foodName : "今日抽中：原生态";
    var lines;

    drawFittedText(ctx, name, 540, 1092, 760, 64, 38, "700", "'STKaiti', 'KaiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif", "#5c4b3a");

    ctx.save();
    ctx.shadowColor = "rgba(92,75,58,0.12)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 14;
    fillRoundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 36, "rgba(255,250,242,0.94)");
    strokeRoundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 36, "rgba(196,168,130,0.35)", 2);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#8b7355";
    ctx.font = "600 25px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.fillText(tag, bubbleX + 42, bubbleY + 52, bubbleW - 84);

    ctx.fillStyle = "#3d3d3d";
    ctx.font = "400 32px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    lines = wrapText(ctx, roastInfo.text, bubbleW - 84, 2);
    lines.forEach(function (line, index) {
      ctx.fillText(line, bubbleX + 42, bubbleY + 96 + index * 42, bubbleW - 84);
    });
    ctx.restore();
  }

  function drawFooter(ctx) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(139,115,85,0.72)";
    ctx.font = "500 22px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.fillText("一口饭养一只猫 · Yummi", 540, 1362);
    ctx.restore();
  }

  function drawFittedText(ctx, text, x, y, maxWidth, startSize, minSize, weight, family, color) {
    var size = startSize;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    do {
      ctx.font = weight + " " + size + "px " + family;
      if (ctx.measureText(text).width <= maxWidth || size <= minSize) {
        break;
      }
      size -= 2;
    } while (size >= minSize);
    ctx.fillText(text, x, y, maxWidth);
    ctx.restore();
  }

  function wrapText(ctx, text, maxWidth, maxLines) {
    var lines = [];
    var current = "";
    var chars = String(text || "").split("");

    chars.forEach(function (char) {
      var next = current + char;
      if (ctx.measureText(next).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    });

    if (current) {
      lines.push(current);
    }

    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = lines[maxLines - 1].replace(/[，。,.!?！？、]*$/, "") + "…";
    }

    return lines;
  }

  function collectFoodCandidates(state) {
    var list = [];
    var seen = {};
    var wardrobe = (state && state.wardrobe) || [];

    function add(name) {
      if (!name || seen[name]) {
        return;
      }
      seen[name] = true;
      list.push(name);
    }

    wardrobe.forEach(function (group) {
      add(group.current);
    });

    if (state && state.drink) {
      add(state.drink.name);
    }

    return list;
  }

  function pickRoast(candidates) {
    var foodName;

    if (!candidates || !candidates.length) {
      return { foodName: "", text: FALLBACK_ROAST };
    }

    foodName = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      foodName: foodName,
      text: FOOD_ROASTS[foodName] || ("今天穿成了" + foodName + "，但我的自信还在备餐中。")
    };
  }

  function createFallbackSnapshot(state) {
    return {
      petName: state.petName,
      petDisplayName: state.petDisplayName,
      activeBackground: state.activeBackground,
      activeCatHouse: state.activeCatHouse,
      layers: state.layers || [],
      drink: state.drink || null
    };
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      if (typeof canvas.toBlob !== "function") {
        reject(new Error("toBlob_unavailable"));
        return;
      }

      try {
        canvas.toBlob(function (blob) {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("toBlob_empty"));
          }
        }, "image/png");
      } catch (error) {
        reject(error);
      }
    });
  }

  function safeFilename(name) {
    var base = String(name || "yummi").replace(/[\\/:*?"<>|]/g, "").trim();
    return (base || "yummi") + "-宠物形象.png";
  }

  function exportCanvas(canvas, petName) {
    var filename = safeFilename(petName);

    if (typeof canvas.toBlob === "function" && global.URL && typeof global.URL.createObjectURL === "function") {
      return canvasToBlob(canvas).then(function (blob) {
        var url = global.URL.createObjectURL(blob);
        return {
          url: url,
          objectUrl: url,
          dataUrl: "",
          blob: blob,
          filename: filename
        };
      }).catch(function () {
        try {
          return {
            url: canvas.toDataURL("image/png"),
            objectUrl: "",
            dataUrl: canvas.toDataURL("image/png"),
            blob: null,
            filename: filename
          };
        } catch (fallbackError) {
          return Promise.reject(new Error("canvas_export_tainted"));
        }
      });
    }

    return Promise.resolve({
      url: canvas.toDataURL("image/png"),
      objectUrl: "",
      dataUrl: canvas.toDataURL("image/png"),
      blob: null,
      filename: filename
    });
  }

  function renderPoster(ctx, snapshot, assets, roastInfo) {
    var cardGradient = ctx.createLinearGradient(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#d8c7ad";
    ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

    cardGradient.addColorStop(0, "#fffaf2");
    cardGradient.addColorStop(0.62, "#f5efe4");
    cardGradient.addColorStop(1, "#e8dcc8");

    ctx.save();
    ctx.shadowColor = "rgba(92,75,58,0.22)";
    ctx.shadowBlur = 44;
    ctx.shadowOffsetY = 28;
    fillRoundRect(ctx, 70, 58, 940, 1324, 70, cardGradient);
    ctx.restore();

    strokeRoundRect(ctx, 70, 58, 940, 1324, 70, "rgba(255,255,255,0.72)", 3);
    drawHeader(ctx);
    drawScene(ctx, snapshot, assets);
    drawPetLayers(ctx, assets);
    drawDrink(ctx, snapshot, assets.drink);
    drawNameAndRoast(ctx, snapshot, roastInfo);
    drawFooter(ctx);
  }

  function exportPoster(state) {
    var synced = root.state.sync(state || root.state.create());
    var snapshot = root.state.captureSnapshot ? root.state.captureSnapshot(synced) : createFallbackSnapshot(synced);
    var roastInfo = pickRoast(collectFoodCandidates(synced));
    var canvas = createCanvas();
    var ctx = canvas.getContext("2d");
    var layerSources = snapshot.layers || [];
    var bgPromise = loadOptionalImage(snapshot.activeBackground && snapshot.activeBackground.src);
    var drinkPromise = loadOptionalImage(snapshot.drink && snapshot.drink.src);

    if (!ctx) {
      return Promise.reject(new Error("canvas_context_unavailable"));
    }

    if (!layerSources.length) {
      return Promise.reject(new Error("pet_layers_empty"));
    }

    return Promise.all(layerSources.map(function (layer) {
      return loadImage(layer.src).then(function (image) {
        return {
          layer: layer,
          image: image
        };
      });
    })).then(function (layers) {
      return Promise.all([bgPromise, drinkPromise]).then(function (optionalImages) {
        renderPoster(ctx, snapshot, {
          layers: layers,
          background: optionalImages[0],
          drink: optionalImages[1]
        }, roastInfo);
        return exportCanvas(canvas, snapshot.petName).then(function (output) {
          return {
            ok: true,
            src: output.url,
            downloadUrl: output.url,
            objectUrl: output.objectUrl,
            dataUrl: output.dataUrl,
            blob: output.blob,
            filename: output.filename,
            foodName: roastInfo.foodName,
            roastText: roastInfo.text,
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT
          };
        });
      });
    });
  }

  function pickRoastForState(state) {
    var synced = root.state.sync(state || root.state.create());
    return pickRoast(collectFoodCandidates(synced));
  }

  warnMissingRoasts();

  root.exporter = {
    exportPoster: exportPoster,
    pickRoastForState: pickRoastForState
  };
})(typeof window !== "undefined" ? window : this);
