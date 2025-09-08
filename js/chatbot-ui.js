document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");
  const clearChat = document.getElementById("clear-chat");

  // Initial bot greeting
  displayBotMessage(
    "👋 Hi! I'm your Career Guide Bot. How can I help you today?"
  );

  // Send message on button click or Enter key
  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Clear chat window
  clearChat.addEventListener("click", () => {
    chatWindow.innerHTML = "";
    displayBotMessage("Chat cleared. How can I assist you?");
  });

  function sendMessage() {
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    displayUserMessage(userMsg);
    chatInput.value = "";
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Call Gemini API backend
    fetch("/api/gemini-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    })
      .then((res) => res.json())
      .then((data) => {
        displayBotMessage(
          data.reply || "Sorry, I couldn't understand. Please try again."
        );
        chatWindow.scrollTop = chatWindow.scrollHeight;
      })
      .catch(() => {
        displayBotMessage(
          "⚠️ There was a problem connecting to the bot. Please try again."
        );
      });
  }

  function displayBotMessage(message) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "bot-message";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message;
    msgDiv.appendChild(bubble);
    chatWindow.appendChild(msgDiv);
  }

  function displayUserMessage(message) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "user-message";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message;
    msgDiv.appendChild(bubble);
    chatWindow.appendChild(msgDiv);
  }
});
