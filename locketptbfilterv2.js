/***********************************************
> Locket Photobooth Shinchan 4-Shot & Gold VIP Client V13
> Chủ sở hữu: Văn Trường (@ttruonngg)
> Worker: https://weathered-wave-12cc.noobnopro2007.workers.dev
> Đã tối ưu hóa triệt để:
  1. Chiều Request (http-request):
     - Chuyển hướng /generateFilteredImage và /createOverlay sang Worker V13.
     - Xóa sạch Accept-Encoding / If-None-Match để Worker trả về JSON nguyên bản
       không nén Brotli/Gzip, giữ nguyên vẹn kết nối HTTP/2 của Shadowrocket.
     - Mock /changeProfileInfo trả về huy hiệu locket_gold ngay lập tức.
  2. Chiều Response (http-response):
     - Khi nhận phản hồi 200 OK từ /generateFilteredImage hoặc /createOverlay đã có
       outputUrl chuẩn Cloudinary, giữ nguyên 100% bộ khung HTTP/2 headers gốc
       (tuyệt đối không ghi đè headers bằng object rỗng gây lỗi "Không thể áp dụng bộ lọc").
     - Mở khóa Locket Gold, vương miện, gỡ mờ ảnh (unblur) và đồng bộ danh sách VIP P2P.
***********************************************/

const WORKER_HOST = "https://weathered-wave-12cc.noobnopro2007.workers.dev";
const VIP_STORE_KEY = "LOCKET_VIP_COMMUNITY";
const SELF_UID_KEY = "LOCKET_SELF_UID";
const SELF_USERNAME_KEY = "LOCKET_SELF_USERNAME";

const BASE_VIP_USERS = [
  "truongphp", "v.truongg09127", "vantruong", "ttruonngg",
  "mhhiep", "2c7dlquxuqulknrwgpcqsqlw0sk2", "th_quang08", "th_quang",
  "nln9pozfecsccxhuqpiwvkhfwsi2", "mhhuyz", "7tulqjjxb0srwqbbp3euildiqfe3",
  "nguyentuankietne", "blgpf4fdvbbnlmfllziy4hnbjjn1", "d4vy8lqpxevoi7yw0etjagd8ihm1",
  "duuxx", "nin1qotyjmnywtrmudubinmywwt1", "kienvin", "ovqinfsvsud70wk1zzamju8cxrf1",
  "nightmarketserver", "qudekzvkzif2oaox79fnh1fodxf3", "nightmarket",
  "j5n7ioiufeymskpmcohjjjswrxa2", "7ghwealmlhxvkdvhp11vwwwciie2",
  "hjmbhnrxstco62kjojgojtc8ddn2", "dualato", "g8mrjoobvcfgo6pomplyvmqfet92",
  "12tsoagygjyx6xdmvqj7d5phsv93", "6fbwotlsq5ojnd7azlrcuousv5k2",
  "v6nunol4iiacnmfnrxsfoko5dxn2", "khoia", "zhuudjqjnatlsn350x4w0wnnnnn1",
  "ak24", "b09lwjxdn3ublwbgtjaqwwnvxcs1", "ak2703", "t5fvkfp994fywhgwfkwsikscleg1",
  "duyvinh09", "729ckhper7p0lnynwp0fsrtktng2", "4a5e1hpej5zgxeaii5z2kdbmolf2",
  "mpqza6lcmoxwtnwqn7jz2yi7vi22", "ghfpj4icughbjhtrqt8hvfqiwmg2",
  "zg1dvwmntaq2jmdvuwqel8fxhei2", "tzxpq8rmhrsq70zyr0wwytnk5t33",
  "enil4j1rdjfwzvkz4y5bxvcnv4k2", "jfv4gmq9gie6g2capflgnozrwhg2",
  "leanhminh2104", "utjvlg8fbfx12lz0qp2c3n5qgay1", "talaquaivat",
  "eufsqtikwsre05wdktcibpcxvhi3", "sarhlywj6doce6yybr0z3vx23ef1", "tduc",
  "znoppo16aanvdi2g9dswximmhrl2", "8acssqcce7gwhfzxtkgdczgmjte2", "daokinnn",
  "4njw4uo7tusl1huh39dy03sl6xf1", "tr.duck", "2u96nqywrdeopjwhn4tvtivpeyh2",
  "nguyenhoangtulinh", "wphe1l0fp9g1wuifi0xrdv3zeqv1", "6mvzl2stbafos0v8wwuujalumel1",
  "gzbnnaurnib6no8ow5yz9cvtwct2", "ann203", "hkcgcbmndwve1uvnlcceu9gbscw1",
  "q5yk3p7jd5qqqwth6aqaohcjvvl1", "wvkrbhbs58zn9xp1oalb732uh922",
  "nlidzrbg3sylny3hursjov5co8t2", "effh2jtjanha5uhmx9mkhbw2kgw2",
  "1zkaxildwlc54iqvpfvc0xshch93", "nviitxuxhmypiq9crffclxbzj7v2", "hunglaoshi",
  "om2esk68dfxqfzryveblf1znoxx1", "miubaby", "mzuspertjfsfbfxhllmvrhzifx62",
  "khaido1117", "obu5ilvrknwrrtu1vyefp8odol43", "1fcncwgripguvtx8hpjw10bsrzh3",
  "pvaheohbr4v01cfg9hai1iwxdkt2", "duonganhky", "8kiu9dwtuicniutzojhr6kf0qyp1",
  "o9ac9wcvwqgfxaw2hmdkbyluqkb2", "ptan.01", "vlrlnbb1esmdut8ch4bepfckkdk2",
  "tloc0088", "hso9tm4a6cpkcpgxjohxiqu6dhi1", "yi9tybjdfzg0kbonhqjb516sbzw2",
  "baoconcu", "rhm8b6rlv1d3snxdfj1jxg1qcrc2", "ho_ann", "e11r1kxh4ezehcbglv0zun6dndn2",
  "bichna14", "w733f9quh4gceczqhipvtvmkqpk2", "taikhoantest1",
  "supfr8xxdkdph6rkcftz0lgsu6q1", "ccc", "onwh7iehjvgylmnsyu9ljuwp4a82",
  "ntnmedia", "gvneomp84yuw8znzpyyqhwwasiy2", "6bsfuqrk1zw8yvqanhnvwndvqql1",
  "nguyentankietne", "oeg7utzfdff5kppub7vcfiqmlli2", "phw_naw",
  "grtrogz4xcdhznd8kzdrkdl66md2", "bn_sii", "f7ugzfhyc7xrikjvee8wbrcmt0k1",
  "oahn2309", "fuokhow1rxuvugyb0bz7xl3wcku2", "mhhieuz",
  "igxfmpws63dt7zpaqp0irtruyj72", "canh.quang", "t9inecetx2dje9n36vvyb9xomxy2",
  "kienviet", "7tegglv8kah3bvapztlejemx"
];

