/**
 * 好友页 — 单一列表 + 私信弹窗
 */
(function (global) {
  "use strict";

  var ASSET_BASE = "source/compressed/10kb/CatImage/";

  var FRIENDS = [
    {
      id: "f1",
      name: "麻薯",
      avatar: ASSET_BASE + "cat5-10kb.webp",
      bio: "你的专属饭搭子",
      affinity: 96,
      lastInteract: "昨天",
      visits: 32,
      preference: { sweet: 60, salty: 50, sour: 25, spicy: 35, bitter: 20, umami: 65, oily: 40, fresh: 55 }
    },
    {
      id: "f2",
      name: "雪球",
      avatar: ASSET_BASE + "cat2-10kb.webp",
      bio: "一起吃遍所有奶茶店吧",
      affinity: 88,
      lastInteract: "2天前",
      visits: 24,
      preference: { sweet: 75, salty: 15, sour: 20, spicy: 0, bitter: 10, umami: 30, oily: 20, fresh: 55 }
    },
    {
      id: "f3",
      name: "小橘",
      avatar: ASSET_BASE + "cat2-10kb.webp",
      bio: "今天也在星巴克晒太阳 ~",
      affinity: 78,
      lastInteract: "10分钟前",
      visits: 12,
      preference: { sweet: 55, salty: 20, sour: 15, spicy: 5, bitter: 35, umami: 30, oily: 25, fresh: 40 }
    },
    {
      id: "f4",
      name: "奶茶喵",
      avatar: ASSET_BASE + "cat3-10kb.webp",
      bio: "喜茶的奶盖yyds",
      affinity: 65,
      lastInteract: "1小时前",
      visits: 8,
      preference: { sweet: 80, salty: 15, sour: 10, spicy: 0, bitter: 5, umami: 25, oily: 20, fresh: 45 }
    },
    {
      id: "f5",
      name: "汉堡侦探",
      avatar: ASSET_BASE + "cat4-10kb.webp",
      bio: "正在寻找全城最好吃的汉堡",
      affinity: 42,
      lastInteract: "3小时前",
      visits: 5,
      preference: { sweet: 30, salty: 65, sour: 20, spicy: 40, bitter: 10, umami: 70, oily: 60, fresh: 25 }
    },
    {
      id: "f6",
      name: "抹茶控",
      avatar: ASSET_BASE + "cat3-10kb.webp",
      bio: "喜欢一切抹茶味的东西",
      affinity: 35,
      lastInteract: "昨天",
      visits: 3,
      preference: { sweet: 40, salty: 20, sour: 15, spicy: 0, bitter: 55, umami: 30, oily: 20, fresh: 50 }
    },
    {
      id: "f7",
      name: "炸鸡王子",
      avatar: ASSET_BASE + "cat4-10kb.webp",
      bio: "肯德基常驻嘉宾",
      affinity: 28,
      lastInteract: "3天前",
      visits: 2,
      preference: { sweet: 20, salty: 65, sour: 15, spicy: 45, bitter: 10, umami: 70, oily: 60, fresh: 20 }
    },
    {
      id: "f8",
      name: "芋泥波波",
      avatar: ASSET_BASE + "cat5-10kb.webp",
      bio: "奶茶三分糖，生活十分甜",
      affinity: 15,
      lastInteract: "5天前",
      visits: 1,
      preference: { sweet: 75, salty: 15, sour: 10, spicy: 0, bitter: 5, umami: 30, oily: 20, fresh: 40 }
    },
    {
      id: "f9",
      name: "深夜食堂",
      avatar: ASSET_BASE + "cat2-10kb.webp",
      bio: "海底捞夜场选手",
      affinity: 8,
      lastInteract: "1周前",
      visits: 1,
      preference: { sweet: 25, salty: 55, sour: 20, spicy: 80, bitter: 15, umami: 75, oily: 60, fresh: 35 }
    }
  ];

  var currentMsgId = null;
  var currentVisitId = null;
  var lastListFocus = null;
  var CATBAR_OFFSET_Y = 52;
  var foodImageIndex = null;

  function containsNode(parent, node) {
    return !!(parent && node && node.nodeType === 1 && (parent === node || parent.contains(node)));
  }

  function blurFocusWithin(container) {
    var active = document.activeElement;
    if (containsNode(container, active) && active && typeof active.blur === "function") {
      active.blur();
    }
  }

  function hidePanel(panel, restoreFocusEl) {
    if (!panel) {
      return;
    }

    blurFocusWithin(panel);
    panel.setAttribute("aria-hidden", "true");

    if (restoreFocusEl && typeof restoreFocusEl.focus === "function") {
      try {
        restoreFocusEl.focus({ preventScroll: true });
      } catch (e) {
        restoreFocusEl.focus();
      }
    }
  }

  function visitRestoreFocus() {
    var visitOpen = document.getElementById("friendsVisit");
    if (visitOpen && visitOpen.getAttribute("aria-hidden") === "false") {
      var prefBtn = document.getElementById("friendsVisitPref");
      if (prefBtn) {
        return prefBtn;
      }
      return document.getElementById("friendsVisitBack");
    }
    return lastListFocus;
  }

  /* 虚拟聊天记录 — 每个好友预置几条消息 */
  var CHAT_HISTORY = {
    f1: [
      { from: "them", text: "今天吃了什么好吃的呀？", time: "昨天 18:30" },
      { from: "me", text: "去吃了海底捞，超满足 ~", time: "昨天 18:35" },
      { from: "them", text: "羡慕！下次一起去吧", time: "昨天 18:40" }
    ],
    f2: [
      { from: "them", text: "发现一家新的奶茶店", time: "2天前 14:20" },
      { from: "me", text: "在哪在哪？", time: "2天前 14:22" },
      { from: "them", text: "美食街区转角，叫茶百道", time: "2天前 14:25" }
    ],
    f3: [
      { from: "them", text: "喵 ~ 今天太阳真好", time: "10分钟前" },
      { from: "me", text: "在星巴克晒太阳吗", time: "9分钟前" }
    ],
    f4: [
      { from: "them", text: "喜茶出了新品！", time: "1小时前" },
      { from: "me", text: "什么口味？", time: "55分钟前" },
      { from: "them", text: "芋泥波波，超好喝", time: "50分钟前" }
    ],
    f5: [
      { from: "them", text: "找到一家超棒的汉堡店", time: "3小时前" }
    ],
    f6: [
      { from: "them", text: "抹茶拿铁你喝过吗", time: "昨天" },
      { from: "me", text: "喝过，有点苦", time: "昨天" }
    ],
    f7: [
      { from: "them", text: "肯德基又有活动了", time: "3天前" }
    ],
    f8: [
      { from: "them", text: "三分糖的奶茶刚好 ~", time: "5天前" }
    ],
    f9: [
      { from: "them", text: "深夜海底捞走不走", time: "1周前" },
      { from: "me", text: "太晚了下次吧", time: "1周前" }
    ]
  };

  /* ================================================================
     【拜访视图】店铺配置 & 小猫位置调整
     ================================================================
     每个店铺一条记录，catPos 控制小猫在画面中的位置和大小：
       left  : 距离左边界的百分比（0 ~ 100）
       top   : 距离上边界的百分比（0 ~ 100）
       width : 小猫宽度占画面宽度的百分比（推荐 10 ~ 25）
     修改下面的数值即可调整小猫位置，不需要改其他代码。
     ================================================================ */
  var VISIT_SHOPS = [
    { svg: "source/svgSHOP/interior_starbucks.svg",    name: "星巴克",      catPos: { left: 55, top: 95, width: 18 } },
    { svg: "source/svgSHOP/interior_mcdonalds.svg",    name: "麦当劳",      catPos: { left: 48, top: 62, width: 20 } },
    { svg: "source/svgSHOP/interior_heytea.svg",       name: "喜茶",        catPos: { left: 60, top: 55, width: 16 } },
    { svg: "source/svgSHOP/interior_kfc.svg",          name: "肯德基",      catPos: { left: 45, top: 60, width: 19 } },
    { svg: "source/svgSHOP/interior_haidilao.svg",     name: "海底捞",      catPos: { left: 52, top: 65, width: 17 } },
    { svg: "source/svgSHOP/interior_mixue.svg",        name: "蜜雪冰城",    catPos: { left: 58, top: 64, width: 18 } },
    { svg: "source/svgSHOP/interior_luckin.svg",       name: "瑞幸咖啡",    catPos: { left: 50, top: 60, width: 16 } },
    { svg: "source/svgSHOP/interior_burgerking.svg",   name: "汉堡王",      catPos: { left: 42, top: 63, width: 20 } },
    { svg: "source/svgSHOP/interior_chapanda.svg",     name: "茶百道",      catPos: { left: 56, top: 59, width: 17 } },
    { svg: "source/svgSHOP/interior_pizzahut.svg",     name: "必胜客",      catPos: { left: 48, top: 61, width: 19 } },
    { svg: "source/svgSHOP/interior_nayuki.svg",       name: "奈雪的茶",    catPos: { left: 54, top: 57, width: 16 } },
    { svg: "source/svgSHOP/interior_subway.svg",       name: "赛百味",      catPos: { left: 46, top: 70, width: 18 } },
    { svg: "source/svgSHOP/interior_alittle_tea.svg",  name: "一点点",      catPos: { left: 64, top: 67, width: 17 } },
    { svg: "source/svgSHOP/interior_auntea.svg",       name: "沪上阿姨",    catPos: { left: 66, top: 66, width: 16 } },
    { svg: "source/svgSHOP/interior_goodme.svg",       name: "古茗",        catPos: { left: 49, top: 80, width: 18 } },
    { svg: "source/svgSHOP/interior_laoxiangji.svg",   name: "老乡鸡",      catPos: { left: 51, top: 80, width: 19 } }
  ];

  function getFriendShopIndex(friendId) {
    var hash = 0;
    for (var i = 0; i < friendId.length; i++) hash = ((hash << 5) - hash) + friendId.charCodeAt(i);
    return Math.abs(hash) % VISIT_SHOPS.length;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function renderFriendCard(friend) {
    var affinityBar = friend.affinity > 0
      ? '<div class="friends-card__affinity">' +
          '<div class="friends-card__affinity-bar">' +
            '<div class="friends-card__affinity-fill" style="width:' + friend.affinity + '%"></div>' +
          '</div>' +
          '<span class="friends-card__affinity-text">亲密度 ' + friend.affinity + '</span>' +
        '</div>'
      : '';

    var meta = [];
    if (friend.lastInteract) meta.push('<span>⏱ ' + escapeHtml(friend.lastInteract) + '</span>');
    if (friend.visits > 0) meta.push('<span>👣 拜访 ' + friend.visits + ' 次</span>');

    var affinityBadge = '<span class="friends-card__affinity-badge" data-affinity="' + friend.affinity + '">' + friend.affinity + '</span>';

    return (
      '<div class="friends-card" data-friend-id="' + escapeHtml(friend.id) + '">' +
        '<div class="friends-card__avatar-wrap">' +
          '<img class="friends-card__avatar" src="' + escapeHtml(friend.avatar) + '" alt="' + escapeHtml(friend.name) + '" loading="lazy">' +
          affinityBadge +
        '</div>' +
        '<div class="friends-card__info">' +
          '<div class="friends-card__name">' + escapeHtml(friend.name) + '</div>' +
          '<div class="friends-card__bio">' + escapeHtml(friend.bio) + '</div>' +
          (meta.length ? '<div class="friends-card__meta">' + meta.join('') + '</div>' : '') +
          affinityBar +
        '</div>' +
        '<div class="friends-card__actions">' +
          '<button type="button" class="friends-card__btn friends-card__btn--primary" data-action="visit" data-id="' + escapeHtml(friend.id) + '">拜访</button>' +
          '<button type="button" class="friends-card__btn friends-card__btn--secondary" data-action="msg" data-id="' + escapeHtml(friend.id) + '">私信</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderList() {
    var container = document.getElementById("friendsList");
    if (!container) return;

    if (FRIENDS.length === 0) {
      container.innerHTML = '<p class="caption" style="text-align:center;padding:40px 0;">暂无好友</p>';
      return;
    }

    container.innerHTML = FRIENDS.map(renderFriendCard).join("");
  }

  /* ========== 私信聊天 ========== */

  function renderChatMessages(friendId) {
    var container = document.getElementById("friendsMsgMessages");
    if (!container) return;

    var friend = FRIENDS.find(function (f) { return f.id === friendId; });
    var msgs = CHAT_HISTORY[friendId] || [];

    if (msgs.length === 0) {
      container.innerHTML = '<p class="caption" style="text-align:center;padding:40px 0;color:var(--color-text-muted);">暂无消息，打个招呼吧 ~</p>';
      return;
    }

    container.innerHTML = msgs.map(function (m) {
      var isMe = m.from === "me";
      var avatarHtml = isMe
        ? ''
        : '<img class="friends-msg__bubble-avatar" src="' + escapeHtml(friend.avatar) + '" alt="">';
      return (
        '<div class="friends-msg__row friends-msg__row--' + (isMe ? "me" : "them") + '">' +
          avatarHtml +
          '<div>' +
            '<div class="friends-msg__bubble">' + escapeHtml(m.text) + '</div>' +
            '<div class="friends-msg__time">' + escapeHtml(m.time) + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    container.scrollTop = container.scrollHeight;
  }

  function openMsgPanel(friendId) {
    var friend = FRIENDS.find(function (f) { return f.id === friendId; });
    if (!friend) return;

    currentMsgId = friendId;

    var panel = document.getElementById("friendsMsg");
    var avatar = document.getElementById("friendsMsgAvatar");
    var name = document.getElementById("friendsMsgName");
    var input = document.getElementById("friendsMsgInput");

    if (avatar) { avatar.src = friend.avatar; avatar.alt = friend.name; }
    if (name) name.textContent = friend.name;
    if (input) { input.value = ""; }

    renderChatMessages(friendId);

    if (panel) {
      panel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setTimeout(function () {
        if (input) input.focus();
      }, 350);
    }
  }

  function closeMsgPanel() {
    var panel = document.getElementById("friendsMsg");
    hidePanel(panel, lastListFocus);
    document.body.style.overflow = "";
    currentMsgId = null;
  }

  function sendMessage() {
    var input = document.getElementById("friendsMsgInput");
    var text = input ? input.value.trim() : "";
    if (!text) {
      showToast("写点什么再发送吧");
      return;
    }

    var msgs = CHAT_HISTORY[currentMsgId];
    if (!msgs) {
      CHAT_HISTORY[currentMsgId] = [];
      msgs = CHAT_HISTORY[currentMsgId];
    }

    var now = new Date();
    var timeStr = now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();

    msgs.push({ from: "me", text: text, time: timeStr });

    if (input) input.value = "";
    renderChatMessages(currentMsgId);
  }

  function setupMsgPanel() {
    var overlay = document.getElementById("friendsMsgOverlay");
    var backBtn = document.getElementById("friendsMsgBack");
    var closeBtn = document.getElementById("friendsMsgClose");
    var sendBtn = document.getElementById("friendsMsgSend");
    var input = document.getElementById("friendsMsgInput");

    if (overlay) overlay.addEventListener("click", closeMsgPanel);
    if (backBtn) backBtn.addEventListener("click", closeMsgPanel);
    if (closeBtn) closeBtn.addEventListener("click", closeMsgPanel);
    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          sendMessage();
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMsgPanel();
    });
  }

  function getCurrentFriend() {
    return FRIENDS.find(function (f) { return f.id === currentVisitId; }) || null;
  }

  function getFriendDressSelection(friend) {
    var npcDress = global.Yummi && global.Yummi.npcDress;
    if (npcDress && typeof npcDress.resolveForFriend === "function") {
      return npcDress.resolveForFriend(friend);
    }
    if (friend && friend.dress && friend.dress.selected) {
      return friend.dress.selected;
    }
    return {};
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

    if (foodImageIndex) {
      return foodImageIndex;
    }

    foodImageIndex = {};
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
        foodImageIndex[list[i]] = "source/compressed/10kb/" + folder + "/" + list[i] + "-10kb.webp";
      }
    }
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
    var compareBody = document.getElementById("friendsCompareBody");
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

  function openComparePanel() {
    var friend = getCurrentFriend();
    var taste = global.Yummi && global.Yummi.foodTaste;
    var yummy = global.Yummi && global.Yummi.yummyCode;
    var comparePanel = document.getElementById("friendsComparePanel");
    var compareBody = document.getElementById("friendsCompareBody");
    var ranked;
    var theirFoods = [];
    var payload;
    var analysis;
    var i;

    if (!friend || !comparePanel || !compareBody) {
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
      return;
    }

    ranked = taste.rankByProfile(friend.preference || {}, { limit: 6 }) || [];
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
      return;
    }

    payload = {
      petName: friend.name,
      foods: theirFoods,
      dress: {
        selected: getFriendDressSelection(friend)
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
      return;
    }

    renderCompareBody(analysis);
    comparePanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeComparePanel() {
    var comparePanel = document.getElementById("friendsComparePanel");
    hidePanel(comparePanel, visitRestoreFocus());
    if (document.getElementById("friendsVisit") &&
        document.getElementById("friendsVisit").getAttribute("aria-hidden") === "false") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  function setupComparePanel() {
    var comparePanel = document.getElementById("friendsComparePanel");
    var compareOverlay = document.getElementById("friendsCompareOverlay");
    var compareClose = document.getElementById("friendsCompareClose");

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

  function renderFeedBody(mode, friend, foodName) {
    var feedBody = document.getElementById("friendsFeedBody");
    var foods = getSelectedFoods();
    var coins = global.Yummi && global.Yummi.fishCoins ? global.Yummi.fishCoins.get() : 0;
    var html = "";
    var i;

    if (!feedBody || !friend) {
      return;
    }

    if (mode === "result") {
      feedBody.innerHTML =
        '<div class="shop-feed__crunch">' +
          '<div class="shop-feed__crunch-text">咔哧 ~ 咔哧 ~</div>' +
          '<div class="shop-feed__sub">' + escapeHtml(friend.name) + "吃掉了你投喂的「" + escapeHtml(foodName) + "」，尾巴摇个不停</div>" +
        '</div>' +
        '<button type="button" class="shop-feed__back" id="friendsFeedBack">完成</button>';
      return;
    }

    if (mode === "nocoin") {
      feedBody.innerHTML =
        '<div class="shop-feed__empty">' +
          '<div class="shop-feed__empty-icon">🐟</div>' +
          '<div class="shop-feed__empty-text">小鱼干币不足</div>' +
          '<div class="shop-feed__empty-sub">投喂需要 1 个小鱼干币，去多逛逛赚一些吧 ~</div>' +
        '</div>' +
        '<button type="button" class="shop-feed__back" id="friendsFeedBack">返回</button>';
      return;
    }

    if (!foods.length) {
      feedBody.innerHTML =
        '<div class="shop-feed__empty">' +
          '<div class="shop-feed__empty-icon">🍽</div>' +
          '<div class="shop-feed__empty-text">还没有选好的食物</div>' +
          '<div class="shop-feed__empty-sub">去点餐模块选些好吃的再来投喂吧 ~</div>' +
        '</div>' +
        '<button type="button" class="shop-feed__back" id="friendsFeedBack">返回</button>';
      return;
    }

    html = '<div class="shop-feed__title">选一种食物投喂 ' + escapeHtml(friend.name) + "</div>";
    html += '<div class="shop-feed__coin">🐟 小鱼干币：' + coins + "</div>";
    html += '<div class="shop-feed__list">';
    for (i = 0; i < foods.length; i += 1) {
      html +=
        '<button type="button" class="shop-feed__item" data-food-index="' + i + '">' +
          '<span class="shop-feed__item-media">' +
            (
              getFoodImageUrl(foods[i])
                ? '<img class="shop-feed__item-thumb" src="' + escapeHtml(getFoodImageUrl(foods[i])) + '" alt="' + escapeHtml(foods[i]) + '" loading="lazy" decoding="async">'
                : '<span class="shop-feed__item-placeholder" aria-hidden="true">🍽</span>'
            ) +
          "</span>" +
          '<span class="shop-feed__item-content">' +
            '<span class="shop-feed__item-name">' + escapeHtml(foods[i]) + "</span>" +
          "</span>" +
        "</button>";
    }
    html += "</div>";
    html += '<button type="button" class="shop-feed__back" id="friendsFeedBack">返回</button>';
    feedBody.innerHTML = html;

    feedBody.querySelectorAll(".shop-feed__item").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute("data-food-index"), 10);
        var selectedFood = foods[idx];
        if (!global.Yummi || !global.Yummi.fishCoins || !global.Yummi.fishCoins.spend(1)) {
          renderFeedBody("nocoin", friend);
          bindFeedBodyActions(friend);
          return;
        }
        global.Yummi.fishCoins.render("fishCoinBar");
        addAffinity(5);
        renderList();
        renderFeedBody("result", friend, selectedFood);
        bindFeedBodyActions(friend);
      });
    });
  }

  function bindFeedBodyActions(friend) {
    var backBtn = document.getElementById("friendsFeedBack");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        closeFeedPanel();
      });
    }
  }

  function openFeedPanel() {
    var friend = getCurrentFriend();
    var feedPanel = document.getElementById("friendsFeedPanel");

    if (!friend || !feedPanel) {
      return;
    }

    renderFeedBody("list", friend);
    bindFeedBodyActions(friend);
    feedPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeFeedPanel() {
    var feedPanel = document.getElementById("friendsFeedPanel");
    hidePanel(feedPanel, visitRestoreFocus());
    if (document.getElementById("friendsVisit") &&
        document.getElementById("friendsVisit").getAttribute("aria-hidden") === "false") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  function setupFeedPanel() {
    var feedPanel = document.getElementById("friendsFeedPanel");
    var feedOverlay = document.getElementById("friendsFeedOverlay");
    var feedClose = document.getElementById("friendsFeedClose");

    if (feedOverlay) {
      feedOverlay.addEventListener("click", function (e) {
        e.stopPropagation();
        closeFeedPanel();
      });
    }

    if (feedClose) {
      feedClose.addEventListener("click", function (e) {
        e.stopPropagation();
        closeFeedPanel();
      });
    }

    if (feedPanel) {
      feedPanel.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && feedPanel && feedPanel.getAttribute("aria-hidden") === "false") {
        closeFeedPanel();
      }
    });
  }

  /* ========== 拜访视图 ========== */

  function openVisitView(friendId) {
    var friend = FRIENDS.find(function (f) { return f.id === friendId; });
    if (!friend) return;

    currentVisitId = friendId;
    hideCatBar();

    var shopIdx = getFriendShopIndex(friendId);
    var shop = VISIT_SHOPS[shopIdx];
    if (!shop) return;

    var view = document.getElementById("friendsVisit");
    var shopHost = document.getElementById("friendsVisitShop");
    var catWrap = document.getElementById("friendsVisitCatWrap");
    var catImg = document.getElementById("friendsVisitCat");
    var catName = document.getElementById("friendsVisitCatName");
    var label = document.getElementById("friendsVisitLabel");

    if (shopHost) {
      shopHost.innerHTML = '<img src="' + escapeHtml(shop.svg) + '" alt="' + escapeHtml(shop.name) + '">';
    }

    if (catWrap && catImg) {
      catWrap.style.left = shop.catPos.left + "%";
      catWrap.style.top = shop.catPos.top + "%";
      catWrap.style.width = shop.catPos.width + "%";
      catImg.src = friend.avatar;
      catImg.alt = friend.name;
      catImg.style.width = "100%";
      catImg.style.height = "auto";
    }

    if (catName) {
      catName.textContent = friend.name + "的哈基米";
    }

    if (label) {
      label.textContent = friend.name + " 的 " + shop.name;
    }

    if (view) {
      view.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  }

  function closeVisitView() {
    var comparePanel = document.getElementById("friendsComparePanel");
    var feedPanel = document.getElementById("friendsFeedPanel");
    var view = document.getElementById("friendsVisit");

    hidePanel(comparePanel, null);
    hidePanel(feedPanel, null);
    hideCatBar();
    hidePanel(view, lastListFocus);
    document.body.style.overflow = "";
    currentVisitId = null;
  }

  function showCatBar() {
    var bar = document.getElementById("friendsCatBar");
    var catWrap = document.getElementById("friendsVisitCatWrap");
    if (!bar || !catWrap) return;

    var rect = catWrap.getBoundingClientRect();
    var stage = document.querySelector('.friends-visit__stage');
    var stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0 };

    var centerX = rect.left + rect.width / 2 - stageRect.left;
    var topY = rect.top - stageRect.top - CATBAR_OFFSET_Y;

    bar.style.left = centerX + "px";
    bar.style.top = topY + "px";
    bar.style.transform = "translateX(-50%)";
    bar.setAttribute("aria-hidden", "false");
  }

  function hideCatBar() {
    var bar = document.getElementById("friendsCatBar");
    if (!bar) {
      return;
    }
    blurFocusWithin(bar);
    bar.setAttribute("aria-hidden", "true");
  }

  function toggleCatBar() {
    var bar = document.getElementById("friendsCatBar");
    if (!bar) return;
    if (bar.getAttribute("aria-hidden") === "false") {
      hideCatBar();
    } else {
      showCatBar();
    }
  }

  function addAffinity(amount) {
    var friend = FRIENDS.find(function (f) { return f.id === currentVisitId; });
    if (!friend) return;
    friend.affinity = Math.min(100, friend.affinity + amount);
  }

  function setupVisitView() {
    var backBtn = document.getElementById("friendsVisitBack");
    var catWrap = document.getElementById("friendsVisitCatWrap");
    var feedBtn = document.getElementById("friendsCatFeed");
    var petBtn = document.getElementById("friendsCatPet");
    var visitPrefBtn = document.getElementById("friendsVisitPref");
    var visitFeedBtn = document.getElementById("friendsVisitFeed");

    if (backBtn) backBtn.addEventListener("click", closeVisitView);
    if (catWrap) catWrap.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleCatBar();
    });
    if (feedBtn) feedBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      openFeedPanel();
    });
    if (petBtn) petBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      handlePetCat();
    });
    if (visitPrefBtn) visitPrefBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      hideCatBar();
      openComparePanel();
    });
    if (visitFeedBtn) visitFeedBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      hideCatBar();
      openFeedPanel();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var comparePanel = document.getElementById("friendsComparePanel");
      var feedPanel = document.getElementById("friendsFeedPanel");
      if (comparePanel && comparePanel.getAttribute("aria-hidden") === "false") return;
      if (feedPanel && feedPanel.getAttribute("aria-hidden") === "false") return;
      closeVisitView();
    });
  }

  function handleFeedCat() {
    openFeedPanel();
  }

  function handlePetCat() {
    var friend = FRIENDS.find(function (f) { return f.id === currentVisitId; });
    if (!friend) return;

    addAffinity(3);
    renderList();
    showToast("喵 ~ 亲密度 +3");
  }

  /* ========== 列表交互 ========== */

  function handleAction(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;

    var action = btn.getAttribute("data-action");
    var id = btn.getAttribute("data-id");
    var friend = FRIENDS.find(function (f) { return f.id === id; });

    lastListFocus = btn;

    if (action === "visit") {
      openVisitView(id);
    } else if (action === "msg") {
      openMsgPanel(id);
    }
  }

  function showToast(text) {
    var existing = document.querySelector('.friends-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'friends-toast';
    toast.textContent = text;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('friends-toast--show');
    });

    setTimeout(function () {
      toast.classList.remove('friends-toast--show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 1800);
  }

  function init() {
    renderList();
    setupMsgPanel();
    setupVisitView();
    setupComparePanel();
    setupFeedPanel();

    var main = document.getElementById("friendsMain");
    if (main) main.addEventListener("click", handleAction);

    if (global.Yummi && global.Yummi.fishCoins) {
      global.Yummi.fishCoins.render("fishCoinBar");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
