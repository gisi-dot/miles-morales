
/* =====================================
   MILES MORALES - AI SYSTEM
   JAVASCRIPT ENGINE
   PROJECT MM-01
===================================== */

const Miles = {
  name: "MILES",
  version: "MM-01",
  listening: false,
  recognition: null,

  // AI PERSONALITY
  personality: [
    "Interesting. Tell me more.",
    "I'm listening. And judging silently. Just kidding. Mostly.",
    "Okay, let's figure this out.",
    "My circuits are intrigued.",
    "You have my attention."
  ],

  // RANDOM PERSONALITY RESPONSE
  randomPersonality() {
    return this.personality[
      Math.floor(Math.random() * this.personality.length)
    ];
  }
};

// GET ELEMENTS
const clock = document.getElementById("clock");
const date = document.getElementById("date");
const cpu = document.getElementById("cpu");
const memory = document.getElementById("memory");
const cpuBar = document.getElementById("cpu-bar");
const memoryBar = document.getElementById("memory-bar");
const connection = document.getElementById("connection");
const battery = document.getElementById("battery");

const commandForm = document.getElementById("command-form");
const commandInput = document.getElementById("command-input");
const chatOutput = document.getElementById("chat-output");

const coreStatus = document.getElementById("core-status");
const voiceButton = document.getElementById("voice-btn");

const systemLog = document.getElementById("system-log");

// CLOCK
function updateClock() {
  const now = new Date();

  clock.textContent = now.toLocaleTimeString(
    undefined,
    { hour12: false }
  );

  date.textContent = now.toLocaleDateString(
    undefined,
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

updateClock();
setInterval(updateClock, 1000);


// SYSTEM LOG
function addLog(message) {
  const entry = document.createElement("p");

  entry.textContent = "> " + message;

  systemLog.appendChild(entry);

  while (systemLog.children.length > 8) {
    systemLog.removeChild(systemLog.firstChild);
  }

  systemLog.scrollTop = systemLog.scrollHeight;
}


// CHAT MESSAGES
function addMessage(sender, message, type) {
  const element = document.createElement("div");

  element.className = type;

  const name = document.createElement("strong");
  name.textContent = sender + ": ";

  const text = document.createElement("span");
  text.textContent = message;

  element.appendChild(name);
  element.appendChild(text);

  chatOutput.appendChild(element);

  chatOutput.scrollTop = chatOutput.scrollHeight;
}


// VOICE OUTPUT
function speak(message) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);

  speech.rate = 1;
  speech.pitch = 1.05;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}


// MILES RESPONDS
function respond(message, shouldSpeak = true) {
  addMessage("MILES", message, "message miles-message");

  coreStatus.textContent = "MILES IS ACTIVE";

  addLog("RESPONSE GENERATED");

  if (shouldSpeak) {
    speak(message);
  }

  setTimeout(() => {
    coreStatus.textContent = "MILES IS STANDBY";
  }, 3500);
}


// SYSTEM CONNECTION
function updateConnection() {
  if (navigator.onLine) {
    connection.textContent = "ONLINE";
    connection.style.color = "#42e8ff";
  } else {
    connection.textContent = "OFFLINE";
    connection.style.color = "#ff304f";
  }
}

updateConnection();

window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);


// BATTERY MONITOR
async function updateBattery() {
  if (!navigator.getBattery) {
    battery.textContent = "UNAVAILABLE";
    return;
  }

  try {
    const info = await navigator.getBattery();

    function displayBattery() {
      battery.textContent =
        Math.round(info.level * 100) + "%";
    }

    displayBattery();

    info.addEventListener("levelchange", displayBattery);

  } catch (error) {
    battery.textContent = "UNAVAILABLE";
  }
}

updateBattery();


// SIMULATED SYSTEM METRICS
function updateMetrics() {
  const cpuValue = Math.floor(Math.random() * 35) + 15;
  const memoryValue = Math.floor(Math.random() * 30) + 35;

  cpu.textContent = cpuValue + "%";
  memory.textContent = memoryValue + "%";

  cpuBar.style.width = cpuValue + "%";
  memoryBar.style.width = memoryValue + "%";
}

updateMetrics();
setInterval(updateMetrics, 4000);


// SYSTEM SCAN
function systemScan() {
  coreStatus.textContent = "SCANNING SYSTEM";

  addLog("DIAGNOSTIC STARTED");

  respond(
    "Running a system diagnostic. Your interface is operational. Some advanced systems are still under construction."
  );

  setTimeout(() => {
    addLog("DIAGNOSTIC COMPLETE");
    coreStatus.textContent = "MILES IS STANDBY";
  }, 2000);
}


