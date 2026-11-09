// ============================================================================
// 📸 LOCKET PHOTOBOOTH 4-SHOT ENGINE (CHỐNG 100% LỖI "KHÔNG THỂ ÁP DỤNG BỘ LỌC")
// Cơ chế chuẩn trên Shadowrocket:
//   - KHÔNG dùng URL Redirect 307 (vì iOS URLSession sẽ làm rỗng POST body gây lỗi 422).
//   - Lưu trạng thái 4 lần chụp (PB_STEP, PB_PUBLIC_IDS) ngay trong $persistentStore của máy
//     đồng thời gọi trực tiếp sang Cloudflare Worker bằng $httpClient.post và trả về
//     Mock HTTP 200 OK ngay tại chỗ ($done({ response: ... }))!
// ============================================================================

(function () {
  const WORKER_ENDPOINT = "https://weathered-wave-12cc.noobnopro2007.workers.dev/generateFilteredImage";

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

  function buildMock200Response(outputUrl, extra = {}) {
    const payload = {
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
    return {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(payload)
    };
  }

  // CHIỀU REQUEST: Bắt request chụp ảnh, gọi ngầm Worker qua $httpClient.post và trả Mock 200 OK trực tiếp
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) {
        return $done({});
      }

      let rawBody = $request.body || "{}";
      let bodyObj = {};
      try {
        bodyObj = JSON.parse(rawBody);
      } catch (e) {
        bodyObj = {};
      }

      let dataNode = (bodyObj && bodyObj.data && typeof bodyObj.data === "object") ? bodyObj.data : bodyObj;
      let rawFilterId = String(
        dataNode.original_filter_id || dataNode.filter_id || dataNode.filterId || dataNode.uid || dataNode.id || dataNode.prompt || "stk_pb_2x2_starry"
      ).trim();

      // Quản lý bộ đếm 4 tấm ngay trên thiết bị để đảm bảo chính xác tuyệt đối 1 -> 2 -> 3 -> 4
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

      // Reset nếu đổi sang khung Photobooth khác hoặc quá 10 phút
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

      const fallbackStepUrl = `https://locket-vip.mhiep20077.workers.dev/assets/frames/pb_step${currentStep < 4 ? currentStep : 1}.jpg`;

      if (typeof $httpClient !== "undefined") {
        $httpClient.post({
          url: WORKER_ENDPOINT,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": ($request.headers && ($request.headers["Authorization"] || $request.headers["authorization"])) || ""
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
              const outUrl = (parsed && parsed.result && parsed.result.outputUrl) || parsed.outputUrl || fallbackStepUrl;
              return $done({ response: buildMock200Response(outUrl, { step: currentStep }) });
            } catch (e) {}
          }
          // Dự phòng an toàn tuyệt đối: không bao giờ báo lỗi "Không thể áp dụng bộ lọc"
          return $done({ response: buildMock200Response(fallbackStepUrl, { step: currentStep }) });
        });
      } else {
        return $done({ response: buildMock200Response(fallbackStepUrl, { step: currentStep }) });
      }
    } catch (e) {
      return $done({
        response: buildMock200Response("https://locket-vip.mhiep20077.workers.dev/assets/frames/pb_step1.jpg")
      });
    }
    return;
  }

  // CHIỀU RESPONSE (Nếu có)
  return $done({});
})();
