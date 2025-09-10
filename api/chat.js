const fetch = require("node-fetch");
const FormData = require("form-data");

const BOT_MAP = {
  chatgpt: { id: "10420", identity: "custom_bot_10420" },
  gemini: { id: "4007", identity: "custom_bot_4007" },
  deepseek: { id: "4008", identity: "custom_bot_4008" },
  claude: { id: "2019", identity: "custom_bot_2019" },
  grok: { id: "4096", identity: "custom_bot_4096" },
  meta: { id: "10445", identity: "custom_bot_10445" },
  qwen: { id: "10537", identity: "custom_bot_10537" },
};

module.exports = async (req, res) => {
  try {
    const ai = (req.query.ai || "chatgpt").toLowerCase();
    const message = req.query.message || "hello";

    // validate AI
    if (!BOT_MAP[ai]) {
      return res.status(400).json({ success: false, msg: "Invalid AI name" });
    }

    const { id, identity } = BOT_MAP[ai];

    const form = new FormData();
    form.append("_wpnonce", "7dcd9d3816");
    form.append("post_id", "261");
    form.append("url", "https://chatgptfree.ai/chat");
    form.append("action", "wpaicg_chat_shortcode_message");
    form.append("message", message);
    form.append("bot_id", id);
    form.append("chatbot_identity", identity);
    form.append("wpaicg_chat_history", "[]");
    form.append("wpaicg_chat_client_id", "vvHZZ88WOV");

    const response = await fetch("https://chatgptfree.ai/wp-admin/admin-ajax.php", {
      method: "POST",
      body: form,
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Node.js Vercel Bot)",
      },
    });

    const rawText = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
      if (typeof parsed.data === "string") {
        parsed = JSON.parse(parsed.data);
      }
    } catch (e) {
      return res.status(500).json({ success: false, msg: "Invalid response format" });
    }

    if (parsed.status === "success" && parsed.data) {
      res.status(200).json({
        success: true,
        ai,
        msg: parsed.data,
      });
    } else {
      res.status(200).json({
        success: false,
        ai,
        msg: parsed.msg || "No reply received",
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};