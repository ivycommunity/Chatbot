function updateTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var timeString = hours + ':' + minutes + ' ' + ampm;
  document.getElementById('clock').textContent = timeString;
}
setInterval(updateTime, 1000);

// Chatbot toggle functionality
document.getElementById("chatbot_toggle").onclick = function () {
  if (document.getElementById("chatbot").classList.contains("collapsed")) {
      document.getElementById("chatbot").classList.remove("collapsed");
      document.getElementById("chatbot_toggle").children[0].style.display = "none";
      document.getElementById("chatbot_toggle").children[1].style.display = "";
      setTimeout(addResponseMsg, 1000, "Type 'start' to begin.");
  } else {
      document.getElementById("chatbot").classList.add("collapsed");
      document.getElementById("chatbot_toggle").children[0].style.display = "";
      document.getElementById("chatbot_toggle").children[1].style.display = "none";
  }
};

const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const BOT_IMG = "static/img/mhcicon.png";
const PERSON_IMG = "static/img/person.png";
const BOT_NAME = "HealthX Bot";
const PERSON_NAME = "You";

let userStarted = false;
let userDetailsCollected = false;
let selectedCategory = "";
let isVoiceInput = false;

msgerForm.addEventListener("submit", event => {
  event.preventDefault();
  const msgText = msgerInput.value.trim();
  if (!msgText) return;
  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  msgerInput.value = "";

  if (!userStarted) {
      if (msgText.toLowerCase() === "start") {
          userStarted = true;
          addResponseMsg("Welcome! Please provide your details (Name, Age, etc.).");
      } else {
          addResponseMsg("Please type 'start' to begin.");
      }
  } else if (!userDetailsCollected) {
      userDetailsCollected = true;
      addResponseMsg("Thank you! Now, please select a service category: 'For Individuals and Families', 'For Organizations', or 'Mental Health'.");
  } else if (!selectedCategory) {
      if (["For Individuals and Families", "For Organizations", "Mental Health"].includes(msgText)) {
          selectedCategory = msgText;
          if (selectedCategory === "Mental Health") {
              addResponseMsg("You selected Mental Health. How can I assist you?");
          } else {
              addResponseMsg(`You selected ${selectedCategory}. Here are the available services: ...`);
          }
      } else {
          addResponseMsg("Please select a valid category: 'For Individuals and Families', 'For Organizations', or 'Mental Health'.");
      }
  } else {
      if (selectedCategory === "Mental Health") {
          botResponse(msgText);
      } else {
          addResponseMsg("For this category, you can check the available services above.");
      }
  }
});

function addResponseMsg(text) {
  appendMessage(BOT_NAME, BOT_IMG, "left", text);
}

function appendMessage(name, img, side, text) {
  const msgHTML = `
      <div class="msg ${side}-msg">
          <div class="msg-img" style="background-image: url(${img})"></div>
          <div class="msg-bubble">
              <div class="msg-info">
                  <div class="msg-info-name">${name}</div>
                  <div class="msg-info-time">${formatDate(new Date())}</div>
              </div>
              <div class="msg-text">${text}</div>
          </div>
      </div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

function botResponse(rawText) {
  $.get("/get", { msg: rawText }).done(function (data) {
      console.log("User:", rawText);
      console.log("Bot:", data);
      appendMessage(BOT_NAME, BOT_IMG, "left", data);
      if (isVoiceInput) {
          speak(data);
          isVoiceInput = false;
      }
  });
}

function speak(text) {
  if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "en-US";
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
  }
}

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (window.SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  document.getElementById("voice-btn").addEventListener("click", function () {
      this.classList.add("recording");
      this.innerHTML = "🎙️";
      isVoiceInput = true;
      recognition.start();
  });

  recognition.onresult = function (event) {
      let voiceText = event.results[0][0].transcript;
      document.querySelector(".msger-input").value = voiceText;
      document.querySelector(".msger-send-btn").click();
  };

  recognition.onend = function () {
      document.getElementById("voice-btn").classList.remove("recording");
      document.getElementById("voice-btn").innerHTML = "🎤";
  };
}

// Dark mode toggle
document.getElementById("dark-mode-toggle").addEventListener("click", function () {
  const body = document.body;
  const isDark = body.classList.toggle("dark-mode");
  this.textContent = isDark ? "🌞" : "🌙";
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
});

document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
      document.getElementById("dark-mode-toggle").textContent = "🌞";
  }
});

function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();
  return `${h.slice(-2)}:${m.slice(-2)}`;
}
