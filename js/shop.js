/**
 * 店铺详情页 — 背景展示与食客留言
 */
(function (global) {
  "use strict";

  // 店铺数据（与 social-map.js 保持一致）
  var SHOPS = [
    { file: "shop_starbucks-10kb.webp", name: "星巴克", tag: "饮品", desc: "浓郁咖啡香，午后阳光里的温柔驻足。" },
    { file: "shop_mcdonalds-10kb.webp", name: "麦当劳", tag: "主食", desc: "经典滋味，快节奏里的小确幸。" },
    { file: "shop_heytea-10kb.webp", name: "喜茶", tag: "饮品", desc: "灵感之茶，每一杯都是小型创作。" },
    { file: "shop_kfc-10kb.webp", name: "肯德基", tag: "主食", desc: "酥脆吮指，熟悉的味道最安心。" },
    { file: "shop_haidilao-10kb.webp", name: "海底捞", tag: "主食", desc: "热气腾腾的相聚，服务里藏着温度。" },
    { file: "shop_mixue-10kb.webp", name: "蜜雪冰城", tag: "饮品", desc: "平价甜蜜，简单纯粹的快乐。" },
    { file: "shop_luckin-10kb.webp", name: "瑞幸咖啡", tag: "饮品", desc: "便捷好咖啡，日常里的小提神。" },
    { file: "shop_burgerking-10kb.webp", name: "汉堡王", tag: "主食", desc: "火烤风味，大口吃肉的满足。" },
    { file: "shop_chapanda-10kb.webp", name: "茶百道", tag: "饮品", desc: "茶香悠扬，鲜果与奶盖的邂逅。" },
    { file: "shop_pizzahut-10kb.webp", name: "必胜客", tag: "主食", desc: "拉丝芝士，分享时刻的最佳选择。" },
    { file: "shop_nayuki-10kb.webp", name: "奈雪的茶", tag: "饮品", desc: "一杯好茶，一口软欧包的惬意。" },
    { file: "shop_subway-10kb.webp", name: "赛百味", tag: "主食", desc: "新鲜现做，轻盈无负担的三明治。" },
    { file: "shop_alittle_tea-10kb.webp", name: "一点点", tag: "饮品", desc: "台式经典，随心搭配的小满足。" },
    { file: "shop_auntea-10kb.webp", name: "沪上阿姨", tag: "饮品", desc: "五谷茶饮，熬煮出的醇厚温暖。" },
    { file: "shop_goodme-10kb.webp", name: "古茗", tag: "饮品", desc: "江南茶饮，清爽不甜腻的日常。" },
    { file: "shop_laoxiangji-10kb.webp", name: "老乡鸡", tag: "主食", desc: "家常中式快餐，干净卫生的温暖食堂。" }
  ];

  var SVG_BASE = "source/svgSHOP/";

  // ============================================================
  // 【小猫位置配置】每个店铺独立配置，可手动调整
  //
  // 说明：
  //   - SHOP_CATS 是一个数组，索引 0~15 对应 16 个店铺
  //   - 每个店铺对应一个「小猫数组」，里面放 2~4 只猫
  //   - 每只猫是一个对象，包含以下字段：
  //       img   : 图片路径（如 "source/compressed/10kb/CatImage/cat1.jpg"）
  //       left  : 距离背景左侧的距离（百分比如 "30%" 或像素如 "100px"）
  //       top   : 距离背景顶部的距离（百分比如 "60%" 或像素如 "200px"）
  //       width : 图片显示宽度（如 "40px"）
  //       alt   : 图片描述（可选）
  //
  // 当前店铺顺序（与 SHOPS 数组对应）：
  //   0=星巴克  1=麦当劳  2=喜茶  3=肯德基  4=海底捞  5=蜜雪冰城
  //   6=瑞幸    7=汉堡王  8=茶百道 9=必胜客 10=奈雪   11=赛百味
  //   12=一点点 13=沪上阿姨 14=古茗 15=老乡鸡
  // ============================================================
  var SHOP_CATS = [
    // 0 星巴克
    [
      { img: "source/compressed/10kb/CatImage/cat2-10kb.webp",  left: "40%", top: "80%", width: "42px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "55%", top: "72%", width: "38px", alt: "小猫B" },
    ],
    // 1 麦当劳
    [
      { img: "source/compressed/10kb/CatImage/cat2-10kb.webp", left: "25%", top: "80%", width: "40px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat4-10kb.webp",  left: "60%", top: "65%", width: "36px", alt: "小猫B" },
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "45%", top: "85%", width: "44px", alt: "小猫C" },
    ],
    // 2 喜茶
    [
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "30%", top: "70%", width: "38px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat2-10kb.webp", left: "70%", top: "65%", width: "42px", alt: "小猫B" },
    ],
    // 3 肯德基
    [
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "15%", top: "58%", width: "40px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat4-10kb.webp",  left: "50%", top: "75%", width: "36px", alt: "小猫B" },
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "10%", top: "85%", width: "44px", alt: "小猫C" },
    ],
    // 4 海底捞
    [
      
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp", left: "60%", top: "68%", width: "38px", alt: "小猫B" },
    ],
    // 5 蜜雪冰城
    [
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "15%", top: "57%", width: "40px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat4-10kb.webp",  left: "75%", top: "72%", width: "36px", alt: "小猫B" },
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "55%", top: "82%", width: "42px", alt: "小猫C" },
    ],
    // 6 瑞幸咖啡
    [
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "19%", top: "55%", width: "38px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat2-10kb.webp", left: "68%", top: "75%", width: "44px", alt: "小猫B" },
    ],
    // 7 汉堡王
    [
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "18%", top: "70%", width: "40px", alt: "小猫A" },
      
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "40%", top: "78%", width: "42px", alt: "小猫C" },
    ],
    // 8 茶百道
    [
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "37%", top: "63%", width: "40px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat2-10kb.webp", left: "54%", top: "63%", width: "38px", alt: "小猫B" },
    ],
    // 9 必胜客
    [
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "10%", top: "53%", width: "42px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat4-10kb.webp",  left: "64%", top: "70%", width: "36px", alt: "小猫B" },
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "44%", top: "80%", width: "44px", alt: "小猫C" },
    ],
    // 10 奈雪的茶
    [
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "26%", top: "85%", width: "38px", alt: "小猫A" },
      
    ],
    // 11 赛百味
    [
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "20%", top: "69%", width: "40px", alt: "小猫A" },
      
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "80%", top: "76%", width: "42px", alt: "小猫C" },
    ],
    // 12 一点点
    [
      { img: "source/compressed/10kb/CatImage/cat4-10kb.webp",  left: "15%", top: "64%", width: "40px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp", left: "74%", top: "85%", width: "38px", alt: "小猫B" },
    ],
    // 13 沪上阿姨
    [
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "16%", top: "64%", width: "42px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat4-10kb.webp",  left: "56%", top: "73%", width: "36px", alt: "小猫B" },
      { img: "source/compressed/10kb/CatImage/cat5-10kb.webp",  left: "38%", top: "83%", width: "44px", alt: "小猫C" },
    ],
    // 14 古茗
    [
      { img: "source/compressed/10kb/CatImage/cat4-10kb.webp",  left: "30%", top: "85%", width: "38px", alt: "小猫A" },
      
    ],
    // 15 老乡鸡
    [
      { img: "source/compressed/10kb/CatImage/cat3-10kb.webp",  left: "22%", top: "56%", width: "40px", alt: "小猫A" },
      { img: "source/compressed/10kb/CatImage/cat4-10kb.webp",  left: "62%", top: "73%", width: "36px", alt: "小猫B" },
      
    ],
  ];
  // ============================================================

  function getParam(name) {
    var search = window.location.search;
    if (!search) return "";
    var pairs = search.slice(1).split("&");
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      if (decodeURIComponent(pair[0]) === name) {
        return decodeURIComponent(pair[1] || "");
      }
    }
    return "";
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getShopIndex() {
    var raw = getParam("shop");
    var index = parseInt(raw, 10);
    if (isNaN(index) || index < 0 || index >= SHOPS.length) return -1;
    return index;
  }

  function getSvgFile(shopFile) {
    // shop_starbucks.png → starbucks → interior_starbucks.svg
    var name = shopFile.replace(/^shop_/, "").replace(/-10kb\.webp$/, "").replace(/\.png$/, "");
    return SVG_BASE + "interior_" + name + ".svg";
  }

  function init() {
    var index = getShopIndex();
    currentShopIndex = index;
    if (index === -1) {
      document.body.innerHTML =
        '<div class="shop-error">' +
          '<p class="shop-error__text">店铺不存在</p>' +
          '<a href="social-map.html" class="shop-back" style="position:static;">返回街区</a>' +
        '</div>';
      return;
    }

    var shop = SHOPS[index];

    var bgImg = document.getElementById("shopBgImg");
    if (bgImg) {
      bgImg.src = getSvgFile(shop.file);
      bgImg.alt = shop.name + "店内";
    }

    setupComparePanel();

    // 渲染该店铺的小猫（绑定访客数据）
    var catsContainer = document.getElementById("shopCats");
    var visitors = VISITOR_DATA[index] || [];
    if (catsContainer) {
      var cats = SHOP_CATS[index] || [];
      var html = "";
      for (var i = 0; i < cats.length; i++) {
        var c = cats[i];
        var visitor = visitors[i];
        if (!c || !visitor || !visitor.preference) {
          continue;
        }
        html +=
          '<div class="shop-cat" style="left:' + escapeHtml(c.left) +
          ';top:' + escapeHtml(c.top) + ';" data-visitor-index="' + i + '">' +
            '<img class="shop-cat__img" src="' + escapeHtml(c.img) +
            '" alt="' + escapeHtml(visitor.name) +
            '" width="' + escapeHtml(c.width) +
            '" style="width:' + escapeHtml(c.width) + ';">' +
            '<span class="shop-cat__name">' + escapeHtml(visitor.name) + "的哈基米</span>" +
          '</div>';
      }
      catsContainer.innerHTML = html;
      bindCatClicks(catsContainer, visitors);
    }

    // 进入店铺时自动显示一条访客留言（2 秒后消失）
    if (visitors.length > 0) {
      showAutoMessage(visitors);
    }
  }

  function showAutoMessage(visitors) {
    var layer = document.getElementById("shopToastLayer");
    var catsContainer = document.getElementById("shopCats");
    if (!layer || !catsContainer) return;

    // 清空旧 toast
    layer.innerHTML = "";

    var containerRect = catsContainer.getBoundingClientRect();
    var containerW = containerRect.width;

    for (var idx = 0; idx < visitors.length; idx++) {
      var v = visitors[idx];
      var cat = catsContainer.querySelector('.shop-cat[data-visitor-index="' + idx + '"]');
      if (!cat) continue;

      var catRect = cat.getBoundingClientRect();
      var catCenterX = catRect.left + catRect.width / 2 - containerRect.left;
      var catTop = catRect.top - containerRect.top;

      // 创建 toast 元素
      var toast = document.createElement("div");
      toast.className = "shop-toast";
      toast.innerHTML = '<div class="shop-toast__content"><strong>' + escapeHtml(v.name) + '</strong>：' + escapeHtml(v.message) + '</div>';
      layer.appendChild(toast);

      // 计算位置
      var toastW = toast.offsetWidth;
      var toastH = toast.offsetHeight;
      var gap = 10;
      var left = catCenterX - toastW / 2;
      var top = catTop - toastH - gap;

      if (left < 8) left = 8;
      if (left + toastW > containerW - 8) left = containerW - toastW - 8;

      toast.style.left = left + "px";
      toast.style.top = top + "px";

      // 触发显示动画
      requestAnimationFrame(function (el) {
        return function () {
          el.classList.add("shop-toast--show");
        };
      }(toast));
    }

    // 5 秒后全部消失
    setTimeout(function () {
      var toasts = layer.querySelectorAll(".shop-toast");
      for (var i = 0; i < toasts.length; i++) {
        toasts[i].classList.remove("shop-toast--show");
      }
      // 动画结束后清空 DOM
      setTimeout(function () {
        layer.innerHTML = "";
      }, 400);
    }, 5000);
  }

  var VISITOR_DATA = [
    // 0 星巴克
    [
      { name: "小橘", avatar: "🐱", visits: 12, message: "这里的拿铁是我的最爱，每次来都要坐窗边发呆。", preference: { sweet: 55, salty: 20, sour: 15, spicy: 5, bitter: 35, umami: 30, oily: 25, fresh: 40 } },
      { name: "阿白", avatar: "🐈", visits: 5, message: "带朋友来过两次，环境很安静适合聊天。", preference: { sweet: 40, salty: 25, sour: 20, spicy: 10, bitter: 45, umami: 35, oily: 20, fresh: 50 } },
    ],
    // 1 麦当劳
    [
      { name: "胖橘", avatar: "🐱", visits: 28, message: "麦辣鸡腿堡永远的神！已经吃了一个月了。", preference: { sweet: 35, salty: 70, sour: 15, spicy: 55, bitter: 10, umami: 60, oily: 65, fresh: 25 } },
      { name: "三花", avatar: "🐈", visits: 7, message: "甜筒第二件半价的时候必来。", preference: { sweet: 75, salty: 15, sour: 10, spicy: 5, bitter: 5, umami: 20, oily: 30, fresh: 35 } },
      { name: "黑猫", avatar: "🐈‍⬛", visits: 3, message: "早餐的卡布奇诺套餐性价比很高。", preference: { sweet: 25, salty: 40, sour: 10, spicy: 5, bitter: 50, umami: 30, oily: 20, fresh: 35 } },
    ],
    // 2 喜茶
    [
      { name: "奶茶猫", avatar: "🐱", visits: 15, message: "芋泥波波牛乳YYDS，每次都要加双倍芋泥！", preference: { sweet: 80, salty: 15, sour: 10, spicy: 0, bitter: 5, umami: 25, oily: 20, fresh: 45 } },
      { name: "奶盖", avatar: "🐈", visits: 9, message: "芝士奶盖系列没有踩雷过，推荐！", preference: { sweet: 65, salty: 25, sour: 15, spicy: 5, bitter: 10, umami: 40, oily: 35, fresh: 50 } },
    ],
    // 3 肯德基
    [
      { name: "炸鸡控", avatar: "🐱", visits: 20, message: "原味鸡要三角部位的，懂得都懂。", preference: { sweet: 20, salty: 65, sour: 15, spicy: 45, bitter: 10, umami: 70, oily: 60, fresh: 20 } },
      { name: "蛋挞猫", avatar: "🐈", visits: 8, message: "葡式蛋挞刚出炉的时候最好吃，外酥里嫩。", preference: { sweet: 70, salty: 25, sour: 10, spicy: 5, bitter: 8, umami: 35, oily: 40, fresh: 30 } },
      { name: "汉堡", avatar: "🐈‍⬛", visits: 4, message: "嫩牛五方回归的时候激动坏了。", preference: { sweet: 30, salty: 60, sour: 20, spicy: 40, bitter: 10, umami: 65, oily: 55, fresh: 25 } },
    ],
    // 4 海底捞
    [
      { name: "火锅猫", avatar: "🐱", visits: 10, message: "一个人来吃火锅也很开心，服务员超贴心。", preference: { sweet: 25, salty: 55, sour: 20, spicy: 80, bitter: 15, umami: 75, oily: 60, fresh: 35 } },
      { name: "番茄", avatar: "🐈", visits: 6, message: "番茄锅汤底可以喝三碗，每次必点。", preference: { sweet: 40, salty: 45, sour: 55, spicy: 20, bitter: 10, umami: 70, oily: 30, fresh: 60 } },
    ],
    // 5 蜜雪冰城
    [
      { name: "雪王", avatar: "🐱", visits: 30, message: "四块钱的柠檬水还要什么自行车！", preference: { sweet: 60, salty: 10, sour: 45, spicy: 0, bitter: 5, umami: 15, oily: 10, fresh: 70 } },
      { name: "甜筒猫", avatar: "🐈", visits: 15, message: "两块钱的甜筒比KFC的还好吃。", preference: { sweet: 80, salty: 15, sour: 5, spicy: 0, bitter: 5, umami: 20, oily: 25, fresh: 30 } },
      { name: "蜜桃", avatar: "🐈‍⬛", visits: 8, message: "蜜桃四季春是隐藏宝藏。", preference: { sweet: 70, salty: 10, sour: 30, spicy: 0, bitter: 5, umami: 25, oily: 10, fresh: 65 } },
    ],
    // 6 瑞幸咖啡
    [
      { name: "生椰", avatar: "🐱", visits: 18, message: "生椰拿铁拯救了我的早八，每天一杯。", preference: { sweet: 45, salty: 20, sour: 10, spicy: 0, bitter: 55, umami: 30, oily: 25, fresh: 40 } },
      { name: "美式", avatar: "🐈", visits: 11, message: "美式提神效果一流，工作必备。", preference: { sweet: 10, salty: 25, sour: 15, spicy: 0, bitter: 75, umami: 20, oily: 15, fresh: 45 } },
    ],
    // 7 汉堡王
    [
      { name: "火烤", avatar: "🐱", visits: 14, message: "皇堡的肉饼是真的厚实，火烤味很香。", preference: { sweet: 25, salty: 60, sour: 15, spicy: 35, bitter: 15, umami: 70, oily: 55, fresh: 20 } },
      { name: "薯条", avatar: "🐈", visits: 6, message: "粗薯条比细的好吃多了，外脆里糯。", preference: { sweet: 20, salty: 55, sour: 10, spicy: 15, bitter: 10, umami: 50, oily: 60, fresh: 25 } },
      { name: "鸡条", avatar: "🐈‍⬛", visits: 3, message: "王道椒香鸡腿偶尔换换口味不错。", preference: { sweet: 30, salty: 55, sour: 15, spicy: 40, bitter: 10, umami: 60, oily: 50, fresh: 20 } },
    ],
    // 8 茶百道
    [
      { name: "豆乳", avatar: "🐱", visits: 13, message: "豆乳玉麒麟上面的黄豆粉绝了，必喝。", preference: { sweet: 65, salty: 20, sour: 10, spicy: 0, bitter: 10, umami: 40, oily: 25, fresh: 55 } },
      { name: "杨枝", avatar: "🐈", visits: 7, message: "杨枝甘露料超足，每次都要多加西米。", preference: { sweet: 70, salty: 15, sour: 35, spicy: 0, bitter: 5, umami: 45, oily: 20, fresh: 60 } },
    ],
    // 9 必胜客
    [
      { name: "芝士", avatar: "🐱", visits: 9, message: "超级至尊披萨的芝士能拉好长的丝！", preference: { sweet: 30, salty: 55, sour: 15, spicy: 10, bitter: 10, umami: 75, oily: 50, fresh: 20 } },
      { name: "意面", avatar: "🐈", visits: 5, message: "肉酱意面分量很足，一个人吃刚好。", preference: { sweet: 25, salty: 60, sour: 30, spicy: 15, bitter: 10, umami: 70, oily: 45, fresh: 25 } },
      { name: "小吃", avatar: "🐈‍⬛", visits: 2, message: "凤尾虾和烤翅拼盘是聚餐必点。", preference: { sweet: 25, salty: 50, sour: 15, spicy: 25, bitter: 10, umami: 60, oily: 55, fresh: 20 } },
    ],
    // 10 奈雪的茶
    [
      { name: "欧包", avatar: "🐱", visits: 16, message: "霸气芝士草莓+榴莲欧包，完美下午茶。", preference: { sweet: 75, salty: 15, sour: 20, spicy: 0, bitter: 5, umami: 30, oily: 25, fresh: 50 } },
      { name: "葡萄", avatar: "🐈", visits: 8, message: "多肉葡萄的果肉好多，每口都能嚼到。", preference: { sweet: 65, salty: 10, sour: 25, spicy: 0, bitter: 5, umami: 35, oily: 15, fresh: 60 } },
    ],
    // 11 赛百味
    [
      { name: "三明治", avatar: "🐱", visits: 11, message: "全麦面包+火鸡胸+蜂蜜芥末酱，减脂神器。", preference: { sweet: 30, salty: 50, sour: 20, spicy: 15, bitter: 10, umami: 55, oily: 30, fresh: 50 } },
      { name: "曲奇", avatar: "🐈", visits: 4, message: "白巧克力曲奇加热后超好吃。", preference: { sweet: 80, salty: 20, sour: 5, spicy: 0, bitter: 5, umami: 20, oily: 35, fresh: 20 } },
      { name: "金枪鱼", avatar: "🐈‍⬛", visits: 6, message: "金枪鱼三明治馅料很多，不会饿。", preference: { sweet: 20, salty: 55, sour: 15, spicy: 10, bitter: 10, umami: 65, oily: 35, fresh: 40 } },
    ],
    // 12 一点点
    [
      { name: "波霸", avatar: "🐱", visits: 22, message: "波霸奶茶三分糖去冰，喝了三年没变过。", preference: { sweet: 70, salty: 15, sour: 10, spicy: 0, bitter: 5, umami: 25, oily: 20, fresh: 45 } },
      { name: "四季", avatar: "🐈", visits: 10, message: "四季春茶加奶霜，清爽不腻。", preference: { sweet: 50, salty: 15, sour: 15, spicy: 0, bitter: 20, umami: 25, oily: 20, fresh: 65 } },
    ],
    // 13 沪上阿姨
    [
      { name: "血糯米", avatar: "🐱", visits: 17, message: "血糯米奶茶饱腹感很强，可以当早餐。", preference: { sweet: 65, salty: 20, sour: 10, spicy: 0, bitter: 10, umami: 40, oily: 25, fresh: 35 } },
      { name: "杨枝", avatar: "🐈", visits: 9, message: "杨枝甘露清爽版更适合夏天。", preference: { sweet: 60, salty: 15, sour: 30, spicy: 0, bitter: 5, umami: 40, oily: 15, fresh: 65 } },
      { name: "芋泥", avatar: "🐈‍⬛", visits: 5, message: "芋泥波波奶茶芋泥给好多，满足。", preference: { sweet: 75, salty: 15, sour: 10, spicy: 0, bitter: 5, umami: 30, oily: 20, fresh: 40 } },
    ],
    // 14 古茗
    [
      { name: "布蕾", avatar: "🐱", visits: 14, message: "布雷脆脆奶芙上面的碧根果碎好香！", preference: { sweet: 70, salty: 20, sour: 10, spicy: 0, bitter: 8, umami: 35, oily: 30, fresh: 45 } },
      { name: "大叔", avatar: "🐈", visits: 8, message: "大叔奶茶珍珠煮得刚刚好，有嚼劲。", preference: { sweet: 65, salty: 20, sour: 10, spicy: 0, bitter: 10, umami: 30, oily: 20, fresh: 40 } },
    ],
    // 15 老乡鸡
    [
      { name: "肥西", avatar: "🐱", visits: 19, message: "肥西老母鸡汤真的是家的味道，暖胃。", preference: { sweet: 20, salty: 55, sour: 10, spicy: 15, bitter: 15, umami: 75, oily: 35, fresh: 40 } },
      { name: "梅菜", avatar: "🐈", visits: 7, message: "梅菜扣肉饭肥而不腻，配汤完美。", preference: { sweet: 30, salty: 60, sour: 15, spicy: 20, bitter: 10, umami: 70, oily: 50, fresh: 25 } },
      { name: "蒸蛋", avatar: "🐈‍⬛", visits: 4, message: "农家蒸蛋超级嫩滑，给小孩必点。", preference: { sweet: 25, salty: 50, sour: 10, spicy: 5, bitter: 10, umami: 65, oily: 30, fresh: 45 } },
    ],
  ];

  // 弹窗控制（绝对定位在小猫头上）
  var popup = document.getElementById("shopPopup");
  var popupBody = document.getElementById("shopPopupBody");
  var catsContainer = document.getElementById("shopCats");
  var comparePanel = document.getElementById("shopComparePanel");
  var compareOverlay = document.getElementById("shopCompareOverlay");
  var compareClose = document.getElementById("shopCompareClose");
  var compareBody = document.getElementById("shopCompareBody");
  var currentMode = "visitor"; // "visitor" | "feed" | "pet" | "message" | "compare"
  var currentCat = null;
  var currentShopIndex = -1;
  var foodImageIndex = null;

  function getVisitorDressSelection(visitor, visitorIndex) {
    var npcDress = global.Yummi && global.Yummi.npcDress;
    if (npcDress && typeof npcDress.resolveForVisitor === "function") {
      return npcDress.resolveForVisitor(currentShopIndex, visitor, visitorIndex);
    }
    if (visitor && visitor.dress && visitor.dress.selected) {
      return visitor.dress.selected;
    }
    return {};
  }

  function closePopup() {
    if (popup) popup.setAttribute("aria-hidden", "true");
    currentMode = "visitor";
  }

  function buildFoodImageIndex() {
    var foods = global.Yummi && global.Yummi.foods;
    var categories = foods && foods.categories ? foods.categories : {};
    var typeToFolder = {
      "主食": "food1",
      "甜品": "food2",
      "饮品": "food3"
    };
    var index;
    var type;
    var list;
    var i;
    var folder;

    if (foodImageIndex) {
      return foodImageIndex;
    }

    index = {};
    for (type in categories) {
      if (!Object.prototype.hasOwnProperty.call(categories, type)) {
        continue;
      }
      folder = typeToFolder[type];
      if (!folder) {
        continue;
      }
      list = categories[type] || [];
      for (i = 0; i < list.length; i += 1) {
        index[list[i]] = "source/compressed/10kb/" + folder + "/" + list[i] + "-10kb.webp";
      }
    }

    foodImageIndex = index;
    return foodImageIndex;
  }

  function getFoodImageUrl(name) {
    var index = buildFoodImageIndex();
    return index[name] || "";
  }

  function renderFoodCards(names) {
    if (!names || !names.length) {
      return "";
    }

    return (
      '<div class="shop-compare__food-grid">' +
        names.map(function (name) {
          var src = getFoodImageUrl(name);
          return (
            '<article class="shop-compare__food-card">' +
              '<div class="shop-compare__food-media">' +
                (
                  src
                    ? '<img class="shop-compare__food-thumb" src="' + escapeHtml(src) + '" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async">'
                    : '<span class="shop-compare__food-placeholder" aria-hidden="true">🍽</span>'
                ) +
              '</div>' +
              '<p class="shop-compare__food-name">' + escapeHtml(name) + "</p>" +
            "</article>"
          );
        }).join("") +
      "</div>"
    );
  }

  function renderCompareEmpty(text) {
    return '<p class="shop-compare__empty">' + escapeHtml(text) + "</p>";
  }

  function renderCompareHero(analysis) {
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
          '<img class="shop-compare__layer" src="' + escapeHtml(layers[i].src) + '"' +
            ' alt="' + escapeHtml(layers[i].label || "哈基米图层") + '"' +
            ' loading="lazy" decoding="async">';
      }
    } else {
      stageHtml += '<div class="shop-compare__fallback" aria-hidden="true">🐾</div>';
    }

    if (drink && drink.src) {
      stageHtml +=
        '<div class="shop-compare__drink">' +
          '<img src="' + escapeHtml(drink.src) + '" alt="' + escapeHtml(drink.name || "饮品") + '" loading="lazy" decoding="async">' +
          '<span>' + escapeHtml(drink.name || "") + "</span>" +
        "</div>";
    }

    stageHtml += "</div>";

    return (
      '<section class="shop-compare__hero">' +
        stageHtml +
        '<div class="shop-compare__persona">' +
          '<p class="shop-compare__persona-kicker">宠物形象</p>' +
          '<h3 class="shop-compare__pet-name">' + escapeHtml(petName) + "</h3>" +
          (
            personality
              ? '<div class="shop-compare__mbti">' +
                  '<span class="shop-compare__mbti-tag">MBTI</span>' +
                  '<strong class="shop-compare__mbti-name">' + escapeHtml(personality.code || personality.name || "未知人格") + "</strong>" +
                  '<p class="shop-compare__mbti-line">' + escapeHtml((personality.name || "") + (personality.oneLiner ? " · " + personality.oneLiner : "")) + "</p>" +
                "</div>"
              : '<p class="shop-compare__mbti-line">这只猫还没有可读的人格标签。</p>'
          ) +
          (
            analysis && analysis.reasonSummary
              ? '<p class="shop-compare__reason">' + escapeHtml(analysis.reasonSummary) + "</p>"
              : ""
          ) +
        "</div>" +
      "</section>"
    );
  }

  function renderCompareScore(analysis) {
    var scoreText;

    if (analysis && analysis.selfHasFoods && analysis.similarity != null) {
      scoreText = "口味匹配度 " + analysis.similarity + "%";
    } else {
      scoreText = "先去点几样食物，再看看你们有多对胃口";
    }

    return (
      '<section class="shop-compare__score">' +
        '<p class="shop-compare__score-num">' + escapeHtml(scoreText) + "</p>" +
        '<p class="shop-compare__score-text">' + escapeHtml((analysis && analysis.similarityLabel) || "") + "</p>" +
      "</section>"
    );
  }

  function renderCompareBody(analysis) {
    var commonFoods = analysis && analysis.commonFoods ? analysis.commonFoods : [];
    var possibleFoods = analysis && analysis.possibleFoods ? analysis.possibleFoods : [];

    if (!compareBody) {
      return;
    }

    compareBody.innerHTML =
      renderCompareHero(analysis) +
      renderCompareScore(analysis) +
      '<section class="shop-compare__section">' +
        '<h3 class="shop-compare__section-title">共同喜欢</h3>' +
        (
          commonFoods.length
            ? renderFoodCards(commonFoods)
            : renderCompareEmpty("你们还没点到同一道，但口味方向很接近。")
        ) +
      "</section>" +
      '<section class="shop-compare__section">' +
        '<h3 class="shop-compare__section-title">可能喜欢</h3>' +
        (
          possibleFoods.length
            ? renderFoodCards(possibleFoods)
            : renderCompareEmpty("等你们再多选几样食物，系统会给出更准的推荐。")
        ) +
      "</section>";
  }

  function openComparePanel(visitor, visitorIndex) {
    var taste = global.Yummi && global.Yummi.foodTaste;
    var yummy = global.Yummi && global.Yummi.yummyCode;
    var ranked;
    var theirFoods = [];
    var payload;
    var analysis;
    var dressSelected;
    var i;

    if (!comparePanel || !compareBody) {
      return;
    }

    if (!taste || typeof taste.rankByProfile !== "function") {
      compareBody.innerHTML =
        '<section class="shop-compare__error">' +
          '<h3 class="shop-compare__section-title">暂时无法比对</h3>' +
          '<p class="shop-compare__empty">口味数据还没准备好，请稍后再试。</p>' +
        "</section>";
      comparePanel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      currentMode = "compare";
      return;
    }

    ranked = taste.rankByProfile(visitor.preference || {}, { limit: 6 }) || [];
    for (i = 0; i < ranked.length; i += 1) {
      if (ranked[i] && ranked[i].name) {
        theirFoods.push(ranked[i].name);
      }
    }

    if (!theirFoods.length || !yummy || typeof yummy.analyzeSharedTaste !== "function") {
      compareBody.innerHTML =
        '<section class="shop-compare__error">' +
          '<h3 class="shop-compare__section-title">暂时无法比对</h3>' +
          '<p class="shop-compare__empty">YUMMY 码比对模块还没准备好，请稍后再试。</p>' +
        "</section>";
      comparePanel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      currentMode = "compare";
      return;
    }

    dressSelected = getVisitorDressSelection(visitor, visitorIndex);

    payload = {
      petName: visitor.name,
      foods: theirFoods,
      dress: {
        selected: dressSelected
      }
    };

    analysis = yummy.analyzeSharedTaste(getSelectedFoods(), payload);
    if (!analysis || !analysis.ok) {
      compareBody.innerHTML =
        '<section class="shop-compare__error">' +
          '<h3 class="shop-compare__section-title">暂时无法比对</h3>' +
          '<p class="shop-compare__empty">这只猫的偏好还没法转换成对比结果。</p>' +
        "</section>";
      comparePanel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      currentMode = "compare";
      return;
    }

    renderCompareBody(analysis);
    comparePanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    currentMode = "compare";
  }

  function closeComparePanel() {
    if (!comparePanel) {
      return;
    }

    comparePanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentMode = "visitor";
  }

  function setupComparePanel() {
    if (compareOverlay) {
      compareOverlay.addEventListener("click", function (e) {
        e.stopPropagation();
        closeComparePanel();
      });
    }

    if (compareClose) {
      compareClose.addEventListener("click", function (e) {
        e.stopPropagation();
        closeComparePanel();
      });
    }

    if (comparePanel) {
      comparePanel.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && comparePanel && comparePanel.getAttribute("aria-hidden") === "false") {
        closeComparePanel();
      }
    });
  }

  function positionPopup(targetCat) {
    if (!popup || !catsContainer) return;
    var catRect = targetCat.getBoundingClientRect();
    var containerRect = catsContainer.getBoundingClientRect();

    // 计算小猫在容器内的相对中心位置
    var catCenterX = catRect.left + catRect.width / 2 - containerRect.left;
    var catTop = catRect.top - containerRect.top;

    // 先显示出来才能拿到弹窗尺寸
    popup.setAttribute("aria-hidden", "false");
    var popupRect = popup.getBoundingClientRect();
    var popupW = popupRect.width;
    var popupH = popupRect.height;

    // 水平居中
    var left = catCenterX - popupW / 2;
    // 垂直：默认显示在小猫上方（留出 10px 间距）
    var gap = 10;
    var top = catTop - popupH - gap;

    // 边界检测：上方空间不够则显示在小猫下方
    if (top < 0) {
      top = catTop + catRect.height + gap;
      popup.classList.add("shop-popup--below");
    } else {
      popup.classList.remove("shop-popup--below");
    }

    // 水平边界检测
    var containerW = containerRect.width;
    if (left < 8) left = 8;
    if (left + popupW > containerW - 8) left = containerW - popupW - 8;

    popup.style.left = left + "px";
    popup.style.top = top + "px";
  }

  function renderVisitorPopup(visitor, visitorIndex) {
    if (!popupBody) return;
    currentMode = "visitor";
    popupBody.innerHTML =
      '<div class="shop-visitor__header">' +
        '<div class="shop-visitor__avatar">' + escapeHtml(visitor.avatar) + '</div>' +
        '<div class="shop-visitor__meta">' +
          '<div class="shop-visitor__name">' + escapeHtml(visitor.name) + '</div>' +
          '<div class="shop-visitor__visits">最近来过 ' + visitor.visits + ' 次</div>' +
        '</div>' +
      '</div>' +
      '<div class="shop-visitor__message">' + escapeHtml(visitor.message) + '</div>' +
      '<div class="shop-visitor__actions">' +
        '<button class="shop-visitor__btn shop-visitor__btn--pet" id="shopPetBtn">' +
          '<span>🖐</span><span>抚摸</span>' +
        '</button>' +
        '<button class="shop-visitor__btn shop-visitor__btn--feed" id="shopFeedBtn">' +
          '<span>🐟</span><span>投喂</span>' +
        '</button>' +
        '<button class="shop-visitor__btn shop-visitor__btn--primary" id="shopPrefBtn">' +
          '<span>🔖</span><span>查看偏好</span>' +
        '</button>' +
        '<button class="shop-visitor__btn" id="shopMsgBtn">' +
          '<span>✉</span><span>私信留言</span>' +
        '</button>' +
      '</div>';

    var prefBtn = document.getElementById("shopPrefBtn");
    if (prefBtn) {
      prefBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openComparePanel(visitor, visitorIndex);
      });
    }

    var petBtn = document.getElementById("shopPetBtn");
    if (petBtn) {
      petBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderPetPopup(visitor);
      });
    }

    var msgBtn = document.getElementById("shopMsgBtn");
    if (msgBtn) {
      msgBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderMessagePopup(visitor);
      });
    }

    var feedBtn = document.getElementById("shopFeedBtn");
    if (feedBtn) {
      feedBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderFeedPopup(visitor);
      });
    }
  }

  function getSelectedFoods() {
    var selection = global.Yummi && global.Yummi.foodSelection;
    var names;

    if (selection && typeof selection.getNames === "function") {
      names = selection.getNames();
      if (Array.isArray(names)) {
        return names;
      }
    }

    try {
      var raw = localStorage.getItem("yummi_food_selection");
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function getFishCoins() {
    return global.Yummi && global.Yummi.fishCoins ? global.Yummi.fishCoins.get() : 0;
  }

  function spendFishCoin() {
    return global.Yummi && global.Yummi.fishCoins ? global.Yummi.fishCoins.spend(1) : false;
  }

  function refreshFishCoinDisplay() {
    if (global.Yummi && global.Yummi.fishCoins) {
      global.Yummi.fishCoins.render("fishCoinBar");
    }
  }

  function renderFeedPopup(visitor) {
    if (!popupBody) return;
    currentMode = "feed";

    var foods = getSelectedFoods();
    var coins = getFishCoins();
    var html;

    if (foods.length === 0) {
      html =
        '<div class="shop-feed__empty">' +
          '<div class="shop-feed__empty-icon">🍽</div>' +
          '<div class="shop-feed__empty-text">还没有选好的食物</div>' +
          '<div class="shop-feed__empty-sub">去点餐模块选些好吃的再来投喂吧 ~</div>' +
        '</div>' +
        '<button class="shop-feed__back" id="shopFeedBack">返回</button>';
    } else {
      html = '<div class="shop-feed__title">选一种食物投喂 ' + escapeHtml(visitor.name) + '</div>';
      html += '<div class="shop-feed__coin">🐟 小鱼干币：' + coins + '</div>';
      html += '<div class="shop-feed__list">';
      for (var i = 0; i < foods.length; i++) {
        var foodName = foods[i];
        var foodSrc = getFoodImageUrl(foodName);
        html +=
          '<button class="shop-feed__item" data-food-index="' + i + '">' +
            '<span class="shop-feed__item-media">' +
              (
                foodSrc
                  ? '<img class="shop-feed__item-thumb" src="' + escapeHtml(foodSrc) + '" alt="' + escapeHtml(foodName) + '" loading="lazy" decoding="async">'
                  : '<span class="shop-feed__item-placeholder" aria-hidden="true">🍽</span>'
              ) +
            '</span>' +
            '<span class="shop-feed__item-content">' +
              '<span class="shop-feed__item-name">' + escapeHtml(foodName) + '</span>' +
            '</span>' +
          '</button>';
      }
      html += '</div>';
      html += '<button class="shop-feed__back" id="shopFeedBack">返回</button>';
    }

    popupBody.innerHTML = html;

    // 绑定食物选择点击
    var foodItems = popupBody.querySelectorAll(".shop-feed__item");
    for (var j = 0; j < foodItems.length; j++) {
      foodItems[j].addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = parseInt(this.getAttribute("data-food-index"), 10);
        var foodName = foods[idx];
        if (!spendFishCoin()) {
          renderFeedNoCoin(visitor);
          return;
        }
        refreshFishCoinDisplay();
        renderFeedResult(visitor, foodName);
      });
    }

    var backBtn = document.getElementById("shopFeedBack");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderVisitorPopup(visitor);
      });
    }
  }

  function renderFeedNoCoin(visitor) {
    if (!popupBody) return;
    currentMode = "feedNoCoin";
    popupBody.innerHTML =
      '<div class="shop-feed__empty">' +
        '<div class="shop-feed__empty-icon">🐟</div>' +
        '<div class="shop-feed__empty-text">小鱼干币不足</div>' +
        '<div class="shop-feed__empty-sub">投喂需要 1 个小鱼干币，去多逛逛赚一些吧 ~</div>' +
      '</div>' +
      '<button class="shop-feed__back" id="shopFeedBackNoCoin">返回</button>';

    var backBtn = document.getElementById("shopFeedBackNoCoin");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderVisitorPopup(visitor);
      });
    }
  }

  function renderFeedResult(visitor, foodName) {
    if (!popupBody) return;
    currentMode = "feedResult";
    popupBody.innerHTML =
      '<div class="shop-feed__crunch">' +
        '<div class="shop-feed__crunch-text">咔哧 ~ 咔哧 ~</div>' +
        '<div class="shop-feed__sub">' + escapeHtml(visitor.name) + "吃掉了你投喂的「" + escapeHtml(foodName) + "」，尾巴摇个不停</div>" +
      '</div>' +
      '<button class="shop-feed__back" id="shopFeedBack2">返回</button>';

    var backBtn = document.getElementById("shopFeedBack2");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderVisitorPopup(visitor);
      });
    }
  }

  function renderPetPopup(visitor) {
    if (!popupBody) return;
    currentMode = "pet";
    popupBody.innerHTML =
      '<div class="shop-pet__meow">' +
        '<div class="shop-pet__meow-text">喵 ~</div>' +
        '<div class="shop-pet__sub">' + escapeHtml(visitor.name) + "开心地蹭了蹭你的手</div>" +
      '</div>' +
      '<button class="shop-pet__back" id="shopPetBack">返回</button>';

    var backBtn = document.getElementById("shopPetBack");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderVisitorPopup(visitor);
      });
    }
  }

  function renderMessagePopup(visitor) {
    if (!popupBody) return;
    currentMode = "message";
    popupBody.innerHTML =
      '<div class="shop-message__title">给 ' + escapeHtml(visitor.name) + ' 留言</div>' +
      '<textarea class="shop-message__input" id="shopMsgInput" placeholder="写点什么..." rows="3"></textarea>' +
      '<button class="shop-message__send" id="shopMsgSend">发送</button>' +
      '<button class="shop-message__back" id="shopMsgBack">返回</button>';

    var sendBtn = document.getElementById("shopMsgSend");
    if (sendBtn) {
      sendBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var input = document.getElementById("shopMsgInput");
        var text = input ? input.value.trim() : "";
        if (!text) {
          popupBody.innerHTML =
            '<div class="shop-message__sent">' +
              '<div class="shop-message__sent-icon">✉</div>' +
              '<div class="shop-message__sent-text">请输入内容哦</div>' +
            '</div>' +
            '<button class="shop-message__back" id="shopMsgBack2">返回</button>';
        } else {
          popupBody.innerHTML =
            '<div class="shop-message__sent">' +
              '<div class="shop-message__sent-icon">✓</div>' +
              '<div class="shop-message__sent-text">留言已发送</div>' +
              '<div class="shop-message__sent-sub">「' + escapeHtml(text.substring(0, 30)) + (text.length > 30 ? "..." : "") + '」</div>' +
            '</div>' +
            '<button class="shop-message__back" id="shopMsgBack2">返回</button>';
        }
        var back2 = document.getElementById("shopMsgBack2");
        if (back2) {
          back2.addEventListener("click", function (e) {
            e.stopPropagation();
            renderVisitorPopup(visitor);
          });
        }
      });
    }

    var backBtn = document.getElementById("shopMsgBack");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderVisitorPopup(visitor);
      });
    }
  }

  function bindCatClicks(container, visitors) {
    if (!container) return;
    container.addEventListener("click", function (e) {
      var cat = e.target.closest(".shop-cat");
      if (!cat) {
        // 点击非小猫区域关闭弹窗
        closePopup();
        return;
      }
      var idx = parseInt(cat.getAttribute("data-visitor-index"), 10);
      if (isNaN(idx) || !visitors[idx]) return;

      // 如果点击的是同一只猫且弹窗已打开，则关闭
      if (popup && popup.getAttribute("aria-hidden") === "false" && cat === currentCat) {
        closePopup();
        currentCat = null;
        return;
      }

      currentCat = cat;
      renderVisitorPopup(visitors[idx], idx);
      // 用 setTimeout 确保 DOM 渲染后再定位
      setTimeout(function () {
        positionPopup(cat);
      }, 0);
    });

    // 点击页面其他地方关闭弹窗
    document.addEventListener("click", function (e) {
      if (!popup) return;
      if (popup.getAttribute("aria-hidden") === "true") return;
      var clickedCat = e.target.closest(".shop-cat");
      var clickedPopup = e.target.closest(".shop-popup");
      var clickedCompare = e.target.closest(".shop-compare");
      if (!clickedCat && !clickedPopup && !clickedCompare) {
        closePopup();
        currentCat = null;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
