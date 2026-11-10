// ============================================================================
// 👑 LOCKET GOLD REVENUECAT UNLOCKER V9 - BẢN CÁ NHÂN HOÁ VĂN TRƯỜNG
// ============================================================================
const subItem = {
  auto_resume_date: null,
  display_name: "locket_1600_1y",
  is_sandbox: false,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  management_url: "\u0068ttps://apps.apple.com/account/subscriptions",
  period_type: "normal",
  price: { amount: 399000, currency: "VND" },
  expires_date: "9999-01-09T10:10:14Z",
  grace_period_expires_date: null,
  refunded_at: null,
  unsubscribe_detected_at: null,
  original_purchase_date: "2005-01-09T10:10:15Z",
  purchase_date: "2005-01-09T10:10:14Z",
  store: "app_store",
  store_transaction_id: "2000001108724193"
};

const entItem = {
  grace_period_expires_date: null,
  purchase_date: "2005-01-09T10:10:14Z",
  original_purchase_date: "2005-01-09T10:10:15Z",
  product_identifier: "locket_1600_1y",
  product_plan_identifier: "locket_1600_1y",
  ownership_type: "PURCHASED",
  store: "app_store",
  is_sandbox: false,
  unsubscribe_detected_at: null,
  billing_issues_detected_at: null,
  expires_date: "9999-01-09T10:10:14Z"
};

const subKeys = [
  "locket_1600_1y", "Gold", "gold", "pro", "locket_gold", "Locket Gold",
  "holiday_effects", "camera_filters", "camera_filter", "filters", "filter",
  "ai_filters", "ai_filter", "locket_gold_yearly", "gold_yearly"
];
const entKeys = [
  "Gold", "gold", "pro", "locket_gold", "Locket Gold", "holiday_effects",
  "camera_filters", "camera_filter", "holiday_filter", "holidays", "effects",
  "filters", "filter", "ai_filters", "ai_filter", "locket_gold_yearly", "gold_yearly"
];

const subscriptions = {};
for (const k of subKeys) subscriptions[k] = subItem;
const entitlements = {};
for (const k of entKeys) entitlements[k] = entItem;

let respHeaders = Object.assign({}, (typeof $response !== "undefined" && $response && $response.headers) || {});
for (const k of Object.keys(respHeaders)) {
  if (["content-encoding", "content-length", "transfer-encoding"].includes(k.toLowerCase())) {
    delete respHeaders[k];
  }
}
respHeaders["Content-Type"] = "application/json; charset=utf-8";

$done({
  status: 200,
  headers: respHeaders,
  body: JSON.stringify({
    Attention: "Locket Gold VIP - Văn Trường",
    subscriber: {
      subscriptions: subscriptions,
      entitlements: entitlements,
      non_subscriptions: {},
      other_purchases: {}
    },
    request_date: new Date().toISOString(),
    request_date_ms: Date.now()
  })
});
