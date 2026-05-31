/**
 * 小鱼干币系统 — 全局虚拟货币
 * 初始 200 个，投喂消耗 1 个
 */
(function (global) {
  "use strict";

  var KEY = "yummi_fish_coins";
  var DEFAULT = 200;

  function get() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw === null) return DEFAULT;
      var n = parseInt(raw, 10);
      return isNaN(n) ? DEFAULT : n;
    } catch (e) {
      return DEFAULT;
    }
  }

  function set(n) {
    try {
      localStorage.setItem(KEY, String(Math.max(0, n)));
    } catch (e) {}
  }

  function spend(amount) {
    var current = get();
    if (current < amount) return false;
    set(current - amount);
    return true;
  }

  function add(amount) {
    set(get() + amount);
  }

  function render(hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML =
      '<span class="fish-coin__icon">🐟</span>' +
      '<span class="fish-coin__num">' + get() + '</span>';
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.fishCoins = {
    get: get,
    set: set,
    spend: spend,
    add: add,
    render: render
  };

  // 页面加载时自动渲染
  function autoRender() {
    render("fishCoinBar");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoRender);
  } else {
    autoRender();
  }
})(typeof window !== "undefined" ? window : this);
