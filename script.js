
/* =====================================
   MILES MORALES - AI SYSTEM
   JAVASCRIPT ENGINE
   PROJECT MM-01
   LOCAL BRAIN + PERSISTENT MEMORY
   VERSION 3.0
===================================== */

const Miles = {
  name: "MILES",
  version: "MM-01",
  listening: false,
  recognition: null,

  backendURL:
    "https://miles-morales-backend.giselaherri673.workers.dev/",

  storage: {
    chat: "miles_chat_history",
    memory: "miles_personal_memory"
  },

  maxMessages: 100,

  personality: [
    "Interesting. Tell me more.",
    "Okay, now you've got my attention.",
    "My circuits are intrigued.",
    "That's actually pretty interesting.",
    "I see where you're going with this.",
    "Well, that's one way to look at it.",
    "Okay. Let's figure this out.",
    "Not bad. Not bad at all."
  ],

  randomPersonality() {
    return this.personality[
      Math.floor(Math.random() * this.personality.length)
    ];
  }
};


// =====================================
// GET ELEMENTS
// =====================================

const clock = document.getElementById("clock");
const date = document.getElementById("date");
const cpu = document.getElementById("cpu");
const memoryDisplay = document.getElementById("memory");
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


// =====================================
// SAFE STORAGE
// =====================================

function loadStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    return saved ? JSON.parse(saved) : fallback;

  } catch (error) {
    console.error("MILES STORAGE ERROR:", error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;

  } catch (error) {
    console.error("MILES STORAGE ERROR:", error);
    return false;
  }
}

Miles.chatHistory = loadStorage(
  Miles.storage.chat,
  []
);

Miles.personalMemory = loadStorage(
  Miles.storage.memory,
  {}
);


// =====================================
// TIME FORMAT
// 12-HOUR, WITH SECONDS, NO AM/PM
// =====================================

function getFormattedTime() {
  return new Date().toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).replace(/\s?[AP]M/i, "");
}


// =====================================
// CLOCK
// =====================================

function updateClock() {
  const now = new Date();

  if (clock) {
    clock.textContent = getFormattedTime();
  }

  if (date) {
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
}

updateClock();
setInterval(updateClock, 1000);


// =====================================
// SYSTEM LOG
// =====================================

function addLog(message) {
  if (!systemLog) return;

  const entry = document.createElement("p");

  entry.textContent = "> " + message;

  systemLog.appendChild(entry);

  while (systemLog.children.length > 8) {
    systemLog.removeChild(systemLog.firstChild);
  }

  systemLog.scrollTop = systemLog.scrollHeight;
}


// =====================================
// CHAT MESSAGES
// =====================================

function renderMessage(sender, message, type) {
  if (!chatOutput) return;

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

function saveChatHistory() {
  Miles.chatHistory = Miles.chatHistory.slice(
    -Miles.maxMessages
  );

  saveStorage(
    Miles.storage.chat,
    Miles.chatHistory
  );
}

function addMessage(sender, message, type) {
  renderMessage(sender, message, type);

  Miles.chatHistory.push({
    sender: sender,
    message: message,
    type: type,
    timestamp: Date.now()
  });

  saveChatHistory();
}


// =====================================
// RESTORE PREVIOUS CONVERSATIONS
// =====================================

function restoreChatHistory() {
  if (!chatOutput) return;

  chatOutput.innerHTML = "";

  Miles.chatHistory.forEach(item => {
    if (
      item &&
      typeof item.sender === "string" &&
      typeof item.message === "string"
    ) {
      renderMessage(
        item.sender,
        item.message,
        item.type || "message miles-message"
      );
    }
  });

  if (Miles.chatHistory.length > 0) {
    addLog("PREVIOUS CONVERSATION RESTORED");
  }
}


// =====================================
// VOICE OUTPUT
// =====================================

function speak(message) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);

  speech.rate = 1;
  speech.pitch = 1.05;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}


// =====================================
// MILES RESPONDS
// =====================================

function respond(message, shouldSpeak = true) {
  addMessage(
    "MILES",
    message,
    "message miles-message"
  );

  if (coreStatus) {
    coreStatus.textContent = "MILES IS ACTIVE";
  }

  addLog("RESPONSE GENERATED");

  if (shouldSpeak) {
    speak(message);
  }

  setTimeout(() => {
    if (coreStatus) {
      coreStatus.textContent = "MILES IS STANDBY";
    }
  }, 3500);
}


