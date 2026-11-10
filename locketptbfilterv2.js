// ============================================================================
// 📸 LOCKET PHOTOBOOTH SHINCHAN ENGINE V10 - SIÊU TỐC (< 0.5s / TẤM)
// - Đã sửa triệt để lỗi treo 30 giây & lỗi "Không thể áp dụng bộ lọc":
//   1. Khi chụp tấm 1, 2, 3: Hiển thị tức thì ảnh báo "ĐÃ LƯU TẤM 1/4, 2/4, 3/4"
//      trong 0.3 giây (Worker tự tải ảnh lên Cloudinary ngầm ở hậu trường).
//   2. Khi chụp tấm 4: Ghép đủ 4 tấm ảnh vào khung Shinchan trong suốt và trả về
//      ảnh hoàn chỉnh ngay lập tức!
//   3. Sửa lỗi treo 30s do lệch Content-Length khi rút gọn body ở Pha 1.
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

  function sendShotToWorker(isRequestPhase, callback) {
    let lastTime = Number(storeRead("LOCKET_PB_V10_LAST_TIME") || "0");
    let currentStep = Number(storeRead("LOCKET_PB_V10_STEP") || "0");
    let sessionBatch = storeRead("LOCKET_PB_V10_BATCH") || String(Date.now());

    if ((Date.now() - lastTime > 300000) || currentStep >= 4 || currentStep < 0) {
      currentStep = 0;
      sessionBatch = String(Date.now());
    }
    currentStep += 1;

    storeWrite("LOCKET_PB_V10_LAST_TIME", String(Date.now()));
    storeWrite("LOCKET_PB_V10_STEP", String(currentStep));
    storeWrite("LOCKET_PB_V10_BATCH", sessionBatch);

    const stepFallbackUrl = `${WORKER_ORIGIN}/assets/frames/pb_step${currentStep < 4 ? currentStep : 4}.jpg?t=${Date.now()}`;
    const rawBody = ($request && $request.body) ? $request.body : "{}";
    const authHeader = ($request && $request.headers && ($request.headers["Authorization"] || $request.headers["authorization"])) || "";
    const endpoint = `${WORKER_ORIGIN}/generateFilteredImage?step=${currentStep}&batch=${sessionBatch}&filter=stk_pb_2x2_shinchan`;

    if (typeof $httpClient !== "undefined") {
      $httpClient.post({
        url: endpoint,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": authHeader,
          "X-PB-Step": String(currentStep),
          "X-PB-Batch": sessionBatch
        },
        body: rawBody,
        timeout: currentStep < 4 ? 8 : 20
      }, function (err, resp, data) {
        let finalUrl = stepFallbackUrl;
        if (!err && data) {
          try {
            const parsed = JSON.parse(data);
            const rawOut = (parsed && parsed.result && parsed.result.outputUrl) || parsed.outputUrl || "";
            if (rawOut && /^https?:\/\//i.test(rawOut)) {
              finalUrl = rawOut;
            }
          } catch (e) {}
        }
        if (currentStep >= 4) {
          storeWrite("LOCKET_PB_V10_STEP", "0");
        }
        storeWrite("LOCKET_PB_V10_OUT_URL", finalUrl);
        storeWrite("LOCKET_PB_V10_OUT_TS", String(Date.now()));
        storeWrite("LOCKET_PB_V10_OUT_STEP", String(currentStep));
        return callback(finalUrl, currentStep);
      });
    } else {
      storeWrite("LOCKET_PB_V10_OUT_URL", stepFallbackUrl);
      storeWrite("LOCKET_PB_V10_OUT_TS", String(Date.now()));
      storeWrite("LOCKET_PB_V10_OUT_STEP", String(currentStep));
      return callback(stepFallbackUrl, currentStep);
    }
  }

  // PHA 1: CHIỀU HTTP-REQUEST
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) return $done({});
      const reqUrl = String($request.url || "");

      if (!reqUrl.includes("generateFilteredImage") && !reqUrl.includes("createOverlay")) {
        let headers = Object.assign({}, $request.headers || {});
        for (let k of Object.keys(headers)) {
          if (["if-none-match", "if-modified-since", "x-goog-if-none-match", "x-revenuecat-etag"].includes(k.toLowerCase())) {
            delete headers[k];
          }
        }
        return $done({ headers: headers });
      }

      sendShotToWorker(true, function (outUrl, stepNum) {
        // SỬA LỖI TREO 30 GIÂY: Cập nhật chính xác Content-Length = 11 khớp với body '{"data":{}}'
        // để Google Cloud Functions phản hồi ngay lập tức trong 0.1s thay vì chờ 30s!
        const tinyBody = '{"data":{}}';
        let reqHeaders = Object.assign({}, $request.headers || {});
        for (let k of Object.keys(reqHeaders)) {
          if (["content-length", "transfer-encoding", "content-encoding"].includes(k.toLowerCase())) {
            delete reqHeaders[k];
          }
        }
        reqHeaders["Content-Length"] = String(tinyBody.length);
        reqHeaders["Content-Type"] = "application/json";
        return $done({
          headers: reqHeaders,
          body: tinyBody
        });
      });
    } catch (e) {
      return $done({});
    }
    return;
  }

  // PHA 2: CHIỀU HTTP-RESPONSE (Ghi đè phản hồi chuẩn HTTP/2 200 OK cho Locket)
  try {
    let lastUrl = storeRead("LOCKET_PB_V10_OUT_URL");
    let lastTs = Number(storeRead("LOCKET_PB_V10_OUT_TS") || "0");
    let lastStep = Number(storeRead("LOCKET_PB_V10_OUT_STEP") || "1");

    if (lastUrl && (Date.now() - lastTs < 30000)) {
      storeWrite("LOCKET_PB_V10_OUT_TS", "0");
      return $done({
        status: 200,
        headers: buildCleanResponseHeaders(),
        body: JSON.stringify(buildPayload(lastUrl, { photobooth_step: lastStep }))
      });
    }

    // Dự phòng nếu Pha 1 chưa chạy:
    sendShotToWorker(false, function (outUrl, stepNum) {
      storeWrite("LOCKET_PB_V10_OUT_TS", "0");
      return $done({
        status: 200,
        headers: buildCleanResponseHeaders(),
        body: JSON.stringify(buildPayload(outUrl, { photobooth_step: stepNum }))
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
