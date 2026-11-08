// ============================================================================
// LOCKET GOLD & FILTER PACKS UNLOCKER (SUPERSET EDITION - VĂN TRƯỜNG 09/11)
// Dung hợp 100% ("Chỉ thêm chứ không bớt"):
//   1. Bản @andanh447 (locket_1600_1y + FilterPack_10Photos_400 + FilterPack_20Photos_500)
//   2. Bản MinhHiep08 (com.locket.Locket.premium.yearly + Anti-Cache Response Headers)
//   3. Giữ nguyên dữ liệu gốc từ $response.body nếu có, chỉ tiêm thêm toàn bộ gói Gold & Filter Pack
// ============================================================================

const respHeaders = (typeof $response !== "undefined" && $response && $response.headers) ? $response.headers : {};
const cleanHeaders = {};

for (const key in respHeaders) {
    const lowerKey = key.toLowerCase();
    if (
        lowerKey !== "etag" &&
        lowerKey !== "x-revenuecat-etag" &&
        lowerKey !== "last-modified" &&
        lowerKey !== "content-encoding" &&
        lowerKey !== "content-length" &&
        lowerKey !== "transfer-encoding"
    ) {
        cleanHeaders[key] = respHeaders[key];
    }
}

cleanHeaders["Cache-Control"] = "no-cache, no-store, must-revalidate";
cleanHeaders["Pragma"] = "no-cache";
cleanHeaders["Expires"] = "0";
cleanHeaders["Content-Type"] = "application/json; charset=utf-8";

var ua = (typeof $request !== "undefined" && $request && $request.headers)
    ? ($request.headers["User-Agent"] || $request.headers["user-agent"] || "")
    : "";

var obj = {};
try {
    obj = JSON.parse(($response && $response.body) || "{}");
} catch (e) {
    obj = {};
}
if (!obj || typeof obj !== "object") obj = {};

obj.Attention = "Chúc mừng sinh nhật Văn Trường (09/11)! Full Locket Gold & Filter Pack Unlocked!";

var FAR_FUTURE = "2099-12-31T23:59:59Z";
var PAST = "2007-11-09T00:00:00Z"; // Ngày sinh nhật đặc biệt 09/11

function makeSub(productId, priceAmount, priceCurrency) {
    return {
        auto_resume_date: null,
        display_name: productId,
        is_sandbox: false,
        ownership_type: "PURCHASED",
        billing_issues_detected_at: null,
        management_url: "https://apps.apple.com/account/subscriptions",
        period_type: "normal",
        price: {
            amount: priceAmount,
            currency: priceCurrency
        },
        expires_date: FAR_FUTURE,
        grace_period_expires_date: null,
        refunded_at: null,
        unsubscribe_detected_at: null,
        original_purchase_date: PAST,
        purchase_date: PAST,
        store: "app_store",
        store_transaction_id: "2000001108724193"
    };
}

function makeEnt(productId) {
    return {
        grace_period_expires_date: null,
        purchase_date: PAST,
        product_identifier: productId,
        expires_date: FAR_FUTURE
    };
}

obj.subscriber = obj.subscriber || {
    original_app_user_id: "LocketGold_VanTruong_0911",
    original_application_version: "1.0",
    original_purchase_date: PAST,
    management_url: "https://apps.apple.com/account/subscriptions"
};
obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};
obj.subscriber.entitlements = obj.subscriber.entitlements || {};

// ========== 1. UNLOCK GOLD (CẢ 2 MÃ SẢN PHẨM NỘI ĐỊA & QUỐC TẾ) ==========
var goldProductVN = "locket_1600_1y";
var goldProductUS = "com.locket.Locket.premium.yearly";
var goldProductMonthly = "com.locket.Locket.premium.monthly";

obj.subscriber.subscriptions[goldProductVN] = makeSub(goldProductVN, 399000.0, "VND");
obj.subscriber.subscriptions[goldProductUS] = makeSub(goldProductUS, 39.99, "USD");
obj.subscriber.subscriptions[goldProductMonthly] = makeSub(goldProductMonthly, 3.99, "USD");

obj.subscriber.entitlements["Gold"] = makeEnt(goldProductVN);
obj.subscriber.entitlements["gold"] = makeEnt(goldProductUS);
obj.subscriber.entitlements["locket_gold"] = makeEnt(goldProductUS);
obj.subscriber.entitlements["pro"] = makeEnt(goldProductUS);

// ========== 2. UNLOCK FILTER PACK (ĐÃ BẬT LẠI TOÀN BỘ PACK 10 & 20 PHOTOS) ==========
var pack10Product = "com.locket.Locket.FilterPack_10Photos_400";
obj.subscriber.subscriptions[pack10Product] = makeSub(pack10Product, 0.0, "USD");
obj.subscriber.entitlements["effect_pack_10"] = makeEnt(pack10Product);

var pack20Product = "com.locket.Locket.FilterPack_20Photos_500";
obj.subscriber.subscriptions[pack20Product] = makeSub(pack20Product, 0.0, "USD");
obj.subscriber.entitlements["effect_pack_20"] = makeEnt(pack20Product);

$done({
    status: 200,
    headers: cleanHeaders,
    body: JSON.stringify(obj)
});