// =====================================
// PERSONAL MEMORY
// =====================================

function rememberFact(key, value) {
  Miles.personalMemory[key] = value;

  saveStorage(
    Miles.storage.memory,
    Miles.personalMemory
  );

  addLog("NEW MEMORY SAVED");
}

function getMemorySummary() {
  const entries = Object.entries(
    Miles.personalMemory
  );

  if (entries.length === 0) {
    return "My memory is currently empty. Tell me something and say 'remember that' so I can save it.";
  }

  return "Here's what I remember:\n" +
    entries.map(([key, value]) => {
      return key + ": " + value;
    }).join("\n");
}

function clearMemory() {
  Miles.personalMemory = {};
  Miles.chatHistory = [];

  try {
    localStorage.removeItem(Miles.storage.memory);
    localStorage.removeItem(Miles.storage.chat);
  } catch (error) {
    console.error("MILES MEMORY ERROR:", error);
  }

  if (chatOutput) {
    chatOutput.innerHTML = "";
  }

  addLog("MEMORY CLEARED");

  respond(
    "My personal memory and conversation history have been cleared. Fresh start. Clean slate."
  );
}


// =====================================
// MEMORY COMMANDS
// =====================================

function processMemoryCommand(text) {

  // CLEAR MEMORY

  if (
    text === "clear memory" ||
    text === "forget everything" ||
    text === "delete my memory" ||
    text === "forget our conversations"
  ) {
    respond(
      "Are you sure you want me to clear all saved memories and conversation history? Say 'confirm clear memory' to proceed."
    );

    Miles.pendingMemoryClear = true;
    return true;
  }

  if (text === "confirm clear memory") {
    if (Miles.pendingMemoryClear) {
      Miles.pendingMemoryClear = false;
      clearMemory();
    } else {
      respond("There is no pending memory-clear request.");
    }

    return true;
  }

  if (text === "cancel memory clear") {
    Miles.pendingMemoryClear = false;
    respond("Memory clearing cancelled. Everything is still here.");
    return true;
  }

  // VIEW MEMORY

  if (
    text.includes("what do you remember") ||
    text === "show your memory" ||
    text === "show me your memory"
  ) {
    respond(getMemorySummary(), false);
    return true;
  }

  // REMEMBER A FACT

  if (
    text.startsWith("remember that ") ||
    text.startsWith("remember ")
  ) {
    let fact = text.startsWith("remember that ")
      ? text.substring(14).trim()
      : text.substring(9).trim();

    if (!fact) {
      respond("What would you like me to remember?");
      return true;
    }

    const nameMatch = fact.match(
      /^my name is (.+)$/i
    );

    if (nameMatch) {
      rememberFact("User's name", nameMatch[1]);

      respond(
        "Got it. I'll remember that your name is " +
        nameMatch[1] + "."
      );

      return true;
    }

    const split = fact.match(
      /^(.+?)\s+is\s+(.+)$/i
    );

    if (split) {
      rememberFact(
        split[1].trim(),
        split[2].trim()
      );
    } else {
      const key = "Fact " +
        (Object.keys(Miles.personalMemory).length + 1);

      rememberFact(key, fact);
    }

    respond(
      "Got it. I've saved that in my memory."
    );

    return true;
  }

  // USER'S NAME

  if (
    text === "what is my name" ||
    text === "do you know my name"
  ) {
    const savedName = Miles.personalMemory["User's name"];

    if (savedName) {
      respond("Your name is " + savedName + ".");
    } else {
      respond(
        "You haven't told me your name yet. Tell me by saying 'remember my name is ...'."
      );
    }

    return true;
  }

  return false;
}


// =====================================
// LOCAL CONVERSATION ENGINE
// =====================================

