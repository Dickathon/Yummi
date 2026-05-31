/**
 * YUMMY 码编解码与共享分析
 *
 * - encodeShare：完整分享载荷 -> YUMMY3.* 不透明短码
 * - decodeShare：YUMMY3.* -> 分享载荷
 * - buildSharePayload：聚合当前猫名字、选菜与装扮
 * - analyzeSharedTaste：分析匹配度、共同喜欢与可能喜欢
 *
 * 依赖：foods.js、food-taste.js、food-personality.js、dress/state.js（仅 buildSharePayload / 预览）
 * 全局：window.Yummi.yummyCode
 */
(function (global) {
  "use strict";

  var PREFIX = "YUMMY3.";
  var VERSION = 1;
  var SALT = [0x59, 0x55, 0x4d, 0x4d, 0x59, 0x33, 0x2d, 0x73, 0x68, 0x61, 0x72, 0x65];

  var foodIndexByName = null;
  var foodNameByIndex = null;

  function getFoodsApi() {
    return global.Yummi && global.Yummi.foods;
  }

  function getTasteApi() {
    return global.Yummi && global.Yummi.foodTaste;
  }

  function getPersonalityApi() {
    return global.Yummi && global.Yummi.foodPersonality;
  }

  function getFoodSelectionApi() {
    return global.Yummi && global.Yummi.foodSelection;
  }

  function getDressStateApi() {
    return global.Yummi &&
      global.Yummi.modules &&
      global.Yummi.modules.dress &&
      global.Yummi.modules.dress.state;
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function trimText(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizeNames(input) {
    var list = [];
    var seen = {};
    var i;
    var name;

    if (!input || !input.length) {
      return list;
    }

    for (i = 0; i < input.length; i += 1) {
      name = trimText(input[i]);
      if (!name || seen[name]) {
        continue;
      }
      seen[name] = true;
      list.push(name);
    }

    return list;
  }

  function buildFoodCatalog() {
    var foods;
    var list;
    var i;

    if (foodIndexByName && foodNameByIndex) {
      return;
    }

    foods = getFoodsApi();
    list = foods && typeof foods.getAll === "function" ? foods.getAll() : [];
    foodIndexByName = {};
    foodNameByIndex = [];

    for (i = 0; i < list.length; i += 1) {
      foodIndexByName[list[i].name] = i;
      foodNameByIndex[i] = list[i].name;
    }
  }

  function utf8Encode(text) {
    if (typeof TextEncoder !== "undefined") {
      return Array.prototype.slice.call(new TextEncoder().encode(text));
    }

    return Array.prototype.map.call(unescape(encodeURIComponent(text)), function (char) {
      return char.charCodeAt(0);
    });
  }

  function utf8Decode(bytes) {
    var i;
    var binary;

    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder().decode(new Uint8Array(bytes));
    }

    binary = "";
    for (i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return decodeURIComponent(escape(binary));
  }

  function bytesToBase64Url(bytes) {
    var b64;
    var i;
    var binary;

    if (typeof Buffer !== "undefined") {
      b64 = Buffer.from(bytes).toString("base64");
    } else {
      binary = "";
      for (i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      b64 = btoa(binary);
    }

    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64UrlToBytes(str) {
    var b64 = String(str || "").replace(/-/g, "+").replace(/_/g, "/");
    var pad = b64.length % 4;
    var bytes = [];
    var i;
    var binary;

    if (pad) {
      b64 += "====".slice(pad);
    }

    if (typeof Buffer !== "undefined") {
      return Array.prototype.slice.call(Buffer.from(b64, "base64"));
    }

    binary = atob(b64);
    for (i = 0; i < binary.length; i += 1) {
      bytes.push(binary.charCodeAt(i));
    }
    return bytes;
  }

  function checksum(bytes) {
    var sum = 0;
    var i;

    for (i = 0; i < bytes.length; i += 1) {
      sum = (sum + bytes[i]) & 255;
    }

    return sum;
  }

  function scramble(bytes) {
    var out = [];
    var i;
    var value;

    for (i = 0; i < bytes.length; i += 1) {
      value = bytes[i] ^ SALT[i % SALT.length] ^ ((i * 29) & 255);
      out.push(value & 255);
    }

    return out;
  }

  function unscramble(bytes) {
    return scramble(bytes);
  }

  function cloneSelectedMap(selected, categories) {
    var out = {};

    (categories || []).forEach(function (category) {
      out[category] = trimText(selected && selected[category]);
    });

    return out;
  }

  function encodeCompactPayload(payload) {
    var dressState = getDressStateApi();
    var categories = dressState && typeof dressState.getCategoryOrder === "function"
      ? dressState.getCategoryOrder()
      : [];
    var selectedMap = cloneSelectedMap(payload.dress && payload.dress.selected, categories);
    var selectedIndices = [];
    var foods = normalizeNames(payload.foods);
    var body;
    var i;
    var index;
    var foodIndices = [];

    buildFoodCatalog();

    for (i = 0; i < foods.length; i += 1) {
      if (!hasOwn(foodIndexByName, foods[i])) {
        return { ok: false, error: "unknown_food", name: foods[i] };
      }
      foodIndices.push(foodIndexByName[foods[i]]);
    }

    if (!foodIndices.length) {
      return { ok: false, error: "empty_foods" };
    }

    for (i = 0; i < categories.length; i += 1) {
      index = dressState && typeof dressState.getShareIndexForSelection === "function"
        ? dressState.getShareIndexForSelection(categories[i], selectedMap[categories[i]])
        : -1;
      if (index < -1) {
        return { ok: false, error: "bad_selection", category: categories[i] };
      }
      selectedIndices.push(index);
    }

    body = {
      v: VERSION,
      n: trimText(payload.petName),
      f: foodIndices,
      d: selectedIndices
    };

    return {
      ok: true,
      body: body
    };
  }

  function decodeCompactPayload(body) {
    var dressState = getDressStateApi();
    var categories = dressState && typeof dressState.getCategoryOrder === "function"
      ? dressState.getCategoryOrder()
      : [];
    var foodNames = [];
    var selected = {};
    var dressIndices = Array.isArray(body && body.d) ? body.d : [];
    var foodIndices = Array.isArray(body && body.f) ? body.f : [];
    var i;
    var name;

    buildFoodCatalog();

    if (!foodIndices.length) {
      return { ok: false, error: "empty_foods" };
    }

    for (i = 0; i < foodIndices.length; i += 1) {
      name = foodNameByIndex[foodIndices[i]];
      if (!name) {
        return { ok: false, error: "bad_food_index" };
      }
      foodNames.push(name);
    }

    for (i = 0; i < categories.length; i += 1) {
      selected[categories[i]] = dressState && typeof dressState.getSelectionForShareIndex === "function"
        ? dressState.getSelectionForShareIndex(categories[i], dressIndices[i])
        : "";
    }

    return {
      ok: true,
      payload: {
        petName: trimText(body && body.n),
        foods: normalizeNames(foodNames),
        dress: {
          selected: selected
        }
      }
    };
  }

  function normalizePayload(payload) {
    var dressState = getDressStateApi();
    var categories = dressState && typeof dressState.getCategoryOrder === "function"
      ? dressState.getCategoryOrder()
      : [];
    var selected = cloneSelectedMap(payload && payload.dress && payload.dress.selected, categories);
    var name = trimText(payload && payload.petName);
    var foods = normalizeNames(payload && payload.foods);

    if (!name && dressState && typeof dressState.getSharePetName === "function") {
      name = dressState.getSharePetName("");
    }

    return {
      petName: name,
      foods: foods,
      dress: {
        selected: selected
      }
    };
  }

  function encodeShare(payload) {
    var normalized = normalizePayload(payload);
    var compact = encodeCompactPayload(normalized);
    var jsonBytes;
    var scrambled;
    var packet;

    if (!compact.ok) {
      return compact;
    }

    jsonBytes = utf8Encode(JSON.stringify(compact.body));
    scrambled = scramble(jsonBytes);
    packet = scrambled.slice();
    packet.push(checksum(scrambled));

    return {
      ok: true,
      code: PREFIX + bytesToBase64Url(packet),
      payload: normalized
    };
  }

  function decodeShare(code) {
    var raw = trimText(code);
    var body;
    var bytes;
    var payload;
    var content;
    var parsed;

    if (!raw || raw.indexOf(PREFIX) !== 0) {
      return { ok: false, error: "bad_prefix" };
    }

    body = raw.slice(PREFIX.length);
    if (!body) {
      return { ok: false, error: "empty_body" };
    }

    try {
      bytes = base64UrlToBytes(body);
    } catch (e) {
      return { ok: false, error: "bad_payload" };
    }

    if (bytes.length < 2) {
      return { ok: false, error: "too_short" };
    }

    if (checksum(bytes.slice(0, -1)) !== bytes[bytes.length - 1]) {
      return { ok: false, error: "checksum" };
    }

    try {
      content = utf8Decode(unscramble(bytes.slice(0, -1)));
      parsed = JSON.parse(content);
    } catch (e2) {
      return { ok: false, error: "bad_json" };
    }

    if (!parsed || Number(parsed.v) !== VERSION) {
      return { ok: false, error: "bad_version" };
    }

    payload = decodeCompactPayload(parsed);
    if (!payload.ok) {
      return payload;
    }

    return {
      ok: true,
      payload: normalizePayload(payload.payload)
    };
  }

  function averageProfiles(profileA, profileB) {
    var taste = getTasteApi();
    var keys = taste && taste.axisKeys ? taste.axisKeys : [];
    var profile = {};
    var aExists = !!profileA;
    var bExists = !!profileB;
    var i;
    var key;
    var count;

    if (!aExists && !bExists) {
      return taste && typeof taste.createNeutralProfile === "function"
        ? taste.createNeutralProfile()
        : profile;
    }

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      count = 0;
      profile[key] = 0;

      if (aExists) {
        profile[key] += Number(profileA[key]) || 0;
        count += 1;
      }
      if (bExists) {
        profile[key] += Number(profileB[key]) || 0;
        count += 1;
      }
      profile[key] = count ? Math.round(profile[key] / count) : 50;
    }

    return profile;
  }

  function similarityLabel(score) {
    if (score >= 80) {
      return "很合拍，像是会互相抢最后一口的人。";
    }
    if (score >= 60) {
      return "挺对胃口，约饭大概率不会踩雷。";
    }
    if (score >= 40) {
      return "有些意外地能聊来，也许能互相种草。";
    }
    return "口味南辕北辙，但也许会互相安利新世界。";
  }

  function intersectionInTheirOrder(myFoods, theirFoods) {
    var mine = {};
    var result = [];

    normalizeNames(myFoods).forEach(function (name) {
      mine[name] = true;
    });

    normalizeNames(theirFoods).forEach(function (name) {
      if (mine[name]) {
        result.push(name);
        delete mine[name];
      }
    });

    return result;
  }

  function analyzeSharedTaste(myFoods, theirPayload) {
    var normalized = normalizePayload(theirPayload);
    var taste = getTasteApi();
    var personalityApi = getPersonalityApi();
    var dressState = getDressStateApi();
    var mySelection = normalizeNames(myFoods);
    var theirSelection = normalized.foods;
    var combinedSet = {};
    var candidateFoods = [];
    var possibleFoods = [];
    var commonFoods = intersectionInTheirOrder(mySelection, theirSelection);
    var myProfile = null;
    var theirProfile = null;
    var mergedProfile = null;
    var similarity = null;
    var ranking;
    var personality;
    var i;
    var foodName;

    if (!theirSelection.length) {
      return { ok: false, error: "empty_other" };
    }

    if (!taste || typeof taste.profileFromSelection !== "function") {
      return { ok: false, error: "taste_unavailable" };
    }

    if (mySelection.length) {
      similarity = taste.compareSelections(mySelection, theirSelection);
      myProfile = taste.profileFromSelection(mySelection).profile;
    }
    theirProfile = taste.profileFromSelection(theirSelection).profile;
    mergedProfile = averageProfiles(myProfile, theirProfile);
    ranking = taste.rankByProfile(mergedProfile);

    normalizeNames(mySelection.concat(theirSelection)).forEach(function (name) {
      combinedSet[name] = true;
    });

    if (dressState && typeof dressState.getFoodsFromShareSelection === "function") {
      candidateFoods = dressState.getFoodsFromShareSelection(normalized.dress.selected);
    }

    candidateFoods.forEach(function (name) {
      if (!combinedSet[name] && possibleFoods.indexOf(name) === -1) {
        possibleFoods.push(name);
      }
    });

    for (i = 0; i < ranking.length && possibleFoods.length < 4; i += 1) {
      foodName = ranking[i].name;
      if (combinedSet[foodName] || possibleFoods.indexOf(foodName) !== -1) {
        continue;
      }
      possibleFoods.push(foodName);
    }

    personality = personalityApi && typeof personalityApi.analyze === "function"
      ? personalityApi.analyze(theirSelection)
      : null;

    return {
      ok: true,
      selfHasFoods: mySelection.length > 0,
      similarity: similarity && similarity.ok ? similarity.similarity : null,
      tasteSimilarity: similarity && similarity.ok ? similarity.tasteSimilarity : null,
      overlapSimilarity: similarity && similarity.ok ? similarity.overlapSimilarity : null,
      similarityLabel: similarity && similarity.ok ? similarityLabel(similarity.similarity) : "先去点几样食物，就能看看你们有多对胃口。",
      myFoods: mySelection,
      theirFoods: theirSelection,
      commonFoods: commonFoods,
      possibleFoods: possibleFoods,
      myProfile: myProfile,
      theirProfile: theirProfile,
      mergedProfile: mergedProfile,
      personality: personality && personality.ok ? personality.personality : null,
      reasonSummary: personality && personality.ok ? personality.reasonSummary : "",
      preview: dressState && typeof dressState.buildSharedAppearance === "function"
        ? dressState.buildSharedAppearance({
          petName: normalized.petName,
          selected: normalized.dress.selected
        })
        : null
    };
  }

  function renderImportHero(analysis, escape) {
    var esc = typeof escape === "function"
      ? escape
      : function (value) {
          return String(value == null ? "" : value);
        };
    var preview = analysis && analysis.preview ? analysis.preview : null;
    var layers = preview && preview.layers ? preview.layers : [];
    var drink = preview && preview.drink ? preview.drink : null;
    var personality = analysis && analysis.personality ? analysis.personality : null;
    var petName = preview && preview.petDisplayName ? preview.petDisplayName : "Ta 的哈基米";
    var stageHtml = "";
    var i;

    stageHtml += '<div class="shop-compare__stage">';
    stageHtml += '<div class="shop-compare__aura" aria-hidden="true"></div>';

    if (layers.length) {
      for (i = 0; i < layers.length; i += 1) {
        stageHtml +=
          '<img class="shop-compare__layer" src="' + esc(layers[i].src) + '"' +
            ' alt="' + esc(layers[i].label || "哈基米图层") + '"' +
            ' loading="lazy" decoding="async">';
      }
    } else {
      stageHtml += '<div class="shop-compare__fallback" aria-hidden="true">🐾</div>';
    }

    if (drink && drink.src) {
      stageHtml +=
        '<div class="shop-compare__drink">' +
          '<img src="' + esc(drink.src) + '" alt="' + esc(drink.name || "饮品") + '" loading="lazy" decoding="async">' +
          '<span>' + esc(drink.name || "") + "</span>" +
        "</div>";
    }

    stageHtml += "</div>";

    return (
      '<section class="shop-compare__hero">' +
        stageHtml +
        '<div class="shop-compare__persona">' +
          '<p class="shop-compare__persona-kicker">宠物形象</p>' +
          '<h3 class="shop-compare__pet-name">' + esc(petName) + "</h3>" +
          (
            personality
              ? '<div class="shop-compare__mbti">' +
                  '<span class="shop-compare__mbti-tag">MBTI</span>' +
                  '<strong class="shop-compare__mbti-name">' + esc(personality.code || personality.name || "未知人格") + "</strong>" +
                  '<p class="shop-compare__mbti-line">' + esc((personality.name || "") + (personality.oneLiner ? " · " + personality.oneLiner : "")) + "</p>" +
                "</div>"
              : '<p class="shop-compare__mbti-line">这只猫还没有可读的人格标签。</p>'
          ) +
          (
            analysis && analysis.reasonSummary
              ? '<p class="shop-compare__reason">' + esc(analysis.reasonSummary) + "</p>"
              : ""
          ) +
        "</div>" +
      "</section>"
    );
  }

  function buildSharePayload() {
    var foodSelection = getFoodSelectionApi();
    var dressState = getDressStateApi();
    var foods = foodSelection && typeof foodSelection.getNames === "function"
      ? foodSelection.getNames()
      : [];
    var appearance;

    if (!foods.length) {
      return { ok: false, error: "empty_foods" };
    }

    if (!dressState || typeof dressState.buildShareAppearance !== "function") {
      return { ok: false, error: "dress_unavailable" };
    }

    appearance = dressState.buildShareAppearance();

    return {
      ok: true,
      payload: {
        petName: appearance.petName,
        foods: normalizeNames(foods),
        dress: {
          selected: cloneSelectedMap(appearance.selected, dressState.getCategoryOrder())
        }
      }
    };
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.yummyCode = {
    version: VERSION,
    prefix: PREFIX,
    encodeShare: encodeShare,
    decodeShare: decodeShare,
    buildSharePayload: buildSharePayload,
    analyzeSharedTaste: analyzeSharedTaste,
    renderImportHero: renderImportHero
  };
})(typeof window !== "undefined" ? window : this);