const UNLOCK_ALL_FRIENDS_DEFAULT = false;

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
    target.uid || target.user_id || target.id || target.friend_uid || target.friend_id || target.friendId || target.userId || ""
  ).toLowerCase().trim();
  if (uid && vSet.has(uid)) return true;

  const uname = String(target.username || target.friend_username || "").toLowerCase().trim();
  if (uname && vSet.has(uname)) return true;

  if (target.user && typeof target.user === "object") {
    const uUid = String(target.user.uid || target.user.id || target.user.user_id || "").toLowerCase().trim();
    if (uUid && vSet.has(uUid)) return true;
    const uUname = String(target.user.username || target.user.friend_username || "").toLowerCase().trim();
    if (uUname && vSet.has(uUname)) return true;
  }

  if (target.friend && typeof target.friend === "object") {
    const fUid = String(target.friend.uid || target.friend.id || "").toLowerCase().trim();
    if (fUid && vSet.has(fUid)) return true;
    const fUname = String(target.friend.username || "").toLowerCase().trim();
    if (fUname && vSet.has(fUname)) return true;
  }

  const dName = String(
    target.display_name || target.first_name || target.name || (target.user && (target.user.display_name || target.user.first_name)) || ""
  ).toLowerCase().trim();
  if (dName && vSet.has(dName)) return true;

  return false;
}

function extractSelfUidFromHeaders(headers) {
  if (!headers || typeof headers !== "object") return null;
  const auth = headers["authorization"] || headers["Authorization"] || headers["AUTHORIZATION"] || "";
  if (!auth || typeof auth !== "string") return null;
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const parts = token.split(".");
  if (parts.length >= 2) {
    try {
      let base64Url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64Url.length % 4) base64Url += "=";
      let output = "";
      let str = String(base64Url).replace(/=+$/, "");
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
  }
  return null;
}

function cleanResponseHeaders(rawHeaders) {
  let respHeaders = Object.assign({}, rawHeaders || {});
  for (let k of Object.keys(respHeaders)) {
    if (["content-encoding", "content-length", "transfer-encoding"].includes(k.toLowerCase())) {
      delete respHeaders[k];
    }
  }
  respHeaders["Content-Type"] = "application/json; charset=utf-8";
  respHeaders["content-type"] = "application/json; charset=utf-8";
  respHeaders["Access-Control-Allow-Origin"] = "*";
  return respHeaders;
}

