/***********************************************
> Locket Gold Client V17 - Cá nhân hóa độc quyền cho: ttruonngg
> Khắc phục triệt để lỗi MẤT BẠN & XUNG ĐỘT HEADER:
  1. Chỉ cấp huy hiệu VIP duy nhất cho tài khoản "ttruonngg" (7tegglv8kah3bvapztlejemxubr2).
  2. Tuyệt đối KHÔNG ghi đè `status` hay `headers` HTTP/2 ở chiều `http-response`
     (chỉ gọi `$done({ body: JSON.stringify(obj) })` khi có sửa đổi, hoặc `$done({})`
     để giữ nguyên gói tin gốc), giúp API tải danh sách bạn bè (`fetchUserV2`, `getFriends`)
     hoạt động mượt 100%.
  3. Nhường 100% luồng `/generateFilteredImage` và `/createOverlay` cho `Locketptbfilterv2.js`.
***********************************************/

(function () {
  var VIP_ONLY_SET = new Set([
    "ttruonngg",
    "7tegglv8kah3bvapztlejemxubr2",
    "7tegglv8kah3bvapztlejemx"
  ]);

  function applyGoldBadge(target) {
    if (!target || typeof target !== "object") return;
    target.badge = "locket_gold";
    target.badge_tier = "gold";
    target.show_badge = true;
    target.is_gold = true;
    target.has_gold = true;
    target.gold = true;
    target.gold_subscription = true;
    target.has_gold_subscription = true;
    target.tier = "gold";
    target.subscription_status = "active";
    if (target.user && typeof target.user === "object" && target.user !== target) {
      applyGoldBadge(target.user);
    }
    if (target.profile && typeof target.profile === "object" && target.profile !== target) {
      applyGoldBadge(target.profile);
    }
  }

  function isTargetOwner(target) {
    if (!target || typeof target !== "object") return false;
    var uid = String(
      target.uid || target.user_id || target.id || target.userId || ""
    ).toLowerCase().trim();
    if (uid && VIP_ONLY_SET.has(uid)) return true;

    var uname = String(target.username || "").toLowerCase().trim();
    if (uname && VIP_ONLY_SET.has(uname)) return true;

    if (target.user && typeof target.user === "object") {
      var uUid = String(target.user.uid || target.user.id || target.user.user_id || "").toLowerCase().trim();
      if (uUid && VIP_ONLY_SET.has(uUid)) return true;
      var uUname = String(target.user.username || "").toLowerCase().trim();
      if (uUname && VIP_ONLY_SET.has(uUname)) return true;
    }
    return false;
  }

  if (typeof $response === "undefined") {
    var reqUrl = (typeof $request !== "undefined" && $request && $request.url) ? String($request.url) : "";
    if (reqUrl.indexOf("generateFilteredImage") !== -1 || reqUrl.indexOf("createOverlay") !== -1) {
      return $done({});
    }
    if (reqUrl.indexOf("changeProfileInfo") !== -1) {
      return $done({
        response: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            data: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true },
            result: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true }
          })
        }
      });
    }
    return $done({});
  }

  var respUrl = (typeof $request !== "undefined" && $request && $request.url) ? String($request.url) : "";
  if (respUrl.indexOf("generateFilteredImage") !== -1 || respUrl.indexOf("createOverlay") !== -1) {
    return $done({});
  }

  var body = $response ? $response.body : null;
  if (!body || typeof body !== "string") {
    return $done({});
  }

  try {
    var obj = JSON.parse(body);
    if (!obj || typeof obj !== "object") {
      return $done({});
    }

    var modified = false;

    function unlockOwnerNode(userNode) {
      if (!userNode || typeof userNode !== "object") return;
      applyGoldBadge(userNode);
      userNode.can_use_filters = true;
      userNode.can_use_gold_features = true;
      userNode.can_generate_filtered_image = true;
      userNode.can_create_filtered_image = true;
      userNode.has_ai_access = true;
      userNode.filter_access = true;
      modified = true;
    }

    function transformNode(node, depth) {
      if (!node || typeof node !== "object" || depth > 12) return;
      if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) {
          transformNode(node[i], depth + 1);
        }
        return;
      }

      if (isTargetOwner(node)) {
        unlockOwnerNode(node);
      }

      var falseFlags = [
        "is_locked", "locked", "requires_gold", "require_gold",
        "gold_only", "is_gold_only", "paywall", "show_paywall",
        "show_upsell", "upsell", "blurred", "is_blurred", "needs_gold"
      ];
      for (var f of falseFlags) {
        if (f in node && node[f] !== false) {
          node[f] = false;
          modified = true;
        }
      }

      var trueFlags = [
        "can_view", "unlocked", "is_unlocked", "is_free", "free",
        "can_use_filter", "allowed", "can_use_filters"
      ];
      for (var t of trueFlags) {
        if (t in node && node[t] !== true) {
          node[t] = true;
          modified = true;
        }
      }

      var clearUrl = node.unblurred_url || node.unlocked_url || node.result_url || node.image_url || node.transformed_image_url || node.url;
      if (clearUrl && typeof clearUrl === "string" && clearUrl.indexOf("http") === 0) {
        if ("blurred_url" in node && node.blurred_url !== clearUrl) {
          node.blurred_url = clearUrl;
          modified = true;
        }
        if ("blurred_image_url" in node && node.blurred_image_url !== clearUrl) {
          node.blurred_image_url = clearUrl;
          modified = true;
        }
      }

      for (var k of Object.keys(node)) {
        if (k !== "badge" && k !== "is_gold" && k !== "has_gold" && k !== "tier" && k !== "gold") {
          if (VIP_ONLY_SET.has(k.toLowerCase().trim()) && node[k] && typeof node[k] === "object") {
            applyGoldBadge(node[k]);
            modified = true;
          }
          transformNode(node[k], depth + 1);
        }
      }
    }

    transformNode(obj, 0);

    if (modified) {
      return $done({ body: JSON.stringify(obj) });
    }
    return $done({});
  } catch (e) {
    return $done({});
  }
})();
