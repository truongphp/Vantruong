// ============================================================================
// 📸 LOCKET PHOTOBOOTH 4-CUT & FRAME ROUTER (SIÊU NHẸ - KHÔNG DÙNG AI)
// Dùng cho: Shadowrocket (Locketptbfilterv2.js / locketptb.js)
// Kết nối trực tiếp tới Cloudflare Worker:
// https://weathered-wave-12cc.noobnopro2007.workers.dev
// ============================================================================

(function () {
  const WORKER_HOST = "https://weathered-wave-12cc.noobnopro2007.workers.dev";
  const WORKER_DOMAIN = "weathered-wave-12cc.noobnopro2007.workers.dev";

  // 1. CHIỀU REQUEST: Chuyển hướng thẳng luồng chụp Photobooth 4 ô & Khung viền về Worker
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) {
        return $done({});
      }

      const reqUrl = $request.url || "";
      const endpoint = reqUrl.includes("createOverlay") ? "/createOverlay" : "/generateFilteredImage";
      const targetUrl = `${WORKER_HOST}${endpoint}`;

      let headers = Object.assign({}, $request.headers || {});
      headers["Host"] = WORKER_DOMAIN;
      headers["host"] = WORKER_DOMAIN;

      let updatedBody = $request.body;
      if (updatedBody && typeof updatedBody === "string") {
        try {
          let bodyObj = JSON.parse(updatedBody);
          let dataNode = (bodyObj && bodyObj.data && typeof bodyObj.data === "object") ? bodyObj.data : bodyObj;

          let rawFilterId = String(
            dataNode.original_filter_id || dataNode.filter_id || dataNode.filterId || dataNode.uid || dataNode.id || dataNode.prompt || ""
          ).trim();

          // Hỗ trợ trường hợp chọn khung từ Tiểu sử (Bio)
          if (!rawFilterId && typeof $persistentStore !== "undefined") {
            const bioFilter = $persistentStore.read("LOCKET_SELECTED_FILTER");
            if (bioFilter) rawFilterId = bioFilter.trim();
          }

          if (rawFilterId) {
            dataNode.original_filter_id = rawFilterId;
            dataNode.filter_id = rawFilterId;
            dataNode.filter_type = "normal";
            updatedBody = JSON.stringify(bodyObj);
          }
        } catch (e) {}
      }

      const result = {
        url: targetUrl,
        headers: headers
      };
      if (updatedBody) {
        result.body = updatedBody;
      }
      return $done(result);
    } catch (e) {
      return $done({});
    }
  }

  // 2. CHIỀU RESPONSE (Dự phòng an toàn nếu gắn ở cả chiều response)
  try {
    if (typeof $response !== "undefined" && $response && $response.body) {
      let resObj = JSON.parse($response.body);
      delete resObj.error;
      delete resObj.errors;
      if (resObj.result) {
        delete resObj.result.error;
        delete resObj.result.errors;
      }
      return $done({
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(resObj)
      });
    }
  } catch (e) {}

  return $done({});
})();