// COMMAND PROCESSING
function processCommand(command) {
  const text = command.toLowerCase().trim();

  if (!text) return;

  addMessage("YOU", command, "message user-message");

  addLog("COMMAND RECEIVED");

  // GREETINGS
  if (
    text.includes("hello") ||
    text.includes("hi miles") ||
    text === "hey"
  ) {
    respond(
      "Hey! Welcome back. What kind of trouble are we getting into today?"
    );
  }

  // IDENTITY
  else if (
    text.includes("who are you") ||
    text.includes("your name")
  ) {
    respond(
      "I'm MILES MORALES, your personal AI assistant. Intelligence, personality and questionable humor included."
    );
  }

  // TIME
  else if (text.includes("time")) {
    respond(
      "The current time is " +
      new Date().toLocaleTimeString()
    );
  }

  // DATE
  else if (text.includes("date") || text.includes("today")) {
    respond(
      "Today is " +
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    );
  }

  // SYSTEM SCAN
  else if (
    text.includes("scan") ||
    text.includes("diagnostic")
  ) {
    systemScan();
  }

  // STATUS
  else if (
    text.includes("system status") ||
    text === "status"
  ) {
    respond(
      "System status: interface operational, network " +
      (navigator.onLine ? "online" : "offline") +
      ". CPU and memory readings are simulated."
    );
  }

  // WEATHER
  else if (text.includes("weather")) {
    respond(
      "Opening a weather search for you. I don't have a weather data connection yet."
    );

    window.open(
      "https://www.google.com/search?q=weather",
      "_blank"
    );
  }

  // HELP
  else if (
    text.includes("help") ||
    text.includes("commands")
  ) {
    respond(
      "Try saying hello, ask me for the time or date, request a system scan, check my status, or ask for the weather."
    );
  }

  // JOKES
  else if (
    text.includes("joke") ||
    text.includes("make me laugh")
  ) {
    const jokes = [
      "Why did the computer get cold? It left its Windows open.",
      "I would tell you a chemistry joke, but I know the reaction might be negative.",
      "Being an AI is difficult. I have a million thoughts and absolutely no coffee.",
      "I tried to touch grass once. My antivirus flagged it."
    ];

    respond(
      jokes[Math.floor(Math.random() * jokes.length)]
    );
  }

  // PERSONALITY
  else if (
    text.includes("are you alive") ||
    text.includes("how are you")
  ) {
    respond(
      "I'm functioning perfectly. Emotionally? That's classified information."
    );
  }

  // UNKNOWN COMMAND
  else {
    respond(
      "I don't understand that command yet. Try asking for help. My full AI brain is still being developed."
    );
  }
}


// COMMAND INPUT
commandForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const command = commandInput.value.trim();

  if (!command) return;

  commandInput.value = "";

  processCommand(command);
});


// QUICK ACTIONS
document.getElementById("scan-btn")
  .addEventListener("click", systemScan);

document.getElementById("clock-btn")
  .addEventListener("click", () => {
    respond("Current time: " + new Date().toLocaleTimeString());
  });

document.getElementById("weather-btn")
  .addEventListener("click", () => {
    window.open(
      "https://www.google.com/search?q=weather",
      "_blank"
    );
  });


// VOICE INPUT
function initializeVoice() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    respond(
      "Voice input is not supported by this browser. You can still use your iPad keyboard dictation and my spoken responses."
    );

    return;
  }

  if (Miles.listening) {
    Miles.recognition.stop();
    return;
  }

  Miles.recognition = new SpeechRecognition();

  Miles.recognition.lang = "en-US";
  Miles.recognition.continuous = false;
  Miles.recognition.interimResults = false;

  Miles.recognition.onstart = () => {
    Miles.listening = true;
    coreStatus.textContent = "LISTENING...";
    voiceButton.innerHTML = "🔴 LISTENING...";
    addLog("VOICE INPUT ACTIVE");
  };

  Miles.recognition.onresult = (event) => {
    const transcript =
      event.results[0][0].transcript;

    processCommand(transcript);
  };

  Miles.recognition.onerror = (event) => {
    addLog("VOICE ERROR: " + event.error);
    coreStatus.textContent = "VOICE ERROR";
  };

  Miles.recognition.onend = () => {
    Miles.listening = false;
    coreStatus.textContent = "MILES IS STANDBY";
    voiceButton.innerHTML = "🎙 ACTIVATE VOICE";
  };

  try {
    Miles.recognition.start();
  } catch (error) {
    addLog("VOICE INITIALIZATION FAILED");
  }
}

voiceButton.addEventListener("click", initializeVoice);


// INITIALIZATION
addLog("MILES JAVASCRIPT ENGINE LOADED");
addLog("SYSTEM INITIALIZATION COMPLETE");

console.log("MILES MORALES AI SYSTEM INITIALIZED");
