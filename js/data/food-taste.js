/**
 * 食物口味 API（仅数据层，不向 UI 暴露）
 *
 * - 菜品向量：food-taste-db.js
 * - 由选择推算画像：profileFromSelection
 * - 模块 state 可缓存 profile，供推荐/匹配等逻辑使用；view 不得渲染各轴数值
 *
 * 依赖：foods.js、food-taste-db.js
 * 全局：window.Yummi.foodTaste
 */
(function (global) {
  "use strict";

  var db = global.Yummi && global.Yummi.foodTasteDb;
  var foods = global.Yummi && global.Yummi.foods;
  var axisKeys = (db && db.axisKeys) || [];

  function getRecord(name) {
    if (!db || !db.records) {
      return null;
    }
    return db.records[name] || null;
  }

  function getAll() {
    if (!db || !db.records) {
      return [];
    }
    return Object.keys(db.records).map(function (name) {
      return db.records[name];
    });
  }

  function getWithCategory(name) {
    var record = getRecord(name);
    var type = null;
    var i;
    var list;
    var cats;

    if (!record || !foods || !foods.categories) {
      return record ? { type: type, taste: record } : null;
    }

    cats = foods.categories;
    for (var cat in cats) {
      if (!Object.prototype.hasOwnProperty.call(cats, cat)) {
        continue;
      }
      list = cats[cat];
      for (i = 0; i < list.length; i += 1) {
        if (list[i] === name) {
          type = cat;
          break;
        }
      }
      if (type) {
        break;
      }
    }

    return { name: name, type: type, taste: record };
  }

  /** 默认中性口味画像（各轴 50） */
  function createNeutralProfile() {
    var profile = {};
    var i;
    for (i = 0; i < axisKeys.length; i += 1) {
      profile[axisKeys[i]] = 50;
    }
    return profile;
  }

  function clampAxis(value) {
    var n = Math.round(Number(value));
    if (isNaN(n)) {
      return 50;
    }
    if (n < 0) {
      return 0;
    }
    if (n > 100) {
      return 100;
    }
    return n;
  }

  function normalizeSelection(names) {
    var list = [];
    var seen = {};
    var i;
    var name;

    if (!names || !names.length) {
      return list;
    }

    for (i = 0; i < names.length; i += 1) {
      name = String(names[i] || "").trim();
      if (!name || seen[name]) {
        continue;
      }
      seen[name] = true;
      list.push(name);
    }
    return list;
  }

  /**
   * 由用户选择的食物列表推算口味画像（各轴 0–100）。
   * 算法：对有效菜品各轴取算术平均；无选择时返回中性画像。
   *
   * @param {string[]} names 食物名称（与 foods.js / food-taste-db 一致）
   * @param {{ weights?: Object.<string, number> }} [options]
   *   weights：可选，按名称加权（如某菜选两次 weight=2）
   * @returns {{ profile: Object, count: number, used: string[], skipped: string[], temp: number }}
   */
  function profileFromSelection(names, options) {
    var selection = normalizeSelection(names);
    var weights = (options && options.weights) || {};
    var sums = {};
    var weightTotal = 0;
    var used = [];
    var skipped = [];
    var tempSum = 0;
    var tempWeight = 0;
    var profile = {};
    var i;
    var j;
    var key;
    var name;
    var record;
    var w;

    for (j = 0; j < axisKeys.length; j += 1) {
      sums[axisKeys[j]] = 0;
    }

    if (!selection.length) {
      return {
        profile: createNeutralProfile(),
        count: 0,
        used: used,
        skipped: skipped,
        temp: 0
      };
    }

    for (i = 0; i < selection.length; i += 1) {
      name = selection[i];
      record = getRecord(name);
      w = Number(weights[name]);
      if (!w || w < 1) {
        w = 1;
      }

      if (!record) {
        skipped.push(name);
        continue;
      }

      used.push(name);
      weightTotal += w;

      for (j = 0; j < axisKeys.length; j += 1) {
        key = axisKeys[j];
        sums[key] += Number(record[key]) * w;
      }

      if (typeof record.temp === "number" && !isNaN(record.temp)) {
        tempSum += record.temp * w;
        tempWeight += w;
      }
    }

    if (!weightTotal) {
      return {
        profile: createNeutralProfile(),
        count: 0,
        used: used,
        skipped: skipped,
        temp: 0
      };
    }

    for (j = 0; j < axisKeys.length; j += 1) {
      key = axisKeys[j];
      profile[key] = clampAxis(sums[key] / weightTotal);
    }

    return {
      profile: profile,
      count: used.length,
      used: used,
      skipped: skipped,
      temp: tempWeight ? Math.round(tempSum / tempWeight) : 0
    };
  }

  function maxProfileDistance() {
    return Math.sqrt(axisKeys.length * 100 * 100);
  }

  /**
   * 两份口味画像的相似度 0–100（越高越像，对称）
   * 算法：八轴欧氏距离映射为相似分，与 matchScore 同一尺度
   */
  function profileSimilarity(profileA, profileB) {
    var sumSq = 0;
    var i;
    var key;
    var diff;
    var dist;

    if (!profileA || !profileB) {
      return 0;
    }

    for (i = 0; i < axisKeys.length; i += 1) {
      key = axisKeys[i];
      diff = Number(profileA[key]) - Number(profileB[key]);
      if (isNaN(diff)) {
        return 0;
      }
      sumSq += diff * diff;
    }

    dist = Math.sqrt(sumSq);
    return Math.round(100 * (1 - dist / maxProfileDistance()));
  }

  /**
   * 选菜列表重合度 0–100（Jaccard：|∩|/|∪|）
   */
  function selectionOverlap(namesA, namesB) {
    var a = normalizeSelection(namesA);
    var b = normalizeSelection(namesB);
    var setA = {};
    var setB = {};
    var union = 0;
    var inter = 0;
    var i;
    var name;

    if (!a.length || !b.length) {
      return 0;
    }

    for (i = 0; i < a.length; i += 1) {
      setA[a[i]] = true;
    }
    for (i = 0; i < b.length; i += 1) {
      name = b[i];
      if (setB[name]) {
        continue;
      }
      setB[name] = true;
      union += 1;
      if (setA[name]) {
        inter += 1;
      }
    }
    for (i = 0; i < a.length; i += 1) {
      name = a[i];
      if (!setB[name]) {
        union += 1;
      }
    }

    if (!union) {
      return 0;
    }

    return Math.round((100 * inter) / union);
  }

  /**
   * 己方选菜 vs 对方选菜 → 综合相似度（仅数据层，不返回对方菜名）
   *
   * similarity = tasteWeight * 口味画像相似 + overlapWeight * 选菜重合
   * 默认 0.75 / 0.25：偏好口味为主，重合为辅（未选同一道菜也可能口味接近）
   */
  function compareSelections(myNames, theirNames, options) {
    var mine = normalizeSelection(myNames);
    var theirs = normalizeSelection(theirNames);
    var aggA;
    var aggB;
    var tasteSimilarity;
    var overlapSimilarity;
    var tasteWeight;
    var overlapWeight;
    var similarity;

    if (!mine.length) {
      return { ok: false, error: "empty_self" };
    }
    if (!theirs.length) {
      return { ok: false, error: "empty_other" };
    }

    aggA = profileFromSelection(mine);
    aggB = profileFromSelection(theirs);
    tasteSimilarity = profileSimilarity(aggA.profile, aggB.profile);
    overlapSimilarity = selectionOverlap(mine, theirs);

    tasteWeight = options && options.tasteWeight != null ? Number(options.tasteWeight) : 0.75;
    overlapWeight = options && options.overlapWeight != null ? Number(options.overlapWeight) : 0.25;

    if (isNaN(tasteWeight) || isNaN(overlapWeight) || tasteWeight < 0 || overlapWeight < 0) {
      tasteWeight = 0.75;
      overlapWeight = 0.25;
    }

    similarity = Math.round(
      tasteSimilarity * tasteWeight + overlapSimilarity * overlapWeight
    );

    return {
      ok: true,
      similarity: similarity,
      tasteSimilarity: tasteSimilarity,
      overlapSimilarity: overlapSimilarity,
      selfCount: mine.length,
      otherCount: theirs.length
    };
  }

  /**
   * 与用户口味画像的匹配分 0–100（越高越合口味）
   * profile: { sweet, salty, ... } 各轴 0–100，表示偏好强度
   */
  function matchScore(profile, name) {
    var record = getRecord(name);

    if (!record || !profile) {
      return 0;
    }

    return profileSimilarity(profile, record);
  }

  function rankByProfile(profile, options) {
    var list = foods && foods.getAll ? foods.getAll() : [];
    var scored = list.map(function (item) {
      return {
        name: item.name,
        type: item.type,
        score: matchScore(profile, item.name),
        taste: getRecord(item.name)
      };
    });

    scored.sort(function (a, b) {
      return b.score - a.score;
    });

    if (options && options.limit) {
      return scored.slice(0, options.limit);
    }
    return scored;
  }

  function assertCoverage() {
    var missing = [];
    var list = foods && foods.getAll ? foods.getAll() : [];
    var i;

    for (i = 0; i < list.length; i += 1) {
      if (!getRecord(list[i].name)) {
        missing.push(list[i].name);
      }
    }
    return missing;
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.foodTaste = {
    axisKeys: axisKeys,
    axisLabels: db && db.axisLabels,
    get: getRecord,
    getAll: getAll,
    getWithCategory: getWithCategory,
    createNeutralProfile: createNeutralProfile,
    profileFromSelection: profileFromSelection,
    profileSimilarity: profileSimilarity,
    selectionOverlap: selectionOverlap,
    compareSelections: compareSelections,
    matchScore: matchScore,
    rankByProfile: rankByProfile,
    assertCoverage: assertCoverage
  };
})(typeof window !== "undefined" ? window : this);
