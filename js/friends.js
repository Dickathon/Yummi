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
      visits: 32
    },
    {
      id: "f2",
      name: "雪球",
      avatar: ASSET_BASE + "cat2-10kb.webp",
      bio: "一起吃遍所有奶茶店吧",
      affinity: 88,
      lastInteract: "2天前",
      visits: 24
    },
    {
      id: "f3",
      name: "小橘",
      avatar: ASSET_BASE + "cat2-10kb.webp",
      bio: "今天也在星巴克晒太阳 ~",
      affinity: 78,
      lastInteract: "10分钟前",
      visits: 12
    },
    {
      id: "f4",
      name: "奶茶喵",
      avatar: ASSET_BASE + "cat3-10kb.webp",
      bio: "喜茶的奶盖yyds",
      affinity: 65,
      lastInteract: "1小时前",
      visits: 8
    },
    {
      id: "f5",
      name: "汉堡侦探",
      avatar: ASSET_BASE + "cat4-10kb.webp",
      bio: "正在寻找全城最好吃的汉堡",
      affinity: 42,
      lastInteract: "3小时前",
      visits: 5
    },
    {
      id: "f6",
      name: "抹茶控",
      avatar: ASSET_BASE + "cat3-10kb.webp",
      bio: "喜欢一切抹茶味的东西",
      affinity: 35,
      lastInteract: "昨天",
      visits: 3
    },
    {
      id: "f7",
      name: "炸鸡王子",
      avatar: ASSET_BASE + "cat4-10kb.webp",
      bio: "肯德基常驻嘉宾",
      affinity: 28,
      lastInteract: "3天前",
      visits: 2
    },
    {
      id: "f8",
      name: "芋泥波波",
      avatar: ASSET_BASE + "cat5-10kb.webp",
      bio: "奶茶三分糖，生活十分甜",
      affinity: 15,
      lastInteract: "5天前",
      visits: 1
    },
    {
      id: "f9",
      name: "深夜食堂",
      avatar: ASSET_BASE + "cat2-10kb.webp",
      bio: "海底捞夜场选手",
      affinity: 8,
      lastInteract: "1周前",
      visits: 1
    }
  ];

  var currentMsgId = null;
  var currentVisitId = null;
  var CATBAR_OFFSET_Y = 52; // 面板在小猫上方的像素偏移

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
    if (panel) {
      panel.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
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
    var catImg = document.getElementById("friendsVisitCat");
    var label = document.getElementById("friendsVisitLabel");

    if (shopHost) {
      shopHost.innerHTML = '<img src="' + escapeHtml(shop.svg) + '" alt="' + escapeHtml(shop.name) + '">';
    }

    if (catImg) {
      catImg.src = friend.avatar;
      catImg.alt = friend.name;
      catImg.style.left = shop.catPos.left + "%";
      catImg.style.top = shop.catPos.top + "%";
      catImg.style.width = shop.catPos.width + "%";
      catImg.style.height = "auto";
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
    var view = document.getElementById("friendsVisit");
    if (view) {
      view.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    hideCatBar();
    currentVisitId = null;
  }

  function showCatBar() {
    var bar = document.getElementById("friendsCatBar");
    var catImg = document.getElementById("friendsVisitCat");
    if (!bar || !catImg) return;

    var rect = catImg.getBoundingClientRect();
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
    if (bar) bar.setAttribute("aria-hidden", "true");
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
    var overlay = document.getElementById("friendsVisitOverlay");
    var catImg = document.getElementById("friendsVisitCat");
    var feedBtn = document.getElementById("friendsCatFeed");
    var petBtn = document.getElementById("friendsCatPet");

    if (backBtn) backBtn.addEventListener("click", closeVisitView);
    if (overlay) overlay.addEventListener("click", closeVisitView);
    if (catImg) catImg.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleCatBar();
    });
    if (feedBtn) feedBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      handleFeedCat();
    });
    if (petBtn) petBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      handlePetCat();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeVisitView();
    });
  }

  function handleFeedCat() {
    var friend = FRIENDS.find(function (f) { return f.id === currentVisitId; });
    if (!friend) return;

    var coins = global.Yummi && global.Yummi.fishCoins ? global.Yummi.fishCoins.get() : 0;
    if (coins < 1) {
      showToast("小鱼干币不足，快去赚取吧 ~");
      return;
    }

    if (global.Yummi && global.Yummi.fishCoins) {
      global.Yummi.fishCoins.spend(1);
      global.Yummi.fishCoins.render("fishCoinBar");
    }

    addAffinity(5);
    renderList();
    showToast("投喂成功！亲密度 +5");
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
    var name = friend ? friend.name : "";

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
