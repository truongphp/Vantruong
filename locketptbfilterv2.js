// ============================================================================
// 📸 LOCKET PHOTOBOOTH SHINCHAN ENGINE V11 - BẢN CHUẨN ĐÃ KIỂM CHỨNG (SIÊU TỐC)
// Cơ chế 2 pha (Two-Phase Handshake) chống lỗi HTTP/2 Stream trên Shadowrocket:
//   - Pha 1 (http-request): Gửi dữ liệu ảnh sang Cloudflare Worker để lưu ngầm
//     (tấm 1, 2, 3 phản hồi tức thì trong 10ms) hoặc ghép khung hoàn chỉnh (tấm 4),
//     ghi kết quả vào $persistentStore, rồi trả về $done({ body: '{"data":{"ping":1}}' })
//     (giữ nguyên headers gốc của HTTP/2 để tuyệt đối không bị treo kết nối!).
//   - Pha 2 (http-response): Bắt phản hồi từ server, giữ nguyên khung headers
//     HTTP/2 và ghi đè status: 200 cùng JSON chứa link ảnh kết quả về cho Locket!
// ============================================================================

(function () {
  const WORKER_ORIGIN = "https://weathered-wave-12cc.noobnopro2007.workers.dev";

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
    let savedTime = Number(storeRead("LOCKET_PB_LAST_TIME") || "0");
    let currentStep = Number(storeRead("LOCKET_PB_STEP") || "0");
    let sessionBatch = storeRead("LOCKET_PB_BATCH") || String(Date.now());

    if ((Date.now() - savedTime > 300000) || currentStep >= 4 || currentStep < 0) {
      currentStep = 0;
      sessionBatch = String(Date.now());
    }

    currentStep += 1;
    storeWrite("LOCKET_PB_LAST_TIME", String(Date.now()));
    storeWrite("LOCKET_PB_STEP", String(currentStep));
    storeWrite("LOCKET_PB_BATCH", sessionBatch);

    const fallbackStepUrl = `${WORKER_ORIGIN}/assets/frames/pb_step${currentStep < 4 ? currentStep : 1}.jpg?t=${Date.now()}`;
    const workerUrl = `${WORKER_ORIGIN}/generateFilteredImage?step=${currentStep}&batch=${sessionBatch}&filter=stk_pb_2x2_shinchan`;

    if (typeof $httpClient !== "undefined") {
      $httpClient.post({
        url: workerUrl,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": ($request && $request.headers && ($request.headers["Authorization"] || $request.headers["authorization"])) || "",
          "X-PB-Step": String(currentStep),
          "X-PB-Batch": sessionBatch
        },
        body: rawBody,
        timeout: 25
      }, function (err, resp, data) {
        if (!err && data) {
          try {
            const parsed = JSON.parse(data);
            if (currentStep >= 4) {
              storeWrite("LOCKET_PB_STEP", "0");
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

  // PHA 1: CHIỀU HTTP-REQUEST (Giữ nguyên 100% cơ chế V7 không chạm vào headers của HTTP/2!)
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

      callWorkerForShot(function (outUrl, stepNum) {
        return $done({ body: JSON.stringify({ data: { ping: 1 } }) });
      });
    } catch (e) {
      return $done({});
    }
    return;
  }

  // PHA 2: CHIỀU HTTP-RESPONSE (Ghi đè phản hồi chuẩn 100% như V7)
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
