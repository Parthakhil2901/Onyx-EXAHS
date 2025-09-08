import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔑 Replace with your API Key (better: load from .env in backend)
const API_KEY = "GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const chatInput =
    document.getElementById("chat-input") ||
    document.getElementById("user-input");
  const chatSend =
    document.getElementById("chat-send") || document.getElementById("send-btn");

  function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-message" : "bot-message";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    msgDiv.appendChild(bubble);
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  async function askGemini(prompt) {
    try {
      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      return data.reply || "Sorry, I couldn't understand. Please try again.";
    } catch (err) {
      console.error("Gemini API error:", err);
      return "⚠️ There was a problem connecting to the bot. Please try again.";
    }
  }

  chatSend.addEventListener("click", async () => {
    const input = chatInput.value.trim();
    if (!input) return;
    appendMessage("user", input);
    chatInput.value = "";

    const response = await askGemini(
      `User asked: ${input}. Respond as a career guidance bot.`
    );
    appendMessage("bot", response);
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") chatSend.click();
  });

  // Initial bot greeting
  appendMessage(
    "bot",
    "👋 Hi! I'm your Career Guide Bot. How can I help you today?"
  );
});
