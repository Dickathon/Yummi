/**
 * 食物 → 宠物形象
 *
 * 以用户第一选择（选菜列表首项）为基准解析宠物形象；
 * 装扮模块接入后返回各部件路径与合成参数。
 *
 * 全局：window.Yummi.foodPetAppearance
 */
(function (global) {
  "use strict";

  function trimName(name) {
    return String(name || "").trim();
  }

  function getDressState() {
    return global.Yummi &&
      global.Yummi.modules &&
      global.Yummi.modules.dress &&
      global.Yummi.modules.dress.state;
  }

  /**
   * 由主选食物解析宠物形象
   * @param {string} primaryFoodName 用户第一选择
   * @returns {{
   *   ok: boolean,
   *   foodName?: string,
   *   ready?: boolean,
   *   category?: string,
   *   petDisplayName?: string,
   *   placeholder?: { label: string, message: string },
   *   components?: { layers: object[], drink: object|null, selected: object }|null,
   *   error?: string
   * }}
   */
  function resolveFromFood(primaryFoodName) {
    var name = trimName(primaryFoodName);
    var dressState;
    var category;
    var snapshot;

    if (!name) {
      return { ok: false, error: "empty_food" };
    }

    dressState = getDressState();
    category = dressState && typeof dressState.findCategoryForFood === "function"
      ? dressState.findCategoryForFood(name)
      : "";

    if (!category || !dressState || typeof dressState.captureSnapshot !== "function") {
      return {
        ok: true,
        foodName: name,
        ready: false,
        components: null,
        placeholder: {
          label: name,
          message: "宠物形象即将呈现"
        }
      };
    }

    snapshot = dressState.captureSnapshot();

    return {
      ok: true,
      foodName: name,
      ready: true,
      category: category,
      petDisplayName: snapshot.petDisplayName,
      components: {
        layers: snapshot.layers || [],
        drink: snapshot.drink || null,
        selected: snapshot.selected || {}
      },
      placeholder: null
    };
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.foodPetAppearance = {
    resolveFromFood: resolveFromFood
  };
})(typeof window !== "undefined" ? window : this);
