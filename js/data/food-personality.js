/**
 * 点餐口味 MBTI 报告分析（本地静态，娱乐向）
 *
 * 输入用户点餐列表，输出 20 种口味人格之一、前三口味、Top 4 分析与地域风味。
 * 地域仅表示「胃的风味归属」，不读取用户真实位置。
 *
 * 依赖：foods.js、food-taste.js
 * 全局：window.Yummi.foodPersonality
 */
(function (global) {
  "use strict";

  var AXIS_META = {
    sweet: {
      label: "甜",
      title: "甜味雷达",
      summary: "甜度是你的情绪充电宝，人生苦短，奶油要先上桌。",
      detail: "甜味高说明你很会给生活找台阶下，压力再大也能用一口甜把自己哄回来。"
    },
    salty: {
      label: "咸",
      title: "咸香底盘",
      summary: "咸香是你的安全区，吃饭可以花里胡哨，但底味必须站稳。",
      detail: "咸味高的人通常喜欢确定感和烟火气，点餐时很少被空灵小清新彻底说服。"
    },
    sour: {
      label: "酸",
      title: "酸爽开关",
      summary: "你需要一点酸来重启味蕾，像给大脑按了刷新键。",
      detail: "酸味高代表你偏爱有转折的味道，不怕食物有个性，就怕它一整口都没剧情。"
    },
    spicy: {
      label: "辣",
      title: "红油外交",
      summary: "嘴上说微辣，系统识别为红油外交官。",
      detail: "辣味高的人吃饭自带气氛组属性，越热闹越来劲，菜单上的警告语常被当成邀请函。"
    },
    bitter: {
      label: "苦",
      title: "苦味黑卡",
      summary: "你不是爱吃苦，你是能欣赏成年人的隐藏风味。",
      detail: "苦味高说明你对复杂味道有耐心，咖啡、茶感、黑巧这类慢热选手更容易拿下你。"
    },
    umami: {
      label: "鲜",
      title: "鲜味天线",
      summary: "你的味蕾像装了海鲜雷达，鲜不鲜一口就能结案。",
      detail: "鲜味高代表你重视食材本身的存在感，汤底、肉汁、海味和菌菇都能让你迅速认真。"
    },
    oily: {
      label: "油",
      title: "油香马达",
      summary: "你相信香气要有抓地力，清汤寡水很难把你留住。",
      detail: "油感高并不等于随便重口，而是你偏好饱满、挂嘴、能留下记忆点的香气结构。"
    },
    fresh: {
      label: "清爽",
      title: "清爽滤镜",
      summary: "你需要食物带一点风，吃完最好像刚换了床单。",
      detail: "清爽高的人更在意味觉的通透感，水果、茶感、海味和轻盈口感都容易加分。"
    }
  };

  var REGION_META = {
    east: {
      label: "东部风味",
      shortLabel: "东",
      summary: "你的胃像住在江南窗边，讲究鲜甜细糯，也讲究这一口要有体面。"
    },
    west: {
      label: "西部风味",
      shortLabel: "西",
      summary: "你的胃大概自带川渝定位，嘴上说都行，手已经在找蘸碟。"
    },
    south: {
      label: "南部风味",
      shortLabel: "南",
      summary: "你的胃吹着岭南小风，喜欢清爽、甜润和一点恰到好处的酸。"
    },
    north: {
      label: "北部风味",
      shortLabel: "北",
      summary: "你的胃很有北方饭桌气质，碳水、肉香、热乎劲儿，一个都不能少。"
    },
    central: {
      label: "中部风味",
      shortLabel: "中",
      summary: "你的胃站在中部十字路口，酸辣鲜香都能接住，主打一个会过日子也会造气氛。"
    }
  };

  var REGION_ORDER = ["east", "west", "south", "north", "central"];
  var CATEGORY_WEIGHTS = { "主食": 1, "甜品": 0.7, "饮品": 0.55 };
  var SPECIAL_REGION_THRESHOLD = 42;
  var SPECIAL_REGION_LEAD = 12;
  var SPECIAL_REGION_STRONG_COUNT = 2;

  var CORE_LETTER_LABELS = {
    R: "浓烈外放",
    L: "清爽内收",
    C: "经典稳口",
    X: "猎奇变奏",
    S: "锋利刺激",
    G: "温柔安抚",
    O: "固定秩序",
    P: "随兴探索"
  };

  function regionEntry(weights, confidence) {
    return {
      weights: weights,
      confidence: confidence
    };
  }

  var REGION_WEIGHTS = {
    "炸酱面": regionEntry({ north: 88, central: 12 }, 1),
    "北京烤鸭": regionEntry({ north: 92, east: 8 }, 1),
    "春卷": regionEntry({ east: 58, south: 28, central: 14 }, 0.8),
    "刀削面": regionEntry({ north: 78, west: 16, central: 6 }, 1),
    "锅包肉": regionEntry({ north: 86, east: 8, central: 6 }, 1),
    "小鸡炖蘑菇": regionEntry({ north: 88, central: 12 }, 1),
    "红烧肉": regionEntry({ east: 52, central: 28, north: 20 }, 0.75),
    "糖醋排骨": regionEntry({ east: 70, north: 12, central: 18 }, 0.85),
    "海蛎煎": regionEntry({ south: 72, east: 22, central: 6 }, 1),
    "蒸螃蟹": regionEntry({ east: 76, south: 18, central: 6 }, 0.9),
    "瓦罐汤": regionEntry({ central: 86, east: 8, south: 6 }, 1),
    "炒腊肉": regionEntry({ central: 72, west: 20, south: 8 }, 1),
    "九转大肠": regionEntry({ north: 64, east: 26, central: 10 }, 1),
    "胡辣汤": regionEntry({ central: 76, north: 18, west: 6 }, 1),
    "酸辣粉": regionEntry({ west: 78, central: 18, south: 4 }, 1),
    "剁椒鱼头": regionEntry({ central: 82, west: 16, south: 2 }, 1),
    "小炒黄牛肉": regionEntry({ central: 82, west: 14, south: 4 }, 1),
    "臭豆腐": regionEntry({ central: 58, south: 24, west: 18 }, 0.9),
    "烧鹅": regionEntry({ south: 86, east: 8, central: 6 }, 1),
    "肠粉": regionEntry({ south: 94, east: 6 }, 1),
    "螺蛳粉": regionEntry({ south: 80, west: 12, central: 8 }, 1),
    "火锅": regionEntry({ west: 86, central: 10, north: 4 }, 1),
    "麻辣小龙虾": regionEntry({ central: 52, west: 38, east: 10 }, 0.95),
    "回锅肉": regionEntry({ west: 90, central: 10 }, 1),
    "酸菜鱼": regionEntry({ west: 62, central: 28, south: 10 }, 0.95),
    "羊肉泡馍": regionEntry({ west: 82, north: 18 }, 1),
    "兰州拉面": regionEntry({ west: 78, north: 18, central: 4 }, 1),
    "手抓羊肉": regionEntry({ west: 76, north: 22, central: 2 }, 1),
    "大盘鸡": regionEntry({ west: 86, north: 10, central: 4 }, 1),
    "烤串": regionEntry({ north: 46, west: 42, central: 12 }, 0.8),
    "牛排": regionEntry({ north: 28, east: 20, south: 12, west: 10, central: 30 }, 0.45),
    "披萨": regionEntry({ east: 24, north: 20, south: 12, west: 10, central: 34 }, 0.45),
    "汉堡": regionEntry({ north: 28, east: 14, south: 10, west: 16, central: 32 }, 0.45),
    "薯条": regionEntry({ north: 22, east: 12, south: 10, west: 18, central: 38 }, 0.45),
    "炸鸡": regionEntry({ north: 30, west: 22, east: 14, south: 10, central: 24 }, 0.55),
    "蔬菜沙拉": regionEntry({ east: 30, south: 34, north: 8, west: 6, central: 22 }, 0.55),
    "刺身": regionEntry({ east: 54, south: 34, north: 4, west: 2, central: 6 }, 0.6),
    "石锅拌饭": regionEntry({ east: 30, north: 24, central: 24, west: 14, south: 8 }, 0.5),
    "冬阴功汤": regionEntry({ south: 62, west: 18, central: 12, east: 8 }, 0.65),
    "咖喱饭": regionEntry({ south: 36, west: 24, east: 18, central: 18, north: 4 }, 0.55),
    "鹅肝": regionEntry({ east: 36, north: 18, south: 12, west: 8, central: 26 }, 0.45),

    "奶油蛋糕": regionEntry({ east: 36, south: 30, north: 8, west: 4, central: 22 }, 0.5),
    "焦糖布丁": regionEntry({ south: 34, east: 30, north: 8, west: 4, central: 24 }, 0.5),
    "香草冰淇淋": regionEntry({ south: 38, east: 30, north: 6, west: 4, central: 22 }, 0.5),
    "芒果冰沙": regionEntry({ south: 78, east: 16, central: 6 }, 0.85),
    "黑巧克力": regionEntry({ east: 28, north: 14, south: 12, west: 6, central: 40 }, 0.45),
    "固体杨枝甘露": regionEntry({ south: 88, east: 8, central: 4 }, 0.95),
    "芝士奶酪块": regionEntry({ east: 30, north: 18, south: 16, west: 8, central: 28 }, 0.45),
    "葡式蛋挞": regionEntry({ south: 68, east: 20, central: 12 }, 0.85),
    "黄油曲奇": regionEntry({ east: 28, north: 20, south: 12, west: 6, central: 34 }, 0.45),
    "话梅": regionEntry({ south: 54, east: 28, central: 18 }, 0.8),
    "水果捞": regionEntry({ south: 74, east: 18, central: 8 }, 0.75),
    "榴莲制品": regionEntry({ south: 78, east: 14, central: 8 }, 0.8),
    "酸嘢": regionEntry({ south: 92, central: 8 }, 1),

    "冰红茶": regionEntry({ south: 34, east: 26, north: 8, west: 6, central: 26 }, 0.45),
    "珍珠奶茶": regionEntry({ south: 64, east: 26, central: 10 }, 0.75),
    "冰镇酸梅汤": regionEntry({ north: 58, central: 24, east: 12, south: 6 }, 0.9),
    "青岛啤酒": regionEntry({ north: 82, east: 12, central: 6 }, 1),
    "鸡尾酒": regionEntry({ east: 32, south: 30, north: 10, west: 8, central: 20 }, 0.45),
    "抹茶奶茶": regionEntry({ east: 42, south: 34, central: 16, north: 8 }, 0.55),
    "美式咖啡": regionEntry({ east: 32, north: 18, south: 16, west: 8, central: 26 }, 0.45),
    "龙井茶": regionEntry({ east: 90, south: 6, central: 4 }, 1),
    "姜糖水": regionEntry({ south: 64, central: 24, east: 12 }, 0.85),
    "碳酸": regionEntry({ south: 28, east: 22, north: 14, west: 10, central: 26 }, 0.45),
    "酸奶": regionEntry({ north: 30, west: 24, south: 18, east: 12, central: 16 }, 0.55),
    "牛奶": regionEntry({ north: 34, east: 22, south: 12, west: 8, central: 24 }, 0.45)
  };

  var NOVELTY_FOODS = {
    "臭豆腐": true,
    "螺蛳粉": true,
    "鹅肝": true,
    "刺身": true,
    "冬阴功汤": true,
    "咖喱饭": true,
    "黑巧克力": true,
    "酸嘢": true,
    "榴莲制品": true,
    "鸡尾酒": true,
    "龙井茶": true
  };

  var COMFORT_FOODS = {
    "炸酱面": true,
    "北京烤鸭": true,
    "小鸡炖蘑菇": true,
    "红烧肉": true,
    "糖醋排骨": true,
    "羊肉泡馍": true,
    "兰州拉面": true,
    "牛奶": true,
    "奶油蛋糕": true
  };

  var CORE_TYPES = {
    "R-C-S-O": {
      code: "R-C-S-O",
      name: "铁锅规训家",
      oneLiner: "你不是重口，你是给每一口都安排了 KPI。",
      description: "偏爱浓烈、经典、刺激且有秩序的味道，菜单可以很长，但你的判断很短：香不香，够不够，稳不稳。",
      regionAffinity: "常见于北方硬菜、西部红油和中部大锅气质。",
      detail: "这种类型吃饭像开会拍板，底味要扎实，香气要落地，辣、油、咸、鲜最好各司其职。你不反对创新，但创新必须先证明自己能下饭。"
    },
    "R-C-S-P": {
      code: "R-C-S-P",
      name: "红油巡演人",
      oneLiner: "你的人生可以低调，饭不能。",
      description: "浓烈经典是底，刺激和随兴是灵魂。你常常嘴上随便点，最后桌上像开了一场红油音乐节。",
      regionAffinity: "更容易贴近川渝、西北烧烤和中部夜宵摊。",
      detail: "你需要食物带情绪，最好第一口就能把注意力抓回来。固定菜单困不住你，但只要遇到靠谱的重口老朋友，你也能反复回购。"
    },
    "R-C-G-O": {
      code: "R-C-G-O",
      name: "砂锅安全官",
      oneLiner: "你追求的是热乎、厚实、别整虚的。",
      description: "喜欢浓郁经典但不一定追求刺激，偏向老火汤、肉香、米饭和能让人坐稳的味道。",
      regionAffinity: "北方炖菜、江南红烧和中部家常都容易命中。",
      detail: "你的点餐像给自己搭一个避风港：不一定要新奇，但要可靠。香气可以浓，口感可以厚，最重要是吃完心里踏实。"
    },
    "R-C-G-P": {
      code: "R-C-G-P",
      name: "奶盖烟火派",
      oneLiner: "一边要安慰，一边要热闹，情绪管理靠菜单。",
      description: "你喜欢浓郁、熟悉、安抚型的风味，但点法并不死板，甜咸油香都能成为今天的小确幸。",
      regionAffinity: "南方甜润、北方热食和商圈快餐都能兼容。",
      detail: "这种类型很会给自己找快乐，不执着于高级，只在乎这一口有没有把今天哄好。你有固定爱好，也保留临场加料的自由。"
    },
    "R-X-S-O": {
      code: "R-X-S-O",
      name: "猎奇火力控",
      oneLiner: "别人看警告语，你看挑战书。",
      description: "浓烈、猎奇、刺激，但内心仍有一套标准：可以怪，但不能乱怪。",
      regionAffinity: "川渝重辣、柳州酸臭、东南亚香料都可能让你眼睛一亮。",
      detail: "你不是为了冒险而冒险，你要的是有逻辑的强烈体验。臭、辣、酸、苦都能接受，前提是它们在盘子里有自己的位置。"
    },
    "R-X-S-P": {
      code: "R-X-S-P",
      name: "菜单拆盲盒型",
      oneLiner: "你点餐不是吃饭，是开副本。",
      description: "浓烈、猎奇、刺激、随兴全开，越不像日常饭点，越像你的主场。",
      regionAffinity: "跨地域混搭、夜市奇遇和异国香料都很适配。",
      detail: "你讨厌没有记忆点的一餐。对你来说，踩雷也是体验的一部分，只要味觉有剧情，今天就不算白吃。"
    },
    "R-X-G-O": {
      code: "R-X-G-O",
      name: "隐藏菜单考古家",
      oneLiner: "你不冲动猎奇，你是有方法地挖宝。",
      description: "喜欢浓郁和新鲜感，但更偏安抚与秩序，会认真研究哪一道才是店里的隐藏王牌。",
      regionAffinity: "江南私房菜、广式老味和中部小馆都可能被你发掘。",
      detail: "你愿意试新东西，但不喜欢盲目乱点。你像一个味觉收藏家，既要有故事，也要有完成度。"
    },
    "R-X-G-P": {
      code: "R-X-G-P",
      name: "芝士游牧民",
      oneLiner: "你可以今天鹅肝，明天奶茶，后天火锅，逻辑是开心。",
      description: "浓郁、猎奇、安抚、随兴混合，喜欢让味道有一点意外，但最后还是要服务情绪。",
      regionAffinity: "城市商圈、融合餐和甜咸混搭最容易触发。",
      detail: "你的点餐品味像移动弹幕：灵感来了就换频道。你不一定追求刺激爆表，但喜欢食物带一点小反转。"
    },
    "L-C-S-O": {
      code: "L-C-S-O",
      name: "清醒酸辣官",
      oneLiner: "你要清爽，但不能寡淡；要刺激，但不能失控。",
      description: "偏清爽经典，同时需要酸辣苦这类清醒感，点餐时很重视平衡和分寸。",
      regionAffinity: "中部酸辣、江南清鲜和南方凉爽风味都能靠近。",
      detail: "你喜欢味道有棱角，但不爱油腻拖沓。真正打动你的不是大开大合，而是酸、辣、鲜、清之间刚好卡点。"
    },
    "L-C-S-P": {
      code: "L-C-S-P",
      name: "薄荷辣条型",
      oneLiner: "你一边降温，一边点火，味蕾很会搞反差。",
      description: "清爽经典打底，刺激和随兴加戏，可能一手冰饮一手辣味小吃。",
      regionAffinity: "南方饮品、中部小吃和川味轻辣都适配。",
      detail: "你不想被厚重味道困住，但也受不了完全没波澜。你的理想饭局像夏天夜风，清爽里带一点上头。"
    },
    "L-C-G-O": {
      code: "L-C-G-O",
      name: "白瓷小碗型",
      oneLiner: "你吃的不是清淡，是精确到小数点后的舒服。",
      description: "清爽、经典、安抚、有秩序，偏爱鲜、甜、轻、稳的味道。",
      regionAffinity: "江南清鲜、岭南汤水和日常家常风味最贴。",
      detail: "你不是没脾气，而是不想让味道吵到自己。你相信食物应该有留白，最好吃完还能保持体面。"
    },
    "L-C-G-P": {
      code: "L-C-G-P",
      name: "下午茶散步型",
      oneLiner: "你的人生原则是：轻一点，但要可爱一点。",
      description: "清爽经典与安抚感为主，随兴挑选甜品、饮品和轻食，吃饭像给自己放个小假。",
      regionAffinity: "南部甜润、东部清鲜和茶饮商圈都容易命中。",
      detail: "你的点餐不像任务，更像散步。你愿意被当下心情带走，只要最后能轻轻落地。"
    },
    "L-X-S-O": {
      code: "L-X-S-O",
      name: "冷萃试吃员",
      oneLiner: "你要新鲜感，也要专业感，不能只是乱来。",
      description: "清爽、猎奇、刺激但有秩序，喜欢茶感、酸感、香料和复杂但干净的结构。",
      regionAffinity: "东部茶感、南部酸甜和异国清爽风味更容易出现。",
      detail: "你会被有层次的清爽吸引，不怕苦、不怕酸，也不怕一点奇特香气。你怕的是没有设计感的平庸。"
    },
    "L-X-S-P": {
      code: "L-X-S-P",
      name: "柠檬冒险家",
      oneLiner: "你点餐像开窗，最好有风，也最好有意外。",
      description: "清爽猎奇，带一点刺激和强烈的探索欲，水果、酸味、茶感和新奇组合都能激活你。",
      regionAffinity: "岭南、东南亚、茶饮新品和夏日小吃都很贴。",
      detail: "你不想吃得太沉，但想吃得有记忆。对你来说，一口清爽里的小爆点，比一整桌厚重更有吸引力。"
    },
    "L-X-G-O": {
      code: "L-X-G-O",
      name: "茶室策展人",
      oneLiner: "你连尝鲜都要讲审美秩序。",
      description: "清爽猎奇但温和有序，喜欢干净、细节多、后味长的食物。",
      regionAffinity: "东部茶点、南方糖水和精致小馆更常见。",
      detail: "你适合慢慢吃、慢慢发现。你的味觉不靠音量取胜，而靠细节、余味和一点刚刚好的陌生感。"
    },
    "L-X-G-P": {
      code: "L-X-G-P",
      name: "果茶云游型",
      oneLiner: "你不是选择困难，你是在等菜单给你灵感。",
      description: "清爽、猎奇、安抚、随兴，最容易被新品、限定和漂亮搭配吸引。",
      regionAffinity: "南部甜润、东部清鲜和融合轻食都容易贴近。",
      detail: "你点餐时很看感觉：名字、颜色、季节、朋友推荐都会影响你。只要整体轻盈又有小惊喜，你就愿意给它机会。"
    }
  };

  var REGION_TYPES = {
    east: {
      code: "E-LOCAL",
      name: "江南细糯型",
      oneLiner: "你的胃有小桥流水编制，吃饭讲究鲜、甜、细、稳。",
      description: "东部风味强势时触发。你偏爱清鲜、微甜、精致和有余味的食物，重口也要重得有章法。",
      regionAffinity: "东部/江南/沿海",
      detail: "这种类型像一张米色餐巾：温柔但不随便。你能接受复杂口味，但它最好有秩序、有层次，别一上来就把桌子掀了。"
    },
    west: {
      code: "W-LOCAL",
      name: "川渝分胃型",
      oneLiner: "你的胃可能偷偷办了川渝暂住证。",
      description: "西部风味强势时触发。你明显偏向辣、油、咸、香和热烈的饭桌气氛。",
      regionAffinity: "西部/川渝/西北",
      detail: "你对味觉的要求很直接：要有存在感，要能把人叫醒。红油、香料、肉香和锅气是你的快乐四件套。"
    },
    south: {
      code: "S-LOCAL",
      name: "岭南清爽型",
      oneLiner: "你的胃吹着南方小风，甜润清爽是底色。",
      description: "南部风味强势时触发。你偏爱茶饮、糖水、酸甜、鲜爽和不压人的香气。",
      regionAffinity: "南部/岭南/南洋",
      detail: "你喜欢食物有水汽和光感，最好吃完还能继续散步。甜可以有，酸可以有，但油腻和沉重不能当主角。"
    },
    north: {
      code: "N-LOCAL",
      name: "北方硬菜型",
      oneLiner: "你的胃讲义气：来都来了，先把主食上了。",
      description: "北部风味强势时触发。你重视肉香、碳水、热乎劲儿和扎实的饱足感。",
      regionAffinity: "北方/东北/华北",
      detail: "你吃饭不爱悬浮概念，喜欢真实、热闹、有分量。香气要厚，口感要稳，最好还能让人多添半碗饭。"
    }
  };

  var AXIS_DIET_ADVICE = {
    sweet: {
      label: "控糖",
      text: "WHO 建议游离糖每日不超过总能量 10%（约 50g）。偏好甜味时，优先选完整水果代替含糖饮料，并留意隐形糖（酱料、烘焙、奶茶）。"
    },
    salty: {
      label: "控钠",
      text: "中国居民膳食指南建议成人每日食盐不超过 5g（约 2000mg 钠）。重咸口味可逐步减盐，用醋、姜蒜、香料提味，并少吃加工肉制品与外卖汤底。"
    },
    sour: {
      label: "护牙",
      text: "高酸饮食可能侵蚀牙釉质。酸性食物与饮料建议随餐食用、用吸管减少接触，餐后 30 分钟再刷牙，并保证足量钙与维生素 D。"
    },
    spicy: {
      label: "护胃",
      text: "辣椒素可暂时提升代谢，但过量刺激可能引发胃灼热或腹泻。嗜辣者建议搭配足量蔬菜与优质蛋白，胃敏感时降低辣度并避免空腹大量进食。"
    },
    bitter: {
      label: "咖啡因",
      text: "咖啡、浓茶等含咖啡因饮品，健康成人建议每日咖啡因总量不超过 400mg（约 3–4 杯美式）。避免与富铁餐同食，以免影响非血红素铁吸收。"
    },
    umami: {
      label: "鲜味与钠",
      text: "鲜味常伴随谷氨酸钠与天然钠盐。享受鲜味的同事，注意每日钠摄入上限，并搭配富含钾的蔬果（如香蕉、菠菜）帮助平衡电解质。"
    },
    oily: {
      label: "油脂",
      text: "膳食指南建议脂肪供能比 20%–30%，其中饱和脂肪低于 10%。重油偏好者可优先选蒸、煮、烤，用橄榄油或菜籽油替代部分动物油，并增加膳食纤维。"
    },
    fresh: {
      label: "均衡",
      text: "清爽口味有利于控制能量，但需保证优质蛋白与全谷物摄入。每日建议 300–500g 蔬菜、200–350g 水果，避免以轻食名义长期热量与营养不足。"
    }
  };

  var DIET_ADVICE = {
    "R-C-S-O": [
      { label: "减钠", text: "浓烈经典型易摄入过量钠与饱和脂肪。建议每日食盐 ≤5g，火锅、卤味、重口炒菜每周不超过 2–3 次，并主动加一份绿叶蔬菜。" },
      { label: "蛋白质", text: "优先选择鱼、禽、豆制品等优质蛋白，红肉与加工肉控制在每周 500g 以内，有助于降低心血管疾病风险。" },
      { label: "饮水", text: "高油高辣后建议足量饮水（约 1500–1700ml/日），帮助代谢，但避免用含糖饮料代替白水。" }
    ],
    "R-C-S-P": [
      { label: "频率", text: "随兴重口不等于顿顿重口。建议将红油、烧烤类设为「奖励餐」，日常以家常均衡饮食为主，减少反式脂肪与反复加热油摄入。" },
      { label: "蔬菜比", text: "每餐争取「半盘蔬菜」：深色叶菜与菌菇可缓冲油脂与辣椒刺激，同时补充钾与膳食纤维。" },
      { label: "睡眠", text: "深夜高油高辣可能影响睡眠与胃食管反流。尽量在睡前 3 小时完成正餐，宵夜选清淡易消化选项。" }
    ],
    "R-C-G-O": [
      { label: "热量密度", text: "砂锅、炖菜能量密度较高。建议用小碗分餐、先吃蔬菜再吃肉，并每周安排 2–3 次全谷物（糙米、燕麦）替代部分精白米面。" },
      { label: "慢食", text: "热乎厚实的食物容易不知不觉吃多。每口咀嚼 15–20 次、用餐 20 分钟以上，有助于饱腹信号及时传达。" },
      { label: "钠盐", text: "老火汤与酱卤类含钠不低。家庭烹饪可最后放盐、用天然鲜味（番茄、蘑菇）减盐，外食时少喝浓汤。" }
    ],
    "R-C-G-P": [
      { label: "糖脂叠加", text: "甜咸混搭（奶茶配炸鸡等）易造成糖脂双超标。建议分开时段享用，或选少糖、非油炸版本，并控制总能量。" },
      { label: "钙与维 D", text: "奶制品与甜品可补充钙，但需留意添加糖。成人每日钙建议 800mg，可通过无糖酸奶、奶酪适量获取。" },
      { label: "情绪性进食", text: "用食物哄自己很正常，但可建立「非食物奖励」清单（散步、音乐），避免将高糖高脂当作唯一情绪出口。" }
    ],
    "R-X-S-O": [
      { label: "新奇≠无限", text: "猎奇重口食物（发酵、超辣、高脂）对肠胃挑战较大。新尝试建议少量多次，观察耐受，并保留 24 小时「恢复餐」吃清淡易消化食物。" },
      { label: "卫生", text: "生腌、生食类需确保来源可靠与冷链完整，孕妇、免疫低下者应避免，降低食源性疾病风险。" },
      { label: "多样性", text: "冒险之余保证膳食多样性：每周摄入 12 种以上食物、25 种以上更佳，避免长期单一重口掩盖营养缺口。" }
    ],
    "R-X-S-P": [
      { label: "能量平衡", text: "频繁尝试高热量新奇食物时，可用「轻午重晚」或增加活动量平衡。每周至少 150 分钟中等强度有氧运动。" },
      { label: "记录", text: "记录哪些猎奇组合让你不适（过辣、过油、过酸），建立个人「安全清单」，减少踩雷后的肠胃代价。" },
      { label: "纤维", text: "每增加 10g 膳食纤维，可降低约 10% 冠心病风险。冒险餐前后可补充全谷物、豆类与蔬菜。" }
    ],
    "R-X-G-O": [
      { label: "精致≠少量", text: "隐藏菜单往往精致但未必低卡。关注烹饪方式（蒸优于炸），并主动询问油盐用量，避免「小份但高密度」。" },
      { label: "微量元素", text: "探索新食材时顺带覆盖不同颜色蔬果，有助于获取多样植物化学物与抗氧化物。" },
      { label: "规律", text: "保持固定进餐节律，不因「等好店」而长期跳过正餐，稳定血糖有助于控制后续暴食。" }
    ],
    "R-X-G-P": [
      { label: "跨界混搭", text: "鹅肝、芝士、火锅、奶茶等同桌时，建议共享分食、减少单人份量，并搭配无糖茶或气泡水解腻。" },
      { label: "饱和脂肪", text: "高脂食材（奶酪、油炸、肥牛）建议分散到不同餐次，避免单餐饱和脂肪超过每日建议量。" },
      { label: "益生菌", text: "饮食多变时可适量摄入发酵食品（无糖酸奶、泡菜），支持肠道菌群多样性，但注意钠含量。" }
    ],
    "L-C-S-O": [
      { label: "酸辣平衡", text: "酸辣清爽型总体较均衡，但仍需控制总钠。泡菜、酸汤粉等可减盐版，并保证优质蛋白与全谷物摄入。" },
      { label: "维 C", text: "酸味来源（柑橘、番茄）富含维生素 C，有助于非血红素铁吸收，搭配豆类或菠菜效果更好。" },
      { label: "刺激度", text: "若酸辣导致胃部不适，可降低辣椒用量、避免空腹，并用温食代替过冷冰饮与热辣同餐。" }
    ],
    "L-C-S-P": [
      { label: "冷热交替", text: "冰饮配辣食可能刺激肠胃。建议冰饮与辣食间隔 15–30 分钟，或选常温/温饮，减少痉挛与腹泻风险。" },
      { label: "补水", text: "辣味促进出汗，夏季更需主动补水。运动饮料仅在大量出汗时使用，日常以白开水为主。" },
      { label: "零食", text: "辣味小吃能量密度不低，可预分小袋份量，搭配黄瓜、番茄等低能量蔬菜增加体积感。" }
    ],
    "L-C-G-O": [
      { label: "清淡≠少营养", text: "偏好清鲜者需确保蛋白质充足（每日约 1.0–1.2g/kg 体重），避免长期「只吃草」导致肌肉流失与贫血。" },
      { label: "铁与 B12", text: "若偏素食或极清淡，注意铁、锌、维生素 B12 来源，可适量摄入海苔、强化食品或遵医嘱补充。" },
      { label: "烹饪油", text: "清蒸、白灼也要用少量好油（亚麻籽油、橄榄油后放）帮助脂溶性维生素吸收。" }
    ],
    "L-C-G-P": [
      { label: "下午茶", text: "甜品与饮品建议作为加餐而非替代正餐，每次添加糖控制在 25g 以内，并选含坚果、燕麦的选项增加饱腹感。" },
      { label: "GI 管理", text: "精制糖与糕点升糖快，可搭配蛋白质（牛奶、希腊酸奶）减缓血糖波动，减少午后困倦。" },
      { label: "活动", text: "轻食散步型适合餐后 10–15 分钟轻度活动，帮助血糖稳定与消化，不必高强度。" }
    ],
    "L-X-S-O": [
      { label: "茶与餐", text: "茶感、冷萃高时，单宁可能影响铁吸收。富铁餐（红肉、菠菜）与浓茶间隔 1 小时，或餐间饮茶。" },
      { label: "咖啡因", text: "冷萃咖啡因浓度常高于热泡，敏感者下午 2 点后控制摄入，保障 7–8 小时睡眠。" },
      { label: "复杂度", text: "复杂清爽结构（香料、酸、苦）仍可能含隐藏糖或钠，阅读标签，自制时控制添加量。" }
    ],
    "L-X-S-P": [
      { label: "果酸", text: "柠檬、酸嘢等果酸丰富，但过量可能伤牙与胃。随餐食用、及时漱口，胃食管反流者适量。" },
      { label: "新品", text: "季节限定与新品常含糖。可选半糖/微糖，或用新鲜水果自制，减少果葡糖浆摄入。" },
      { label: "防晒与维 C", text: "夏季清爽冒险餐可搭配富含维 C 的果蔬（猕猴桃、彩椒），支持皮肤健康与免疫，但不能替代防晒。" }
    ],
    "L-X-G-O": [
      { label: "慢品", text: "茶室型慢食有利于正念饮食与饱腹感知。建议每餐 20 分钟以上，避免边工作边吃导致过量。" },
      { label: "茶碱", text: "多道茶饮时注意累计咖啡因与茶碱，晚间改选低咖啡因茶（如熟普、花草茶）。" },
      { label: "点心", text: "精致茶点往往高糖高脂，可「一块原则」：每种只尝一块，主餐保证蛋白质与蔬菜。" }
    ],
    "L-X-G-P": [
      { label: "颜值陷阱", text: "果茶、轻食碗外观健康但可能高糖高卡。关注配料表前三位是否含糖、炼乳、奶油，优先选真实水果与无糖茶底。" },
      { label: "蛋白质", text: "轻食若缺少蛋白易饿得快。加鸡蛋、鸡胸、豆腐或鹰嘴豆，使每餐至少含 20–30g 蛋白质。" },
      { label: "纤维", text: "新品打卡时顺手加一份蔬菜或奇亚籽，目标每日膳食纤维 25–30g，稳定血糖与肠道。" }
    ],
    "E-LOCAL": [
      { label: "精制碳水", text: "江南细糯型易偏多精制米面。建议每日至少 1/3 主食为全谷物或杂豆，控制糖油混合物（糕团、酥点）频率。" },
      { label: "河海鲜", text: "河海鲜提供优质蛋白与 omega-3，但注意汞含量较高的大型肉食性鱼类不宜过量，每周 2–3 次即可。" },
      { label: "糖度", text: "鲜甜风格注意菜肴中的冰糖、糟卤与糖醋用量，外食可选「少糖」「少油」并主动要烫洗蔬菜。" }
    ],
    "W-LOCAL": [
      { label: "红油", text: "川渝风味常高油高辣。建议用干碟代替油碟、选清汤锅底涮菜，并每周安排无辣清淡日让肠胃休息。" },
      { label: "蔬菜", text: "火锅、麻辣烫务必「半盘绿」：叶菜、菌菇、冬瓜等吸油较少，先涮菜后涮肉。" },
      { label: "肠道", text: "持续重辣可能改变肠道菌群。可穿插发酵食品与益生元（洋葱、香蕉），若出现持续不适请就医。" }
    ],
    "S-LOCAL": [
      { label: "糖水", text: "岭南甜润型需警惕糖水、奶茶与甜品叠加。建议每周设定「无糖日」，用新鲜水果与无糖凉茶替代。" },
      { label: "湿热", text: "高温高湿环境更需补水与电解质，但避免长期大量含糖电解质饮料；清淡汤品与椰子水适量即可。" },
      { label: "生熟", text: "生滚、白切等讲究新鲜，夏季注意生熟分开、及时冷藏剩余食物，降低细菌繁殖风险。" }
    ],
    "N-LOCAL": [
      { label: "碳水", text: "北方硬菜型碳水比例常偏高。建议每餐保留拳头大小主食，其余用蔬菜填充，并选全麦面、杂粮馒头。" },
      { label: "红肉", text: "大块肉香满足但饱和脂肪较高。每周红肉控制在 3–4 次，其余用鱼、禽、豆制品替代，搭配大蒜、洋葱助风味。" },
      { label: "温度", text: "热食有助于冬季保暖，但避免过烫（＞65℃）长期损伤食管黏膜，稍凉至温热再入口。" }
    ]
  };

  function buildDietAdvice(report) {
    var code = report && report.personality && report.personality.code;
    var base = (code && DIET_ADVICE[code]) ? DIET_ADVICE[code].slice() : [];
    var topTastes = (report && report.topTastes) || [];
    var topKey;
    var axisTip;
    var i;
    var seenLabels;

    if (!base.length) {
      base = [
        { label: "均衡", text: "中国居民膳食指南建议：食物多样、谷类为主，每日摄入 12 种以上食物，每周 25 种以上，搭配足量蔬果与优质蛋白。" },
        { label: "控盐控糖", text: "成人每日食盐不超过 5g，添加糖不超过 50g。外食主动要求少盐少糖，家庭烹饪优先蒸、煮、炖。" },
        { label: "活动", text: "每周至少 150 分钟中等强度运动，减少久坐，有助于代谢多余能量与改善心血管健康。" }
      ];
    }

    if (topTastes.length) {
      topKey = topTastes[0].key;
      axisTip = AXIS_DIET_ADVICE[topKey];
      seenLabels = {};
      for (i = 0; i < base.length; i += 1) {
        seenLabels[base[i].label] = true;
      }
      if (axisTip && !seenLabels[axisTip.label]) {
        base.push(axisTip);
      }
    }

    return base.slice(0, 4);
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function normalizeSelection(names) {
    var out = [];
    var seen = {};
    var i;
    var name;

    if (!names || !names.length) return out;

    for (i = 0; i < names.length; i += 1) {
      name = String(names[i] || "").trim();
      if (!name || seen[name]) continue;
      seen[name] = true;
      out.push(name);
    }

    return out;
  }

  function getFoodsApi() {
    return global.Yummi && global.Yummi.foods;
  }

  function getTasteApi() {
    return global.Yummi && global.Yummi.foodTaste;
  }

  function getFoodCategory(name) {
    var foods = getFoodsApi();
    var cats = foods && foods.categories;
    var cat;

    if (!cats) return "";

    for (cat in cats) {
      if (hasOwn(cats, cat) && cats[cat].indexOf(name) >= 0) {
        return cat;
      }
    }

    return "";
  }

  function categoryWeight(name) {
    var category = getFoodCategory(name);
    return CATEGORY_WEIGHTS[category] || 0.75;
  }

  function emptyRegionScores() {
    var scores = {};
    var i;
    for (i = 0; i < REGION_ORDER.length; i += 1) {
      scores[REGION_ORDER[i]] = 0;
    }
    return scores;
  }

  function normalizeWeights(weights) {
    var out = emptyRegionScores();
    var i;
    var key;

    for (i = 0; i < REGION_ORDER.length; i += 1) {
      key = REGION_ORDER[i];
      out[key] = Number(weights && weights[key]) || 0;
    }

    return out;
  }

  function fallbackRegionEntry(name) {
    var tasteApi = getTasteApi();
    var record = tasteApi && tasteApi.get ? tasteApi.get(name) : null;
    var tempBoost = record && record.temp > 0 ? 10 : 0;
    var weights;

    if (!record) {
      return regionEntry({ east: 20, west: 20, south: 20, north: 20, central: 20 }, 0.35);
    }

    weights = {
      east: (record.fresh * 0.32) + (record.sweet * 0.24) + (record.umami * 0.26) + (record.sour * 0.18),
      west: (record.spicy * 0.42) + (record.oily * 0.24) + (record.salty * 0.2) + (record.umami * 0.14),
      south: (record.fresh * 0.36) + (record.sweet * 0.26) + (record.sour * 0.24) + (record.umami * 0.14),
      north: (record.salty * 0.34) + (record.umami * 0.24) + (record.oily * 0.24) + (record.sweet * 0.08) + tempBoost,
      central: (record.spicy * 0.3) + (record.sour * 0.24) + (record.umami * 0.22) + (record.salty * 0.14) + (record.oily * 0.1)
    };

    return regionEntry(weights, 0.55);
  }

  function sortScores(scores) {
    return REGION_ORDER.map(function (key) {
      return {
        key: key,
        label: REGION_META[key].label,
        shortLabel: REGION_META[key].shortLabel,
        score: Math.max(0, Number(scores[key]) || 0)
      };
    }).sort(function (a, b) {
      return b.score - a.score;
    });
  }

  function distributePercent(items, valueKey) {
    var total = items.reduce(function (sum, item) {
      return sum + Math.max(0, Number(item[valueKey]) || 0);
    }, 0);
    var raw;
    var floors;
    var remainder;
    var order;
    var i;

    if (!items.length) return [];

    if (!total) {
      return items.map(function (item, index) {
        return Object.assign({}, item, {
          percent: index === items.length - 1
            ? 100 - Math.floor(100 / items.length) * (items.length - 1)
            : Math.floor(100 / items.length)
        });
      });
    }

    raw = items.map(function (item) {
      return (Math.max(0, Number(item[valueKey]) || 0) / total) * 100;
    });
    floors = raw.map(function (value) {
      return Math.floor(value);
    });
    remainder = 100 - floors.reduce(function (sum, value) {
      return sum + value;
    }, 0);
    order = raw.map(function (value, index) {
      return { index: index, fraction: value - floors[index] };
    }).sort(function (a, b) {
      return b.fraction - a.fraction;
    });

    for (i = 0; i < remainder; i += 1) {
      floors[order[i % order.length].index] += 1;
    }

    return items.map(function (item, index) {
      return Object.assign({}, item, { percent: floors[index] });
    });
  }

  function computeRegion(names) {
    var scores = emptyRegionScores();
    var foodRegions = [];
    var strongByRegion = emptyRegionScores();
    var i;
    var j;
    var name;
    var entry;
    var weights;
    var weight;
    var categoryBoost;
    var primaryFoodRegion;
    var ranking;
    var total;
    var primary;
    var second;
    var supportFoods;

    for (i = 0; i < names.length; i += 1) {
      name = names[i];
      entry = REGION_WEIGHTS[name] || fallbackRegionEntry(name);
      weights = normalizeWeights(entry.weights);
      weight = Number(entry.confidence) || 0.45;
      categoryBoost = categoryWeight(name);
      primaryFoodRegion = REGION_ORDER[0];

      for (j = 0; j < REGION_ORDER.length; j += 1) {
        if (weights[REGION_ORDER[j]] > weights[primaryFoodRegion]) {
          primaryFoodRegion = REGION_ORDER[j];
        }
      }

      for (j = 0; j < REGION_ORDER.length; j += 1) {
        scores[REGION_ORDER[j]] += weights[REGION_ORDER[j]] * weight * categoryBoost;
      }

      if (weight >= 0.8) {
        strongByRegion[primaryFoodRegion] += 1;
      }

      foodRegions.push({
        name: name,
        primaryRegion: primaryFoodRegion,
        confidence: weight,
        categoryWeight: categoryBoost,
        weights: weights
      });
    }

    ranking = sortScores(scores);
    total = ranking.reduce(function (sum, item) {
      return sum + item.score;
    }, 0);
    primary = ranking[0] || { key: "central", label: REGION_META.central.label, score: 0 };
    second = ranking[1] || { score: 0 };
    supportFoods = foodRegions.map(function (item) {
      return {
        name: item.name,
        primaryRegion: item.primaryRegion,
        confidence: item.confidence,
        contribution: Math.round((item.weights[primary.key] || 0) * item.confidence * item.categoryWeight)
      };
    }).filter(function (item) {
      return item.contribution > 0;
    }).sort(function (a, b) {
      return b.contribution - a.contribution;
    }).slice(0, 3);

    primary = Object.assign({}, primary, {
      percent: total ? Math.round((primary.score / total) * 100) : 0,
      lead: total ? Math.round(((primary.score - second.score) / total) * 100) : 0,
      strongCount: strongByRegion[primary.key] || 0,
      summary: REGION_META[primary.key].summary,
      supportFoods: supportFoods
    });

    return {
      scores: scores,
      ranking: ranking,
      primary: primary,
      strongByRegion: strongByRegion,
      foodRegions: foodRegions
    };
  }

  function sourceFoodsForTaste(axisKey, names) {
    var tasteApi = getTasteApi();

    if (!tasteApi || !tasteApi.get) return [];

    return names.map(function (name) {
      var record = tasteApi.get(name);
      return {
        name: name,
        value: record ? Math.max(0, Number(record[axisKey]) || 0) : 0
      };
    }).filter(function (item) {
      return item.value > 0;
    }).sort(function (a, b) {
      return b.value - a.value;
    }).slice(0, 2);
  }

  function enrichTasteInsights(top4, names) {
    return (top4 || []).map(function (item) {
      var sources = sourceFoodsForTaste(item.key, names);
      var sourceText = sources.length
        ? "主要由 " + sources.map(function (source) {
            return source.name;
          }).join("、") + " 把这一项顶上去。"
        : "";

      return Object.assign({}, item, {
        sourceFoods: sources,
        sourceText: sourceText
      });
    });
  }

  function computeTopTastes(profile) {
    var entries = Object.keys(AXIS_META).map(function (key) {
      return {
        key: key,
        label: AXIS_META[key].label,
        title: AXIS_META[key].title,
        value: Math.max(0, Number(profile && profile[key]) || 0),
        summary: AXIS_META[key].summary,
        detail: AXIS_META[key].detail
      };
    }).sort(function (a, b) {
      if (b.value !== a.value) return b.value - a.value;
      return a.label.localeCompare(b.label);
    });

    return {
      top3: distributePercent(entries.slice(0, 3), "value"),
      top4: entries.slice(0, 4)
    };
  }

  function categoryDiversity(names) {
    var seen = {};
    var count = 0;
    var i;
    var category;

    for (i = 0; i < names.length; i += 1) {
      category = getFoodCategory(names[i]) || "未知";
      if (!seen[category]) {
        seen[category] = true;
        count += 1;
      }
    }

    return count;
  }

  function share(names, lookup) {
    var hit = 0;
    var i;

    if (!names.length) return 0;

    for (i = 0; i < names.length; i += 1) {
      if (lookup[names[i]]) hit += 1;
    }

    return hit / names.length;
  }

  function computeCoreCode(profile, names, top4) {
    var p = profile || {};
    var richScore = (p.spicy * 0.3) + (p.oily * 0.24) + (p.salty * 0.18) + (p.umami * 0.18) + (p.bitter * 0.1);
    var lightScore = (p.fresh * 0.36) + (p.sweet * 0.22) + (p.sour * 0.16) + (p.umami * 0.14) + (p.bitter * 0.12);
    var noveltyScore = (p.sour * 0.2) + (p.spicy * 0.2) + (p.bitter * 0.2) + (p.fresh * 0.14) + (share(names, NOVELTY_FOODS) * 45) + (categoryDiversity(names) * 5);
    var classicScore = (p.salty * 0.24) + (p.umami * 0.24) + (p.sweet * 0.16) + (p.oily * 0.14) + (share(names, COMFORT_FOODS) * 45);
    var stimulusScore = (p.spicy * 0.42) + (p.sour * 0.24) + (p.bitter * 0.18) + (p.salty * 0.16);
    var gentleScore = (p.sweet * 0.3) + (p.umami * 0.28) + (p.fresh * 0.24) + (p.oily * 0.12) + (100 - Math.max(0, p.spicy || 0)) * 0.06;
    var dominance = top4 && top4.length >= 4 ? Math.max(0, top4[0].value - top4[3].value) : 0;
    var orderScore = (dominance * 1.3) + (share(names, COMFORT_FOODS) * 30) + (names.length <= 3 ? 12 : 0);
    var playfulScore = ((100 - dominance) * 0.32) + (categoryDiversity(names) * 10) + (share(names, NOVELTY_FOODS) * 32);

    return [
      richScore >= lightScore ? "R" : "L",
      classicScore >= noveltyScore ? "C" : "X",
      stimulusScore >= gentleScore ? "S" : "G",
      orderScore >= playfulScore ? "O" : "P"
    ].join("-");
  }

  function shouldUseRegionSpecial(region) {
    var primary = region && region.primary;

    if (!primary) return false;
    if (primary.key === "central") return false;

    return (
      primary.percent >= SPECIAL_REGION_THRESHOLD &&
      primary.lead >= SPECIAL_REGION_LEAD &&
      primary.strongCount >= SPECIAL_REGION_STRONG_COUNT
    );
  }

  function coreLabels(code) {
    return String(code || "").split("-").map(function (letter) {
      return CORE_LETTER_LABELS[letter] || letter;
    });
  }

  function buildReasonSummary(topTastes, region, coreType, isRegionSpecial) {
    var tasteText = (topTastes || []).map(function (item) {
      return item.label + item.percent + "%";
    }).join(" / ");
    var regionFoods = region && region.primary && region.primary.supportFoods
      ? region.primary.supportFoods.map(function (item) {
          return item.name;
        }).join("、")
      : "";
    var base = "系统判定依据：前三口味是 " + tasteText + "，地域信号落在" +
      (region && region.primary ? region.primary.label + " " + region.primary.percent + "%" : "未定") + "。";

    if (regionFoods) {
      base += " 其中 " + regionFoods + " 是最明显的地域证据。";
    }

    if (isRegionSpecial) {
      return base + " 地域信号足够强，所以本次覆盖核心型，进入地域特调人格。";
    }

    return base + " 核心型由 " + coreLabels(coreType && coreType.code).join("、") + " 组合推导。";
  }

  function analyze(selectionNames) {
    var names = normalizeSelection(selectionNames);
    var tasteApi = getTasteApi();
    var aggregate;
    var topTastes;
    var region;
    var coreCode;
    var coreType;
    var personality;
    var isRegionSpecial;
    var usedNames;
    var tasteInsights;
    var reasonSummary;

    if (!names.length) {
      return { ok: false, error: "empty_selection" };
    }

    if (!tasteApi || !tasteApi.profileFromSelection) {
      return { ok: false, error: "taste_unavailable" };
    }

    aggregate = tasteApi.profileFromSelection(names);
    if (!aggregate || !aggregate.count) {
      return { ok: false, error: "no_valid_foods" };
    }

    usedNames = aggregate.used || names;
    topTastes = computeTopTastes(aggregate.profile);
    tasteInsights = enrichTasteInsights(topTastes.top4, usedNames);
    region = computeRegion(usedNames);
    coreCode = computeCoreCode(aggregate.profile, usedNames, topTastes.top4);
    coreType = CORE_TYPES[coreCode] || CORE_TYPES["R-C-S-O"];
    isRegionSpecial = shouldUseRegionSpecial(region);
    personality = isRegionSpecial ? REGION_TYPES[region.primary.key] : coreType;
    reasonSummary = buildReasonSummary(topTastes.top3, region, coreType, isRegionSpecial);

    return {
      ok: true,
      version: 1,
      names: names,
      used: aggregate.used,
      skipped: aggregate.skipped,
      count: aggregate.count,
      profile: aggregate.profile,
      personality: personality,
      corePersonality: coreType,
      isRegionSpecial: isRegionSpecial,
      reasonSummary: reasonSummary,
      coreLabels: coreLabels(coreType.code),
      topTastes: topTastes.top3,
      tasteInsights: tasteInsights,
      region: region,
      dietAdvice: buildDietAdvice({
        personality: personality,
        topTastes: topTastes.top3
      })
    };
  }

  global.Yummi = global.Yummi || {};
  global.Yummi.foodPersonality = {
    version: 1,
    axisMeta: AXIS_META,
    regionMeta: REGION_META,
    coreTypes: CORE_TYPES,
    regionTypes: REGION_TYPES,
    regionWeights: REGION_WEIGHTS,
    axisDietAdvice: AXIS_DIET_ADVICE,
    dietAdvice: DIET_ADVICE,
    buildDietAdvice: buildDietAdvice,
    analyze: analyze
  };
})(typeof window !== "undefined" ? window : this);
