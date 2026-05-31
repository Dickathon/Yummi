/**
 * 美食街区地图 — 店铺渲染与预览交互
 */
(function (global) {
  "use strict";

  // 店铺数据：文件名 → 中文名、品类、简介
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

  var ASSET_BASE = "source/compressed/10kb/shop/";
  var MAP_CAT_IMG = "source/compressed/10kb/cat2-10kb.webp";
  var FOOD_IMAGE_INDEX = null;
  var friendPanel = null;
  var friendOverlay = null;
  var friendClose = null;
  var friendInput = null;
  var friendSubmit = null;
  var friendStatus = null;
  var friendResult = null;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getMyFoods() {
    try {
      var raw = localStorage.getItem("yummi_food_selection");
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function (name) {
        return String(name || "").trim();
      }) : [];
    } catch (e) {
      return [];
    }
  }

  function buildFoodImageIndex() {
    var foods = global.Yummi && global.Yummi.foods;
    var categories = foods && foods.categories ? foods.categories : {};
    var typeToFolder = {
      "主食": "food1",
      "甜品": "food2",
      "饮品": "food3"
    };
    var type;
    var list;
    var i;
    var folder;

    if (FOOD_IMAGE_INDEX) {
      return FOOD_IMAGE_INDEX;
    }

    FOOD_IMAGE_INDEX = {};
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
        FOOD_IMAGE_INDEX[list[i]] = "source/compressed/10kb/" + folder + "/" + list[i] + "-10kb.webp";
      }
    }
    return FOOD_IMAGE_INDEX;
  }

  function getFoodImageUrl(name) {
    var index = buildFoodImageIndex();
    return index[name] || "";
  }

  function renderFoodCard(name, cls) {
    var src = getFoodImageUrl(name);

    return (
      '<article class="' + cls + '">' +
        '<div class="' + cls + '__media">' +
          (
            src
              ? '<img class="' + cls + '__thumb" src="' + escapeHtml(src) + '" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async">'
              : '<span class="' + cls + '__placeholder" aria-hidden="true">🍽</span>'
          ) +
        '</div>' +
        '<p class="' + cls + '__name">' + escapeHtml(name) + '</p>' +
      '</article>'
    );
  }

  function renderFoodGrid(names, cls) {
    if (!names || !names.length) {
      return "";
    }

    return (
      '<div class="' + cls + '__grid">' +
        names.map(function (name) {
          return renderFoodCard(name, cls + '__food');
        }).join("") +
      "</div>"
    );
  }

  function renderPetStage(preview) {
    var layers = preview && preview.layers ? preview.layers : [];
    var drink = preview && preview.drink;
    var title = preview && preview.petDisplayName ? preview.petDisplayName : "好友的哈基米";
    var html = '<div class="map-friend__stage" role="img" aria-label="' + escapeHtml(title) + '">';

    html += '<div class="map-friend__aura" aria-hidden="true"></div>';
    if (!layers.length) {
      html += '<div class="map-friend__stage-empty">哈基米</div>';
    } else {
      layers.forEach(function (layer) {
        var zClass = layer.zClass || layer.className || "layer";
        html +=
          '<img class="map-friend__layer map-friend__layer--' + escapeHtml(zClass) +
            ' map-friend__layer--' + escapeHtml(layer.className || zClass) + '"' +
            ' src="' + escapeHtml(layer.src) + '"' +
            ' alt="' + escapeHtml(layer.label || "宠物图层") + '"' +
            ' loading="lazy" decoding="async">';
      });
    }

    if (drink && drink.src) {
      html +=
        '<div class="map-friend__drink">' +
          '<img src="' + escapeHtml(drink.src) + '" alt="' + escapeHtml(drink.name || "饮品") + '" loading="lazy" decoding="async">' +
        '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderImportHero(analysis) {
    var yummy = global.Yummi && global.Yummi.yummyCode;
    if (yummy && typeof yummy.renderImportHero === "function") {
      return yummy.renderImportHero(analysis, escapeHtml);
    }
    return renderPetStage(analysis && analysis.preview);
  }

  function renderFriendResult(analysis) {
    if (!analysis || !analysis.ok) {
      return (
        '<div class="map-friend__empty">' +
          '<div class="map-friend__empty-icon" aria-hidden="true">🐾</div>' +
          '<p class="map-friend__empty-title">输入一串 YUMMY码，就能看到朋友的哈基米。</p>' +
          '<p class="map-friend__empty-sub">结果会直接显示在当前页面，不会跳走。</p>' +
        '</div>'
      );
    }

    return (
      '<div class="map-friend__result-card">' +
        '<section class="map-friend__hero">' +
          renderImportHero(analysis) +
        '</section>' +
        '<section class="map-friend__score">' +
          '<p class="map-friend__score-num">' + escapeHtml(analysis.selfHasFoods && analysis.similarity != null ? ("口味匹配度 " + analysis.similarity + "%") : "先去点几样食物，再看看你们有多对胃口") + '</p>' +
          '<p class="map-friend__score-text">' + escapeHtml(analysis.similarityLabel || "") + '</p>' +
        '</section>' +
        '<section class="map-friend__section">' +
          '<h3>Ta 喜欢的食物</h3>' +
          (analysis.theirFoods && analysis.theirFoods.length
            ? renderFoodGrid(analysis.theirFoods, "map-friend")
            : '<p class="map-friend__empty-line">Ta 还没有可展示的食物。</p>') +
        '</section>' +
        '<section class="map-friend__section">' +
          '<h3>你们共同喜欢</h3>' +
          (analysis.commonFoods && analysis.commonFoods.length
            ? renderFoodGrid(analysis.commonFoods, "map-friend")
            : '<p class="map-friend__empty-line">你们还没点到同一道，但口味方向很接近。</p>') +
        '</section>' +
        '<section class="map-friend__section">' +
          '<h3>你们可能还会喜欢</h3>' +
          (analysis.possibleFoods && analysis.possibleFoods.length
            ? renderFoodGrid(analysis.possibleFoods, "map-friend")
            : '<p class="map-friend__empty-line">等你们再多选几样食物，系统会给出更准的推荐。</p>') +
        '</section>' +
      '</div>'
    );
  }

  function setFriendStatus(message, tone) {
    if (!friendStatus) return;
    friendStatus.textContent = message || "";
    friendStatus.classList.toggle("is-error", tone === "error");
    friendStatus.classList.toggle("is-success", tone === "success");
  }

  function openFriendPanel() {
    if (!friendPanel) return;
    friendPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setFriendStatus("", "");
    if (friendResult) {
      friendResult.innerHTML = renderFriendResult(null);
    }
    if (friendInput) {
      setTimeout(function () {
        friendInput.focus();
        friendInput.select();
      }, 0);
    }
  }

  function closeFriendPanel() {
    if (!friendPanel) return;
    friendPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function submitFriendCode() {
    var yummy = global.Yummi && global.Yummi.yummyCode;
    var code = friendInput ? friendInput.value : "";
    var decoded;
    var analysis;

    if (!yummy || typeof yummy.decodeShare !== "function" || typeof yummy.analyzeSharedTaste !== "function") {
      setFriendStatus("YUMMY码 功能还没准备好，请稍后再试。", "error");
      return;
    }

    decoded = yummy.decodeShare(code);
    if (!decoded.ok) {
      setFriendStatus("这串 YUMMY码 好像不对，再检查一下。", "error");
      if (friendResult) friendResult.innerHTML = "";
      return;
    }

    analysis = yummy.analyzeSharedTaste(getMyFoods(), decoded.payload);
    if (!analysis.ok) {
      setFriendStatus("这串 YUMMY码 暂时没法解析，再试一次。", "error");
      if (friendResult) friendResult.innerHTML = "";
      return;
    }

    setFriendStatus("解析成功，好友的哈基米已经展示出来了。", "success");
    if (friendResult) {
      friendResult.innerHTML = renderFriendResult(analysis);
    }
  }

  function setupFriendPanel() {
    friendPanel = document.getElementById("mapFriendPanel");
    friendOverlay = document.getElementById("mapFriendOverlay");
    friendClose = document.getElementById("mapFriendClose");
    friendInput = document.getElementById("mapFriendCodeInput");
    friendSubmit = document.getElementById("mapFriendSubmit");
    friendStatus = document.getElementById("mapFriendStatus");
    friendResult = document.getElementById("mapFriendResult");

    if (friendOverlay) friendOverlay.addEventListener("click", closeFriendPanel);
    if (friendClose) friendClose.addEventListener("click", closeFriendPanel);
    if (friendSubmit) friendSubmit.addEventListener("click", submitFriendCode);

    if (friendInput) {
      friendInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          submitFriendCode();
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && friendPanel && friendPanel.getAttribute("aria-hidden") === "false") {
        closeFriendPanel();
      }
    });
  }

  function renderStreet() {
    var container = document.getElementById("mapStreet");
    if (!container) return;

    // 读取最近一次进入的店铺索引
    var lastShopIndex = -1;
    try {
      var raw = localStorage.getItem("yummi_last_shop");
      if (raw !== null) {
        var parsed = parseInt(raw, 10);
        if (!isNaN(parsed)) lastShopIndex = parsed;
      }
    } catch (e) {}

    // 3×3 街区网格，16个店铺分配到9个街区块
    var blocks = [
      [0, 1],    // 星巴克, 麦当劳
      [2, 3],    // 喜茶, 肯德基
      [4],       // 海底捞
      [5, 6],    // 蜜雪冰城, 瑞幸咖啡
      [7, 8],    // 汉堡王, 茶百道
      [9],       // 必胜客
      [10, 11],  // 奈雪的茶, 赛百味
      [12, 13],  // 一点点, 沪上阿姨
      [14, 15]   // 古茗, 老乡鸡
    ];

    var html = "";

    // 生成9个街区块
    blocks.forEach(function (blockShops) {
      var blockHtml = "";
      blockShops.forEach(function (shopIndex) {
        var shop = SHOPS[shopIndex];
        var catHtml = (shopIndex === lastShopIndex)
          ? '<img class="map-shop__cat" src="' + MAP_CAT_IMG + '" alt="" aria-hidden="true" width="34" height="34">'
          : '';
        blockHtml +=
          '<button type="button" class="map-shop" data-shop-index="' + shopIndex + '" aria-label="' + escapeHtml(shop.name) + '">' +
            '<span class="map-shop__icon">' +
              '<img src="' + ASSET_BASE + escapeHtml(shop.file) + '" alt="' + escapeHtml(shop.name) + '" loading="lazy" width="36" height="36">' +
            '</span>' +
            catHtml +
            '<span class="map-shop__name">' + escapeHtml(shop.name) + '</span>' +
          '</button>';
      });
      html += '<div class="map-block">' + blockHtml + '</div>';
    });

    // 4个十字路口标记
    var crossPositions = [
      { top: "34%", left: "34%" },
      { top: "34%", left: "66%" },
      { top: "66%", left: "34%" },
      { top: "66%", left: "66%" }
    ];
    crossPositions.forEach(function (pos) {
      html += '<span class="map-crossroad" style="top:' + pos.top + ';left:' + pos.left + ';transform:translate(-50%,-50%)" aria-hidden="true"></span>';
    });

    // 路灯 — 分布在道路段中间，避开十字路口（12盏）
    var lampPositions = [
      // 横向道路1 上侧 — 3段道路中间
      { top: "28%", left: "20%" }, { top: "28%", left: "50%" }, { top: "28%", left: "80%" },
      // 横向道路2 下侧 — 3段道路中间
      { top: "72%", left: "20%" }, { top: "72%", left: "50%" }, { top: "72%", left: "80%" },
      // 纵向道路1 左侧 — 3段道路中间
      { top: "20%", left: "30%" }, { top: "50%", left: "30%" }, { top: "80%", left: "30%" },
      // 纵向道路2 右侧 — 3段道路中间
      { top: "20%", left: "70%" }, { top: "50%", left: "70%" }, { top: "80%", left: "70%" }
    ];
    lampPositions.forEach(function (pos) {
      html += '<span class="map-lamp" style="top:' + pos.top + ';left:' + pos.left + ';transform:translate(-50%,-50%)" aria-hidden="true"></span>';
    });

    // 斑马线 — 每个十字路口4组（16组）
    var zebras = [
      // 路口1 (34%, 34%)
      { top: "30%", left: "34%", cls: "map-zebra-hroad" },
      { top: "38%", left: "34%", cls: "map-zebra-hroad" },
      { top: "34%", left: "30%", cls: "map-zebra-vroad" },
      { top: "34%", left: "38%", cls: "map-zebra-vroad" },
      // 路口2 (34%, 66%)
      { top: "30%", left: "66%", cls: "map-zebra-hroad" },
      { top: "38%", left: "66%", cls: "map-zebra-hroad" },
      { top: "34%", left: "62%", cls: "map-zebra-vroad" },
      { top: "34%", left: "70%", cls: "map-zebra-vroad" },
      // 路口3 (66%, 34%)
      { top: "62%", left: "34%", cls: "map-zebra-hroad" },
      { top: "70%", left: "34%", cls: "map-zebra-hroad" },
      { top: "66%", left: "30%", cls: "map-zebra-vroad" },
      { top: "66%", left: "38%", cls: "map-zebra-vroad" },
      // 路口4 (66%, 66%)
      { top: "62%", left: "66%", cls: "map-zebra-hroad" },
      { top: "70%", left: "66%", cls: "map-zebra-hroad" },
      { top: "66%", left: "62%", cls: "map-zebra-vroad" },
      { top: "66%", left: "70%", cls: "map-zebra-vroad" }
    ];
    zebras.forEach(function (z) {
      html += '<span class="' + z.cls + '" style="top:' + z.top + ';left:' + z.left + ';transform:translate(-50%,-50%)" aria-hidden="true"></span>';
    });

    // 车辆 — 4辆，分布在横纵道路上，带移动动画
    var cars = [
      { top: "33%", left: "50%", cls: "map-car--right", color: "#f4e1e1" },
      { top: "66%", left: "40%", cls: "map-car--left", color: "#8fbc8f" },
      { top: "40%", left: "33%", cls: "map-car--down", color: "#9caf88" },
      { top: "60%", left: "66%", cls: "map-car--up", color: "#c4a882" }
    ];
    cars.forEach(function (car) {
      html += '<span class="map-car ' + car.cls + '" style="top:' + car.top + ';left:' + car.left + ';background:' + car.color + '" aria-hidden="true"></span>';
    });

    container.innerHTML = html;
  }

  function setupPreview() {
    var preview = document.getElementById("mapPreview");
    var overlay = document.getElementById("mapPreviewOverlay");
    var closeBtn = document.getElementById("mapPreviewClose");
    var img = document.getElementById("mapPreviewImg");
    var name = document.getElementById("mapPreviewName");
    var tag = document.getElementById("mapPreviewTag");
    var desc = document.getElementById("mapPreviewDesc");
    var enterBtn = document.getElementById("mapPreviewEnter");
    var street = document.getElementById("mapStreet");

    if (!preview || !street) return;

    function open(index) {
      var shop = SHOPS[index];
      if (!shop) return;

      img.src = ASSET_BASE + shop.file;
      img.alt = shop.name;
      name.textContent = shop.name;
      tag.textContent = shop.tag;
      desc.textContent = shop.desc;

      // 预留：将当前店铺索引绑定到按钮，供后续跳转使用
      if (enterBtn) enterBtn.setAttribute("data-shop-index", index);

      preview.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function close() {
      preview.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    street.addEventListener("click", function (e) {
      var btn = e.target.closest(".map-shop");
      if (!btn) return;
      var index = parseInt(btn.getAttribute("data-shop-index"), 10);
      if (isNaN(index)) return;
      try {
        localStorage.setItem("yummi_last_shop", String(index));
      } catch (e) {}
      window.location.href = "shop.html?shop=" + index;
    });

    if (overlay) overlay.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);

    // 进入店铺按钮 — 跳转店铺详情页
    if (enterBtn) {
      enterBtn.addEventListener("click", function () {
        var index = parseInt(enterBtn.getAttribute("data-shop-index"), 10);
        if (isNaN(index)) return;
        try {
          localStorage.setItem("yummi_last_shop", String(index));
        } catch (e) {}
        window.location.href = "shop.html?shop=" + index;
      });
    }

    // 点按 ESC 关闭
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && preview.getAttribute("aria-hidden") === "false") {
        close();
      }
    });
  }

  function init() {
    var circleBtn = document.getElementById("mapCircleBtn");
    var friendBtn = document.getElementById("mapAddFriendBtn");
    var friendsBtn = document.getElementById("mapFriendsBtn");

    renderStreet();
    setupFriendPanel();
    setupPreview();

    if (circleBtn) {
      circleBtn.addEventListener("click", function () {
        window.location.href = "food-circle.html";
      });
    }

    if (friendBtn) {
      friendBtn.addEventListener("click", function () {
        openFriendPanel();
      });
    }

    if (friendsBtn) {
      friendsBtn.addEventListener("click", function () {
        window.location.href = "friends.html";
      });
    }

    var guide = global.Yummi && global.Yummi.socialMapGuide;
    if (guide && typeof guide.openOnEnter === "function") {
      guide.openOnEnter();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
