/**
 * ============================================================================
 * LOCKET PERSONAL CLIENT SCRIPT (SHADOWROCKET / SURGE / LOON / QUANTUMULT X)
 * ============================================================================
 * Đã dọn sạch 100%:
 *  - Không gửi UID/Username của bạn lên server lạ (/api/register-vip).
 *  - Không tải danh sách người lạ (/api/vip-users).
 *  - Gỡ bỏ hoàn toàn hàng trăm dòng Dead Code không dùng tới, tối ưu RAM cho
 *    Network Extension trên iOS (chỉ tốn vài KB bộ nhớ).
 *  - Kết nối trực tiếp tới Cloudflare Worker cá nhân của bạn.
 *
 * Cấu hình Module (.sgmodule / Shadowrocket):
 *  locket_pb_req = type=http-request,pattern=^https?:\/\/(us-central1-locket-4252a\.cloudfunctions\.net|api\.locketcamera\.com)\/generateFilteredImage,script-path=locket_client_custom.js,requires-body=true,max-size=-1,timeout=60
 *  locket_change_profile = type=http-request,pattern=^https:\/\/api\.locketcamera\.com\/changeProfileInfo,script-path=locket_client_custom.js,timeout=60
 *  locket_filter_resp = type=http-response,pattern=^https?:\/\/api\.locketcamera\.com\/.+,requires-body=true,max-size=-1,script-path=locket_client_custom.js,timeout=60
 * ============================================================================
 */

// 1. Thay bằng domain Cloudflare Worker của riêng bạn:
const MY_WORKER_HOST = "https://locket-pb.ten-cua-ban.workers.dev";

// 2. Điền Username hoặc UID của bạn và hội bạn thân muốn hiển thị tim vàng:
const MY_VIP_FRIENDS = [
  "username_cua_ban",
  "username_ban_than_1",
  "username_ban_than_2"
];

// 3. Đặt thành true nếu muốn TẤT CẢ bạn bè trong danh sách đều hiện Gold:
const UNLOCK_ALL_FRIENDS = false;

const SELF_UID_KEY = "LOCKET_SELF_UID";

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
  if (target.friend && typeof target.friend === "object" && target.friend !== target) {
    applyGoldBadge(target.friend);
  }
  if (target.profile && typeof target.profile === "object" && target.profile !== target) {
    applyGoldBadge(target.profile);
  }
}

function isNodeVip(target, vSet) {
  if (!target || typeof target !== "object") return false;
  const uid = String(
    target.uid || target.user_id || target.id || target.friend_uid || target.friend_id || ""
  ).toLowerCase().trim();
  if (uid && vSet.has(uid)) return true;

  const uname = String(target.username || target.friend_username || "").toLowerCase().trim();
  if (uname && vSet.has(uname)) return true;

  if (target.user && typeof target.user === "object") {
    const uUid = String(target.user.uid || target.user.id || "").toLowerCase().trim();
    const uUname = String(target.user.username || "").toLowerCase().trim();
    if ((uUid && vSet.has(uUid)) || (uUname && vSet.has(uUname))) return true;
  }
  return false;
}

