/**
 * 用户选菜导出编解码（仅数据层）
 *
 * - encode：食物名称列表 → 不透明分享码（如 YUMMI2.xK9m…），无法直接读出菜名
 * - decode：分享码 → 名称列表（供本应用导入/还原，不在 UI 展示明文过程）
 *
 * 依赖：foods.js（菜品顺序与版本绑定，变更 foods 列表会破坏旧码）
 * 全局：window.Yummi.foodSelectionCodec
 */
(function (global) {
  "use strict";

  var PREFIX = "YUMMI2.";
  var SALT = [0x59, 0x75, 0x6d, 0x6d, 0x69, 0x2d, 0x73, 0x65, 0x6c];

  var nameToIndex = null;
  var indexToName = null;

  function buildCatalog() {
    var foods;
    var list;
    var i;

    if (nameToIndex) {
      return;
    }

    foods = global.Yummi && global.Yummi.foods;
    list = foods && foods.getAll ? foods.getAll() : [];
    nameToIndex = {};
    indexToName = [];

    for (i = 0; i < list.length; i += 1) {
      nameToIndex[list[i].name] = i;
      indexToName[i] = list[i].name;
    }
  }

  function normalizeNames(names) {
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

  function checksum(bytes) {
    var c = 0;
    var i;
    for (i = 0; i < bytes.length; i += 1) {
      c = (c + bytes[i]) & 255;
    }
    return c;
  }

  function scramble(bytes) {
    var out = [];
    var i;
    var b;
    for (i = 0; i < bytes.length; i += 1) {
      b = bytes[i] ^ SALT[i % SALT.length] ^ ((i * 17) & 255);
      out.push(b & 255);
    }
    return out;
  }

  function unscramble(bytes) {
    return scramble(bytes);
  }

  function bytesToBase64Url(bytes) {
    var b64;
    if (typeof Buffer !== "undefined") {
      b64 = Buffer.from(bytes).toString("base64");
    } else {
      var bin = "";
      var i;
      for (i = 0; i < bytes.length; i += 1) {
        bin += String.fromCharCode(bytes[i]);
      }
      b64 = btoa(bin);
    }
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64UrlToBytes(str) {
    var b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    var pad = b64.length % 4;
    var out = [];
    var i;
    var bin;

    if (pad) {
      b64 += "====".slice(pad);
    }

    if (typeof Buffer !== "undefined") {
      return Array.prototype.slice.call(Buffer.from(b64, "base64"));
    }

    bin = atob(b64);
    for (i = 0; i < bin.length; i += 1) {
      out.push(bin.charCodeAt(i));
    }
    return out;
  }

  /**
   * @param {string[]} names
   * @returns {{ ok: boolean, code?: string, count?: number, skipped?: string[], error?: string }}
   */
  function encode(names) {
    var selection = normalizeNames(names);
    var indices = [];
    var skipped = [];
    var payload;
    var scrambled;
    var i;
    var idx;
    var name;

    buildCatalog();

    if (!indexToName.length) {
      return { ok: false, error: "catalog_empty" };
    }

    if (!selection.length) {
      return { ok: false, error: "empty_selection" };
    }

    for (i = 0; i < selection.length; i += 1) {
      name = selection[i];
      if (!Object.prototype.hasOwnProperty.call(nameToIndex, name)) {
        skipped.push(name);
        continue;
      }
      idx = nameToIndex[name];
      if (idx < 0 || idx > 255) {
        skipped.push(name);
        continue;
      }
      indices.push(idx);
    }

    if (!indices.length) {
      return { ok: false, error: "no_valid_items", skipped: skipped };
    }

    indices.sort(function (a, b) {
      return a - b;
    });

    payload = [indices.length];
    for (i = 0; i < indices.length; i += 1) {
      payload.push(indices[i]);
    }
    payload.push(checksum(payload));

    scrambled = scramble(payload);

    return {
      ok: true,
      code: PREFIX + bytesToBase64Url(scrambled),
      count: indices.length,
      skipped: skipped
    };
  }

  /**
   * @param {string} code
   * @returns {{ ok: boolean, names?: string[], count?: number, error?: string }}
   */
  function decode(code) {
    var raw = String(code || "").trim();
    var body;
    var bytes;
    var expectCs;
    var actualCs;
    var count;
    var names = [];
    var i;
    var idx;

    buildCatalog();

    if (!raw || raw.indexOf(PREFIX) !== 0) {
      return { ok: false, error: "bad_prefix" };
    }

    body = raw.slice(PREFIX.length);
    if (!body) {
      return { ok: false, error: "empty_body" };
    }

    try {
      bytes = unscramble(base64UrlToBytes(body));
    } catch (e) {
      return { ok: false, error: "bad_payload" };
    }

    if (bytes.length < 2) {
      return { ok: false, error: "too_short" };
    }

    expectCs = bytes[bytes.length - 1];
    bytes = bytes.slice(0, -1);
    actualCs = checksum(bytes);

    if (expectCs !== actualCs) {
      return { ok: false, error: "checksum" };
    }

    count = bytes[0];
    if (count < 1 || bytes.length !== count + 1) {
      return { ok: false, error: "bad_count" };
    }

    for (i = 1; i <= count; i += 1) {
      idx = bytes[i];
      if (idx < 0 || idx >= indexToName.length || !indexToName[idx]) {
        return { ok: false, error: "bad_index" };
      }
      names.push(indexToName[idx]);
    }

    return { ok: true, names: names, count: names.length };
  }

  /**
   * 输入对方分享码，与己方选菜比对相似度（内部 decode，不向 UI 返回对方菜名）
   *
   * @param {string[]} myNames 己方已选食物名称
   * @param {string} theirCode 对方 YUMMI2.* 分享码
   * @param {{ tasteWeight?: number, overlapWeight?: number }} [options] 传给 compareSelections
   */
  function compareImport(myNames, theirCode, options) {
    var decoded = decode(theirCode);
    var taste;

    if (!decoded.ok) {
      return { ok: false, error: decoded.error };
    }

    taste = global.Yummi && global.Yummi.foodTaste;
    if (!taste || !taste.compareSelections) {
      return { ok: false, error: "taste_unavailable" };
    }

    return taste.compareSelections(myNames, decoded.names, options);
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.foodSelectionCodec = {
    prefix: PREFIX,
    encode: encode,
    decode: decode,
    compareImport: compareImport
  };
})(typeof window !== "undefined" ? window : this);