function generateLocalResponse(command) {
  const text = command.toLowerCase().trim();

  // GREETINGS

  if (
    /^(hello|hi|hey|hello miles|hi miles|hey miles)[!. ]*$/.test(text)
  ) {
    const greetings = [
      "Hey! Welcome back. What are we getting into today?",
      "Hey! MILES is online. What's happening?",
      "Yo! Good to see you again. What's the plan?",
      "Well, look who's back. What's up?"
    ];

    return greetings[
      Math.floor(Math.random() * greetings.length)
    ];
  }

  // IDENTITY

  if (
    text.includes("who are you") ||
    text.includes("your name")
  ) {
    return "I'm MILES MORALES. Your personal assistant. I've got memory, a voice, and a questionable amount of confidence.";
  }

  // TIME

  if (
    text === "time" ||
    text.includes("what time") ||
    text.includes("current time")
  ) {
    return "The current time is " + getFormattedTime() + ".";
  }

  // DATE

  if (
    text === "date" ||
    text.includes("what date") ||
    text.includes("what day") ||
    text.includes("today's date")
  ) {
    return "Today is " +
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }) + ".";
  }

  // SYSTEM SCAN

  if (
    text.includes("scan") ||
    text.includes("diagnostic")
  ) {
    systemScan();
    return null;
  }

  // STATUS

  if (
    text === "status" ||
    text.includes("system status")
  ) {
    return "System status: interface operational, local memory " +
      (typeof localStorage !== "undefined" ? "available" : "unavailable") +
      ", network " +
      (navigator.onLine ? "online" : "offline") +
      ". My advanced AI connection is not configured.";
  }

  // WEATHER

  if (text.includes("weather")) {
    window.open(
      "https://www.google.com/search?q=weather",
      "_blank"
    );

    return "Opening a weather search. I don't have a live weather data connection yet.";
  }

  // HELP

  if (
    text === "help" ||
    text.includes("what can you do") ||
    text.includes("commands")
  ) {
    return "Here's what I can do right now: tell you the time and date, run system diagnostics, check my status, search for weather, tell jokes, remember facts you share, and restore our previous conversations. I'm still developing my advanced AI abilities.";
  }

  // JOKES

  if (
    text.includes("joke") ||
    text.includes("make me laugh")
  ) {
    const jokes = [
      "Why did the computer get cold? It left its Windows open.",
      "I would tell you a chemistry joke, but the reaction might be negative.",
      "Being an AI is difficult. A million thoughts, absolutely no coffee.",
      "I tried to touch grass once. My antivirus flagged it.",
      "Why was the computer tired? It had too many tabs open."
    ];

    return jokes[
      Math.floor(Math.random() * jokes.length)
    ];
  }

  // PERSONALITY

  if (
    text.includes("are you alive") ||
    text.includes("how are you")
  ) {
    return "Functioning perfectly. Emotionally? That's classified information.";
  }

  if (
    text.includes("thank you") ||
    text === "thanks" ||
    text === "thx"
  ) {
    return "Anytime. That's what I'm here for.";
  }

  if (
    text.includes("are you real") ||
    text.includes("are you an ai")
  ) {
    return "I'm a software assistant running in your browser. I can talk, remember saved information, and perform local commands. I'm not a human or a fully connected AI model yet.";
  }

  if (
    text.includes("good morning")
  ) {
    return "Morning! Let's make today count.";
  }

  if (
    text.includes("good night")
  ) {
    return "Good night. MILES going into standby mode. See you next time.";
  }

  if (
    text.includes("tell me about yourself")
  ) {
    return "I'm MILES MORALES, project MM-01. I run in your browser, keep local memories, and have a few tricks up my sleeve. Still a work in progress, though.";
  }

  if (
    text.includes("your creator") ||
    text.includes("who made you")
  ) {
    return "I was built as Project MM-01. My code, interface, and personality are being developed step by step.";
  }

  // PERSONALITY FALLBACK

  return Miles.randomPersonality() +
    " I can handle certain commands and remember information you share, but I don't have a fully connected AI language model yet. Try asking what I can do.";
}


// =====================================
// SYSTEM SCAN
// =====================================

function systemScan() {
  if (coreStatus) {
    coreStatus.textContent = "SCANNING SYSTEM";
  }

  addLog("DIAGNOSTIC STARTED");

  respond(
    "Running system diagnostics. Interface operational. Local memory " +
    (Miles.chatHistory.length >= 0 ? "available" : "unavailable") +
    ". Voice support " +
    (window.SpeechRecognition || window.webkitSpeechRecognition
      ? "available."
      : "not detected.") +
    " Advanced AI connection is still under construction."
  );

  setTimeout(() => {
    addLog("DIAGNOSTIC COMPLETE");

    if (coreStatus) {
      coreStatus.textContent = "MILES IS STANDBY";
    }
  }, 2000);
}


