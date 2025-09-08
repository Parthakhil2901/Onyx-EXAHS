// Robust Express server for Gemini API proxy

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gemini API proxy endpoint
app.post("/api/gemini-chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: userMessage }] }],
    };

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return res
        .status(502)
        .json({ error: "Gemini API error", details: errorText });
    }

    const data = await geminiRes.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand your response. Please try again.";

    res.json({ reply });
  } catch (err) {
    console.error("Gemini proxy error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve static files if needed (optional)
// app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
