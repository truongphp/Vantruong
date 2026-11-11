// ============================================================================
// 🎂 LOCKET REMOTE CONFIG V17 - BẢN CHUẨN KHÔNG MẤT BẠN & PHOTOBOOTH SHINCHAN
// - Khắc phục triệt để lỗi MẤT BẠN:
//   1. Loại bỏ hoàn toàn khối `baseSqliteEntries` cũ có chứa cờ độc hại
//      `"send_to_self_only_mode": "always_enabled"` và `"friends_button": false`.
//   2. Giữ nguyên `obj.entries` gốc từ Firebase của tài khoản bạn, KHÔNG xóa trắng
//      cache bạn bè (`friends_cache_v2: "true"`, `hide_friends_enabled: "false"`).
// - Khắc phục lỗi BỘ LỌC KHÔNG GỬI LỆNH POST:
//   3. Đặt `"overlay": false`, `"style": "normal"`, `"type": "normal"`, `"filterType": "normal"`
//      để Locket luôn kích hoạt Cloud Function `POST /generateFilteredImage` khi chụp.
// - Tích hợp đầy đủ 14 nhóm Caption độc quyền của Văn Trường và chỉ trả `$done({ body })`.
// ============================================================================
(function () {
  var obj = {};
  try {
    obj = JSON.parse((typeof $response !== "undefined" && $response && $response.body) || "{}");
  } catch (e) {
    obj = {};
  }
  if (!obj || typeof obj !== "object") {
    obj = {};
  }

  obj.state = "UPDATE";
  obj.templateVersion = String(Date.now());
  obj.entries = obj.entries || {};

  // Xóa cờ chỉ gửi cho bản thân nếu từng bị lưu trong phản hồi cũ
  delete obj.entries["send_to_self_only_mode"];

  // 1. CẤU HÌNH BẠN BÈ CHUẨN (GIỮ NGUYÊN DANH SÁCH BẠN BÈ, KHÔNG ẨN BẠN)
  Object.assign(obj.entries, {
    max_friends_count: "1000",
    unlimited_max_friend_count: "1000",
    friend_limit_mode: "0",
    soft_friend_limit_threshold_count: "1000",
    signup_max_friends_count: "1000",
    show_friend_limit_on_cam: "false",
    hide_friends_enabled: "false",
    show_no_friends_bottom_sheet: "false",
    friends_cache_v2: "true",
    fetch_users_from_cloud_function: "true",
    close_friends: "true",
    close_friends_enabled: "true",
    best_friends_enabled: "true",
    friend_groups_enabled: "true",
    groups_enabled: "true",
    groups_feature_mode: "enabled",
    recipient_selection_enabled: "true",
    send_to_individual: "true",
    send_to_individual_enabled: "true",
    direct_sharing: "true",
    direct_sharing_enabled: "true",
    audience_selector: "true",
    audience_selector_enabled: "true",
    custom_audience_enabled: "true",
    profile_friends_button: JSON.stringify({ enabled: true })
  });

  // 2. MỞ KHÓA LOCKET GOLD, VIDEO 60S & TỐI ƯU KÍCH THƯỚC ẢNH 1080PX CHO PHOTOBOOTH
  Object.assign(obj.entries, {
    purchases_enabled: "true",
    purchases_entitlement: "Gold",
    is_gold: "true",
    has_gold: "true",
    is_gold_user: "true",
    user_is_gold: "true",
    gold_user: "true",
    gold_active: "true",
    gold_member: "true",
    gold_membership: "true",
    gold_membership_card: "true",
    gold_card: "true",
    profile_gold_card: "true",
    profile_gold_badge: "true",
    locket_gold_badge: "true",
    locket_gold_badge_small: "true",
    profile_badge: "true",
    profile_badge_enabled: "true",
    profile_badge_visible: "true",
    gold_badge_profile_menu: "true",
    gold_since: "true",
    gold_since_enabled: "true",
    gold_since_badge: "true",
    gold_since_badge_enabled: "true",
    gold_member_since: "true",
    gold_member_since_enabled: "true",
    show_gold_since: "true",
    app_icon_enabled: "true",
    app_icon_picker: "true",
    custom_widget_frames: "enabled",
    custom_widget_frames_enabled: "true",
    custom_widget_frames_unlocked: "true",
    widget_frames_enabled: "true",
    widget_frames_unlocked: "true",
    history_ads_mode: "disabled",
    longer_video_enabled: "true",
    longer_videos_enabled: "true",
    max_video_duration: "60.0",
    video_max_duration: "60.0",
    camera_roll_max_duration: "60.0",
    gold_max_duration: "60.0",
    goldMaxDuration: "60.0",
    upload_main_image_size: "1080",
    upload_main_image_quality: "0.85",
    upload_thumbnail_image_size: "1080",
    upload_thumbnail_image_quality: "0.85",
    camera: JSON.stringify({
      gold_max_duration: 60,
      goldMaxDuration: 60,
      max_duration: 60,
      maxDuration: 60,
      ultra_wide: true,
      ultraWide: true,
      volume_button: true,
      volumeButton: true,
      flash_button: true,
      telephoto: true,
      srgb: true,
      quality_mbps: 1.5,
      qualityMbps: 1.5
    }),
    camera_roll: JSON.stringify({
      enabled: true,
      flash_button: true,
      allow_video: true,
      allow_photo: true,
      max_duration: 60
    }),
    upsell_features: JSON.stringify({
      custom_widget_frames: true,
      app_icon_picker: true,
      unlimited_friends: true
    }),
    feature_gates: JSON.stringify({
      app_icon_picker: "enabled",
      camera_roll: "enabled",
      camera_theme: "enabled",
      locket_views: "enabled",
      long_captions: "enabled",
      longer_video: "enabled",
      unlimited_friends: "enabled",
      priority_support: "subscriber",
      profile_badge: "enabled",
      remove_ads: "subscriber",
      custom_widget_frames: "enabled",
      longerVideo: "enabled",
      video: "enabled",
      widget_frame: "enabled",
      widget_frame_event: "enabled",
      widget_frame_events: "enabled",
      live_photos: "enabled",
      live_photo: "enabled",
      live_photos_capture: "enabled",
      live_photos_viewing: "enabled",
      gold_camera_themes: "enabled",
      profileBadge: "enabled",
      gold_badge: "enabled",
      goldBadge: "enabled",
      gold_since: "enabled",
      gold_since_badge: "enabled",
      gold_member_since: "enabled",
      show_gold_since: "enabled",
      profile_gold_badge: "enabled",
      profile_gold_card: "enabled",
      gold_membership_card: "enabled",
      gold_card: "enabled",
      profile_badge_visible: "enabled",
      gold_badge_profile_menu: "enabled",
      audience_selector: "enabled",
      send_to_individual: "enabled",
      custom_audience: "enabled",
      recipient_selection: "enabled",
      direct_sharing: "enabled",
      close_friends: "enabled",
      best_friends: "enabled",
      private_sharing: "enabled",
      groups: "enabled"
    })
  });

  // 3. CẤU HÌNH BỘ LỌC PHOTOBOOTH SHINCHAN 4 Ô (ÉP GỌI CLOUD FUNCTION POST /generateFilteredImage)
  var iconUrl = "\u0068ttps://weathered-wave-12cc.noobnopro2007.workers.dev/assets/stickers/stk_pb_2x2_shinchan.png";
  var customPhotoboothFilters = [
    {
      "uid": "stk_pb_2x2_shinchan",
      "id": "stk_pb_2x2_shinchan",
      "filter_id": "stk_pb_2x2_shinchan",
      "filterId": "stk_pb_2x2_shinchan",
      "name": "🖍️ Photobooth Shinchan (4 Ảnh 2x2)",
      "title": "🖍️ Photobooth Shinchan (4 Ảnh 2x2)",
      "prompt": "Photobooth 2x2 Crayon Shinchan Cute Frame",
      "productUrl": null,
      "colors": ["#FACC15", "#EF4444"],
      "captureButtonColors": ["#FACC15", "#EF4444"],
      "icon": {
        "url": iconUrl,
        "iconUrl": iconUrl,
        "remoteImage": iconUrl,
        "sfSymbol": "square.grid.2x2.fill",
        "emoji": "🖍️"
      },
      "textColor": "#FFFFFF",
      "style": "normal",
      "overlay": false,
      "url": iconUrl,
      "imageUrl": iconUrl,
      "image_url": iconUrl,
      "iconUrl": iconUrl,
      "icon_url": iconUrl,
      "thumbnail_url": iconUrl,
      "referenceImages": [],
      "requires_gold": false,
      "requiresGold": false,
      "is_gold": false,
      "isGold": false,
      "unlocked": true,
      "is_unlocked": true,
      "isUnlocked": true,
      "free": true,
      "enabled": true,
      "allowsTryFilter": true,
      "allows_try_filter": true,
      "tryButtonEnabled": true,
      "try_button_enabled": true,
      "type": "normal",
      "filterType": "normal",
      "filter_type": "normal",
      "data": {
        "filterId": "stk_pb_2x2_shinchan",
        "filter_id": "stk_pb_2x2_shinchan",
        "filterType": "normal",
        "prompt": "Photobooth 2x2 Crayon Shinchan Cute Frame"
      }
    }
  ];

  var customFilterGroups = [
    {
      "id": "group_photobooth_shinchan",
      "title": {
        "en": "Photobooth Shinchan 📸",
        "vi": "Photobooth Shinchan 📸"
      },
      "filterIds": ["stk_pb_2x2_shinchan"],
      "filter_ids": ["stk_pb_2x2_shinchan"],
      "filters": customPhotoboothFilters,
      "requires_gold": false,
      "requiresGold": false,
      "is_gold": false,
      "isGold": false,
      "unlocked": true,
      "is_unlocked": true,
      "isUnlocked": true,
      "free": true
    }
  ];

  var customPickerFilters = ["stk_pb_2x2_shinchan"];

  var locketCameraFilterConfig = {
    showFilterButton: true,
    allowsCustomFilters: true,
    referenceImageAttachmentEnabled: true,
    sheetEnabled: true,
    openSheetImmediately: false,
    pickerFilters: customPickerFilters,
    picker_filters: customPickerFilters,
    Picker_filters: customPickerFilters,
    freeFilters: customPickerFilters,
    free_filters: customPickerFilters,
    unlockedFilters: customPickerFilters,
    unlocked_filters: customPickerFilters,
    filterGroups: customFilterGroups,
    filter_groups: customFilterGroups,
    sheetFilters: customFilterGroups,
    sheet_filters: customFilterGroups,
    Sheet_filters: customPickerFilters,
    remoteFilters: customPhotoboothFilters,
    remote_filters: customPhotoboothFilters,
    presets: customPhotoboothFilters,
    filters: customPhotoboothFilters,
    show_filter_button: true,
    allows_custom_filters: true,
    reference_image_attachment_enabled: true,
    sheet_enabled: true,
    open_sheet_immediately: false
  };

  Object.assign(obj.entries, {
    country_code: "US",
    region_code: "US",
    is_us_user: "true",
    functions_domains: JSON.stringify(["\u0068ttps://api.locketcamera.com"]),
    functions_v2: "false",
    android_use_functions_v2: "false",
    camera_filters_enabled: "true",
    camera_filter_enabled: "true",
    holiday_filters_enabled: "true",
    ai_filters_enabled: "true",
    all_filters_free: "true",
    unlocked_filters: "true",
    free_filters_enabled: "true",
    filter_selection_enabled: "true",
    camera_filter_gold_only: "false",
    camera_filters_gold_only: "false",
    holiday_filters_gold_only: "false",
    filter_gold_only: "false",
    filters_gold_only: "false",
    ai_filter_gold_only: "false",
    ai_filters_gold_only: "false",
    filter_paywall_enabled: "false",
    camera_filter_paywall_enabled: "false",
    filter_upsell_enabled: "false",
    require_gold_for_filters: "false",
    requires_gold_for_filters: "false",
    camera_filter_sheet_selection_enabled: "true",
    sheet_filters_selectable: "true",
    dismiss_filter_sheet_on_select: "true",
    camera_filter_max_count: "10",
    max_camera_filters: "10",
    camera_filter_config: JSON.stringify(locketCameraFilterConfig),
    camera_filter_picker_config: JSON.stringify(locketCameraFilterConfig),
    filter_config: JSON.stringify(locketCameraFilterConfig),
    filters_config: JSON.stringify(locketCameraFilterConfig),
    locket_filter_config: JSON.stringify(locketCameraFilterConfig)
  });

  // 4. OVERLAY & 14 NHÓM CAPTION VĂN TRƯỜNG
  Object.assign(obj.entries, {
    overlay_navigator_enabled: "true",
    overlays_v2_config: JSON.stringify({ suggestions_enabled: true }),
    captions_enabled: "true",
    music_caption_enabled: "true",
    music_caption_song_preview_enabled: "true",
    link_caption_link_enabled: "true",
    overlay_dynamic_captions: JSON.stringify([
      "standard", "poll", "color_palette", "review", "music", "location",
      "weather", "time", "streak", "star_sign", "party_time", "locket_count",
      "good_morning", "goodnight", "ootd", "miss_you", "custom", "phunu_2010", "halloween_2026"
    ]),
    overlay_items: JSON.stringify([{"section": "🎨 Basic", "items": [{"overlay_id": "caption:standard", "source": "local", "caption": {"type": "standard"}}, {"overlay_id": "caption:link", "source": "local", "caption": {"type": "link"}, "overlay_type": "caption"}, {"overlay_id": "caption:review", "source": "local", "caption": {"type": "review"}}, {"overlay_id": "caption:music", "source": "local", "caption": {"type": "music"}}, {"overlay_id": "caption:location", "source": "local", "caption": {"type": "location"}}, {"overlay_id": "caption:weather", "source": "local", "caption": {"type": "weather"}}, {"overlay_id": "caption:time", "source": "local", "caption": {"type": "time"}}, {"overlay_id": "caption:streak", "source": "local", "caption": {"type": "streak"}}, {"overlay_id": "caption:star_sign", "source": "local", "caption": {"type": "star_sign"}}, {"overlay_id": "caption:poll", "source": "local", "caption": {"type": "poll"}}, {"overlay_id": "caption:color_palette", "source": "local", "caption": {"type": "color_palette"}}, {"overlay_id": "caption:live", "source": "local", "caption": {"type": "live"}}, {"overlay_id": "caption:locket_count", "source": "local", "caption": {"type": "locket_count"}}]}, {"section": "🎨 Tình yêu 💕", "items": [{"overlay_id": "caption:em_nho_anhh", "source": "remote", "caption": {"background": {"colors": ["#FF6B81", "#FF8E9E", "#FFB3C6"]}, "icon": {"data": "🥺", "type": "emoji"}, "max_lines": 1, "text": "em nhớ anhh", "text_color": "#8C1938", "type": "static_content"}}, {"overlay_id": "caption:nho_anh_phien", "source": "remote", "caption": {"background": {"colors": ["#F0B5CB", "#F6D0DF", "#DCCAF0"]}, "icon": {"data": "🥺", "type": "emoji"}, "max_lines": 1, "text": "nhớ anh tới mức hơi phiền", "text_color": "#70445A", "type": "static_content"}}, {"overlay_id": "caption:i_love_you", "source": "remote", "caption": {"background": {"colors": ["#FF8FAB", "#FFC2D1", "#FFE5EC"]}, "icon": {"data": "💗", "type": "emoji"}, "max_lines": 1, "text": "i love you", "text_color": "#8A304F", "type": "static_content"}}, {"overlay_id": "caption:yeu_cuc_dang", "source": "remote", "caption": {"background": {"colors": ["#F2B5C8", "#F8D5D9", "#F6E5D2"]}, "icon": {"data": "🎀", "type": "emoji"}, "max_lines": 1, "text": "yêu cục dàng", "text_color": "#754454", "type": "static_content"}}, {"overlay_id": "caption:yeu_emmm", "source": "remote", "caption": {"background": {"colors": ["#F2AFC6", "#F7C9D9", "#E5CFF4"]}, "icon": {"data": "💗", "type": "emoji"}, "max_lines": 1, "text": "Yeu Emmm", "text_color": "#70445C", "type": "static_content"}}, {"overlay_id": "caption:yeu_anhhh", "source": "remote", "caption": {"background": {"colors": ["#B8C9F2", "#D5DDF8", "#E8CFF0"]}, "icon": {"data": "🫶", "type": "emoji"}, "max_lines": 1, "text": "Yeu Anhhh", "text_color": "#414C72", "type": "static_content"}}, {"overlay_id": "caption:baby_love", "source": "remote", "caption": {"background": {"colors": ["#FFB6C1", "#FF69B4", "#FF1493"]}, "icon": {"data": "🧸", "type": "emoji"}, "max_lines": 1, "text": "Baby Love 💖", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:muon_duoc_om", "source": "remote", "caption": {"background": {"colors": ["#FF9A9E", "#FECFEF"]}, "icon": {"data": "🫂", "type": "emoji"}, "max_lines": 1, "text": "Muốn được ôm", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:cho_hun_mieng", "source": "remote", "caption": {"background": {"colors": ["#F3AFC7", "#F8D0D8", "#F4C9BB"]}, "icon": {"data": "😘", "type": "emoji"}, "max_lines": 1, "text": "cho hun miếng coi", "text_color": "#754252", "type": "static_content"}}, {"overlay_id": "caption:me_anh_me_ngu", "source": "remote", "caption": {"background": {"colors": ["#C4C8EF", "#DED3F4", "#EBCDE4"]}, "icon": {"data": "💤", "type": "emoji"}, "max_lines": 1, "text": "mê anh hơn mê ngủ", "text_color": "#4F4770", "type": "static_content"}}, {"overlay_id": "caption:be_be_can_do", "source": "remote", "caption": {"background": {"colors": ["#FF8FAB", "#FFC2D1", "#FFE5EC"]}, "icon": {"data": "🎀", "type": "emoji"}, "max_lines": 1, "text": "em bé cần được dỗ", "text_color": "#812D4A", "type": "static_content"}}, {"overlay_id": "caption:iu_thi_noi", "source": "remote", "caption": {"background": {"colors": ["#FFD166", "#FFE8A3", "#FFF3D0"]}, "icon": {"data": "🤭", "type": "emoji"}, "max_lines": 1, "text": "iu thì nói, đừng có ngại", "text_color": "#704510", "type": "static_content"}}, {"overlay_id": "caption:iu_hong_thi_bao", "source": "remote", "caption": {"background": {"colors": ["#FF6B6B", "#FF9999", "#FFD1C9"]}, "icon": {"data": "🎀", "type": "emoji"}, "max_lines": 1, "text": "iu hong thì bảo", "text_color": "#812626", "type": "static_content"}}, {"overlay_id": "caption:anh_thuong_em", "source": "remote", "caption": {"background": {"colors": ["#A0C4FF", "#BDE0FE", "#DFF3FF"]}, "icon": {"data": "🥹", "type": "emoji"}, "max_lines": 1, "text": "anh có thương em thiệt hong", "text_color": "#23466F", "type": "static_content"}}, {"overlay_id": "caption:yeu_em_nhiem_vu", "source": "remote", "caption": {"background": {"colors": ["#B7E4C7", "#D8F3DC", "#F0FFF1"]}, "icon": {"data": "🫡", "type": "emoji"}, "max_lines": 1, "text": "yêu em là nhiệm vụ cả đời", "text_color": "#24563A", "type": "static_content"}}, {"overlay_id": "caption:crush_nhin", "source": "remote", "caption": {"background": {"colors": ["#CDB4DB", "#E2CFEA", "#F3E5F5"]}, "icon": {"data": "🫠", "type": "emoji"}, "max_lines": 1, "text": "crush nhìn em một cái là xong", "text_color": "#593B68", "type": "static_content"}}, {"overlay_id": "caption:ngoai_le_cua_em", "source": "remote", "caption": {"background": {"colors": ["#80CBC4", "#B2DFDB", "#E0F2F1"]}, "icon": {"data": "🫶", "type": "emoji"}, "max_lines": 1, "text": "anh là ngoại lệ của em", "text_color": "#205953", "type": "static_content"}}, {"overlay_id": "caption:dang_ban_tuong_tu", "source": "remote", "caption": {"background": {"colors": ["#1A2980", "#26D0CE"]}, "icon": {"data": "💭", "type": "emoji"}, "max_lines": 1, "text": "Đang bận tương tư", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:mac_bay_tinh_yeu", "source": "remote", "caption": {"background": {"colors": ["#EE9CA7", "#FFDDE1"]}, "icon": {"data": "💘", "type": "emoji"}, "max_lines": 1, "text": "Mắc bẫy tình yêu", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:minh_cuoi_nhau", "source": "remote", "caption": {"background": {"colors": ["#F0B8CD", "#F7D4DF", "#E7C9EF"]}, "icon": {"data": "💍", "type": "emoji"}, "max_lines": 1, "text": "hông ấy mình cưới nhau đi", "text_color": "#70465B", "type": "static_content"}}, {"overlay_id": "caption:wedding_time", "source": "remote", "caption": {"background": {"colors": ["#FFE4E1", "#E73C7E"]}, "icon": {"data": "💍", "type": "emoji"}, "max_lines": 1, "text": "Wedding Time!", "localized_text": {"en": "Wedding Time!", "vn": "Đám cưới nè!"}, "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:dating_time", "source": "remote", "caption": {"background": {"colors": ["#E91E63", "#F44336"]}, "icon": {"data": "💕", "type": "emoji"}, "max_lines": 1, "text": "Dating Time!", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:tuong_love_hoa_ra_lop", "source": "remote", "caption": {"background": {"colors": ["#C9184A", "#FF4D6D", "#FFB3C6"]}, "icon": {"data": "❤️🩹", "type": "emoji"}, "max_lines": 1, "text": "Tưởng love hoá ra lốp", "text_color": "#64152F", "type": "static_content"}}, {"overlay_id": "caption:cam_thay_hanh_phuc", "source": "remote", "caption": {"background": {"colors": ["#EC407A", "#F8BBD0"]}, "icon": {"data": "🇻🇳", "type": "emoji"}, "max_lines": 1, "text": "Cảm thấy hạnh phúc", "localized_text": {"en": "Feeling Happy", "vn": "Cảm thấy hạnh phúc"}, "text_color": "#FFFFFFE6", "type": "static_content"}}]}, {"section": "🎨 Holiday Caption", "items": [{"overlay_id": "caption:halloween_2026", "source": "remote", "caption": {"background": {"colors": ["#150804", "#C8540D"]}, "icon": {"data": "🎃", "type": "emoji"}, "max_lines": 1, "text": "Halloween", "localized_text": {"en": "Halloween", "vn": "Halloween"}, "text_color": "#FFB182", "type": "static_content"}}, {"overlay_id": "caption:autumn_2026", "source": "remote", "caption": {"background": {"colors": ["#FFE0A0", "#F6A53A"]}, "icon": {"data": "🍂", "type": "emoji"}, "max_lines": 1, "text": "Xin chào Mùa Thu", "localized_text": {"en": "Xin chào Mùa Thu", "vn": "Xin chào Mùa Thu"}, "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:christmas_eve_2026", "source": "remote", "caption": {"background": {"colors": ["#2FA85F", "#176B3A"]}, "icon": {"data": "🕯️", "type": "emoji"}, "max_lines": 1, "text": "Giáng sinh an lành", "localized_text": {"en": "Giáng sinh an lành", "vn": "Giáng sinh an lành"}, "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:christmas_day_2026", "source": "remote", "caption": {"background": {"colors": ["#E53935", "#A81818"]}, "icon": {"data": "🎄", "type": "emoji"}, "max_lines": 1, "text": "Giáng sinh an lành", "localized_text": {"en": "Giáng sinh an lành", "vn": "Giáng sinh an lành"}, "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:new_years_eve_2026", "source": "remote", "caption": {"background": {"colors": ["#FFC64B", "#FFEDBF"]}, "icon": {"data": "🥂", "type": "emoji"}, "max_lines": 1, "text": "Xin chào 2027!", "localized_text": {"en": "Xin chào 2027!", "vn": "Xin chào 2027!"}, "text_color": "#643F00", "type": "static_content"}}, {"overlay_id": "caption:new_years_day_2027", "source": "remote", "caption": {"background": {"colors": ["#3B00EC", "#823FFF"]}, "icon": {"data": "💫", "type": "emoji"}, "max_lines": 1, "text": "Xin chào 2027!", "localized_text": {"en": "Xin chào 2027!", "vn": "Xin chào 2027!"}, "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:new_years_day_2027_alternate", "source": "remote", "caption": {"background": {"colors": ["#FF0062", "#FF783F"]}, "max_lines": 1, "text": "2027", "text_color": "#FFFFFF", "type": "static_content"}}]}, {"section": "🎨 Decorative by Locket", "items": [{"overlay_id": "caption:toi_nho_em", "source": "remote", "caption": {"background": {"colors": ["#FFFFFF", "#6D9EEB"]}, "max_lines": 1, "text": "보고 싶어 🥺", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:party_time", "source": "remote", "caption": {"background": {"colors": ["#5EFFF5", "#FCFF57"]}, "icon": {"data": "🪩", "type": "emoji"}, "max_lines": 1, "text": "Party Time!", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:good_morning", "source": "remote", "daily_start_hour": 5, "daily_end_hour": 10, "caption": {"background": {"colors": ["#EF7402", "#EABF0F"]}, "icon": {"data": "☀️", "type": "emoji"}, "max_lines": 1, "text": "Good morning", "text_color": "#FFFFFFE5", "type": "static_content"}}, {"overlay_id": "caption:goodnight", "source": "remote", "daily_start_hour": 19.5, "daily_end_hour": 24, "caption": {"background": {"colors": ["#370C6F", "#575CD4"]}, "icon": {"data": "🌙", "type": "emoji"}, "max_lines": 1, "text": "Goodnight", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ootd", "source": "remote", "caption": {"background": {"colors": ["#FFFFFF", "#DBDBDB"]}, "icon": {"data": "🕶", "type": "emoji"}, "max_lines": 1, "text": "OOTD", "text_color": "#101010E6", "type": "static_content"}}, {"overlay_id": "caption:miss_you", "source": "remote", "caption": {"background": {"colors": ["#EC0C00", "#FF493F"]}, "icon": {"data": "🥰", "type": "emoji"}, "max_lines": 1, "text": "Miss you", "text_color": "#FFFFFFDB", "type": "static_content"}}]}, {"section": "🎨 Decorative by Văn Trường", "items": [{"overlay_id": "caption:quangthanh06", "source": "remote", "caption": {"background": {"colors": ["#B8E7FF", "#A8F5D0", "#DCCBFF"]}, "max_lines": 1, "text": "💻 By Văn Trường", "text_color": "#183153", "type": "static_content"}}, {"overlay_id": "caption:Hieon", "source": "remote", "caption": {"background": {"colors": ["#B8E7FF", "#A8F5D0", "#DCCBFF"]}, "max_lines": 1, "text": "Hieon", "text_color": "#183153", "type": "static_content"}}, {"overlay_id": "caption:feeling_cute", "source": "remote", "caption": {"background": {"colors": ["#F8BBD0", "#E91E63"]}, "icon": {"data": "🌷", "type": "emoji"}, "max_lines": 1, "text": "Feeling Cute", "localized_text": {"en": "Feeling Cute", "vn": "Cảm thấy dthw"}, "text_color": "#FFFFFFE5", "type": "static_content"}}, {"overlay_id": "caption:cu", "source": "remote", "caption": {"background": {"colors": ["#FFD6A5", "#FFF1A8", "#FFC4D6"]}, "max_lines": 1, "text": "Cu 🐎", "text_color": "#633B24", "type": "static_content"}}, {"overlay_id": "caption:tuat", "source": "remote", "caption": {"background": {"colors": ["#2C1A0E", "#5D4037", "#D7A86E"]}, "icon": {"data": "🐕", "type": "emoji"}, "max_lines": 1, "text": "Tuất", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:wedding_time", "source": "remote", "caption": {"background": {"colors": ["#FFE4E1", "#E73C7E"]}, "icon": {"data": "💍", "type": "emoji"}, "max_lines": 1, "text": "Wedding Time!", "localized_text": {"en": "Wedding Time!", "vn": "Đám cưới nè!"}, "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:cam_thay_hanh_phuc", "source": "remote", "caption": {"background": {"colors": ["#EC407A", "#F8BBD0"]}, "icon": {"data": "🇻🇳", "type": "emoji"}, "max_lines": 1, "text": "Cảm thấy hạnh phúc", "localized_text": {"en": "Feeling Happy", "vn": "Cảm thấy hạnh phúc"}, "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:coffee_time", "source": "remote", "caption": {"background": {"colors": ["#4E342E", "#8D6E63"]}, "icon": {"data": "☕", "type": "emoji"}, "max_lines": 1, "text": "Coffee Time!", "localized_text": {"en": "Coffee Time!", "vn": "Giờ uống cà phê!"}, "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:snake_vibes", "source": "remote", "caption": {"background": {"colors": ["#2E7D32", "#66BB6A"]}, "icon": {"data": "🐍", "type": "emoji"}, "max_lines": 1, "text": "Snake Vibes", "localized_text": {"en": "Snake Vibes", "vn": "Chất rắn"}, "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:mixue_time", "source": "remote", "caption": {"background": {"colors": ["#FFF9C4", "#F8BBD0"]}, "icon": {"data": "🍦", "type": "emoji"}, "max_lines": 1, "text": "Mixue Time!", "localized_text": {"en": "Mixue Time!", "vn": "Giờ Mixue!"}, "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:locket_time", "source": "remote", "caption": {"background": {"colors": ["#ECEFF1", "#B3E5FC"]}, "icon": {"data": "📷", "type": "emoji"}, "max_lines": 1, "text": "Locket Time!", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:cinema_time", "source": "remote", "caption": {"background": {"colors": ["#1A237E", "#455A64"]}, "icon": {"data": "🎬", "type": "emoji"}, "max_lines": 1, "text": "Cinema Time!", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:dating_time", "source": "remote", "caption": {"background": {"colors": ["#E91E63", "#F44336"]}, "icon": {"data": "💕", "type": "emoji"}, "max_lines": 1, "text": "Dating Time!", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:graduation_day", "source": "remote", "caption": {"background": {"colors": ["#1A237E", "#283593"]}, "icon": {"data": "🎓", "type": "emoji"}, "max_lines": 1, "text": "Happy Graduation Day!", "localized_text": {"en": "Happy Graduation Day!", "vn": "Chúc mừng tốt nghiệp!"}, "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:shopping_time", "source": "remote", "caption": {"background": {"colors": ["#B3E5FC", "#FFFFFF"]}, "icon": {"data": "🛍️", "type": "emoji"}, "max_lines": 1, "text": "Shopping Time!", "localized_text": {"en": "Shopping Time!", "vn": "Giờ mua sắm!"}, "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:dinner_time", "source": "remote", "caption": {"background": {"colors": ["#FFCCBC", "#FF8A80"]}, "icon": {"data": "🍽️", "type": "emoji"}, "max_lines": 1, "text": "Dinner Time!", "localized_text": {"en": "Dinner Time!", "vn": "Giờ ăn tối!"}, "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:chilling_time", "source": "remote", "caption": {"background": {"colors": ["#E1BEE7", "#F8BBD0"]}, "icon": {"data": "🌴", "type": "emoji"}, "max_lines": 1, "text": "Chilling Time!", "localized_text": {"en": "Chilling Time!", "vn": "Giờ thư giãn!"}, "text_color": "#FFFFFFE6", "type": "static_content"}}]}, {"section": "🎨 Độc lạ đời sống", "items": [{"overlay_id": "caption:xin_vinh_biet_cu", "source": "remote", "caption": {"background": {"colors": ["#232526", "#414345"]}, "icon": {"data": "🕯️", "type": "emoji"}, "max_lines": 1, "text": "Xin vĩnh biệt cụ", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:chay_ngay_di", "source": "remote", "caption": {"background": {"colors": ["#D31027", "#EA384D"]}, "icon": {"data": "🏃💨", "type": "emoji"}, "max_lines": 1, "text": "Chạy ngay đi", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:luc_nao_co_tien_thi_moi_di_a", "source": "remote", "caption": {"background": {"colors": ["#0F2027", "#203A43", "#2C5364"]}, "icon": {"data": "💸", "type": "emoji"}, "max_lines": 1, "text": "Lúc nào có tiền thì mới đi á", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:cu_tu_tu_khoai_se_nhu", "source": "remote", "caption": {"background": {"colors": ["#56AB2F", "#A8E063"]}, "icon": {"data": "🥔", "type": "emoji"}, "max_lines": 1, "text": "Cứ từ từ khoai sẽ nhừ", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:kiem_tra_nhan_pham", "source": "remote", "caption": {"background": {"colors": ["#654EA3", "#EAAFC8"]}, "icon": {"data": "🎲", "type": "emoji"}, "max_lines": 1, "text": "Kiểm tra nhân phẩm", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:doc_so_tai_khoan", "source": "remote", "caption": {"background": {"colors": ["#1E90FF", "#00D4FF"]}, "icon": {"data": "💳", "type": "emoji"}, "max_lines": 1, "text": "đọc số tài khoản", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ai_so_thi_di_ve", "source": "remote", "caption": {"background": {"colors": ["#B71C1C", "#FF5722"]}, "icon": {"data": "🏃", "type": "emoji"}, "max_lines": 1, "text": "ai sợ thì đi về", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:con_cai_nit", "source": "remote", "caption": {"background": {"colors": ["#D7CCC8", "#8D6E63"]}, "icon": {"data": "🧶", "type": "emoji"}, "max_lines": 1, "text": "còn cái nịt", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:canh_bao_co_hat", "source": "remote", "caption": {"background": {"colors": ["#9C27B0", "#E91E63"]}, "icon": {"data": "🎤", "type": "emoji"}, "max_lines": 1, "text": "cảnh báo có hát", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:than_chua_ma_don", "source": "remote", "caption": {"background": {"colors": ["#607D8B", "#37474F"]}, "icon": {"data": "😔", "type": "emoji"}, "max_lines": 1, "text": "Thân chưa mà dỡn", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ai_muon", "source": "remote", "caption": {"background": {"colors": ["#E91E63", "#F44336"]}, "icon": {"data": "🤔", "type": "emoji"}, "max_lines": 1, "text": "Ai mượn?", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:hay_ra_de_qua_a", "source": "remote", "caption": {"background": {"colors": ["#FFF59D", "#80DEEA"]}, "icon": {"data": "🥺", "type": "emoji"}, "max_lines": 1, "text": "Hay ra dẻ quá à!", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:giam_suc_manh_con_tuong", "source": "remote", "caption": {"background": {"colors": ["#4CAF50", "#00BCD4"]}, "icon": {"data": "🎮", "type": "emoji"}, "max_lines": 1, "text": "Giảm sức mạnh con tướng", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:mac_co_qua_hai_oi", "source": "remote", "caption": {"background": {"colors": ["#FFB74D", "#F8BBD0"]}, "icon": {"data": "😭", "type": "emoji"}, "max_lines": 1, "text": "Mắc cỡ quá hai ơi", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:minh_la_lop", "source": "remote", "caption": {"background": {"colors": ["#263238", "#455A64"]}, "icon": {"data": "🛞", "type": "emoji"}, "max_lines": 1, "text": "Mình là lốp", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:dep_trai_co_gi_sai", "source": "remote", "caption": {"background": {"colors": ["#FF5722", "#FFC107"]}, "icon": {"data": "😎", "type": "emoji"}, "max_lines": 1, "text": "Đẹp trai có gì sai", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:mong_ton_hoa_sen", "source": "remote", "caption": {"background": {"colors": ["#D8B4E2", "#F8BBD0"]}, "icon": {"data": "🪷", "type": "emoji"}, "max_lines": 1, "text": "Mong tôn hoa sen thấy cảnh này", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:dam_nhau_khong", "source": "remote", "caption": {"background": {"colors": ["#E53935", "#FF7043"]}, "icon": {"data": "🥊", "type": "emoji"}, "max_lines": 1, "text": "đấm nhau không", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:sieu_cap_ba_khi", "source": "remote", "caption": {"background": {"colors": ["#EC407A", "#F44336"]}, "icon": {"data": "🐉", "type": "emoji"}, "max_lines": 1, "text": "siêu cấp bá khí", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:du_an_ma", "source": "remote", "caption": {"background": {"colors": ["#263238", "#455A64"]}, "icon": {"data": "👻", "type": "emoji"}, "max_lines": 1, "text": "dự án ma", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:doi_roi", "source": "remote", "caption": {"background": {"colors": ["#FF5F6D", "#FFC371"]}, "icon": {"data": "😤", "type": "emoji"}, "max_lines": 1, "text": "Dỗi rồi", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:dang_ban_tuong_tu", "source": "remote", "caption": {"background": {"colors": ["#1A2980", "#26D0CE"]}, "icon": {"data": "💭", "type": "emoji"}, "max_lines": 1, "text": "Đang bận tương tư", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:mo_hon_nhung_tam_hien", "source": "remote", "caption": {"background": {"colors": ["#FFB75E", "#ED8F03"]}, "icon": {"data": "🐤", "type": "emoji"}, "max_lines": 1, "text": "Mỏ hỗn nhưng tâm hiền", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:muon_duoc_om", "source": "remote", "caption": {"background": {"colors": ["#FF9A9E", "#FECFEF"]}, "icon": {"data": "🫂", "type": "emoji"}, "max_lines": 1, "text": "Muốn được ôm", "text_color": "#FFFFFF", "type": "static_content"}}]}, {"section": "🎨 Trend TikTok (36 Caption)", "items": [{"overlay_id": "caption:hoi_chieu_troi_mua", "source": "remote", "caption": {"background": {"colors": ["#546E7A", "#263238"]}, "icon": {"data": "🌧️", "type": "emoji"}, "max_lines": 1, "text": "Hồi chiều trời mưa...", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:con_vien_la_lan", "source": "remote", "caption": {"background": {"colors": ["#12C2E9", "#F64F59"]}, "icon": {"data": "🍂", "type": "emoji"}, "max_lines": 1, "text": "côn viên lá làn", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:gian_dang_iu_hong", "source": "remote", "caption": {"background": {"colors": ["#3E2723", "#6D4C41", "#A1887F"]}, "icon": {"data": "🪳", "type": "emoji"}, "max_lines": 1, "text": "Gián đáng iu hong", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:nau_xoi", "source": "remote", "caption": {"background": {"colors": ["#7B1FA2", "#E91E63", "#FFB74D"]}, "icon": {"data": "🙀", "type": "emoji"}, "max_lines": 1, "text": "Nấu xói", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:co_tien_lam_phien_thien_ha", "source": "remote", "caption": {"background": {"colors": ["#0F0C29", "#302B63", "#F7971E", "#FFD200"]}, "icon": {"data": "💰", "type": "emoji"}, "max_lines": 1, "text": "Có tiền làm phiền thiên hạ", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:nguoi_im_lang_gap_nguoi_hay_noi", "source": "remote", "caption": {"background": {"colors": ["#232526", "#414345", "#6C7A89", "#B0BEC5"]}, "icon": {"data": "🤐", "type": "emoji"}, "max_lines": 1, "text": "Người im lặng gặp người hay nói", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:roi_let_luon", "source": "remote", "caption": {"background": {"colors": ["#FF9A9E", "#FECFEF", "#FBC2EB", "#A6C1EE"]}, "icon": {"data": "💅", "type": "emoji"}, "max_lines": 1, "text": "rồi lét luôn", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:roi_gay_luon", "source": "remote", "caption": {"background": {"colors": ["#FF6EC7", "#7873F5", "#4ADEDE", "#FFE66D"]}, "icon": {"data": "🌈", "type": "emoji"}, "max_lines": 1, "text": "rồi gay luôn", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:tuyet_doi_khong_nghe", "source": "remote", "caption": {"background": {"colors": ["#FF416C", "#FF4B2B"]}, "icon": {"data": "🙉", "type": "emoji"}, "max_lines": 1, "text": "Tuyệt đối không nghe", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:cha_nay_tu_luyen_ghe", "source": "remote", "caption": {"background": {"colors": ["#FFDEE9", "#B5FFFC", "#FAD0C4", "#FFD1FF"]}, "icon": {"data": "🪞", "type": "emoji"}, "max_lines": 1, "text": "Cha này tự luyến ghê", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:co_bien_co_bien", "source": "remote", "caption": {"background": {"colors": ["#FF512F", "#F09819", "#FFD200"]}, "icon": {"data": "🚨", "type": "emoji"}, "max_lines": 1, "text": "Có biến có biến", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:hong_drama", "source": "remote", "caption": {"background": {"colors": ["#8A2387", "#E94057", "#F27121"]}, "icon": {"data": "🍿", "type": "emoji"}, "max_lines": 1, "text": "Hóng drama", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:cuoi_vcl_m_oi", "source": "remote", "caption": {"background": {"colors": ["#F7971E", "#FFD200", "#FFEE58"]}, "icon": {"data": "😂", "type": "emoji"}, "max_lines": 1, "text": "Cười vcl m oi", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:vl_m_oi", "source": "remote", "caption": {"background": {"colors": ["#1F1C2C", "#928DAB", "#C9D6FF"]}, "icon": {"data": "😳", "type": "emoji"}, "max_lines": 1, "text": "vl m ơi?", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:noi_het_bi_mat_thi_co_yeu_hong", "source": "remote", "caption": {"background": {"colors": ["#EE9CA7", "#FFDDE1", "#C6FFDD", "#FBD786"]}, "icon": {"data": "🤫", "type": "emoji"}, "max_lines": 1, "text": "Nói hết bị mật thì có yêu hong", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:flex_den_hoi_tho_cuoi", "source": "remote", "caption": {"background": {"colors": ["#F7971E", "#FFD200"]}, "icon": {"data": "💎", "type": "emoji"}, "max_lines": 1, "text": "Flex đến hơi thở cuối", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:overthinking_vai_chuong", "source": "remote", "caption": {"background": {"colors": ["#2C3E50", "#4CA1AF"]}, "icon": {"data": "🤯", "type": "emoji"}, "max_lines": 1, "text": "Overthinking vai chưởng", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:chan_bo_may_di", "source": "remote", "caption": {"background": {"colors": ["#870000", "#190A05"]}, "icon": {"data": "🙄", "type": "emoji"}, "max_lines": 1, "text": "Chan bố mày đi", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:oach_xa_lach", "source": "remote", "caption": {"background": {"colors": ["#11998E", "#38EF7D"]}, "icon": {"data": "🥬", "type": "emoji"}, "max_lines": 1, "text": "oách xà lách", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:lai_phai_lo", "source": "remote", "caption": {"background": {"colors": ["#FBD3E9", "#BB377D", "#6A0572"]}, "icon": {"data": "💔", "type": "emoji"}, "max_lines": 1, "text": "lại phải lọ", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ua_alo_1", "source": "remote", "caption": {"background": {"colors": ["#8E2DE2", "#4A00E0"]}, "icon": {"data": "📞", "type": "emoji"}, "max_lines": 1, "text": "Ủa alo", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:ke_chuyen_nghe_choi", "source": "remote", "caption": {"background": {"colors": ["#8A2387", "#E94057"]}, "icon": {"data": "🍿", "type": "emoji"}, "max_lines": 1, "text": "Kể chuyện nghe chơi", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:hom_nay_toi_buon", "source": "remote", "caption": {"background": {"colors": ["#141E30", "#243B55"]}, "icon": {"data": "🥀", "type": "emoji"}, "max_lines": 1, "text": "hôm nay tôi buồn", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:xinh_dep_tuyet_voi", "source": "remote", "caption": {"background": {"colors": ["#FC5C7D", "#6A82FB"]}, "icon": {"data": "💅", "type": "emoji"}, "max_lines": 1, "text": "Xinh đẹp tuyệt vời", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:tram_cam_nhe", "source": "remote", "caption": {"background": {"colors": ["#1F1C2C", "#928DAB"]}, "icon": {"data": "🫠", "type": "emoji"}, "max_lines": 1, "text": "Trầm cảm nhẹ", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:chua_du_wow", "source": "remote", "caption": {"background": {"colors": ["#FF5349", "#EB0C00"]}, "icon": {"data": "⭐", "type": "emoji"}, "max_lines": 1, "text": "Chưa đủ wow", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:boc_trung_sit_rit", "source": "remote", "caption": {"background": {"colors": ["#9C27B0", "#7B1FA2"]}, "icon": {"data": "🎁", "type": "emoji"}, "max_lines": 1, "text": "Bóc trúng sít rịt", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:hen_lam_moi_xui_duoc_vay_a", "source": "remote", "caption": {"background": {"colors": ["#00BCD4", "#0097A7"]}, "icon": {"data": "😅", "type": "emoji"}, "max_lines": 1, "text": "Hên lắm mới xui được vậy á", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ra_duong_ne_moi_anh", "source": "remote", "caption": {"background": {"colors": ["#2196F3", "#1976D2"]}, "icon": {"data": "👤", "type": "emoji"}, "max_lines": 1, "text": "Ra đường nể mỗi anh", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:cung_cung_di", "source": "remote", "caption": {"background": {"colors": ["#FFC107", "#FFA000"]}, "icon": {"data": "🚀", "type": "emoji"}, "max_lines": 1, "text": "Cũng cứng đi", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:tuyet_doi_dien_anh", "source": "remote", "caption": {"background": {"colors": ["#455A64", "#263238"]}, "icon": {"data": "📷", "type": "emoji"}, "max_lines": 1, "text": "Tuyệt đối điện ảnh", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:du_ba_khi_chua", "source": "remote", "caption": {"background": {"colors": ["#FF5722", "#E64A19"]}, "icon": {"data": "⚡", "type": "emoji"}, "max_lines": 1, "text": "Đủ bá khí chưa", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ua_alo_2", "source": "remote", "caption": {"background": {"colors": ["#9C27B0", "#7B1FA2"]}, "icon": {"data": "❓", "type": "emoji"}, "max_lines": 1, "text": "Ủa alo?", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:cai_gi_vay_troi", "source": "remote", "caption": {"background": {"colors": ["#F44336", "#D32F2F"]}, "icon": {"data": "❗", "type": "emoji"}, "max_lines": 1, "text": "Cái gì vậy trời", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:nay_la_het_cuu", "source": "remote", "caption": {"background": {"colors": ["#607D8B", "#455A64"]}, "icon": {"data": "❌", "type": "emoji"}, "max_lines": 1, "text": "Này là hết cứu", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:qua_la_dien_anh", "source": "remote", "caption": {"background": {"colors": ["#26A69A", "#00897B"]}, "icon": {"data": "📷", "type": "emoji"}, "max_lines": 1, "text": "Quá là điện ảnh", "text_color": "#FFFFFFE6", "type": "static_content"}}]}, {"section": "🎨 Gen Z Life 🩻", "items": [{"overlay_id": "caption:hao_han", "source": "remote", "caption": {"background": {"colors": ["#114357", "#F29492"]}, "icon": {"data": "🗡️", "type": "emoji"}, "max_lines": 1, "text": "Hảo hán", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:cam_lanh", "source": "remote", "caption": {"background": {"colors": ["#2193B0", "#6DD5ED"]}, "icon": {"data": "🤧", "type": "emoji"}, "max_lines": 1, "text": "Cảm lạnh", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:bat_luc", "source": "remote", "caption": {"background": {"colors": ["#2C3E50", "#3498DB"]}, "icon": {"data": "🏳️", "type": "emoji"}, "max_lines": 1, "text": "Bất lực", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:xin_lui_duoc_chua", "source": "remote", "caption": {"background": {"colors": ["#F6D365", "#FDA085"]}, "icon": {"data": "🥺", "type": "emoji"}, "max_lines": 1, "text": "Xin lũi được chưa", "text_color": "#000000", "type": "static_content"}}, {"overlay_id": "caption:rot_nuoc_mat", "source": "remote", "caption": {"background": {"colors": ["#1CB5E0", "#000046"]}, "icon": {"data": "😭", "type": "emoji"}, "max_lines": 1, "text": "Rớt nước mắt", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:guc_nga", "source": "remote", "caption": {"background": {"colors": ["#3A1C71", "#D76D77"]}, "icon": {"data": "📉", "type": "emoji"}, "max_lines": 1, "text": "Gục ngã", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:tien_dinh", "source": "remote", "caption": {"background": {"colors": ["#C33764", "#1D2671"]}, "icon": {"data": "🌪️", "type": "emoji"}, "max_lines": 1, "text": "Tiền đình", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:che_manh", "source": "remote", "caption": {"background": {"colors": ["#FF4E50", "#F9D423"]}, "icon": {"data": "👎", "type": "emoji"}, "max_lines": 1, "text": "Chê mạnh", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:xinh_gai_an_phim_1", "source": "remote", "caption": {"background": {"colors": ["#F77062", "#FE5196"]}, "icon": {"data": "💅", "type": "emoji"}, "max_lines": 1, "text": "Xinh gái ấn phím 1", "text_color": "#FFFFFF", "type": "static_content"}}, {"overlay_id": "caption:di_lam_vi_dam_me", "source": "remote", "caption": {"background": {"colors": ["#FDC830", "#F37335"]}, "icon": {"data": "🤡", "type": "emoji"}, "max_lines": 1, "text": "Đi làm vì đam mê", "text_color": "#FFFFFF", "type": "static_content"}}]}, {"section": "🎨 Meme vui nhộn", "items": [{"overlay_id": "caption:cuoi_xiu", "source": "remote", "caption": {"background": {"colors": ["#FFEB3B", "#FF9800"]}, "icon": {"data": "😎", "type": "emoji"}, "max_lines": 1, "text": "Cười xỉu", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:toang_that_roi", "source": "remote", "caption": {"background": {"colors": ["#F44336", "#B71C1C"]}, "icon": {"data": "🐉", "type": "emoji"}, "max_lines": 1, "text": "Toang thật rồi", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:toi_roi_toi_roi", "source": "remote", "caption": {"background": {"colors": ["#673AB7", "#512DA8"]}, "icon": {"data": "❗", "type": "emoji"}, "max_lines": 1, "text": "Tới rồi tới rồi", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:khong_the_tin_noi", "source": "remote", "caption": {"background": {"colors": ["#00BCD4", "#0097A7"]}, "icon": {"data": "❓", "type": "emoji"}, "max_lines": 1, "text": "Không thể tin nổi", "text_color": "#FFFFFFE6", "type": "static_content"}}]}, {"section": "🎨 Đời sống", "items": [{"overlay_id": "caption:ngay_moi_vui_ve", "source": "remote", "caption": {"background": {"colors": ["#4CAF50", "#2E7D32"]}, "icon": {"data": "☀️", "type": "emoji"}, "max_lines": 1, "text": "Ngày mới vui vẻ", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ngu_ngon", "source": "remote", "caption": {"background": {"colors": ["#3F51B5", "#1A237E"]}, "icon": {"data": "🌙", "type": "emoji"}, "max_lines": 1, "text": "Ngủ ngon", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:an_com_chua", "source": "remote", "caption": {"background": {"colors": ["#FF9800", "#F57C00"]}, "icon": {"data": "🍽️", "type": "emoji"}, "max_lines": 1, "text": "Ăn cơm chưa?", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:di_choi_khong", "source": "remote", "caption": {"background": {"colors": ["#E91E63", "#C2185B"]}, "icon": {"data": "✈️", "type": "emoji"}, "max_lines": 1, "text": "Đi chơi không?", "text_color": "#FFFFFFE6", "type": "static_content"}}]}, {"section": "🎨 Gen Z Slay", "items": [{"overlay_id": "caption:tinh_hoa_hoi_tu", "source": "remote", "caption": {"background": {"colors": ["#FFD700", "#FF8C00"]}, "icon": {"data": "✨", "type": "emoji"}, "max_lines": 1, "text": "Tinh hoa hội tụ", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:phu_tinh_khong_phu_ban", "source": "remote", "caption": {"background": {"colors": ["#8E2DE2", "#4A00E0"]}, "icon": {"data": "🕶️", "type": "emoji"}, "max_lines": 1, "text": "Phụ tình không phụ bản", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ngoan_xinh_yeu", "source": "remote", "caption": {"background": {"colors": ["#FFAFBD", "#FFC3A0"]}, "icon": {"data": "🌸", "type": "emoji"}, "max_lines": 1, "text": "Ngoan xinh yêu của ai?", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:nhin_la_biet_uy_tin", "source": "remote", "caption": {"background": {"colors": ["#2980B9", "#2C3E50"]}, "icon": {"data": "👌", "type": "emoji"}, "max_lines": 1, "text": "Nhìn là biết uy tín", "text_color": "#FFFFFFE6", "type": "static_content"}}]}, {"section": "🎨 Bất ổn & Khó đỡ", "items": [{"overlay_id": "caption:luon_vui_tuoi", "source": "remote", "caption": {"background": {"colors": ["#00F2FE", "#4FACFE"]}, "icon": {"data": "🤡", "type": "emoji"}, "max_lines": 1, "text": "Luôn vui tươi", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:bat_on_that_su", "source": "remote", "caption": {"background": {"colors": ["#636363", "#A2AB58"]}, "icon": {"data": "🫠", "type": "emoji"}, "max_lines": 1, "text": "Bất ổn thật sự", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:khong_cam_xuc", "source": "remote", "caption": {"background": {"colors": ["#434343", "#000000"]}, "icon": {"data": "🗿", "type": "emoji"}, "max_lines": 1, "text": "Không cảm xúc", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:phu_huynh_dung_xem", "source": "remote", "caption": {"background": {"colors": ["#FF0844", "#FFB199"]}, "icon": {"data": "🙈", "type": "emoji"}, "max_lines": 1, "text": "Phụ huynh đừng xem", "text_color": "#FFFFFFE6", "type": "static_content"}}]}, {"section": "🎨 Check VAR & Hóng hớt", "items": [{"overlay_id": "caption:check_var", "source": "remote", "caption": {"background": {"colors": ["#11998E", "#38EF7D"]}, "icon": {"data": "📺", "type": "emoji"}, "max_lines": 1, "text": "Check VAR liền", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:qua_nhieu_su_de_thuong", "source": "remote", "caption": {"background": {"colors": ["#F38181", "#FCE38A"]}, "icon": {"data": "🎀", "type": "emoji"}, "max_lines": 1, "text": "Quá nhiều sự dễ thương", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:mac_bay_tinh_yeu", "source": "remote", "caption": {"background": {"colors": ["#EE9CA7", "#FFDDE1"]}, "icon": {"data": "💘", "type": "emoji"}, "max_lines": 1, "text": "Mắc bẫy tình yêu", "text_color": "#000000E6", "type": "static_content"}}, {"overlay_id": "caption:song_gio_phu_doi_trai", "source": "remote", "caption": {"background": {"colors": ["#3A1C71", "#D76D77"]}, "icon": {"data": "🌪️", "type": "emoji"}, "max_lines": 1, "text": "Sóng gió phủ đời trai", "text_color": "#FFFFFFE6", "type": "static_content"}}]}, {"section": "🎨 Góc Deadline & Đi Làm", "items": [{"overlay_id": "caption:deadline_ruot", "source": "remote", "caption": {"background": {"colors": ["#ED213A", "#93291E"]}, "icon": {"data": "🔥", "type": "emoji"}, "max_lines": 1, "text": "Deadline dí tụt quần", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:ca_o_ran_doc", "source": "remote", "caption": {"background": {"colors": ["#0F2027", "#1B5E20", "#66BB6A"]}, "icon": {"data": "🐍", "type": "emoji"}, "max_lines": 1, "text": "Cả ổ rắn độc", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:tien_dau_ma_tieu", "source": "remote", "caption": {"background": {"colors": ["#11998E", "#38EF7D"]}, "icon": {"data": "💸", "type": "emoji"}, "max_lines": 1, "text": "Tiền đâu mà tiêu", "text_color": "#FFFFFFE6", "type": "static_content"}}, {"overlay_id": "caption:nghien_cuu_khoa_hoc", "source": "remote", "caption": {"background": {"colors": ["#0F2027", "#2C5364"]}, "icon": {"data": "☕", "type": "emoji"}, "max_lines": 1, "text": "Cần nạp cafein gấp", "text_color": "#FFFFFFE6", "type": "static_content"}}]}])
  });

  $done({
    body: JSON.stringify(obj)
  });
})();
