// api/chat.js
const fetch = require("node-fetch"); // CommonJS import

module.exports = async (req, res) => {
  try {
    const { message = "hi" } = req.query;

    const url = "https://chatgptfree.ai/wp-admin/admin-ajax.php";

    // Cookie اور User-Agent اپنے browser سے DevTools → Network → admin-ajax.php سے copy کرو
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      "Cookie": "cf_clearance=abcd1234efgh5678; wordpress_logged_in=xyz123...",
    };

    const params = new URLSearchParams();
    params.append("_wpnonce", "7dcd9d3816");
    params.append("post_id", "261");
    params.append("url", "https://chatgptfree.ai/chat");
    params.append("action", "wpaicg_chat_shortcode_message");
    params.append("message", message);
    params.append("bot_id", "10420");
    params.append("chatbot_identity", "custom_bot_10420");
    params.append("wpaicg_chat_history", "[]");
    params.append("wpaicg_chat_client_id", "vvHZZ88WOV");

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: params,
    });

    const data = await response.text(); // اصل response
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};
