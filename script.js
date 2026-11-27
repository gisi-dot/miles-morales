
/* =====================================
   MILES MORALES - AI SYSTEM
   JAVASCRIPT ENGINE
   PROJECT MM-01
   VERSION 2.2
   CONVERSATION MEMORY // V1.0
   PERSONAL MEMORY // V2.0
===================================== */

const Miles = {
  name: "MILES",
  version: "MM-01",
  listening: false,
  recognition: null,

  backendURL:
    "https://miles-morales-backend.giselaherri673.workers.dev/",

  personality: [
    "Interesting. Tell me more.",
    "I'm listening. And judging silently. Just kidding. Mostly.",
    "Okay, let's figure this out.",
    "My circuits are intrigued.",
    "You have my attention."
  ],

  randomPersonality() {
    return this.personality[
      Math.floor(Math.random() * this.personality.length)
    ];
  }
};


// MEMORY SYSTEM

const MEMORY_KEY = "miles_conversation_memory_v1";
const PERSONAL_MEMORY_KEY = "miles_personal_memory_v2";
const MAX_MEMORY_MESSAGES = 50;

let conversationHistory = [];
let personalMemories = [];
let restoringHistory = false;


// CONVERSATION MEMORY

function saveMemory() {
  try {
    localStorage.setItem(
      MEMORY_KEY,
      JSON.stringify(conversationHistory)
    );
  } catch (error) {
    console.error("MILES MEMORY SAVE ERROR:", error);
  }
}

function restoreMemory() {
  try {
    const savedMemory = localStorage.getItem(MEMORY_KEY);

    if (!savedMemory) return;

    const parsedMemory = JSON.parse(savedMemory);

    if (!Array.isArray(parsedMemory)) return;

    conversationHistory = parsedMemory
      .filter(item =>
        item &&
        typeof item.sender === "string" &&
        typeof item.message === "string" &&
        typeof item.type === "string"
      )
      .slice(-MAX_MEMORY_MESSAGES);

    restoringHistory = true;

    conversationHistory.forEach(item => {
      addMessage(
        item.sender,
        item.message,
        item.type
      );
    });

    restoringHistory = false;

    addLog("PREVIOUS CONVERSATION RESTORED");

  } catch (error) {
    restoringHistory = false;
    conversationHistory = [];

    console.error("MILES MEMORY RESTORE ERROR:", error);
    addLog("MEMORY RESTORE FAILED");
  }
}

function clearMemory() {
  conversationHistory = [];

  try {
    localStorage.removeItem(MEMORY_KEY);
  } catch (error) {
    console.error("MILES MEMORY CLEAR ERROR:", error);
  }

  chatOutput.innerHTML = "";

  addLog("CONVERSATION MEMORY CLEARED");
}


// PERSONAL MEMORY

function savePersonalMemories() {
  try {
    localStorage.setItem(
      PERSONAL_MEMORY_KEY,
      JSON.stringify(personalMemories)
    );
  } catch (error) {
    console.error("PERSONAL MEMORY SAVE ERROR:", error);
  }
}

function restorePersonalMemories() {
  try {
    const saved = localStorage.getItem(PERSONAL_MEMORY_KEY);

    if (!saved) return;

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      personalMemories = parsed.filter(
        item => typeof item === "string"
      );
    }

    addLog("PERSONAL MEMORY RESTORED");

  } catch (error) {
    personalMemories = [];
    console.error("PERSONAL MEMORY RESTORE ERROR:", error);
  }
}

function rememberFact(fact) {
  const cleanFact = fact.trim();

  if (!cleanFact) {
    respond("Tell me what you'd like me to remember.");
    return;
  }

  const exists = personalMemories.some(
    item => item.toLowerCase() === cleanFact.toLowerCase()
  );

  if (exists) {
    respond("I already have that saved in my personal memory.");
    return;
  }

  personalMemories.push(cleanFact);
  savePersonalMemories();

  addLog("NEW PERSONAL MEMORY SAVED");

  respond("Got it. I've saved this to my personal memory: " + cleanFact);
}

function showPersonalMemories() {
  if (personalMemories.length === 0) {
    respond("My personal memory is currently empty. Tell me something by saying: Remember that...");
    return;
  }

  const memoryList = personalMemories
    .map((item, index) => (index + 1) + ". " + item)
    .join(" ");

  respond("Here is what I remember: " + memoryList);
}

