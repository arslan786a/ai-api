const fetch = require("node-fetch");
const FormData = require("form-data");

// AI bots mapping
const AI_BOTS = {
  chatgpt: { bot_id: "10420", identity: "custom_bot_10420" },
  gemini: { bot_id: "4007", identity: "custom_bot_4007" },
  deepseek: { bot_id: "4008", identity: "custom_bot_4008" },
  claude: { bot_id: "2019", identity: "custom_bot_2019" },
  grok: { bot_id: "4096", identity: "custom_bot_4096" },
  meta: { bot_id: "10445", identity: "custom_bot_10445" },
  qwen: { bot_id: "10537", identity: "custom_bot_10537" }
};

async function fetchAIResponse(message, bot_id, identity) {
  try {
    const form = new FormData();
    form.append("_wpnonce", "7dcd9d3816");
    form.append("post_id", "261");
    form.append("url", "https://chatgptfree.ai/chat");
    form.append("action", "wpaicg_chat_shortcode_message");
    form.append("message", message);
    form.append("bot_id", bot_id);
    form.append("chatbot_identity", identity);
    form.append("wpaicg_chat_history", "[]");
    form.append("wpaicg_chat_client_id", "vvHZZ88WOV");

    const response = await fetch("https://chatgptfree.ai/wp-admin/admin-ajax.php", {
      method: "POST",
      body: form,
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Node.js Vercel Bot)"
      },
    });

    const rawText = await response.text();

    // Safe parsing, handle emojis or special chars
    let parsed;
    try {
      parsed = JSON.parse(rawText);
      if (parsed.data) {
        try {
          parsed = JSON.parse(parsed.data);
        } catch (e) {
          // ignore, keep original parsed
        }
      }
    } catch (err) {
      return { success: false, msg: rawText || "Invalid response format" };
    }

    // response ہمیشہ return ہو، emojis safe
    if (parsed.status === "success" && parsed.data) {
      return { success: true, msg: parsed.data };
    } else if (parsed.msg) {
      return { success: false, msg: parsed.msg };
    } else {
      return { success: false, msg: rawText };
    }

  } catch (err) {
    return { success: false, msg: err.message };
  }
}

module.exports = async (req, res) => {
  try {
    const message = req.query.message || "hello";
    const aiName = req.query.ai ? req.query.ai.toLowerCase() : null;

    const botsToCall = aiName ? [aiName] : Object.keys(AI_BOTS);
    const results = [];

    for (const bot of botsToCall) {
      if (!AI_BOTS[bot]) {
        results.push({ ai: bot, success: false, msg: "Unknown AI" });
        continue;
      }

      const { bot_id, identity } = AI_BOTS[bot];
      const reply = await fetchAIResponse(message, bot_id, identity);
      results.push({ ai: bot, ...reply });
    }

    // اگر صرف ایک AI specify کیا گیا ہو تو single object واپس کریں
    if (aiName && results.length === 1) {
      return res.status(200).json(results[0]);
    }

    res.status(200).json({ success: true, results });

  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