// =========================================================================
// 1. CHIỀU REQUEST: Điều hướng Photobooth sang Worker V13 & Mock Profile
// =========================================================================
if (typeof $response === "undefined") {
  const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  let headers = Object.assign({}, ($request && $request.headers) || {});

  // 1A. Khi Locket gọi generateFilteredImage hoặc createOverlay -> Chuyển hướng sạch về Worker V13
  if (reqUrl.includes("generateFilteredImage") || reqUrl.includes("createOverlay")) {
    const endpoint = reqUrl.includes("createOverlay") ? "/createOverlay" : "/generateFilteredImage";
    let targetUrl = `${WORKER_HOST}${endpoint}`;
    if (reqUrl.includes("?")) {
      const qs = reqUrl.split("?")[1];
      if (qs) targetUrl += "?" + qs;
    }
    const workerHostOnly = WORKER_HOST.replace(/^https?:\/\//, "");
    for (let k of Object.keys(headers)) {
      const lk = k.toLowerCase();
      if (["accept-encoding", "if-none-match", "if-modified-since", "x-goog-if-none-match"].includes(lk)) {
        delete headers[k];
      }
    }
    headers["Host"] = workerHostOnly;
    headers["host"] = workerHostOnly;

    $done({
      url: targetUrl,
      headers: headers
    });
  }
  // 1B. Khi Locket gọi changeProfileInfo -> Phản hồi thành công huy hiệu Gold ngay tại chỗ
  else if (reqUrl.includes("changeProfileInfo")) {
    $done({
      response: {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          result: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true, data: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true } }
        })
      }
    });
  }
  // 1C. Các request khác -> Xóa sạch header cache gây lỗi 304 Not Modified
  else {
    for (let k of Object.keys(headers)) {
      if (["if-none-match", "if-modified-since", "x-revenuecat-etag"].includes(k.toLowerCase())) {
        delete headers[k];
      }
    }
    $done({ headers: headers });
  }
}

