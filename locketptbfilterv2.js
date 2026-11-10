/***********************************************
> Locket Photobooth Shinchan 4-Shot Filter Engine V16 (Locketptbfilterv2.js / dklocketfilterv2.js)
> Tối ưu hóa độc quyền cho tài khoản: ttruonngg
> Worker: weathered-wave-12cc.noobnopro2007.workers.dev
***********************************************/

(function () {
  const WORKER_HOST = "\u0068ttps://weathered-wave-12cc.noobnopro2007.workers.dev";

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

  // 1. CHIỀU HTTP-REQUEST: Bẻ lái /generateFilteredImage & /createOverlay kèm toàn bộ body về Worker V16
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) return $done({});
      const reqUrl = String($request.url || "");

      if (reqUrl.includes("noobnopro2007.workers.dev")) {
        return $done({});
      }

      const endpoint = reqUrl.includes("createOverlay") ? "/createOverlay" : "/generateFilteredImage";
      const targetUrl = `${WORKER_HOST}${endpoint}?module=ttruonngg_V16`;
      const workerHostOnly = WORKER_HOST.replace(/^https?:\/\//, "");

      let headers = Object.assign({}, $request.headers || {});
      for (let k of Object.keys(headers)) {
        const lk = k.toLowerCase();
        if (["if-none-match", "if-modified-since", "x-goog-if-none-match"].includes(lk)) {
          delete headers[k];
        }
      }
      headers["Host"] = workerHostOnly;
      headers["host"] = workerHostOnly;
      headers["X-Module-Origin"] = "ttruonngg_V16";

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

  // 2. CHIỀU HTTP-RESPONSE: Nếu Worker đã trả 200 OK có sẵn outputUrl chuẩn Cloudinary, giữ nguyên 100% HTTP/2 headers ($done({}))
  try {
    if (typeof $response !== "undefined" && $response) {
      const status = $response.status || $response.statusCode || 200;
      const body = $response.body || "";
      if (status === 200 && body && body.includes("outputUrl") && !body.includes('"error"')) {
        return $done({});
      }
      if (body) {
        let resObj = {};
        try {
          resObj = JSON.parse(body);
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
    }
  } catch (e) {}

  return $done({});
})();