function extractSelfUidFromHeaders(headers) {
  if (!headers || typeof headers !== "object") return null;
  const auth = headers["authorization"] || headers["Authorization"] || "";
  if (!auth || typeof auth !== "string") return null;
  const parts = auth.replace(/^Bearer\s+/i, "").trim().split(".");
  if (parts.length < 2) return null;
  try {
    let base64Url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64Url.length % 4) base64Url += "=";
    let output = "";
    const str = String(base64Url).replace(/=+$/, "");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    for (
      let bc = 0, bs, buffer, idx = 0;
      (buffer = str.charAt(idx++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    if (output) {
      const payload = JSON.parse(output);
      return payload.user_id || payload.sub || payload.uid || null;
    }
  } catch (e) {}
  return null;
}

// ============================================================================
// NHÁNH 1: XỬ LÝ CHIỀU REQUEST (http-request)
// ============================================================================
if (typeof $response === "undefined") {
  const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  let headers = Object.assign({}, ($request && $request.headers) || {});

  // 1A. Chặn generateFilteredImage -> Bẻ lái sang Cloudflare Worker cá nhân của bạn
  if (reqUrl.includes("generateFilteredImage")) {
    const workerHostOnly = MY_WORKER_HOST.replace(/^https?:\/\//, "");
    headers["Host"] = workerHostOnly;
    headers["host"] = workerHostOnly;
    $done({
      url: `${MY_WORKER_HOST}/generateFilteredImage`,
      headers: headers
    });
  }
  // 1B. Chặn changeProfileInfo -> Trả kết quả Mock 200 thành công ngay tại chỗ
  else if (reqUrl.includes("changeProfileInfo")) {
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
  }
  // 1C. Các Request khác -> Xóa ETag / Cache 304 để luôn lấy JSON mới
  else {
    for (let k of Object.keys(headers)) {
      if (["if-none-match", "if-modified-since", "x-revenuecat-etag"].includes(k.toLowerCase())) {
        delete headers[k];
      }
    }
    $done({ headers: headers });
  }
}

// ============================================================================
// NHÁNH 2: XỬ LÝ CHIỀU RESPONSE (http-response)
// ============================================================================
else {
  const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  let body = $response.body;
  let status = $response.status || $response.statusCode || 200;

  let vipSet = new Set(MY_VIP_FRIENDS.map(u => String(u).toLowerCase().trim()));
  const reqHeaders = ($request && $request.headers) || {};
  const jwtSelfUid = extractSelfUidFromHeaders(reqHeaders);

  let myUid = (typeof $persistentStore !== "undefined") ? $persistentStore.read(SELF_UID_KEY) : null;
  if (jwtSelfUid) {
    myUid = jwtSelfUid;
    if (typeof $persistentStore !== "undefined") {
      $persistentStore.write(myUid, SELF_UID_KEY);
    }
  }
  if (myUid) vipSet.add(String(myUid).toLowerCase().trim());

  if (body && typeof body === "string") {
    try {
      let obj = JSON.parse(body);
      const isFriendsOrFeed = /getFriends|getUsers|fetchFriends|getRecipients|recipients|moments|fetchMoments|getMoments|contacts/i.test(reqUrl);

      if (!isFriendsOrFeed && (status === 402 || status === 403 || status === 400)) {
        status = 200;
      }

      function unlockSelfUser(userNode) {
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
          for (let i = 0; i < node.length; i++) transformNode(node[i]);
          return;
        }

        const actualUser = (node.user && typeof node.user === "object") ? node.user : node;
        const nodeUid = String(actualUser.uid || actualUser.user_id || actualUser.id || "").toLowerCase().trim();

        const isSelf = Boolean(
          (myUid && nodeUid && nodeUid === myUid.toLowerCase()) ||
          ("email" in node && node.email && typeof node.email === "string" && node.email.includes("@")) ||
          ("push_token" in node && node.push_token) ||
          ("fcm_token" in node && node.fcm_token)
        );

        if (isSelf) {
          unlockSelfUser(node);
        } else if (UNLOCK_ALL_FRIENDS || isNodeVip(node, vipSet)) {
          applyGoldBadge(node);
        }

        // Gỡ bỏ các cờ khóa & làm mờ ảnh
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

        const clearUrl = node.unblurred_url || node.unlocked_url || node.result_url || node.image_url || node.url;
        if (clearUrl && typeof clearUrl === "string" && clearUrl.startsWith("http")) {
          if ("blurred_url" in node) node.blurred_url = clearUrl;
          if ("blurred_image_url" in node) node.blurred_image_url = clearUrl;
        }

        for (let k of Object.keys(node)) {
          if (!["badge", "is_gold", "has_gold", "tier", "gold"].includes(k)) {
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
