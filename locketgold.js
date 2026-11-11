// ============================================================================
// 👑 LOCKET GOLD REVENUECAT UNLOCKER V17 (CHUẨN @OHOANG7 + VĂN TRƯỜNG VIP)
// - Khắc phục triệt để lỗi MẤT GOLD:
//   1. Đọc và giữ nguyên `JSON.parse($response.body)` (bảo toàn `original_app_user_id`,
//      `first_seen`, `original_application_version` của tài khoản thực `ttruonngg`).
//   2. Bơm đồng thời gói chuẩn `@Ohoang7` (`com.ohoang7.premium.yearly`), gói nội địa
//      (`locket_1600_1y`) và gói quốc tế (`com.locket.Locket.premium.yearly`).
//   3. Chỉ trả về `$done({ body: JSON.stringify(obj) })` để giữ nguyên 100% HTTP/2
//      Response Headers gốc của RevenueCat trên Shadowrocket.
// ============================================================================
(function () {
  var ua = (typeof $request !== "undefined" && $request && $request.headers)
    ? ($request.headers["User-Agent"] || $request.headers["user-agent"] || "Locket")
    : "Locket";

  var obj = {};
  try {
    obj = JSON.parse((typeof $response !== "undefined" && $response && $response.body) || "{}");
  } catch (e) {
    obj = {};
  }
  if (!obj || typeof obj !== "object") obj = {};

  obj.Attention = "Chúc mừng bạn! Locket Gold VIP Văn Trường (@ttruonngg) V17 đã kích hoạt!";
  if (!obj.request_date) obj.request_date = new Date().toISOString();
  if (!obj.request_date_ms) obj.request_date_ms = Date.now();

  if (!obj.subscriber || typeof obj.subscriber !== "object") {
    obj.subscriber = {
      original_app_user_id: "7tegglv8kah3bvapztlejemxubr2",
      original_application_version: "1.0",
      original_purchase_date: "2024-07-28T01:04:18Z",
      first_seen: "2024-07-28T01:04:17Z",
      management_url: "\u0068ttps://apps.apple.com/account/subscriptions",
      non_subscriptions: {},
      other_purchases: {}
    };
  }
  if (!obj.subscriber.subscriptions || typeof obj.subscriber.subscriptions !== "object") {
    obj.subscriber.subscriptions = {};
  }
  if (!obj.subscriber.entitlements || typeof obj.subscriber.entitlements !== "object") {
    obj.subscriber.entitlements = {};
  }

  var ohoang7Sub = {
    is_sandbox: false,
    ownership_type: "PURCHASED",
    billing_issues_detected_at: null,
    period_type: "normal",
    expires_date: "2099-12-18T01:04:17Z",
    grace_period_expires_date: null,
    refunded_at: null,
    unsubscribe_detected_at: null,
    original_purchase_date: "2024-07-28T01:04:18Z",
    purchase_date: "2024-07-28T01:04:17Z",
    store: "app_store"
  };

  var vanTruongSubVN = {
    auto_resume_date: null,
    display_name: "locket_1600_1y",
    is_sandbox: false,
    ownership_type: "PURCHASED",
    billing_issues_detected_at: null,
    management_url: "\u0068ttps://apps.apple.com/account/subscriptions",
    period_type: "normal",
    price: { amount: 399000, currency: "VND" },
    expires_date: "2099-12-18T01:04:17Z",
    grace_period_expires_date: null,
    refunded_at: null,
    unsubscribe_detected_at: null,
    original_purchase_date: "2024-07-28T01:04:18Z",
    purchase_date: "2024-07-28T01:04:17Z",
    store: "app_store",
    store_transaction_id: "2000001108724193"
  };

  var goldEntitlementOhoang7 = {
    grace_period_expires_date: null,
    purchase_date: "2024-07-28T01:04:17Z",
    product_identifier: "com.ohoang7.premium.yearly",
    expires_date: "2099-12-18T01:04:17Z"
  };

  var goldEntitlementVN = {
    grace_period_expires_date: null,
    purchase_date: "2024-07-28T01:04:17Z",
    product_identifier: "locket_1600_1y",
    product_plan_identifier: "locket_1600_1y",
    expires_date: "2099-12-18T01:04:17Z"
  };

  obj.subscriber.subscriptions["com.ohoang7.premium.yearly"] = ohoang7Sub;
  obj.subscriber.subscriptions["com.locket.Locket.premium.yearly"] = ohoang7Sub;
  obj.subscriber.subscriptions["locket_1600_1y"] = vanTruongSubVN;

  obj.subscriber.entitlements["Gold"] = goldEntitlementOhoang7;
  obj.subscriber.entitlements["gold"] = goldEntitlementVN;
  obj.subscriber.entitlements["locket_gold"] = goldEntitlementVN;
  obj.subscriber.entitlements["pro"] = goldEntitlementOhoang7;

  $done({ body: JSON.stringify(obj) });
})();
