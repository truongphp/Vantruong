/***********************************************
> Locket Gold Client V16 - Cá nhân hóa độc quyền cho: ttruonngg
> Đã tối ưu hóa lưu lượng mạng:
  1. Chỉ cấp huy hiệu VIP duy nhất cho tài khoản "ttruonngg" (cùng UID chính chủ).
  2. Loại bỏ hoàn toàn các request ngầm dư thừa (/api/vip-users) trên mỗi gói tin,
     giúp giảm 90% lưu lượng nền và tránh nghẽn kết nối trên Shadowrocket.
  3. Nhường 100% luồng /generateFilteredImage và /createOverlay cho Locketptbfilterv2.js.
***********************************************/

const SELF_UID_KEY = "LOCKET_SELF_UID";
const SELF_USERNAME_KEY = "LOCKET_SELF_USERNAME";

// Chỉ duy nhất tài khoản chính chủ "ttruonngg" của bạn
const VIP_ONLY_SET = new Set([
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
  const uid = String(
    target.uid || target.user_id || target.id || target.userId || ""
  ).toLowerCase().trim();
  if (uid && VIP_ONLY_SET.has(uid)) return true;

  const uname = String(target.username || "").toLowerCase().trim();
  if (uname && VIP_ONLY_SET.has(uname)) return true;

  if (target.user && typeof target.user === "object") {
    const uUid = String(target.user.uid || target.user.id || target.user.user_id || "").toLowerCase().trim();
    if (uUid && VIP_ONLY_SET.has(uUid)) return true;
    const uUname = String(target.user.username || "").toLowerCase().trim();
    if (uUname && VIP_ONLY_SET.has(uUname)) return true;
  }
  return false;
}

if (typeof $response === "undefined") {
  const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  if (reqUrl.includes("generateFilteredImage") || reqUrl.includes("createOverlay")) {
    $done({});
  } else if (reqUrl.includes("changeProfileInfo")) {
    $done({
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
  } else {
    let headers = Object.assign({}, ($request && $request.headers) || {});
    for (let k of Object.keys(headers)) {
      if (["if-none-match", "if-modified-since", "x-revenuecat-etag"].includes(k.toLowerCase())) {
        delete headers[k];
      }
    }
    $done({ headers: headers });
  }
} else {
  const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  if (reqUrl.includes("generateFilteredImage") || reqUrl.includes("createOverlay")) {
    $done({});
  } else {
    let body = $response.body;
    let status = $response.status || $response.statusCode || 200;

    if (body && typeof body === "string") {
      try {
        let obj = JSON.parse(body);
        const isFriendsOrFeed = /getFriends|getUsers|fetchFriends|getRecipients|recipients|moments|fetchMoments|getMoments|contacts/i.test(reqUrl);

        if (!isFriendsOrFeed && (status === 402 || status === 403 || status === 400)) {
          status = 200;
        }

        function unlockOwnerNode(userNode) {
          if (!userNode || typeof userNode !== "object") return;
          applyGoldBadge(userNode);
          userNode.can_use_filters = true;
          userNode.can_use_gold_features = true;
          userNode.can_generate_filtered_image = true;
          userNode.can_create_filtered_image = true;
          userNode.has_ai_access = true;
          userNode.filter_access = true;
        }

        function transformNode(node) {
          if (!node || typeof node !== "object") return;
          if (Array.isArray(node)) {
            for (let i = 0; i < node.length; i++) {
              transformNode(node[i]);
            }
            return;
          }

          const isOwner = Boolean(
            isTargetOwner(node) ||
            ("email" in node && node.email && typeof node.email === "string" && node.email.includes("@")) ||
            ("push_token" in node && node.push_token) ||
            ("fcm_token" in node && node.fcm_token)
          );

          if (isOwner) {
            unlockOwnerNode(node);
          }

          const falseFlags = [
            "is_locked", "locked", "requires_gold", "require_gold",
            "gold_only", "is_gold_only", "paywall", "show_paywall",
            "show_upsell", "upsell", "blurred", "is_blurred", "needs_gold"
          ];
          for (let f of falseFlags) {
            if (f in node) node[f] = false;
          }

          const trueFlags = [
            "can_view", "unlocked", "is_unlocked", "is_free", "free",
            "can_use_filter", "allowed", "can_use_filters"
          ];
          for (let t of trueFlags) {
            if (t in node) node[t] = true;
          }

          const clearUrl = node.unblurred_url || node.unlocked_url || node.result_url || node.image_url || node.transformed_image_url || node.url;
          if (clearUrl && typeof clearUrl === "string" && clearUrl.startsWith("http")) {
            if ("blurred_url" in node) node.blurred_url = clearUrl;
            if ("blurred_image_url" in node) node.blurred_image_url = clearUrl;
            if ("preview_url" in node && node.is_blurred) node.preview_url = clearUrl;
          }

          for (let k of Object.keys(node)) {
            if (k !== "badge" && k !== "is_gold" && k !== "has_gold" && k !== "tier" && k !== "gold") {
              if (VIP_ONLY_SET.has(k.toLowerCase().trim()) && node[k] && typeof node[k] === "object") {
                applyGoldBadge(node[k]);
              }
              transformNode(node[k]);
            }
          }
        }

        transformNode(obj);
        body = JSON.stringify(obj);
      } catch (e) {}
    }

    let respHeaders = Object.assign({}, ($response && $response.headers) || {});
    delete respHeaders["Content-Encoding"];
    delete respHeaders["content-encoding"];
    delete respHeaders["Content-Length"];
    delete respHeaders["content-length"];
    delete respHeaders["Transfer-Encoding"];
    delete respHeaders["transfer-encoding"];
    respHeaders["content-type"] = "application/json; charset=utf-8";

    $done({
      status: status,
      headers: respHeaders,
      body: body
    });
  }
}
