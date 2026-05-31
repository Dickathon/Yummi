/**
 * 食物数据 — 名称与分类严格遵循 Project Specification.md §5
 * 全局：window.Yummi.foods
 */
(function (global) {
  "use strict";

  var CATEGORIES = {
    主食: [
      "炸酱面", "北京烤鸭", "春卷", "刀削面", "锅包肉", "小鸡炖蘑菇", "红烧肉",
      "糖醋排骨", "海蛎煎", "蒸螃蟹", "瓦罐汤", "炒腊肉", "九转大肠", "胡辣汤",
      "酸辣粉", "剁椒鱼头", "小炒黄牛肉", "臭豆腐", "烧鹅", "肠粉", "螺蛳粉",
      "火锅", "麻辣小龙虾", "回锅肉", "酸菜鱼", "羊肉泡馍", "兰州拉面", "手抓羊肉",
      "大盘鸡", "烤串", "牛排", "披萨", "汉堡", "薯条", "炸鸡", "蔬菜沙拉",
      "刺身", "石锅拌饭", "冬阴功汤", "咖喱饭", "鹅肝"
    ],
    甜品: [
      "奶油蛋糕", "焦糖布丁", "香草冰淇淋", "芒果冰沙", "黑巧克力", "固体杨枝甘露",
      "芝士奶酪块", "葡式蛋挞", "黄油曲奇", "话梅", "水果捞", "榴莲制品", "酸嘢"
    ],
    饮品: [
      "冰红茶", "珍珠奶茶", "冰镇酸梅汤", "青岛啤酒", "鸡尾酒", "抹茶奶茶",
      "美式咖啡", "龙井茶", "姜糖水", "碳酸", "酸奶", "牛奶"
    ]
  };

  function getAll() {
    var list = [];
    Object.keys(CATEGORIES).forEach(function (type) {
      CATEGORIES[type].forEach(function (name) {
        list.push({ type: type, name: name });
      });
    });
    return list;
  }

  function getByType(type) {
    return CATEGORIES[type] ? CATEGORIES[type].slice() : [];
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.foods = {
    categories: CATEGORIES,
    getAll: getAll,
    getByType: getByType
  };
})(typeof window !== "undefined" ? window : this);
