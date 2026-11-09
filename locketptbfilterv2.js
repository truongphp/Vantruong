// ============================================================================
// 📸 LOCKET PHOTOBOOTH 4-SHOT ENGINE V7 - BẢN CÁ NHÂN HOÁ VĂN TRƯỜNG
// Cơ chế 2 pha (Two-Phase Handshake) chống lỗi HTTP/2 Stream trên Shadowrocket:
//   - Pha 1 (http-request): Đọc dữ liệu ảnh gốc từ $request.body, gửi sang
//     Cloudflare Worker để lưu/ghép ảnh, ghi kết quả vào $persistentStore,
//     rồi cho phép request đi tiếp với body gọn nhẹ "{}" để không làm đứt luồng HTTP/2.
//   - Pha 2 (http-response): Bắt phản hồi từ server Locket, giữ nguyên bộ khung
//     headers chuẩn của HTTP/2 (giống hệt cơ chế của locketremotevip1.js) và
//     ghi đè status: 200 cùng JSON chứa link ảnh đã ghép về cho Locket!
// ============================================================================

(function () {
  const WORKER_ORIGIN = "https://weathered-wave-12cc.noobnopro2007.workers.dev";
  const WORKER_ENDPOINT = WORKER_ORIGIN + "/generateFilteredImage";

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

  function normalizeOutputUrl(rawUrl, fallbackUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return fallbackUrl;
    let s = rawUrl.trim();
    if (!s) return fallbackUrl;
    s = s.replace("https://locket-vip.mhiep20077.workers.dev", WORKER_ORIGIN);
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return WORKER_ORIGIN + s;
    return fallbackUrl;
  }

  function buildPayload(outputUrl, extra = {}) {
    return {
      result: {
        outputUrl: outputUrl,
        output_url: outputUrl,
        url: outputUrl,
        imageUrl: outputUrl,
        image_url: outputUrl,
        transformed_image_url: outputUrl,
        status: 200,
        data: Object.assign({
          outputUrl: outputUrl,
          output_url: outputUrl,
          url: outputUrl,
          imageUrl: outputUrl,
          image_url: outputUrl
        }, extra)
      },
      data: {
        outputUrl: outputUrl,
        output_url: outputUrl,
        url: outputUrl,
        imageUrl: outputUrl,
        image_url: outputUrl
      },
      outputUrl: outputUrl,
      output_url: outputUrl,
      url: outputUrl,
      status: 200
    };
  }

  function buildCleanResponseHeaders() {
    let respHeaders = Object.assign({}, (typeof $response !== "undefined" && $response && $response.headers) || {});
    for (let k of Object.keys(respHeaders)) {
      if (["content-encoding", "content-length", "transfer-encoding"].includes(k.toLowerCase())) {
        delete respHeaders[k];
      }
    }
    respHeaders["Content-Type"] = "application/json; charset=utf-8";
    respHeaders["Access-Control-Allow-Origin"] = "*";
    respHeaders["Cache-Control"] = "no-store";
    return respHeaders;
  }

  function callWorkerForShot(callback) {
    let rawBody = ($request && $request.body) || "{}";
    let bodyObj = {};
    try {
      bodyObj = (typeof rawBody === "string") ? JSON.parse(rawBody) : {};
    } catch (e) {
      bodyObj = {};
    }

    let dataNode = (bodyObj && bodyObj.data && typeof bodyObj.data === "object") ? bodyObj.data : bodyObj;
    let rawFilterId = String(
      dataNode.original_filter_id || dataNode.filter_id || dataNode.filterId || dataNode.uid || dataNode.id || dataNode.prompt || "stk_pb_2x2_starry"
    ).trim();

    let savedFilter = storeRead("LOCKET_PB_ACTIVE_FILTER");
    let savedTime = Number(storeRead("LOCKET_PB_LAST_TIME") || "0");
    let currentStep = Number(storeRead("LOCKET_PB_STEP") || "0");
    let savedIds = [];
    try {
      savedIds = JSON.parse(storeRead("LOCKET_PB_PUBLIC_IDS") || "[]");
      if (!Array.isArray(savedIds)) savedIds = [];
    } catch (e) {
      savedIds = [];
    }

    if (savedFilter !== rawFilterId || (Date.now() - savedTime > 600000) || currentStep >= 4 || currentStep < 0) {
      currentStep = 0;
      savedIds = [];
    }

    currentStep += 1;
    storeWrite("LOCKET_PB_ACTIVE_FILTER", rawFilterId);
    storeWrite("LOCKET_PB_LAST_TIME", String(Date.now()));
    storeWrite("LOCKET_PB_STEP", String(currentStep));

    dataNode.original_filter_id = rawFilterId;
    dataNode.client_step = currentStep;
    dataNode.previous_public_ids = savedIds;

    const fallbackStepUrl = `${WORKER_ORIGIN}/assets/frames/pb_step${currentStep < 4 ? currentStep : 1}.jpg`;

    if (typeof $httpClient !== "undefined") {
      $httpClient.post({
        url: WORKER_ENDPOINT,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": ($request && $request.headers && ($request.headers["Authorization"] || $request.headers["authorization"])) || ""
        },
        body: JSON.stringify(bodyObj),
        timeout: 25
      }, function (err, resp, data) {
        if (!err && data) {
          try {
            const parsed = JSON.parse(data);
            const shotId = (parsed && parsed.result && parsed.result.data && parsed.result.data.shot_public_id) || parsed.shot_public_id || "";
            if (shotId) {
              savedIds.push(shotId);
              storeWrite("LOCKET_PB_PUBLIC_IDS", JSON.stringify(savedIds));
            }
            if (currentStep >= 4) {
              storeWrite("LOCKET_PB_STEP", "0");
              storeWrite("LOCKET_PB_PUBLIC_IDS", "[]");
            }
            const rawOut = (parsed && parsed.result && parsed.result.outputUrl) || parsed.outputUrl || "";
            const outUrl = normalizeOutputUrl(rawOut, fallbackStepUrl);
            storeWrite("LOCKET_PB_LAST_OUT_URL", outUrl);
            storeWrite("LOCKET_PB_LAST_OUT_TS", String(Date.now()));
            storeWrite("LOCKET_PB_LAST_OUT_STEP", String(currentStep));
            return callback(outUrl, currentStep);
          } catch (e) {}
        }
        storeWrite("LOCKET_PB_LAST_OUT_URL", fallbackStepUrl);
        storeWrite("LOCKET_PB_LAST_OUT_TS", String(Date.now()));
        storeWrite("LOCKET_PB_LAST_OUT_STEP", String(currentStep));
        return callback(fallbackStepUrl, currentStep);
      });
    } else {
      storeWrite("LOCKET_PB_LAST_OUT_URL", fallbackStepUrl);
      storeWrite("LOCKET_PB_LAST_OUT_TS", String(Date.now()));
      storeWrite("LOCKET_PB_LAST_OUT_STEP", String(currentStep));
      return callback(fallbackStepUrl, currentStep);
    }
  }

  // PHA 1: CHIỀU HTTP-REQUEST
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) {
        return $done({});
      }
      const reqUrl = String($request.url || "");
      if (reqUrl.includes("firebaseremoteconfig") || reqUrl.includes("revenuecat")) {
        let headers = Object.assign({}, $request.headers || {});
        for (let k of Object.keys(headers)) {
          if (["if-none-match", "if-modified-since", "x-goog-if-none-match", "x-revenuecat-etag"].includes(k.toLowerCase())) {
            delete headers[k];
          }
        }
        return $done({ headers: headers });
      }

      // Gọi Worker để tải ảnh & ghép khung, lưu kết quả vào bộ nhớ đệm rồi cho phép
      // request đi tiếp sang Pha 2 (http-response) để trả kết quả chuẩn HTTP/2!
      callWorkerForShot(function (outUrl, stepNum) {
        return $done({ body: JSON.stringify({ data: { ping: 1 } }) });
      });
    } catch (e) {
      return $done({});
    }
    return;
  }

  // PHA 2: CHIỀU HTTP-RESPONSE (Ghi đè phản hồi chuẩn 100% như locketremotevip1.js)
  try {
    let lastUrl = storeRead("LOCKET_PB_LAST_OUT_URL");
    let lastTs = Number(storeRead("LOCKET_PB_LAST_OUT_TS") || "0");
    let lastStep = Number(storeRead("LOCKET_PB_LAST_OUT_STEP") || "1");

    if (lastUrl && (Date.now() - lastTs < 25000)) {
      storeWrite("LOCKET_PB_LAST_OUT_TS", "0");
      return $done({
        status: 200,
        headers: buildCleanResponseHeaders(),
        body: JSON.stringify(buildPayload(lastUrl, { step: lastStep }))
      });
    }

    // Nếu người dùng chỉ bật rule http-response mà không bật http-request:
    callWorkerForShot(function (outUrl, stepNum) {
      storeWrite("LOCKET_PB_LAST_OUT_TS", "0");
      return $done({
        status: 200,
        headers: buildCleanResponseHeaders(),
        body: JSON.stringify(buildPayload(outUrl, { step: stepNum }))
      });
    });
  } catch (e) {
    return $done({
      status: 200,
      headers: buildCleanResponseHeaders(),
      body: JSON.stringify(buildPayload(`${WORKER_ORIGIN}/assets/frames/pb_step1.jpg`))
    });
  }
})();
