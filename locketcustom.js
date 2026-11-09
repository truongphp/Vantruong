/***********************************************
> Locket AI Filter Bio Selector & Safe Response Handler
> Phiên bản Sinh Nhật Văn Trường (09/11) 🎂
> Worker: https://weathered-wave-12cc.noobnopro2007.workers.dev
> GitHub: https://github.com/truongphp/Vantruong
> Đã vá lỗi:
  1. Bỏ qua hoàn toàn các gói tin danh sách bạn bè (getFriends, fetchFriends, getUsers, moments)
     ở chiều Response để danh sách bạn bè hiển thị 100% nguyên vẹn, không bao giờ bị treo hay trắng trang.
  2. Khôi phục bộ chọn Filter qua Tiểu sử (Bio) khi gọi /changeProfileInfo (nhập số 1..50 hoặc mã stk_*).
  3. Bảo vệ nguyên vẹn gói tin trả về từ /generateFilteredImage và /createOverlay.
***********************************************/

const WORKER_HOST = "https://weathered-wave-12cc.noobnopro2007.workers.dev";
const SELECTED_FILTER_KEY = "LOCKET_SELECTED_FILTER";

const BIO_NUMBER_TO_FILTER = {
  "1": "stk_vantruong_birthday_0911",
  "2": "stk_rose_flower",
  "3": "stk_shrek_ogre",
  "4": "stk_superhero_cape",
  "5": "stk_spooky_ghost",
  "6": "stk_pirate_hat",
  "7": "stk_volcano_lava",
  "8": "stk_rain_storm",
  "9": "stk_fortnite_llama",
  "10": "stk_watercolor_art",
  "11": "stk_golden_hour",
  "12": "stk_jungle_leaf",
  "13": "stk_cute_zombie",
  "14": "stk_fireworks",
  "15": "stk_new_year_2026",
  "16": "stk_harry_potter",
  "17": "stk_minecraft",
  "18": "stk_fire_flame",
  "19": "stk_giant_spider",
  "20": "stk_ocean_underwater",
  "21": "stk_ufo_alien",
  "22": "photobooth_4cut",
  "23": "photobooth_cute",
  "24": "pb_holo_4cut",
  "25": "pb_scrapbook_ripped_4cut",
  "26": "pb_ripped_paper_4cut",
  "27": "pb_denim_ripped_2x2",
  "28": "frame_berry_days",
  "29": "frame_happy_snap",
  "30": "frame_sky_diary",
  "31": "frame_classic_pb"
};

// 1. CHIỀU REQUEST
if (typeof $response === "undefined") {
  const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
  let headers = Object.assign({}, ($request && $request.headers) || {});

  // 1A. Nếu đi vào /generateFilteredImage hoặc /createOverlay -> Đẩy thẳng về Worker
  if (reqUrl.includes("generateFilteredImage") || reqUrl.includes("createOverlay")) {
    const endpoint = reqUrl.includes("createOverlay") ? "/createOverlay" : "/generateFilteredImage";
    const targetUrl = `${WORKER_HOST}${endpoint}?module=VanTruong_VIP`;
    const workerHostOnly = WORKER_HOST.replace(/^https?:\/\//, "");
    headers["Host"] = workerHostOnly;
    headers["host"] = workerHostOnly;

    const doneObj = { url: targetUrl, headers: headers };
    if ($request && $request.body) doneObj.body = $request.body;
    $done(doneObj);
  }
  // 1B. Khi người dùng đổi Tiểu sử (/changeProfileInfo) -> Lưu mã Filter nếu có rồi cho request đi tiếp bình thường
  else if (reqUrl.includes("changeProfileInfo")) {
    if ($request && $request.body && typeof $persistentStore !== "undefined") {
      try {
        const bodyObj = JSON.parse($request.body);
        const dataNode = bodyObj.data || bodyObj;
        const bioText = String(dataNode.bio || dataNode.status || dataNode.about || "").trim();
        if (bioText === "0" || bioText.toLowerCase() === "off") {
          $persistentStore.write("", SELECTED_FILTER_KEY);
        } else if (BIO_NUMBER_TO_FILTER[bioText]) {
          $persistentStore.write(BIO_NUMBER_TO_FILTER[bioText], SELECTED_FILTER_KEY);
        } else if (/^(stk_|pb_|frame_|khung_|photobooth_)/i.test(bioText)) {
          $persistentStore.write(bioText, SELECTED_FILTER_KEY);
        }
      } catch (e) {}
    }
    $done({});
  }
  // 1C. Các request khác -> Xóa header ETag để tránh lỗi cache 304
  else {
    for (let k of Object.keys(headers)) {
      if (["if-none-match", "if-modified-since"].includes(k.toLowerCase())) {
        delete headers[k];
      }
    }
    $done({ headers: headers });
  }
}
// 2. CHIỀU RESPONSE
else {
  const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";

  // Bảo vệ tuyệt đối danh sách bạn bè, bảng tin và luồng trả ảnh AI (không can thiệp tránh lỗi trắng bạn bè)
  if (
    reqUrl.includes("generateFilteredImage") ||
    reqUrl.includes("createOverlay") ||
    /getFriends|getUsers|fetchFriends|getRecipients|recipients|moments|fetchMoments|getMoments|contacts/i.test(reqUrl)
  ) {
    $done({});
  } else {
    $done({});
  }
}