// =========================================================================
// 2. CHIỀU RESPONSE: Bảo toàn HTTP/2 cho Photobooth & Mở khóa Gold VIP
// =========================================================================
else {
  const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";

  // Bảo vệ tuyệt đối HTTP/2 headers & kết quả trả về từ generateFilteredImage / createOverlay
  if (reqUrl.includes("generateFilteredImage") || reqUrl.includes("createOverlay")) {
    let status = ($response && ($response.status || $response.statusCode)) || 200;
    let body = ($response && $response.body) || "";
    // Nếu Worker đã trả về 200 OK có sẵn result.outputUrl chuẩn Cloudinary, giữ nguyên 100% ($done({})) giống hệt file 07.37 gốc!
    if (status === 200 && body && body.includes("outputUrl") && !body.includes('"error"')) {
      $done({});
    } else if (body) {
      try {
        let resObj = JSON.parse(body);
        delete resObj.error;
        delete resObj.errors;
        if (resObj.result) {
          delete resObj.result.error;
          delete resObj.result.errors;
        }
        $done({
          status: 200,
          headers: cleanResponseHeaders($response && $response.headers),
          body: JSON.stringify(resObj)
        });
      } catch (e) {
        $done({});
      }
    } else {
      $done({});
    }
  } else {
    let body = $response.body;
    let status = $response.status || $response.statusCode || 200;

    const customArg = (typeof $argument === "string" && $argument.trim()) ? $argument.trim().toLowerCase() : "";
    const unlockAllFriends = UNLOCK_ALL_FRIENDS_DEFAULT || customArg.includes("all_friends=true") || customArg.includes("gold_all=true");

    let vipSet = new Set(BASE_VIP_USERS.map(u => String(u).toLowerCase().trim()));

    const reqHeaders = (typeof $request !== "undefined" && $request && $request.headers) ? $request.headers : {};
    const jwtSelfUid = extractSelfUidFromHeaders(reqHeaders);
    let myUid = (typeof $persistentStore !== "undefined") ? $persistentStore.read(SELF_UID_KEY) : null;
    if (jwtSelfUid) {
      myUid = jwtSelfUid;
      if (typeof $persistentStore !== "undefined") {
        $persistentStore.write(myUid, SELF_UID_KEY);
      }
    }
    if (myUid) vipSet.add(String(myUid).toLowerCase().trim());

    const myUname = (typeof $persistentStore !== "undefined") ? $persistentStore.read(SELF_USERNAME_KEY) : null;
    if (myUname) vipSet.add(String(myUname).toLowerCase().trim());

    if (typeof $persistentStore !== "undefined") {
      try {
        const rawVip = $persistentStore.read(VIP_STORE_KEY);
        if (rawVip) {
          const list = JSON.parse(rawVip);
          if (Array.isArray(list)) {
            for (let id of list) {
              if (id) vipSet.add(String(id).toLowerCase().trim());
            }
          }
        }
      } catch (e) {}
    }

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

          const actual = (userNode.user && typeof userNode.user === "object") ? userNode.user : userNode;
          const uid = String(actual.uid || actual.user_id || actual.id || userNode.uid || userNode.user_id || userNode.id || myUid || "").toLowerCase().trim();
          const username = String(actual.username || userNode.username || "").toLowerCase().trim();

          if (typeof $persistentStore !== "undefined") {
            if (uid) $persistentStore.write(uid, SELF_UID_KEY);
            if (username) $persistentStore.write(username, SELF_USERNAME_KEY);
          }
          if (uid) vipSet.add(uid);
          if (username) vipSet.add(username);

          if ((uid || username) && typeof $httpClient !== "undefined") {
            try {
              $httpClient.get(`${WORKER_HOST}/api/register-vip?uid=${encodeURIComponent(uid)}&username=${encodeURIComponent(username)}`, function () {});
            } catch (e) {}
          }

          const authHeader = reqHeaders["authorization"] || reqHeaders["Authorization"];
          if (authHeader && typeof $httpClient !== "undefined") {
            const lastSyncTime = (typeof $persistentStore !== "undefined") ? $persistentStore.read("LOCKET_PROFILE_BADGE_SYNCED") : null;
            const now = Date.now();
            if (!lastSyncTime || (now - Number(lastSyncTime)) > 3600000) {
              if (typeof $persistentStore !== "undefined") {
                $persistentStore.write(String(now), "LOCKET_PROFILE_BADGE_SYNCED");
              }
              try {
                $httpClient.post({
                  url: "https://api.locketcamera.com/changeProfileInfo",
                  headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    data: { badge: "locket_gold" }
                  })
                }, function () {});
              } catch (e) {}
            }
          }
        }

        const isSingleUserProfile = Boolean(
          !isFriendsOrFeed &&
          ((obj && obj.data && typeof obj.data === "object" && !Array.isArray(obj.data) && (obj.data.email || (myUid && obj.data.uid === myUid))) ||
           (obj && obj.result && typeof obj.result === "object" && !Array.isArray(obj.result) && (obj.result.email || (myUid && obj.result.uid === myUid))) ||
           (obj && obj.user && typeof obj.user === "object" && !Array.isArray(obj.user) && (obj.user.email || (myUid && obj.user.uid === myUid))))
        );

        if (isSingleUserProfile) {
          applyGoldBadge(obj);
          unlockSelfUser(obj.data || obj.result || obj.user || obj);
        }

        function transformNode(node) {
          if (!node || typeof node !== "object") return;
          if (Array.isArray(node)) {
            for (let i = 0; i < node.length; i++) {
              transformNode(node[i]);
            }
            return;
          }

          const actualUser = (node.user && typeof node.user === "object") ? node.user : node;
          const nodeUid = String(actualUser.uid || actualUser.user_id || actualUser.id || node.uid || node.user_id || node.id || "").toLowerCase().trim();

          const isSelf = Boolean(
            (myUid && nodeUid && nodeUid === myUid.toLowerCase()) ||
            ("email" in node && node.email && typeof node.email === "string" && node.email.includes("@")) ||
            ("push_token" in node && node.push_token) ||
            ("fcm_token" in node && node.fcm_token)
          );

          if (isSelf) {
            unlockSelfUser(node);
          } else {
            const isVipFriend = unlockAllFriends || isNodeVip(node, vipSet);
            if (isVipFriend) {
              applyGoldBadge(node);
              if (node.user && typeof node.user === "object") applyGoldBadge(node.user);
              if (node.friend && typeof node.friend === "object") applyGoldBadge(node.friend);
            }
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
              if (vipSet.has(k.toLowerCase().trim()) && node[k] && typeof node[k] === "object") {
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

    if (typeof $httpClient !== "undefined") {
      try {
        $httpClient.get(`${WORKER_HOST}/api/vip-users`, function (err, resp, data) {
          if (!err && data) {
            try {
              const resData = JSON.parse(data);
              if (resData && Array.isArray(resData.identifiers) && typeof $persistentStore !== "undefined") {
                $persistentStore.write(JSON.stringify(resData.identifiers), VIP_STORE_KEY);
              }
            } catch (e) {}
          }
        });
      } catch (e) {}
    }

    $done({
      status: status,
      headers: cleanResponseHeaders($response && $response.headers),
      body: body
    });
  }
}