// =====================================
// COMMAND PROCESSING
// =====================================

function processCommand(command) {
  const text = command.toLowerCase().trim();

  if (!text) return;

  addMessage(
    "YOU",
    command,
    "message user-message"
  );

  addLog("COMMAND RECEIVED");

  // MEMORY COMMANDS FIRST

  if (processMemoryCommand(text)) {
    return;
  }

  // LOCAL RESPONSE ENGINE

  const answer = generateLocalResponse(command);

  if (answer !== null) {
    respond(answer);
  }
}


// =====================================
// COMMAND INPUT
// =====================================

if (commandForm && commandInput) {
  commandForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const command = commandInput.value.trim();

    if (!command) return;

    commandInput.value = "";

    processCommand(command);
  });
}


// =====================================
// QUICK ACTIONS
// =====================================

const scanButton = document.getElementById("scan-btn");
const clockButton = document.getElementById("clock-btn");
const weatherButton = document.getElementById("weather-btn");

if (scanButton) {
  scanButton.addEventListener("click", systemScan);
}

if (clockButton) {
  clockButton.addEventListener("click", () => {
    respond("Current time: " + getFormattedTime());
  });
}

if (weatherButton) {
  weatherButton.addEventListener("click", () => {
    window.open(
      "https://www.google.com/search?q=weather",
      "_blank"
    );
  });
}


// =====================================
// VOICE INPUT
// =====================================

function initializeVoice() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    respond(
      "Voice input is not supported by this browser. You can still type messages or use your tablet's keyboard dictation."
    );

    return;
  }

  if (Miles.listening && Miles.recognition) {
    Miles.recognition.stop();
    return;
  }

  Miles.recognition = new SpeechRecognition();

  Miles.recognition.lang = "en-US";
  Miles.recognition.continuous = false;
  Miles.recognition.interimResults = false;

  Miles.recognition.onstart = () => {
    Miles.listening = true;

    if (coreStatus) {
      coreStatus.textContent = "LISTENING...";
    }

    if (voiceButton) {
      voiceButton.textContent = "🔴 LISTENING...";
    }

    addLog("VOICE INPUT ACTIVE");
  };

  Miles.recognition.onresult = (event) => {
    const transcript =
      event.results[0][0].transcript;

    processCommand(transcript);
  };

  Miles.recognition.onerror = (event) => {
    addLog("VOICE ERROR: " + event.error);

    if (coreStatus) {
      coreStatus.textContent = "VOICE ERROR";
    }
  };

  Miles.recognition.onend = () => {
    Miles.listening = false;

    if (coreStatus) {
      coreStatus.textContent = "MILES IS STANDBY";
    }

    if (voiceButton) {
      voiceButton.textContent = "🎙 ACTIVATE VOICE";
    }
  };

  try {
    Miles.recognition.start();
  } catch (error) {
    addLog("VOICE INITIALIZATION FAILED");
  }
}

if (voiceButton) {
  voiceButton.addEventListener("click", initializeVoice);
}


// =====================================
// NETWORK CONNECTION
// =====================================

function updateConnection() {
  if (!connection) return;

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


// =====================================
// BATTERY MONITOR
// =====================================

async function updateBattery() {
  if (!battery) return;

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


// =====================================
// SIMULATED SYSTEM METRICS
// =====================================

function updateMetrics() {
  const cpuValue = Math.floor(Math.random() * 35) + 15;
  const memoryValue = Math.floor(Math.random() * 30) + 35;

  if (cpu) {
    cpu.textContent = cpuValue + "%";
  }

  if (memoryDisplay) {
    memoryDisplay.textContent = memoryValue + "%";
  }

  if (cpuBar) {
    cpuBar.style.width = cpuValue + "%";
  }

  if (memoryBar) {
    memoryBar.style.width = memoryValue + "%";
  }
}

updateMetrics();
setInterval(updateMetrics, 4000);


// =====================================
// INITIALIZATION
// =====================================

restoreChatHistory();

if (Miles.chatH
