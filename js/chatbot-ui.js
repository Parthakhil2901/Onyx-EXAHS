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

  async function sendMessage() {
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    displayUserMessage(userMsg);
    chatInput.value = "";
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      displayBotMessage(
        data.reply || "Sorry, I couldn't understand. Please try again."
      );
      chatWindow.scrollTop = chatWindow.scrollHeight;

      // Check if screening is complete based on bot reply or userMsg
      // Removed screeningComplete check and modal for now as per user request
      // if (data.screeningComplete) {
      //   // Show success modal
      //   showSuccessModal();
      // }
    } catch (error) {
      displayBotMessage(
        "⚠️ There was a problem connecting to the bot. Please try again."
      );
    }
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

  function showSuccessModal() {
    const modalOverlay = document.querySelector(".modal-overlay");
    const successModal = document.querySelector(".success-modal");
    modalOverlay.style.display = "block";
    successModal.style.display = "block";

    const goToDashboardBtn = successModal.querySelector("button");
    goToDashboardBtn.addEventListener("click", () => {
      // Redirect to dashboard with personalized roadmap
      window.location.href = "dashboard.html?personalizedRoadmap=true";
    });
  }
});
