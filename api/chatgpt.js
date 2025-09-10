const fetch = require("node-fetch");
const FormData = require("form-data");

module.exports = async (req, res) => {
  try {
    const message = req.query.message || "hello";

    const form = new FormData();
    form.append("_wpnonce", "7dcd9d3816");
    form.append("post_id", "261");
    form.append("url", "https://chatgptfree.ai/chat");
    form.append("action", "wpaicg_chat_shortcode_message");
    form.append("message", message);
    form.append("bot_id", "10420");
    form.append("chatbot_identity", "custom_bot_10420");
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

    // اصل JSON parse کرنا
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // اگر double JSON ہو جیسے پچھلے response میں تھا
      try {
        const tmp = JSON.parse(rawText);
        parsed = JSON.parse(tmp.data);
      } catch (e2) {
        return res.status(500).json({
          success: false,
          msg: "Invalid response format",
        });
      }
    }

    // clean response واپس کرنا
    if (parsed.status === "success" && parsed.data) {
      res.status(200).json({
        success: true,
        msg: parsed.data, // صرف AI کا reply
      });
    } else {
      res.status(200).json({
        success: false,
        msg: parsed.msg || "No reply received",
      });
    }

  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};