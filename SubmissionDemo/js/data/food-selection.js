/**
 * 用户选菜记录（仅数据层）
 *
 * - 维护当前选菜列表（内存 + localStorage）
 * - 联动口味画像（food-taste）与分享码（food-selection-codec）
 *
 * 依赖：foods.js、food-taste.js、food-selection-codec.js
 * 全局：window.Yummi.foodSelection
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "yummi_food_selection";
  var names = [];
  var profileCache = null;

  function getFoods() {
    return global.Yummi && global.Yummi.foods;
  }

  function getTaste() {
    return global.Yummi && global.Yummi.foodTaste;
  }

  function getCodec() {
    return global.Yummi && global.Yummi.foodSelectionCodec;
  }

  function getYummyCode() {
    return global.Yummi && global.Yummi.yummyCode;
  }

  function getPetAppearance() {
    return global.Yummi && global.Yummi.foodPetAppearance;
  }

  function trimName(name) {
    return String(name || "").trim();
  }

  function buildValidSet() {
    var foods = getFoods();
    var list = foods && foods.getAll ? foods.getAll() : [];
    var set = {};
    var i;

    for (i = 0; i < list.length; i += 1) {
      set[list[i].name] = true;
    }
    return set;
  }

  function invalidateProfile() {
    profileCache = null;
  }

  function persist() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
      }
    } catch (e) {
      /* quota / private mode */
    }
  }

  function emitChange(reason) {
    if (typeof global.dispatchEvent !== "function" || typeof global.CustomEvent !== "function") {
      return;
    }

    global.dispatchEvent(new global.CustomEvent("yummi:food-selection-change", {
      detail: {
        names: names.slice(),
        count: names.length,
        reason: reason || "update"
      }
    }));
  }

  /**
   * @param {string[]} input
   * @returns {{ names: string[], skipped: string[] }}
   */
  function normalizeInput(input) {
    var valid = buildValidSet();
    var seen = {};
    var next = [];
    var skipped = [];
    var i;
    var name;

    if (!input || !input.length) {
      return { names: next, skipped: skipped };
    }

    for (i = 0; i < input.length; i += 1) {
      name = trimName(input[i]);
      if (!name) {
        continue;
      }
      if (seen[name]) {
        continue;
      }
      seen[name] = true;
      if (!valid[name]) {
        skipped.push(name);
        continue;
      }
      next.push(name);
    }

    return { names: next, skipped: skipped };
  }

  function replaceNames(next, options) {
    names = next.slice();
    invalidateProfile();
    if (!options || !options.skipPersist) {
      persist();
    }
    emitChange(options && options.reason ? options.reason : "replace");
    return { ok: true, names: names.slice(), count: names.length };
  }

  /**
   * 从 localStorage 恢复选菜；无记录时清空为 []
   * @returns {{ ok: boolean, names?: string[], count?: number, skipped?: string[], error?: string }}
   */
  function load() {
    var raw;
    var parsed;
    var normalized;

    try {
      if (typeof localStorage === "undefined") {
        return { ok: false, error: "no_storage" };
      }
      raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return replaceNames([], { skipPersist: true });
      }
      parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return { ok: false, error: "bad_format" };
      }
      normalized = normalizeInput(parsed);
      return Object.assign(replaceNames(normalized.names, { skipPersist: true }), {
        skipped: normalized.skipped
      });
    } catch (e) {
      return { ok: false, error: "load_failed" };
    }
  }

  /**
   * 写入 localStorage（通常由 record/remove 自动调用）
   */
  function save() {
    persist();
    return { ok: true, names: names.slice(), count: names.length };
  }

  function getNames() {
    return names.slice();
  }

  function getCount() {
    return names.length;
  }

  function has(name) {
    var n = trimName(name);
    var i;

    if (!n) {
      return false;
    }

    for (i = 0; i < names.length; i += 1) {
      if (names[i] === n) {
        return true;
      }
    }
    return false;
  }

  /**
   * 记录一道菜（已选则不变）
   * @param {string} name
   */
  function record(name) {
    var n = trimName(name);
    var valid;

    if (!n) {
      return { ok: false, error: "empty_name" };
    }

    valid = buildValidSet();
    if (!valid[n]) {
      return { ok: false, error: "unknown_food", name: n };
    }

    if (has(n)) {
      return { ok: true, names: names.slice(), count: names.length, alreadySelected: true };
    }

    names.push(n);
    invalidateProfile();
    persist();
    emitChange("record");
    return { ok: true, names: names.slice(), count: names.length, alreadySelected: false };
  }

  /**
   * 批量记录（去重、跳过未知菜名）
   * @param {string[]} input
   */
  function recordMany(input) {
    var normalized = normalizeInput(input);
    var merged = names.slice();
    var seen = {};
    var added = [];
    var i;
    var name;

    for (i = 0; i < merged.length; i += 1) {
      seen[merged[i]] = true;
    }

    for (i = 0; i < normalized.names.length; i += 1) {
      name = normalized.names[i];
      if (seen[name]) {
        continue;
      }
      seen[name] = true;
      merged.push(name);
      added.push(name);
    }

    if (added.length) {
      names = merged;
      invalidateProfile();
      persist();
      emitChange("recordMany");
    }

    return {
      ok: true,
      names: names.slice(),
      count: names.length,
      added: added,
      skipped: normalized.skipped
    };
  }

  /**
   * @param {string} name
   */
  function remove(name) {
    var n = trimName(name);
    var next = [];
    var removed = false;
    var i;

    if (!n) {
      return { ok: false, error: "empty_name" };
    }

    for (i = 0; i < names.length; i += 1) {
      if (names[i] === n) {
        removed = true;
        continue;
      }
      next.push(names[i]);
    }

    if (!removed) {
      return { ok: false, error: "not_selected", name: n, names: names.slice() };
    }

    names = next;
    invalidateProfile();
    persist();
    emitChange("remove");
    return { ok: true, names: names.slice(), count: names.length };
  }

  /**
   * @param {string} name
   */
  function toggle(name) {
    if (has(name)) {
      return Object.assign(remove(name), { selected: false });
    }
    return Object.assign(record(name), { selected: true });
  }

  function clear() {
    names = [];
    invalidateProfile();
    persist();
    emitChange("clear");
    return { ok: true, names: [], count: 0 };
  }

  /**
   * 由当前选菜推算口味画像（带缓存）
   */
  function getProfile() {
    var taste;

    if (profileCache) {
      return profileCache;
    }

    taste = getTaste();
    if (!taste || !taste.profileFromSelection) {
      return null;
    }

    profileCache = taste.profileFromSelection(names);
    return profileCache;
  }

  /**
   * 用户第一选择（选菜顺序首项）
   * @returns {string}
   */
  function getPrimaryFood() {
    return names.length ? names[0] : "";
  }

  /**
   * 用户最后一次选择（选菜顺序末项，装扮同步以此为准）
   * @returns {string}
   */
  function getLastFood() {
    return names.length ? names[names.length - 1] : "";
  }

  /**
   * 将已有选菜移到末尾，或新增一道菜（作为最后一次选择）
   * @param {string} name
   */
  function touchLast(name) {
    var n = trimName(name);
    var valid;
    var i;

    if (!n) {
      return { ok: false, error: "empty_name" };
    }

    valid = buildValidSet();
    if (!valid[n]) {
      return { ok: false, error: "unknown_food", name: n };
    }

    for (i = 0; i < names.length; i += 1) {
      if (names[i] === n) {
        names.splice(i, 1);
        break;
      }
    }

    names.push(n);
    invalidateProfile();
    persist();
    emitChange("touchLast");
    return { ok: true, names: names.slice(), count: names.length, moved: true };
  }

  /**
   * 确认选菜：推算口味画像（数据层）并解析宠物形象（预留接口，以第一选择为准）
   * @returns {{
   *   ok: boolean,
   *   primaryFood?: string,
   *   names?: string[],
   *   count?: number,
   *   profile?: object|null,
   *   petAppearance?: object,
   *   error?: string
   * }}
   */
  function confirm() {
    var primary;
    var profile;
    var petApi;
    var petAppearance;

    if (!names.length) {
      return { ok: false, error: "empty_selection" };
    }

    primary = names[0];
    profile = getProfile();

    petApi = getPetAppearance();
    if (petApi && petApi.resolveFromFood) {
      petAppearance = petApi.resolveFromFood(primary);
    } else {
      petAppearance = { ok: false, error: "pet_appearance_unavailable" };
    }

    return {
      ok: true,
      primaryFood: primary,
      names: names.slice(),
      count: names.length,
      profile: profile,
      petAppearance: petAppearance
    };
  }

  /**
   * 导出分享码
   */
  function exportCode() {
    var yummy = getYummyCode();
    var payload;
    if (!yummy || typeof yummy.buildSharePayload !== "function" || typeof yummy.encodeShare !== "function") {
      return { ok: false, error: "codec_unavailable" };
    }
    payload = yummy.buildSharePayload();
    if (!payload.ok) {
      return payload;
    }
    return yummy.encodeShare(payload.payload);
  }

  /**
   * 与分享码比对相似度
   * @param {string} theirCode
   * @param {{ tasteWeight?: number, overlapWeight?: number }} [options]
   */
  function compareWithCode(theirCode, options) {
    var yummy = getYummyCode();
    if (!yummy || typeof yummy.decodeShare !== "function" || typeof yummy.analyzeSharedTaste !== "function") {
      return { ok: false, error: "codec_unavailable" };
    }
    var decoded = yummy.decodeShare(theirCode);
    if (!decoded.ok) {
      return decoded;
    }
    return yummy.analyzeSharedTaste(names, decoded.payload, options);
  }

  if (typeof localStorage !== "undefined") {
    load();
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.foodSelection = {
    storageKey: STORAGE_KEY,
    getNames: getNames,
    getCount: getCount,
    has: has,
    record: record,
    recordMany: recordMany,
    remove: remove,
    toggle: toggle,
    clear: clear,
    getPrimaryFood: getPrimaryFood,
    getLastFood: getLastFood,
    touchLast: touchLast,
    getProfile: getProfile,
    confirm: confirm,
    exportCode: exportCode,
    compareWithCode: compareWithCode,
    load: load,
    save: save
  };
})(typeof window !== "undefined" ? window : this);
