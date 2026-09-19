// Web Speech Recognition API Wrapper supporting English and Hindi (hi-IN)

export function isSpeechSupported() {
  return typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export class VoiceAssistant {
  constructor({ lang = "en-IN", onResult, onStart, onEnd, onError }) {
    this.lang = lang;
    this.onResult = onResult;
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.onError = onError;
    this.recognition = null;
    this.isListening = false;

    this.init();
  }

  init() {
    if (!isSpeechSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStart) this.onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResult) {
        this.onResult({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (this.onError) this.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };
  }

  setLanguage(lang) {
    this.lang = lang;
    if (this.recognition) {
      const wasListening = this.isListening;
      if (wasListening) this.stop();
      this.recognition.lang = lang;
      if (wasListening) this.start();
    }
  }

  start() {
    if (!this.recognition) return;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Speech recognition already active:", e.message);
    }
  }

  stop() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn("Speech recognition stop error:", e.message);
    }
  }
}
