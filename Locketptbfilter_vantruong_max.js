// ========= Locket Photobooth 4-Shot Engine & AI Filter Router ========= //
// Phiên bản Sinh Nhật Văn Trường (09/11) - Kết nối trực tiếp Cloudflare Worker
// Worker: https://weathered-wave-12cc.noobnopro2007.workers.dev
// GitHub: https://github.com/truongphp/Vantruong
// Đã vá lỗi:
// 1. Sửa lỗi dán nhầm Prompt vào STICKER_ID_MAP ở dòng 21 ("stk_vantruong_birthday_0911").
// 2. Chuẩn hóa đầy đủ JSON body (gắn AI_PROMPTS + giữ nguyên original_filter_id cho Photobooth 4 ô)
//    và truyền kèm `body` khi gọi $done({ url, headers, body }) sang Cloudflare Worker.
// ====================================================================== //

(function () {
    const WORKER_HOST = "https://weathered-wave-12cc.noobnopro2007.workers.dev";

    const STICKER_ID_MAP = {
        "stk_vantruong_birthday_0911": "happy_birthday",
        "stk_rose_flower": "rose_flower",
        "rose_flower": "rose_flower",
        "stk_shrek_ogre": "shrek_ogre",
        "shrek_ogre": "shrek_ogre",
        "stk_superhero_cape": "superhero_cape",
        "superhero_cape": "superhero_cape",
        "stk_spooky_ghost": "spooky_ghost",
        "spooky_ghost": "spooky_ghost",
        "stk_pirate_hat": "pirate_hat",
        "pirate_hat": "pirate_hat",
        "stk_volcano_lava": "volcano_lava",
        "volcano_lava": "volcano_lava",
        "stk_rain_storm": "rain_storm",
        "rain_storm": "rain_storm",
        "stk_fortnite_llama": "fortnite_llama",
        "fortnite_llama": "fortnite_llama",
        "stk_watercolor_art": "watercolor_art",
        "watercolor_art": "watercolor_art",
        "stk_golden_hour": "golden_hour",
        "golden_hour": "golden_hour",
        "stk_jungle_leaf": "jungle_leaf",
        "jungle_leaf": "jungle_leaf",
        "stk_cute_zombie": "cute_zombie",
        "cute_zombie": "cute_zombie",
        "stk_fireworks": "fireworks",
        "fireworks": "fireworks",
        "stk_new_year_2026": "new_year_2026",
        "new_year_2026": "new_year_2026",
        "stk_harry_potter": "harry_potter",
        "harry_potter": "harry_potter",
        "stk_minecraft": "minecraft",
        "minecraft": "minecraft",
        "stk_fire_flame": "fire_flame",
        "fire_flame": "fire_flame",
        "stk_giant_spider": "giant_spider",
        "giant_spider": "giant_spider",
        "stk_ocean_underwater": "ocean_underwater",
        "ocean_underwater": "ocean_underwater",
        "stk_ufo_alien": "ufo_alien",
        "ufo_alien": "ufo_alien",
        "stk_dio_disco": "disco_lights",
        "disco": "disco_lights",
        "stk_dio_pm2": "locket",
        "stk_dio_cash": "cash_money",
        "cash": "cash_money",
        "stk_dio_wedding": "wedding",
        "wedding": "wedding",
        "stk_dio_cowboy": "cowboy_cowgirl",
        "cowboy": "cowboy_cowgirl",
        "stk_dio_looksmaxing": "looks_maxxing",
        "looksmaxing": "looks_maxxing",
        "stk_dio_orange_wig": "okay_wig",
        "orange_wig": "okay_wig",
        "stk_dio_bleached_hair": "blonde_bleached",
        "bleached_hair": "blonde_bleached",
        "stk_dio_bob": "bob_cut",
        "bob": "bob_cut",
        "stk_dio_bearded": "beard",
        "bearded": "beard",
        "stk_dio_bearded_holiday": "bearded",
        "stk_dio_sweat_hearts": "sweet_hearts",
        "sweat_hearts": "sweet_hearts",
        "stk_dio_elf": "elf_cutout",
        "elf": "elf_cutout",
        "stk_dio_santa": "santa_cutout",
        "santa": "santa_cutout",
        "stk_dio_easter_bunny": "easter_bunney_cutout",
        "easter_bunny": "easter_bunney_cutout",
        "stk_dio_easter_chick": "easter_chick_cutout",
        "easter_chick": "easter_chick_cutout",
        "stk_dio_toothless": "toothless",
        "toothless": "toothless",
        "stk_dio_bye_brows": "bye_brows",
        "bye_brows": "bye_brows",
        "stk_dio_bowling_ball": "bowling_ball",
        "bowling_ball": "bowling_ball",
        "stk_dio_buns": "buns",
        "buns": "buns",
        "stk_dio_tatted": "tatted",
        "tatted": "tatted",
        "stk_dio_mohawk": "mohawk",
        "mohawk": "mohawk",
        "stk_dio_braces": "braces",
        "braces": "braces",
        "stk_dio_slimed": "slimed",
        "slimed": "slimed",
        "stk_dio_princess": "princess",
        "princess": "princess",
        "stk_dio_happy_birthday": "happy_birthday",
        "happy_birthday": "happy_birthday",
        "stk_dio_cutesy": "cutesy",
        "cutesy": "cutesy",
        "stk_dio_sticker_face": "sticker_face",
        "sticker_face": "sticker_face",
        "stk_dio_flower_crown": "flower_crown",
        "flower_crown": "flower_crown",
        "stk_dio_love_bug": "love_bug",
        "love_bug": "love_bug",
        "stk_dio_giraffe": "giraffe",
        "giraffe": "giraffe",
        "stk_dio_clown": "clown",
        "clown": "clown",
        "stk_dio_leprechaun": "leprechaun",
        "leprechaun": "leprechaun",
        "stk_dio_lucky_face": "lucky_face",
        "lucky_face": "lucky_face",
        "stk_dio_frosty": "frosty",
        "frosty": "frosty",
        "stk_dio_influencer": "influencer",
        "influencer": "influencer"
    };

    const AI_PROMPTS = {
        "stk_vantruong_birthday_0911": "Show the person in the photo with the exact same pose and background, but celebrate their birthday with a glowing royal gold crown, floating golden confetti, and festive birthday party lights, captured with a modern iPhone camera look.",
        "rose_flower": "Show the person in the photo with the exact same pose and background, but have them with a single rose in their mouth. If no person is present in the input, do not add anything to the output.",
        "stk_rose_flower": "Show the person in the photo with the exact same pose and background, but have them with a single rose in their mouth. If no person is present in the input, do not add anything to the output.",
        "shrek_ogre": "Show the person in the photo with the exact same pose and background, but transform them into Shrek with rounded ears, and rustic clothing while preserving the pose. Keep their hairstyle, but make it look natural in the Shrek style.",
        "stk_shrek_ogre": "Show the person in the photo with the exact same pose and background, but transform them into Shrek with rounded ears, and rustic clothing while preserving the pose. Keep their hairstyle, but make it look natural in the Shrek style.",
        "superhero_cape": "Show the person in the photo with the exact same pose and background, but suit them up like a superhero in a blue and red outfit with a flowing cape while keeping their pose and framing identical.",
        "stk_superhero_cape": "Show the person in the photo with the exact same pose and background, but suit them up like a superhero in a blue and red outfit with a flowing cape while keeping their pose and framing identical.",
        "spooky_ghost": "Show the person in the photo with the exact same pose, expression, and background, but subtly insert a realistic-looking ghost somewhere in the background. If no person is present, do not add any people to the output.",
        "stk_spooky_ghost": "Show the person in the photo with the exact same pose, expression, and background, but subtly insert a realistic-looking ghost somewhere in the background. If no person is present, do not add any people to the output.",
        "pirate_hat": "Show the person in the photo with the exact same pose and background, but dress them like a pirate from Pirates of the Caribbean while keeping their pose and facial expression identical.",
        "stk_pirate_hat": "Show the person in the photo with the exact same pose and background, but dress them like a pirate from Pirates of the Caribbean while keeping their pose and facial expression identical.",
        "volcano_lava": "Show the person in the photo with the exact same pose, background, and facial expression, but replace the ground with molten lava, glowing magma cracks, and volcanic sparks while keeping them rooted to the spot. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "stk_volcano_lava": "Show the person in the photo with the exact same pose, background, and facial expression, but replace the ground with molten lava, glowing magma cracks, and volcanic sparks while keeping them rooted to the spot. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "fortnite_llama": "Show the person in the photo with the exact same pose, expression, and background, but make the entire scene look like it was rendered inside a video game, similar to the style of Fortnite. Show no extra overlays or text on top of the photo. If no person is present, do not add any people to the output.",
        "stk_fortnite_llama": "Show the person in the photo with the exact same pose, expression, and background, but make the entire scene look like it was rendered inside a video game, similar to the style of Fortnite. Show no extra overlays or text on top of the photo. If no person is present, do not add any people to the output.",
        "watercolor_art": "Show the person in the photo with the exact same pose, expression, and background, but render the entire scene as a watercolor painting with flowing brush strokes. If no person is present, do not add any people to the output.",
        "stk_watercolor_art": "Show the person in the photo with the exact same pose, expression, and background, but render the entire scene as a watercolor painting with flowing brush strokes. If no person is present, do not add any people to the output.",
        "golden_hour": "Show the person in the photo with the exact same pose, expression, and background, but make the scene look like it was captured during peak golden hour with warm sunlight and long shadows. If no person is present, do not add any people to the output.",
        "stk_golden_hour": "Show the person in the photo with the exact same pose, expression, and background, but make the scene look like it was captured during peak golden hour with warm sunlight and long shadows. If no person is present, do not add any people to the output.",
        "jungle_leaf": "Show the person in the photo with the exact same pose, background, and facial expression, but with their background surroundings overgrown with plants in a seamless way. The person and their background should remain in the same positions. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "stk_jungle_leaf": "Show the person in the photo with the exact same pose, background, and facial expression, but with their background surroundings overgrown with plants in a seamless way. The person and their background should remain in the same positions. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "cute_zombie": "Show the person in the photo with the exact same pose and background, but turn them into a zombie while keeping their pose and expression identical.",
        "stk_cute_zombie": "Show the person in the photo with the exact same pose and background, but turn them into a zombie while keeping their pose and expression identical.",
        "fireworks": "Show the person in the photo with the exact same pose and background, but fill the scene with fireworks exploding in the night sky and reflecting colorful light onto the subject. Ensure the person is in the exact same pose and positioning within the frame. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "stk_fireworks": "Show the person in the photo with the exact same pose and background, but fill the scene with fireworks exploding in the night sky and reflecting colorful light onto the subject. Ensure the person is in the exact same pose and positioning within the frame. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "new_year_2026": "Show the person in the photo with the exact same pose and background, but have them wearing decorative glasses that say Happy New Year 2026. Ensure the person is in the exact same pose and positioning within the frame. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "stk_new_year_2026": "Show the person in the photo with the exact same pose and background, but have them wearing decorative glasses that say Happy New Year 2026. Ensure the person is in the exact same pose and positioning within the frame. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "harry_potter": "Show the person in the photo with the exact same pose and background, but show them as a character from Harry Potter wearing a robe of one of the four houses. Keep the pose and framing identical and do not change the background.",
        "stk_harry_potter": "Show the person in the photo with the exact same pose and background, but show them as a character from Harry Potter wearing a robe of one of the four houses. Keep the pose and framing identical and do not change the background.",
        "minecraft": "Show the person in the photo with the exact same pose, expression, and background, but make everything in the scene look like it was created from Minecraft-style blocks and show people as Minecraft characters. If no person is present, do not add any people to the output.",
        "stk_minecraft": "Show the person in the photo with the exact same pose, expression, and background, but make everything in the scene look like it was created from Minecraft-style blocks and show people as Minecraft characters. If no person is present, do not add any people to the output.",
        "giant_spider": "Show the person in the photo with the exact same pose, expression, and background, but place a realistic spider perched on them somewhere, such as their shoulder or head. If no person is present, do not add any people to the output.",
        "stk_giant_spider": "Show the person in the photo with the exact same pose, expression, and background, but place a realistic spider perched on them somewhere, such as their shoulder or head. If no person is present, do not add any people to the output.",
        "ocean_underwater": "Show the person in the photo with the exact same pose, background, and facial expression, but as if them and their surrounding environment was underwater. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "stk_ocean_underwater": "Show the person in the photo with the exact same pose, background, and facial expression, but as if them and their surrounding environment was underwater. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "ufo_alien": "Show the person in the photo with the exact same pose and background, but show a subtle UFO hovering in the sky or an alien somewhere hidden in the user's background. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "stk_ufo_alien": "Show the person in the photo with the exact same pose and background, but show a subtle UFO hovering in the sky or an alien somewhere hidden in the user's background. If no face is present, do not show any people in the output, only ever show people who were in the original input image.",
        "princess": "Show the person in the photo with the exact same pose and background, but portray them as a prince charming or a beautiful princess from a fairytale.",
        "elf_cutout": "Show the person in the photo with the exact same pose and background, but dressed up as an Elf. Ensure the person is in the exact same pose and positioning within the frame.",
        "santa_cutout": "Show the person in the photo with the exact same pose and background, but dressed up as Santa Claus. Ensure the person is in the exact same pose and positioning within the frame."
    };

    // 1. CHIỀU REQUEST: Chuẩn hóa Body & Điều hướng sang Cloudflare Worker của Văn Trường
    if (typeof $response === "undefined") {
        try {
            if (!$request) return $done({});

            const reqUrl = $request.url || "";
            const endpoint = reqUrl.includes("createOverlay") ? "/createOverlay" : "/generateFilteredImage";
            const targetUrl = `${WORKER_HOST}${endpoint}?module=VanTruong_VIP`;
            const workerHostOnly = WORKER_HOST.replace(/^https?:\/\//, "");

            let headers = Object.assign({}, $request.headers || {});
            headers["Host"] = workerHostOnly;
            headers["host"] = workerHostOnly;
            headers["X-Module-Origin"] = "VanTruong_VIP";

            let updatedBody = $request.body;
            if (updatedBody && typeof updatedBody === "string") {
                try {
                    let bodyObj = JSON.parse(updatedBody);
                    let dataNode = (bodyObj && bodyObj.data && typeof bodyObj.data === "object") ? bodyObj.data : bodyObj;
                    let rawFilterId = String(
                        dataNode.filter_id || dataNode.filterId || dataNode.uid || dataNode.id || ""
                    ).trim();

                    // Nếu người dùng chọn Filter qua Bio (lưu trong $persistentStore) mà trên UI để mặc định
                    if (!rawFilterId && typeof $persistentStore !== "undefined") {
                        const savedBioFilter = $persistentStore.read("LOCKET_SELECTED_FILTER");
                        if (savedBioFilter) rawFilterId = savedBioFilter.trim();
                    }

                    if (rawFilterId) {
                        // Giữ lại ID gốc để Worker nhận diện chính xác Photobooth 4 ô và Khung tĩnh
                        dataNode.original_filter_id = rawFilterId;
                        const mappedId = STICKER_ID_MAP[rawFilterId] || rawFilterId;
                        const fullPrompt = AI_PROMPTS[rawFilterId] || AI_PROMPTS[mappedId];
                        if (fullPrompt && (!dataNode.prompt || dataNode.prompt.length < 30)) {
                            dataNode.prompt = fullPrompt;
                        }
                        dataNode.filter_type = "normal";
                        updatedBody = JSON.stringify(bodyObj);
                    }
                } catch (e) {}
            }

            const donePayload = {
                url: targetUrl,
                headers: headers
            };
            if (updatedBody) {
                donePayload.body = updatedBody;
            }
            return $done(donePayload);
        } catch (e) {
            return $done({});
        }
    }

    // 2. CHIỀU RESPONSE: Bảo toàn dữ liệu ảnh AI / Photobooth trả về từ Worker
    try {
        if (typeof $response !== "undefined" && $response.body) {
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
