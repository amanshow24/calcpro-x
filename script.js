const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const voiceBtn = document.getElementById("voice-btn");

let expression = "";
let recognition;

buttons.forEach((button) => {
  const value = button.getAttribute("data-value");

  button.addEventListener("click", () => {
    if (value === "C") {
      expression = "";
      display.value = "";
    } else if (value === "←") {
      expression = expression.slice(0, -1);
      display.value = expression;
    } else if (value === "=") {
      try {
        const result = eval(expression);
        display.value = result;
        expression = result.toString();
        speak(`Done! ${result}`);
      } catch {
        display.value = "Error";
        expression = "";
        speak("Error");
      }
    } else {
      expression += value;
      display.value = expression;
    }
  });
});

const speakMap = {
  "plus": "+",
  "addition": "+",
  "add": "+",
  "minus": "-",
  "subtract": "-",
  "subtraction": "-",
  "times": "*",
  "multiplied": "*",
  "multiply": "*",
  "into": "*",
  "divided": "/",
  "divide": "/",
  "over": "/",
  "equals": "=",
  "equal": "=",
  "clear": "C",
  "delete": "←"
};

voiceBtn.addEventListener("click", () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported. Use Chrome.");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    voiceBtn.innerText = "🛑";
    voiceBtn.title = "Mic On – Listening...";
    voiceBtn.classList.add("listening");
  };

  recognition.onend = () => {
    voiceBtn.innerText = "🎤";
    voiceBtn.title = "Mic Off – Click to speak";
    voiceBtn.classList.remove("listening");
  };

  recognition.onerror = (event) => {
    console.error("Mic error:", event.error);
    speak("Error");
  };

  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript.toLowerCase();
    const parsed = spoken
      .split(" ")
      .map(word => speakMap[word] || word)
      .join(" ")
      .replace("x", "*");

    if (parsed === "C") {
      expression = "";
      display.value = "";
      speak("Cleared");
      return;
    }

    if (parsed === "←") {
      expression = expression.slice(0, -1);
      display.value = expression;
      speak("Deleted");
      return;
    }

    if (parsed.includes("=")) {
      try {
        const result = eval(parsed.replace("=", ""));
        display.value = result;
        expression = result.toString();
        speak(`Done! ${result}`);
      } catch {
        display.value = "Error";
        expression = "";
        speak("Error");
      }
    } else {
      expression = parsed;
      display.value = expression;

      try {
        const result = eval(expression);
        display.value = result;
        expression = result.toString();
        speak(`Done! ${result}`);
      } catch {
        display.value = "Error";
        expression = "";
        speak("Error");
      }
    }
  };

  recognition.start();
});

// Voice output
function speak(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}
