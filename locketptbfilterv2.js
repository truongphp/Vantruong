// ============================================================================
// 📸 LOCKET PHOTOBOOTH 4-SHOT ENGINE V5 - BẢN CÁ NHÂN HOÁ VĂN TRƯỜNG
// Hỗ trợ ĐỒNG THỜI cả 2 chiều trên Shadowrocket:
//   1. Chiều type=http-request: Bắt request chụp ảnh, gọi Cloudflare Worker,
//      lưu kết quả tạm thời vào $persistentStore và trả Mock HTTP 200 OK ngay lập tức.
//   2. Chiều type=http-response (Dự phòng khi một số bản Shadowrocket bỏ qua
//      mock response ở http-request và đẩy request lên server thật của Locket gây lỗi 400):
//      Tự động chặn phản hồi lỗi từ server Locket và ghi đè bằng HTTP 200 OK chuẩn!
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

  function buildResponseObject(outputUrl, extra = {}) {
    return {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify(buildPayload(outputUrl, extra))
    };
  }

  function executePhotoboothShot(isResponsePhase) {
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

    const finish = (finalUrl) => {
      storeWrite("LOCKET_PB_LAST_OUT_URL", finalUrl);
      storeWrite("LOCKET_PB_LAST_OUT_TS", String(Date.now()));
      storeWrite("LOCKET_PB_LAST_OUT_STEP", String(currentStep));
      const respObj = buildResponseObject(finalUrl, { step: currentStep });
      if (isResponsePhase) {
        return $done(respObj);
      } else {
        return $done({ response: respObj });
      }
    };

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
            return finish(outUrl);
          } catch (e) {}
        }
        return finish(fallbackStepUrl);
      });
    } else {
      return finish(fallbackStepUrl);
    }
  }

  // NẾU ĐƯỢC GỌI Ở CHIỀU HTTP-REQUEST (Hoặc khi gọi vào deleteHeader)
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) {
        return $done({});
      }
      const reqUrl = String($request.url || "");
      // Nếu người dùng gắn nhầm vào rule deleteHeader của Firebase/RevenueCat
      if (reqUrl.includes("firebaseremoteconfig") || reqUrl.includes("revenuecat")) {
        let headers = Object.assign({}, $request.headers || {});
        for (let k of Object.keys(headers)) {
          if (["if-none-match", "if-modified-since", "x-goog-if-none-match", "x-revenuecat-etag"].includes(k.toLowerCase())) {
            delete headers[k];
          }
        }
        return $done({ headers: headers });
      }
      return executePhotoboothShot(false);
    } catch (e) {
      return $done({
        response: buildResponseObject(`${WORKER_ORIGIN}/assets/frames/pb_step1.jpg`)
      });
    }
    return;
  }

  // NẾU ĐƯỢC GỌI Ở CHIỀU HTTP-RESPONSE (Ghi đè mọi lỗi 400/404/500 từ server Locket)
  try {
    let lastUrl = storeRead("LOCKET_PB_LAST_OUT_URL");
    let lastTs = Number(storeRead("LOCKET_PB_LAST_OUT_TS") || "0");
    let lastStep = Number(storeRead("LOCKET_PB_LAST_OUT_STEP") || "1");
    if (lastUrl && (Date.now() - lastTs < 15000)) {
      storeWrite("LOCKET_PB_LAST_OUT_TS", "0");
      return $done(buildResponseObject(lastUrl, { step: lastStep }));
    }
    return executePhotoboothShot(true);
  } catch (e) {
    return $done(buildResponseObject(`${WORKER_ORIGIN}/assets/frames/pb_step1.jpg`));
  }
})();
