/**
 * 食物圈 — 背景展示与栏目交互
 */
(function (global) {
  "use strict";

  var SVG_BASE = "source/svgSHOP/";
  var previewPanel = null;
  var previewOverlay = null;
  var previewClose = null;
  var previewBody = null;
  var previewTitle = null;
  var shareInput = null;
  var shareSubmit = null;
  var shareStatus = null;
  var foodImageIndex = null;
  var feedingStage = null;
  var petStage = null;
  var petBubble = null;
  var foodList = null;
  var feedStatus = null;
  var feedSlots = [];
  var feedingLocked = false;
  var bubbleTimer = null;
  var FEED_PRICE = 1;

  // 店铺文件名 → SVG 文件名映射（与 shop.js 保持一致）
  function getSvgFile(shopFile) {
    var name = shopFile.replace(/^shop_/, "").replace(/-10kb\.webp$/, "").replace(/\.png$/, "");
    return SVG_BASE + "interior_" + name + ".svg";
  }

  // 店铺数据（仅用于映射 SVG）
  var SHOPS = [
    { file: "shop_starbucks-10kb.webp" },
    { file: "shop_mcdonalds-10kb.webp" },
    { file: "shop_heytea-10kb.webp" },
    { file: "shop_kfc-10kb.webp" },
    { file: "shop_haidilao-10kb.webp" },
    { file: "shop_mixue-10kb.webp" },
    { file: "shop_luckin-10kb.webp" },
    { file: "shop_burgerking-10kb.webp" },
    { file: "shop_chapanda-10kb.webp" },
    { file: "shop_pizzahut-10kb.webp" },
    { file: "shop_nayuki-10kb.webp" },
    { file: "shop_subway-10kb.webp" },
    { file: "shop_alittle_tea-10kb.webp" },
    { file: "shop_auntea-10kb.webp" },
    { file: "shop_goodme-10kb.webp" },
    { file: "shop_laoxiangji-10kb.webp" }
  ];

  // 虚构消息数据
  var MESSAGES = [
    { id: 1, from: "小鹿", time: "今天 14:30", text: "嗨！今天星巴克的拿铁很好喝，推荐你试试~" },
    { id: 2, from: "阿茶", time: "昨天 20:15", text: "周末一起去吃海底捞吗？听说有新锅底~" },
    { id: 3, from: "甜甜", time: "昨天 10:22", text: "喜茶的多肉葡萄回归了！排队半小时也值得~" },
    { id: 4, from: "大胃王", time: "3天前", text: "麦当劳的薯条买一送一，别忘了去薅羊毛~" },
    { id: 5, from: "火锅仙子", time: "5天前", text: "海底捞的服务太贴心了，一个人去也不尴尬~" },
    { id: 6, from: "学生仔", time: "1周前", text: "蜜雪冰城的柠檬水涨价了，但还是最便宜的~" }
  ];

  function getLastShopIndex() {
    try {
      var raw = localStorage.getItem("yummi_last_shop");
      if (raw === null) return -1;
      var index = parseInt(raw, 10);
      if (isNaN(index) || index < 0 || index >= SHOPS.length) return -1;
      return index;
    } catch (e) {
      return -1;
    }
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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

  function randomChoice(list) {
    if (!list || !list.length) {
      return "";
    }
    return list[Math.floor(Math.random() * list.length)];
  }

  function prefersReducedMotion() {
    return !!(
      global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function setFeedStatus(message, tone) {
    if (!feedStatus) return;
    feedStatus.textContent = message || "";
    feedStatus.classList.toggle("is-error", tone === "error");
    feedStatus.classList.toggle("is-success", tone === "success");
  }

  function renderFishCoins() {
    var wallet = global.Yummi && global.Yummi.fishCoins;
    if (wallet && typeof wallet.render === "function") {
      wallet.render("fishCoinBar");
    }
  }

  function renderFoodCard(name) {
    var src = getFoodImageUrl(name);
    return (
      '<article class="fc-share-preview__food-card">' +
        '<div class="fc-share-preview__food-media">' +
          (
            src
              ? '<img class="fc-share-preview__food-thumb" src="' + escapeHtml(src) + '" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async">'
              : '<span class="fc-share-preview__food-placeholder" aria-hidden="true">🍽</span>'
          ) +
        "</div>" +
        '<p class="fc-share-preview__food-name">' + escapeHtml(name) + "</p>" +
      "</article>"
    );
  }

  function renderFoodGrid(names) {
    if (!names || !names.length) {
      return "";
    }

    return (
      '<div class="fc-share-preview__food-grid">' +
        names.map(renderFoodCard).join("") +
      "</div>"
    );
  }

  function getDressSnapshot() {
    var dressState = global.Yummi &&
      global.Yummi.modules &&
      global.Yummi.modules.dress &&
      global.Yummi.modules.dress.state;
    var state;

    if (!dressState || typeof dressState.create !== "function") {
      return null;
    }

    state = dressState.create();
    return typeof dressState.captureSnapshot === "function"
      ? dressState.captureSnapshot(state)
      : state;
  }

  function renderOwnPetStage() {
    var snapshot = getDressSnapshot();
    var layers = snapshot && snapshot.layers ? snapshot.layers : [];
    var drink = snapshot && snapshot.drink;
    var html = '<div class="fc-pet-stage__aura" aria-hidden="true"></div>';

    if (!petStage) {
      return;
    }

    if (!layers.length) {
      html += '<div class="fc-pet-stage__placeholder">哈基米</div>';
    } else {
      layers.forEach(function (layer) {
        var zClass = layer.zClass || layer.className || "layer";
        html +=
          '<img class="fc-pet-stage__layer fc-pet-stage__layer--' + escapeHtml(zClass) + '"' +
            ' src="' + escapeHtml(layer.src) + '"' +
            ' alt="' + escapeHtml(layer.label || "宠物图层") + '"' +
            ' loading="lazy" decoding="async">';
      });
    }

    if (drink && drink.src) {
      html +=
        '<div class="fc-pet-stage__drink">' +
          '<img src="' + escapeHtml(drink.src) + '" alt="' + escapeHtml(drink.name || "饮品") + '" loading="lazy" decoding="async">' +
        "</div>";
    }

    html += '<span class="fc-pet-stage__target" data-feed-target aria-hidden="true"></span>';
    petStage.innerHTML = html;
    petStage.setAttribute("aria-label", (snapshot && snapshot.petDisplayName) || "当前宠物形象");
  }

  function ensureFeedSlots() {
    var selected = getSelectedFoods();
    var targetCount = Math.min(3, selected.length);
    var candidates;
    var next;

    if (!targetCount) {
      feedSlots = [];
      return selected;
    }

    feedSlots = feedSlots.filter(function (name) {
      return selected.indexOf(name) !== -1;
    }).slice(0, targetCount);

    while (feedSlots.length < targetCount) {
      candidates = selected.filter(function (name) {
        return feedSlots.indexOf(name) === -1;
      });
      next = randomChoice(candidates.length ? candidates : selected);
      if (!next) break;
      feedSlots.push(next);
    }

    return selected;
  }

  function renderFoodButton(name, index) {
    var src = getFoodImageUrl(name);

    return (
      '<button type="button" class="fc-feed-food" role="listitem"' +
        ' data-feed-slot="' + index + '" data-feed-name="' + escapeHtml(name) + '"' +
        ' aria-label="投喂' + escapeHtml(name) + '，价格 1 个小鱼干">' +
        '<span class="fc-feed-food__plate" data-feed-food-art>' +
          (
            src
              ? '<img class="fc-feed-food__img" src="' + escapeHtml(src) + '" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async">'
              : '<span class="fc-feed-food__placeholder" aria-hidden="true">🍽</span>'
          ) +
        "</span>" +
        '<span class="fc-feed-food__meta">' +
          '<span class="fc-feed-food__name">' + escapeHtml(name) + "</span>" +
          '<span class="fc-feed-food__price">1 个小鱼干</span>' +
        "</span>" +
      "</button>"
    );
  }

  function renderFoodSlots() {
    var selected = ensureFeedSlots();

    if (!foodList) {
      return;
    }

    if (!selected.length) {
      foodList.innerHTML =
        '<div class="fc-food-list__empty" role="listitem">' +
          '<span class="fc-food-list__empty-icon" aria-hidden="true">🍙</span>' +
          '<span>还没有可投喂的食物</span>' +
        "</div>";
      setFeedStatus("先去点餐模块选喜欢的食物，再回来投喂哈基米。", "");
      return;
    }

    foodList.innerHTML = feedSlots.map(renderFoodButton).join("");

    if (selected.length < 3) {
      setFeedStatus("再选 " + (3 - selected.length) + " 道食物，就能摆满三格投喂架。", "");
      return;
    }

    setFeedStatus("点击任意食物投喂，消耗 1 个小鱼干。", "");
  }

  function pickReplacement(slotIndex, fedName) {
    var selected = getSelectedFoods();
    var stillVisible;
    var candidates;

    if (!selected.length) {
      return "";
    }

    if (selected.length <= 3) {
      candidates = selected.filter(function (name) {
        return name !== fedName;
      });
      return randomChoice(candidates.length ? candidates : selected);
    }

    stillVisible = feedSlots.filter(function (name, index) {
      return index !== slotIndex && name;
    });
    candidates = selected.filter(function (name) {
      return stillVisible.indexOf(name) === -1 && name !== fedName;
    });

    if (!candidates.length) {
      candidates = selected.filter(function (name) {
        return stillVisible.indexOf(name) === -1;
      });
    }

    return randomChoice(candidates.length ? candidates : selected);
  }

  function getFeedTargetRect() {
    var target = petStage && petStage.querySelector("[data-feed-target]");
    return target ? target.getBoundingClientRect() : (petStage ? petStage.getBoundingClientRect() : null);
  }

  function animateFoodToPet(sourceButton) {
    return new Promise(function (resolve) {
      var art = sourceButton && sourceButton.querySelector("[data-feed-food-art]");
      var sourceRect = art ? art.getBoundingClientRect() : null;
      var targetRect = getFeedTargetRect();
      var flyer;
      var clone;
      var dx;
      var dy;
      var animation;

      if (prefersReducedMotion() || !sourceRect || !targetRect) {
        resolve();
        return;
      }

      flyer = document.createElement("div");
      flyer.className = "fc-feed-flyer";
      flyer.style.left = sourceRect.left + "px";
      flyer.style.top = sourceRect.top + "px";
      flyer.style.width = sourceRect.width + "px";
      flyer.style.height = sourceRect.height + "px";

      clone = art.cloneNode(true);
      clone.removeAttribute("data-feed-food-art");
      clone.className = "fc-feed-flyer__art";
      flyer.appendChild(clone);
      document.body.appendChild(flyer);

      dx = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
      dy = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

      if (typeof flyer.animate === "function") {
        animation = flyer.animate([
          { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
          { transform: "translate3d(" + dx + "px, " + dy + "px, 0) scale(0.16)", opacity: 0.08 }
        ], {
          duration: 680,
          easing: "cubic-bezier(0.22, 0.78, 0.24, 1)",
          fill: "forwards"
        });

        animation.finished.then(function () {
          flyer.remove();
          resolve();
        }).catch(function () {
          flyer.remove();
          resolve();
        });
        return;
      }

      requestAnimationFrame(function () {
        flyer.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0) scale(0.16)";
        flyer.style.opacity = "0.08";
      });

      setTimeout(function () {
        flyer.remove();
        resolve();
      }, 700);
    });
  }

  function showPetBubble(foodName) {
    var roasts = global.Yummi && global.Yummi.foodRoasts;
    var info = roasts && typeof roasts.get === "function"
      ? roasts.get(foodName)
      : { text: (roasts && roasts.fallback) || "今天穿成了" + foodName + "，但我的自信还在备餐中。" };

    if (!petBubble) {
      return;
    }

    clearTimeout(bubbleTimer);
    petBubble.textContent = info.text;
    petBubble.setAttribute("aria-hidden", "false");
    petBubble.classList.remove("is-visible");
    void petBubble.offsetWidth;
    petBubble.classList.add("is-visible");

    bubbleTimer = setTimeout(function () {
      petBubble.classList.remove("is-visible");
      petBubble.setAttribute("aria-hidden", "true");
    }, 5200);
  }

  function finishFeeding(slotIndex, foodName) {
    feedSlots[slotIndex] = pickReplacement(slotIndex, foodName);
    renderFoodSlots();
    showPetBubble(foodName);
    setFeedStatus("已投喂「" + foodName + "」，小鱼干 -1。", "success");
  }

  function handleFeedClick(event) {
    var btn = event.target.closest("[data-feed-slot]");
    var wallet = global.Yummi && global.Yummi.fishCoins;
    var slotIndex;
    var foodName;

    if (!btn || feedingLocked) {
      return;
    }

    slotIndex = parseInt(btn.getAttribute("data-feed-slot"), 10);
    foodName = feedSlots[slotIndex] || btn.getAttribute("data-feed-name") || "";

    if (!foodName) {
      return;
    }

    if (!wallet || typeof wallet.spend !== "function") {
      setFeedStatus("小鱼干钱包还没加载完成，请稍后再试。", "error");
      return;
    }

    if (!wallet.spend(FEED_PRICE)) {
      btn.classList.add("is-denied");
      setTimeout(function () {
        btn.classList.remove("is-denied");
      }, 420);
      setFeedStatus("小鱼干不够啦，投喂需要 1 个小鱼干。", "error");
      return;
    }

    feedingLocked = true;
    btn.classList.add("is-feeding");
    renderFishCoins();
    setFeedStatus("投喂中，哈基米正在接住「" + foodName + "」。", "");

    animateFoodToPet(btn).then(function () {
      finishFeeding(slotIndex, foodName);
      feedingLocked = false;
    }, function () {
      finishFeeding(slotIndex, foodName);
      feedingLocked = false;
    });
  }

  function focusFeeding() {
    if (!feedingStage) {
      return;
    }

    renderFoodSlots();
    feedingStage.classList.add("is-highlighted");
    setTimeout(function () {
      feedingStage.classList.remove("is-highlighted");
    }, 900);

    if (typeof feedingStage.scrollIntoView === "function") {
      feedingStage.scrollIntoView({
        block: "end",
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    }
  }

  function setupFeeding() {
    feedingStage = document.getElementById("fcFeeding");
    petStage = document.getElementById("fcPetStage");
    petBubble = document.getElementById("fcPetBubble");
    foodList = document.getElementById("fcFoodList");
    feedStatus = document.getElementById("fcFeedStatus");

    renderOwnPetStage();
    renderFoodSlots();

    if (foodList) {
      foodList.addEventListener("click", handleFeedClick);
    }

    global.addEventListener("storage", function (event) {
      if (event.key === "yummi_food_selection") {
        feedSlots = [];
        renderFoodSlots();
      }
      if (event.key === "yummi_dress_selection") {
        renderOwnPetStage();
      }
    });
  }

  function renderSharedPetStage(preview) {
    var layers = preview && preview.layers ? preview.layers : [];
    var drink = preview && preview.drink;
    var html = '<section class="fc-share-preview__hero">';

    html +=
      '<div class="fc-share-preview__stage">' +
        '<div class="fc-share-preview__aura" aria-hidden="true"></div>';

    layers.forEach(function (layer) {
      html +=
        '<img class="fc-share-preview__layer" src="' + escapeHtml(layer.src) + '"' +
          ' alt="' + escapeHtml(layer.label || "哈基米图层") + '"' +
          ' loading="lazy" decoding="async">';
    });

    if (drink && drink.src) {
      html +=
        '<div class="fc-share-preview__drink">' +
          '<img src="' + escapeHtml(drink.src) + '" alt="' + escapeHtml(drink.name || "饮品") + '" loading="lazy" decoding="async">' +
          '<span>' + escapeHtml(drink.name || "") + "</span>" +
        "</div>";
    }

    html += "</div></section>";

    return html;
  }

  function renderSimilaritySection(analysis) {
    var scoreText;
    var personality = analysis.personality;
    var reason = analysis.reasonSummary || "";

    if (analysis.selfHasFoods && analysis.similarity != null) {
      scoreText = "口味匹配度 " + analysis.similarity + "%";
    } else {
      scoreText = "先去点几样食物，再看看你们有多对胃口";
    }

    return (
      '<section class="fc-share-preview__score">' +
        '<p class="fc-share-preview__score-num">' + escapeHtml(scoreText) + "</p>" +
        '<p class="fc-share-preview__score-text">' + escapeHtml(analysis.similarityLabel || "") + "</p>" +
        (
          personality
            ? '<p class="fc-share-preview__personality">' +
                escapeHtml(personality.name + " · " + (personality.oneLiner || personality.description || "")) +
              "</p>"
            : ""
        ) +
        (
          reason
            ? '<p class="fc-share-preview__personality">' + escapeHtml(reason) + "</p>"
            : ""
        ) +
      "</section>"
    );
  }

  function renderEmptyHint(text) {
    return '<p>' + escapeHtml(text) + "</p>";
  }

  function renderSharedPreview(payload, analysis) {
    var commonFoods = analysis.commonFoods || [];
    var possibleFoods = analysis.possibleFoods || [];
    var theirFoods = analysis.theirFoods || [];

    return (
      renderSharedPetStage(analysis.preview) +
      renderSimilaritySection(analysis) +
      '<section class="fc-share-preview__section">' +
        "<h3>Ta 喜欢的食物</h3>" +
        renderFoodGrid(theirFoods) +
      "</section>" +
      '<section class="fc-share-preview__section">' +
        "<h3>你们共同喜欢</h3>" +
        (
          commonFoods.length
            ? renderFoodGrid(commonFoods)
            : renderEmptyHint("你们还没点到同一道，但口味方向很接近。")
        ) +
      "</section>" +
      '<section class="fc-share-preview__section">' +
        "<h3>你们可能还会喜欢</h3>" +
        (
          possibleFoods.length
            ? renderFoodGrid(possibleFoods)
            : renderEmptyHint("等你们再多选几样食物，系统会给出更准的推荐。")
        ) +
      "</section>"
    );
  }

  function setShareStatus(message, tone) {
    if (!shareStatus) return;
    shareStatus.textContent = message || "";
    shareStatus.classList.toggle("is-error", tone === "error");
    shareStatus.classList.toggle("is-success", tone === "success");
  }

  function openSharePreview(payload, analysis) {
    if (!previewPanel || !previewBody || !previewTitle) return;

    previewTitle.textContent = (payload.petName || "朋友") + "的哈基米";
    previewBody.innerHTML = renderSharedPreview(payload, analysis);
    previewPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeSharePreview() {
    if (!previewPanel) return;
    previewPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setupSharePreview() {
    previewPanel = document.getElementById("fcSharePreview");
    previewOverlay = document.getElementById("fcSharePreviewOverlay");
    previewClose = document.getElementById("fcSharePreviewClose");
    previewBody = document.getElementById("fcSharePreviewBody");
    previewTitle = document.getElementById("fcSharePreviewTitle");

    if (previewOverlay) previewOverlay.addEventListener("click", closeSharePreview);
    if (previewClose) previewClose.addEventListener("click", closeSharePreview);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && previewPanel && previewPanel.getAttribute("aria-hidden") === "false") {
        closeSharePreview();
      }
    });
  }

  function setupShareInput() {
    shareInput = document.getElementById("fcCodeInput");
    shareSubmit = document.getElementById("fcCodeSubmit");
    shareStatus = document.getElementById("fcCodeStatus");

    function submit() {
      var yummy = global.Yummi && global.Yummi.yummyCode;
      var code = shareInput ? shareInput.value : "";
      var decoded;
      var analysis;

      if (!yummy || typeof yummy.decodeShare !== "function" || typeof yummy.analyzeSharedTaste !== "function") {
        setShareStatus("YUMMY码 功能还没准备好，请稍后再试。", "error");
        return;
      }

      decoded = yummy.decodeShare(code);
      if (!decoded.ok) {
        setShareStatus("这个 YUMMY码 好像不对，再检查一下。", "error");
        return;
      }

      analysis = yummy.analyzeSharedTaste(
        getSelectedFoods(),
        decoded.payload
      );

      if (!analysis.ok) {
        setShareStatus("这串 YUMMY码 暂时没法解析，再试一次。", "error");
        return;
      }

      setShareStatus("解析成功，正在打开预览。", "success");
      openSharePreview(decoded.payload, analysis);
    }

    if (shareSubmit) {
      shareSubmit.addEventListener("click", submit);
    }

    if (shareInput) {
      shareInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          submit();
        }
      });
    }
  }

  // 收信箱相关
  var inboxPanel = null;
  var inboxOverlay = null;
  var inboxClose = null;
  var inboxList = null;

  function renderMessages() {
    if (!inboxList) return;
    if (MESSAGES.length === 0) {
      inboxList.innerHTML = '<p class="fc-inbox__empty">暂无消息</p>';
      return;
    }

    var html = "";
    MESSAGES.forEach(function (msg) {
      html +=
        '<div class="fc-msg" data-msg-id="' + msg.id + '">' +
          '<div class="fc-msg__header">' +
            '<span class="fc-msg__from">' + escapeHtml(msg.from) + '</span>' +
            '<span class="fc-msg__time">' + escapeHtml(msg.time) + '</span>' +
          '</div>' +
          '<p class="fc-msg__text">' + escapeHtml(msg.text) + '</p>' +
          '<div class="fc-msg__actions">' +
            '<button type="button" class="fc-msg__reply" data-msg-id="' + msg.id + '">回复</button>' +
            '<button type="button" class="fc-msg__delete" data-msg-id="' + msg.id + '">删除</button>' +
          '</div>' +
        '</div>';
    });
    inboxList.innerHTML = html;

    // 绑定回复按钮
    inboxList.querySelectorAll(".fc-msg__reply").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = parseInt(btn.getAttribute("data-msg-id"), 10);
        // TODO: 回复功能完成后在此实现
        console.log("[预留] 回复消息 id:", id);
      });
    });

    // 绑定删除按钮
    inboxList.querySelectorAll(".fc-msg__delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = parseInt(btn.getAttribute("data-msg-id"), 10);
        deleteMessage(id);
      });
    });
  }

  function deleteMessage(id) {
    for (var i = 0; i < MESSAGES.length; i++) {
      if (MESSAGES[i].id === id) {
        MESSAGES.splice(i, 1);
        break;
      }
    }
    renderMessages();
  }

  function openInbox() {
    if (!inboxPanel) return;
    renderMessages();
    inboxPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeInbox() {
    if (!inboxPanel) return;
    inboxPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setupInbox() {
    inboxPanel = document.getElementById("fcInboxPanel");
    inboxOverlay = document.getElementById("fcInboxOverlay");
    inboxClose = document.getElementById("fcInboxClose");
    inboxList = document.getElementById("fcInboxList");

    var inboxBtn = document.getElementById("fcInbox");
    if (inboxBtn) {
      inboxBtn.addEventListener("click", openInbox);
    }

    if (inboxOverlay) inboxOverlay.addEventListener("click", closeInbox);
    if (inboxClose) inboxClose.addEventListener("click", closeInbox);

    // ESC 关闭
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && inboxPanel && inboxPanel.getAttribute("aria-hidden") === "false") {
        closeInbox();
      }
    });
  }

  function init() {
    var index = getLastShopIndex();
    var bgImg = document.getElementById("fcBgImg");
    var feedBtn = document.getElementById("fcFeed");

    if (index !== -1 && bgImg) {
      var shop = SHOPS[index];
      bgImg.src = getSvgFile(shop.file);
      bgImg.alt = "店铺背景";
    }

    setupInbox();
    setupPreference();
    setupFeeding();
    if (feedBtn) {
      feedBtn.addEventListener("click", function () {
        focusFeeding();
      });
    }

    // 鱼干收益
    setupEarnings();
  }

  // ============================================================
  // 鱼干收益
  // ============================================================
  var CHECKIN_KEY = "yummi_checkin_date";

  // 虚拟投喂记录（别人给你的投喂，每次 +3 鱼干）
  var VIRTUAL_FEEDS = [
    { name: "小橘", avatar: "🐱", food: "麦辣鸡腿堡", time: "今天 10:23" },
    { name: "阿白", avatar: "🐈", food: "珍珠奶茶", time: "今天 09:15" },
    { name: "胖橘", avatar: "🐱", food: "芋泥波波牛乳", time: "昨天 20:40" },
    { name: "三花", avatar: "🐈", food: "生椰拿铁", time: "昨天 18:22" },
    { name: "奶茶猫", avatar: "🐱", food: "肥西老母鸡汤", time: "3天前" },
    { name: "黑猫", avatar: "🐈‍⬛", food: "葡式蛋挞", time: "3天前" },
  ];

  function getTodayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function hasCheckedInToday() {
    try {
      return localStorage.getItem(CHECKIN_KEY) === getTodayStr();
    } catch (e) {
      return false;
    }
  }

  function doCheckIn() {
    if (hasCheckedInToday()) return false;
    try {
      localStorage.setItem(CHECKIN_KEY, getTodayStr());
    } catch (e) {}
    var fc = global.Yummi && global.Yummi.fishCoins;
    if (fc) fc.add(1);
    return true;
  }

  function renderEarnings() {
    var body = document.getElementById("fcEarningsBody");
    if (!body) return;

    var checked = hasCheckedInToday();
    var coins = global.Yummi && global.Yummi.fishCoins ? global.Yummi.fishCoins.get() : 0;
    var totalFeedCoins = VIRTUAL_FEEDS.length * 3;

    var html = "";

    // 签到区
    html +=
      '<div class="fc-earnings__checkin">' +
        '<div class="fc-earnings__checkin-icon">📅</div>' +
        '<button class="fc-earnings__checkin-btn" id="fcCheckinBtn"' + (checked ? ' disabled' : '') + '>' +
          (checked ? "今日已签到" : "签到领鱼干") +
        '</button>' +
        '<div class="fc-earnings__checkin-text">' + (checked ? "明天再来哦 ~" : "签到可获得 1 个小鱼干") + '</div>' +
      '</div>';

    // 投喂记录区
    html += '<div class="fc-earnings__section-title">🎁 投喂记录（+' + totalFeedCoins + ' 鱼干）</div>';
    html += '<div class="fc-earnings__feed-list">';
    for (var i = 0; i < VIRTUAL_FEEDS.length; i++) {
      var f = VIRTUAL_FEEDS[i];
      html +=
        '<div class="fc-earnings__feed-item">' +
          '<div class="fc-earnings__feed-avatar">' + f.avatar + '</div>' +
          '<div class="fc-earnings__feed-info">' +
            '<div class="fc-earnings__feed-name">' + escapeHtml(f.name) + "投喂了「" + escapeHtml(f.food) + "」</div>" +
            '<div class="fc-earnings__feed-detail">' + escapeHtml(f.time) + " · 获得 3 个小鱼干</div>" +
          '</div>' +
          '<div class="fc-earnings__feed-coin">+3</div>' +
        '</div>';
    }
    html += '</div>';

    html +=
      '<div class="fc-earnings__total">' +
        "当前小鱼干余额：<strong>" + coins + " 🐟</strong>" +
      '</div>';

    body.innerHTML = html;

    var checkinBtn = document.getElementById("fcCheckinBtn");
    if (checkinBtn) {
      checkinBtn.addEventListener("click", function () {
        if (doCheckIn()) {
          renderEarnings();
          if (global.Yummi && global.Yummi.fishCoins) {
            global.Yummi.fishCoins.render("fishCoinBar");
          }
        }
      });
    }
  }

  function openEarnings() {
    var panel = document.getElementById("fcEarningsPanel");
    if (!panel) return;
    renderEarnings();
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeEarnings() {
    var panel = document.getElementById("fcEarningsPanel");
    if (!panel) return;
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setupEarnings() {
    var btn = document.getElementById("fcEarnings");
    var overlay = document.getElementById("fcEarningsOverlay");
    var closeBtn = document.getElementById("fcEarningsClose");

    if (btn) btn.addEventListener("click", openEarnings);
    if (overlay) overlay.addEventListener("click", closeEarnings);
    if (closeBtn) closeBtn.addEventListener("click", closeEarnings);

    document.addEventListener("keydown", function (e) {
      var panel = document.getElementById("fcEarningsPanel");
      if (e.key === "Escape" && panel && panel.getAttribute("aria-hidden") === "false") {
        closeEarnings();
      }
    });
  }

  // ============================================================
  // 口味偏好
  // ============================================================
  var AXIS_LABELS = { sweet: "甜", salty: "咸", sour: "酸", spicy: "辣", bitter: "苦", umami: "鲜", oily: "油", fresh: "爽" };
  var AXIS_KEYS = ["sweet", "salty", "sour", "spicy", "bitter", "umami", "oily", "fresh"];

  function getSelectedFoods() {
    try {
      var raw = localStorage.getItem("yummi_food_selection");
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function computeTasteProfile() {
    var foods = getSelectedFoods();
    var taste = global.Yummi && global.Yummi.foodTaste;
    if (!taste || !taste.profileFromSelection) {
      return null;
    }
    return taste.profileFromSelection(foods);
  }

  function renderTasteProfile() {
    var body = document.getElementById("fcPrefBody");
    if (!body) return;

    var result = computeTasteProfile();

    if (!result || !result.count) {
      body.innerHTML =
        '<div class="fc-pref__empty">' +
          '<div class="fc-pref__empty-icon">🍽</div>' +
          '<div class="fc-pref__empty-text">还没有选好的食物</div>' +
          '<div class="fc-pref__empty-sub">去点餐模块选些好吃的，就能生成你的口味画像啦 ~</div>' +
        '</div>';
      return;
    }

    var profile = result.profile || {};
    var html = '<div class="fc-pref__axes">';
    for (var i = 0; i < AXIS_KEYS.length; i++) {
      var key = AXIS_KEYS[i];
      var label = AXIS_LABELS[key];
      var val = profile[key] || 0;
      html +=
        '<div class="fc-pref__axis">' +
          '<div class="fc-pref__axis-header">' +
            '<span class="fc-pref__axis-label">' + escapeHtml(label) + '</span>' +
            '<span class="fc-pref__axis-num">' + val + '</span>' +
          '</div>' +
          '<div class="fc-pref__axis-bar">' +
            '<div class="fc-pref__axis-fill" style="width:' + val + '%;"></div>' +
          '</div>' +
        '</div>';
    }
    html += '</div>';
    html += '<div class="fc-pref__summary">基于 ' + result.count + ' 道已选菜品计算</div>';
    body.innerHTML = html;
  }

  function openPreference() {
    var panel = document.getElementById("fcPrefPanel");
    if (!panel) return;
    renderTasteProfile();
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePreference() {
    var panel = document.getElementById("fcPrefPanel");
    if (!panel) return;
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setupPreference() {
    var prefBtn = document.getElementById("fcPreference");
    var overlay = document.getElementById("fcPrefOverlay");
    var closeBtn = document.getElementById("fcPrefClose");

    if (prefBtn) prefBtn.addEventListener("click", openPreference);
    if (overlay) overlay.addEventListener("click", closePreference);
    if (closeBtn) closeBtn.addEventListener("click", closePreference);

    document.addEventListener("keydown", function (e) {
      var panel = document.getElementById("fcPrefPanel");
      if (e.key === "Escape" && panel && panel.getAttribute("aria-hidden") === "false") {
        closePreference();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