function forgetFact(fact) {
  const target = fact.trim().toLowerCase();

  if (!target) {
    respond("Tell me which memory you'd like me to forget.");
    return;
  }

  const originalLength = personalMemories.length;

  personalMemories = personalMemories.filter(
    item => !item.toLowerCase().includes(target)
  );

  if (personalMemories.length === originalLength) {
    respond("I couldn't find a matching personal memory.");
    return;
  }

  savePersonalMemories();

  addLog("PERSONAL MEMORY UPDATED");

  respond("I've removed the matching personal memory.");
}

function forgetAllPersonalMemories() {
  personalMemories = [];

  try {
    localStorage.removeItem(PERSONAL_MEMORY_KEY);
  } catch (error) {
    console.error("PERSONAL MEMORY CLEAR ERROR:", error);
  }

  addLog("ALL PERSONAL MEMORIES CLEARED");

  respond("All personal memories have been cleared.");
}


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


// TIME FORMAT — 12-HOUR, WITH SECONDS, NO AM/PM

function getFormattedTime() {
  return new Date().toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).replace(/\s?[AP]M/i, "");
}


// CLOCK

function updateClock() {
  const now = new Date();

  clock.textContent = getFormattedTime();

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

  if (!restoringHistory) {
    conversationHistory.push({
      sender: sender,
      message: message,
      type: type
    });

    conversationHistory =
      conversationHistory.slice(-MAX_MEMORY_MESSAGES);

    saveMemory();
  }
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


// CLOUDFLARE BACKEND CONNECTION

async function askBackend(message) {
  coreStatus.textContent = "CONNECTING TO BACKEND";

  addLog("BACKEND REQUEST STARTED");

  try {
    const response = await fetch(Miles.backendURL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: message
      })
    });

    if (!response.ok) {
      throw new Error("Backend returned status " + response.status);
    }

    const data = await response.json();

    addLog("BACKEND RESPONSE RECEIVED");

    respond(
      data.message || "The backend responded, but returned no message."
    );

    if (data.status === "not_connected") {
      addLog("OPENAI CONNECTION PENDING");
    }

  } catch (error) {
    console.error("MILES BACKEND ERROR:", error);

    addLog("BACKEND CONNECTION FAILED");

    respond(
      "I couldn't reach my backend. Please check your internet connection or try again."
    );
  }
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


  // FORGET ALL PERSONAL MEMORIES

  if (
    text === "forget all personal memories" ||
    text === "forget everything you remember about me"
  ) {
    forgetAllPersonalMemories();
  }

  // REMEMBER A FACT

  else if (text.startsWith("remember that ")) {
    rememberFact(command.slice(14));
  }

  else if (text.startsWith("remember ")) {
    rememberFact(command.slice(9));
  }

  // SHOW PERSONAL MEMORIES

  else if (
    text === "what do you remember about me" ||
    text === "what do you remember" ||
    text === "show my memories" ||
    text === "show memories"
  ) {
    showPersonalMemories();
  }

  // FORGET A SPECIFIC FACT

  else if (text.startsWith("forget ")) {
    const fact = command.slice(7);

    forgetFact(fact);
  }

  // CLEAR CONVERSATION HISTORY

  else if (
    text === "clear memory" ||
    text === "clear conversation" ||
    text === "forget this conversation"
  ) {
    clearMemory();

    respond("Conversation memory cleared. Starting fresh.");
  }

  // GREETINGS

  else if (
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
      "The current time is " + getFormattedTime()
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
      "Try hello, ask for the time or date, request a system scan, check my status, ask for the weather, or use remember that, show my memories, forget, and clear memory."
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

  // UNKNOWN COMMAND — SEND TO BACKEND

  else {
    askBackend(command);
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
    respond("Current time: " + getFormattedTime());
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
      "Voice input is not supported by this browser. You can still use your tablet keyboard dictation and my spoken responses."
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

restoreMemory();
restorePersonalMemories();

addLog("MILES JAVASCRIPT ENGINE LOADED");
addLog("CLOUDFLARE BACKEND CONFIGURED");
addLog("CONVERSATION MEMORY INITIALIZED");
addLog("PERSONAL MEMORY V2.0 INITIALIZED");
addLog("OPENAI CONNECTION PENDING");
addLog("SYSTEM INITIALIZATION COMPLETE");

console.log("MILES MORALES AI SYSTEM INITIALIZED");
     
