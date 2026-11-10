// ============================================================================
// 📸 LOCKET PHOTOBOOTH SHINCHAN ENGINE V9 - SIÊU TỐC 1-HOP (0.1ms)
// - Đã tối ưu hóa triệt để cho iOS Shadowrocket Network Extension:
//   + KHÔNG dùng JSON.parse($request.body) hay $httpClient.post trên file ảnh nặng
//     ở tầng Shadowrocket (tránh tràn bộ nhớ 50MB của iOS làm treo/lỗi rửa ảnh).
//   + Chuyển tiếp luồng POST nguyên bản thẳng sang Cloudflare Worker trong 0.1ms
//     (giống hệt cơ chế gốc của Locket_Photobooth.js).
//   + Đếm bước chụp 1 -> 2 -> 3 -> 4 và gửi kèm qua Header X-PB-Step để Worker
//     gắn ảnh lũy tiến vào đúng ô trên khung Shinchan ngay sau mỗi lần chụp!
// ============================================================================

(function () {
  const WORKER_ORIGIN = "https://weathered-wave-12cc.noobnopro2007.workers.dev";
  const WORKER_HOST_ONLY = "weathered-wave-12cc.noobnopro2007.workers.dev";

  function storeRead(key) {
    try {
      if (typeof $persistentStore !== "undefined") return $persistentStore.read(key) || "";
      if (typeof $prefs !== "undefined") return $prefs.valueForKey(key) || "";
    } catch (e) {}
    return "";
  }

  function storeWrite(key, val) {
    try {
      if (typeof $persistentStore !== "undefined") $persistentStore.write(String(val), key);
      else if (typeof $prefs !== "undefined") $prefs.setValueForKey(String(val), key);
    } catch (e) {}
  }

  // 1. CHIỀU HTTP-REQUEST: Bẻ lái trực tiếp 1-Hop sang Worker (0.1ms, không chạm vào $request.body)
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) return $done({});
      const reqUrl = String($request.url || "");

      // Nếu là request changeProfileInfo -> trả về Mock 200 OK gắn huy hiệu Gold ngay
      if (reqUrl.includes("changeProfileInfo")) {
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

      // Nếu là request generateFilteredImage / createOverlay -> tăng bước chụp 1..4 và chuyển thẳng về Worker
      if (reqUrl.includes("generateFilteredImage") || reqUrl.includes("createOverlay")) {
        let lastTime = Number(storeRead("LOCKET_PB_V9_LAST_TIME") || "0");
        let currentStep = Number(storeRead("LOCKET_PB_V9_STEP") || "0");
        let sessionBatch = storeRead("LOCKET_PB_V9_BATCH") || String(Date.now());

        if ((Date.now() - lastTime > 300000) || currentStep >= 4 || currentStep < 0) {
          currentStep = 0;
          sessionBatch = String(Date.now());
        }
        currentStep += 1;

        storeWrite("LOCKET_PB_V9_LAST_TIME", String(Date.now()));
        storeWrite("LOCKET_PB_V9_STEP", String(currentStep >= 4 ? 0 : currentStep));
        storeWrite("LOCKET_PB_V9_BATCH", sessionBatch);

        const targetUrl = `${WORKER_ORIGIN}/generateFilteredImage?step=${currentStep}&batch=${sessionBatch}&filter=stk_pb_2x2_shinchan`;
        let headers = Object.assign({}, $request.headers || {});
        headers["Host"] = WORKER_HOST_ONLY;
        headers["host"] = WORKER_HOST_ONLY;
        headers["X-PB-Step"] = String(currentStep);
        headers["X-PB-Batch"] = sessionBatch;
        headers["X-PB-Filter"] = "stk_pb_2x2_shinchan";

        return $done({
          url: targetUrl,
          headers: headers
        });
      }

      // Xóa header ETag / If-None-Match cho các request khác
      let headers = Object.assign({}, $request.headers || {});
      for (let k of Object.keys(headers)) {
        if (["if-none-match", "if-modified-since", "x-goog-if-none-match", "x-revenuecat-etag"].includes(k.toLowerCase())) {
          delete headers[k];
        }
      }
      return $done({ headers: headers });
    } catch (e) {
      return $done({});
    }
  }

  // 2. CHIỀU HTTP-RESPONSE: Đảm bảo phản hồi JSON sạch 100% chuẩn HTTP 200
  try {
    if (typeof $response !== "undefined" && $response && $response.body) {
      let resObj = {};
      try {
        resObj = JSON.parse($response.body);
      } catch (e) {
        return $done({});
      }
      delete resObj.error;
      delete resObj.errors;
      if (resObj.result) {
        delete resObj.result.error;
        delete resObj.result.errors;
      }
      let respHeaders = Object.assign({}, $response.headers || {});
      for (let k of Object.keys(respHeaders)) {
        if (["content-encoding", "content-length", "transfer-encoding"].includes(k.toLowerCase())) {
          delete respHeaders[k];
        }
      }
      respHeaders["Content-Type"] = "application/json; charset=utf-8";
      respHeaders["Access-Control-Allow-Origin"] = "*";
      return $done({
        status: 200,
        headers: respHeaders,
        body: JSON.stringify(resObj)
      });
    }
  } catch (e) {}

  return $done({});
})();
