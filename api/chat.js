const fetch = require("node-fetch");
const FormData = require("form-data");

module.exports = async (req, res) => {
  try {
    // query param سے message لینا
    const message = req.query.message || "hello";

    // form-data build کرنا
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

    // request بھیجنا
    const response = await fetch("https://chatgptfree.ai/wp-admin/admin-ajax.php", {
      method: "POST",
      body: form,
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Node.js Vercel Bot)", // spoof کرنا ضروری ہے
      },
    });

    const data = await response.text(); // کچھ جگہ json نہیں بلکہ text آتا ہے
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
