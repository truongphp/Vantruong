/***********************************************
> Locket Photobooth Shinchan 4-Shot Filter Engine (Locketptbfilterv2.js)
> Chủ sở hữu: Văn Trường (@ttruonngg)
> Worker: https://weathered-wave-12cc.noobnopro2007.workers.dev
> Chuyên biệt 100% cho /generateFilteredImage và /createOverlay:
  1. Chiều Request (http-request):
     - Chuyển hướng kèm toàn bộ $request.body về Worker (giống hệt bản V12 đã gửi
       thành công bodyLen=1957 lên Cloudflare Worker).
  2. Chiều Response (http-response):
     - Giữ nguyên bộ khung HTTP/2 headers của $response.headers (chỉ xóa
       Content-Encoding / Content-Length / Transfer-Encoding) và trả về JSON
       chứa link ảnh Cloudinary 1080x1080 cho Locket iOS.
***********************************************/

(function () {
  const WORKER_HOST = "https://weathered-wave-12cc.noobnopro2007.workers.dev";

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

  // 1. CHIỀU HTTP-REQUEST
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) return $done({});
      const reqUrl = String($request.url || "");

      // Nếu URL đã được bẻ lái sang Worker rồi thì không bẻ lái lần 2
      if (reqUrl.includes("noobnopro2007.workers.dev")) {
        return $done({});
      }

      const endpoint = reqUrl.includes("createOverlay") ? "/createOverlay" : "/generateFilteredImage";
      const targetUrl = `${WORKER_HOST}${endpoint}?module=Vantruong_VIP`;
      const workerHostOnly = WORKER_HOST.replace(/^https?:\/\//, "");

      let headers = Object.assign({}, $request.headers || {});
      headers["Host"] = workerHostOnly;
      headers["host"] = workerHostOnly;
      headers["X-Module-Origin"] = "Vantruong_VIP";

      const doneObj = {
        url: targetUrl,
        headers: headers
      };
      if ($request.body) {
        doneObj.body = $request.body;
      }
      return $done(doneObj);
    } catch (e) {
      return $done({});
    }
  }

  // 2. CHIỀU HTTP-RESPONSE
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
      if (resObj.data) {
        delete resObj.data.error;
        delete resObj.data.errors;
      }

      return $done({
        status: 200,
        headers: cleanResponseHeaders($response.headers),
        body: JSON.stringify(resObj)
      });
    }
  } catch (e) {}

  return $done({});
})();
