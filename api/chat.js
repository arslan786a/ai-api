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

async function fetchAIReply(aiName, message) {
  const { id, identity } = BOT_MAP[aiName];
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

  try {
    const response = await fetch(
      "https://chatgptfree.ai/wp-admin/admin-ajax.php",
      {
        method: "POST",
        body: form,
        headers: {
          ...form.getHeaders(),
          "User-Agent": "Mozilla/5.0 (Node.js Vercel Bot)",
        },
      }
    );

    const rawText = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return { success: false, msg: "Invalid top-level response" };
    }

    // Some responses wrap data in a string → parse again
    let dataObj;
    try {
      dataObj = typeof parsed.data === "string" ? JSON.parse(parsed.data) : parsed.data;
    } catch {
      return { success: false, msg: "Invalid nested response format" };
    }

    if (dataObj && dataObj.data) {
      return { success: true, msg: dataObj.data };
    } else if (dataObj && dataObj.msg) {
      return { success: false, msg: dataObj.msg };
    } else {
      return { success: false, msg: "No reply received" };
    }
  } catch (err) {
    return { success: false, msg: err.message };
  }
}

module.exports = async (req, res) => {
  try {
    const aiQuery = req.query.ai ? req.query.ai.toLowerCase() : null;
    const message = req.query.message || "hello";

    if (aiQuery) {
      // Single AI selected
      if (!BOT_MAP[aiQuery]) {
        return res.status(400).json({ success: false, msg: "Invalid AI name" });
      }
      const reply = await fetchAIReply(aiQuery, message);
      return res.status(200).json({ ai: aiQuery, ...reply });
    } else {
      // No AI selected → fetch all
      const promises = Object.keys(BOT_MAP).map((aiName) =>
        fetchAIReply(aiName, message).then((reply) => ({ ai: aiName, ...reply }))
      );
      const results = await Promise.all(promises);
      return res.status(200).json({ success: true, results });
    }
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
