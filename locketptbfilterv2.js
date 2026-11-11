/***********************************************
> Locket Photobooth Shinchan 4-Shot Filter Engine V17 (Locketptbfilterv2.js)
> Tối ưu hóa độc quyền cho tài khoản: ttruonngg
> Worker: weathered-wave-12cc.noobnopro2007.workers.dev
> Cơ chế V17 Khắc phục triệt để lỗi "không tìm thấy POST trên Cloudflare, qua Shadow lỗi loạn":
  1. Khi bắt lệnh `http-request` (/generateFilteredImage, /createOverlay), script sử dụng
     trực tiếp `$httpClient.post` của Shadowrocket để bắn gói tin `POST` chuẩn (kèm đầy đủ
     JSON body & Authorization) thẳng lên Cloudflare Worker, sau đó trả kết quả trực tiếp
     về cho Locket qua `$done({ response: { status: 200, headers, body } })`.
  2. Hoàn toàn không còn lỗi xung đột HTTP/2 `:authority` hay trùng lặp `Host`/`host` khi
     bẻ lái tên miền giữa chừng trên Shadowrocket.
***********************************************/

(function () {
  var WORKER_HOST = "\u0068ttps://weathered-wave-12cc.noobnopro2007.workers.dev";

  // 1. CHIỀU HTTP-REQUEST: Bắn trực tiếp lệnh POST sạch lên Cloudflare Worker qua $httpClient.post
  if (typeof $response === "undefined") {
    try {
      if (typeof $request === "undefined" || !$request) return $done({});
      var reqUrl = String($request.url || "");

      if (reqUrl.indexOf("noobnopro2007.workers.dev") !== -1) {
        return $done({});
      }

      var endpoint = reqUrl.indexOf("createOverlay") !== -1 ? "/createOverlay" : "/generateFilteredImage";
      var targetUrl = WORKER_HOST + endpoint + "?module=ttruonngg_V17";
      var rawHeaders = $request.headers || {};
      var authHeader = rawHeaders["Authorization"] || rawHeaders["authorization"] || "";

      // Chuẩn hóa JSON body để đảm bảo luôn có filter_id & prompt chuẩn
      var rawBody = $request.body || "";
      var payloadBody = rawBody;
      if (typeof rawBody === "string" && rawBody.length > 0) {
        try {
          var bodyObj = JSON.parse(rawBody);
          var dataNode = (bodyObj && bodyObj.data && typeof bodyObj.data === "object") ? bodyObj.data : bodyObj;
          if (!dataNode.filter_id && !dataNode.filterId) {
            dataNode.filter_id = "stk_pb_2x2_shinchan";
            dataNode.filterId = "stk_pb_2x2_shinchan";
          }
          if (!dataNode.prompt) {
            dataNode.prompt = "Photobooth 2x2 Crayon Shinchan Cute Frame";
          }
          dataNode.filter_type = "normal";
          dataNode.filterType = "normal";
          payloadBody = JSON.stringify(bodyObj);
        } catch (e) {
          payloadBody = rawBody;
        }
      } else if (!payloadBody) {
        payloadBody = JSON.stringify({
          data: {
            filter_id: "stk_pb_2x2_shinchan",
            filterId: "stk_pb_2x2_shinchan",
            filter_type: "normal",
            prompt: "Photobooth 2x2 Crayon Shinchan Cute Frame"
          }
        });
      }

      // Ưu tiên số 1: Gửi POST trực tiếp qua $httpClient.post của Shadowrocket / Surge / Loon
      if (typeof $httpClient !== "undefined" && $httpClient && typeof $httpClient.post === "function") {
        $httpClient.post({
          url: targetUrl,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "application/json",
            "Authorization": authHeader,
            "X-Locket-Owner": "ttruonngg",
            "X-Module-Origin": "ttruonngg_V17"
          },
          body: payloadBody,
          timeout: 25
        }, function (error, response, data) {
          if (!error && data && typeof data === "string" && data.indexOf("outputUrl") !== -1) {
            return $done({
              response: {
                status: 200,
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                  "Access-Control-Allow-Origin": "*",
                  "Cache-Control": "no-store"
                },
                body: data
              }
            });
          }
          // Dự phòng nếu mạng chập chờn: trả ảnh bước 1 từ Cloudinary để app không báo lỗi đỏ
          var fallbackUrl = "\u0068ttps://res.cloudinary.com/jebnfjqh/image/upload/pb_step_shinchan_1080_v13_1.jpg";
          var fbCore = {
            outputUrl: fallbackUrl,
            output_url: fallbackUrl,
            url: fallbackUrl,
            imageUrl: fallbackUrl,
            image_url: fallbackUrl,
            transformed_image_url: fallbackUrl,
            transformedImageUrl: fallbackUrl,
            result_url: fallbackUrl,
            resultUrl: fallbackUrl,
            status: 200
          };
          var fbNode = Object.assign({}, fbCore, { data: fbCore });
          return $done({
            response: {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*"
              },
              body: JSON.stringify({
                result: fbNode,
                data: fbNode,
                outputUrl: fallbackUrl,
                status: 200
              })
            }
          });
        });
        return;
      }

      // Dự phòng cho các client không có $httpClient.post: làm sạch triệt để pseudo-headers HTTP/2 và Host trùng
      var workerHostOnly = WORKER_HOST.replace(/^https?:\/\//, "");
      var cleanReqHeaders = {};
      for (var k of Object.keys(rawHeaders)) {
        var lk = k.toLowerCase();
        if (
          lk.startsWith(":") ||
          lk === "host" ||
          lk === "content-length" ||
          lk === "if-none-match" ||
          lk === "if-modified-since" ||
          lk === "x-goog-if-none-match"
        ) {
          continue;
        }
        cleanReqHeaders[k] = rawHeaders[k];
      }
      cleanReqHeaders["Host"] = workerHostOnly;
      cleanReqHeaders["Content-Type"] = "application/json; charset=utf-8";
      cleanReqHeaders["X-Module-Origin"] = "ttruonngg_V17";

      return $done({
        url: targetUrl,
        headers: cleanReqHeaders,
        body: payloadBody
      });
    } catch (e) {
      return $done({});
    }
  }

  // 2. CHIỀU HTTP-RESPONSE: Giữ nguyên 100% HTTP/2 headers nếu đã có outputUrl
  try {
    if (typeof $response !== "undefined" && $response && $response.body) {
      var body = String($response.body || "");
      if (body.indexOf("outputUrl") !== -1 && body.indexOf('"error"') === -1) {
        return $done({});
      }
      var resObj = JSON.parse(body);
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
        body: JSON.stringify(resObj)
      });
    }
  } catch (e) {}

  return $done({});
})();
