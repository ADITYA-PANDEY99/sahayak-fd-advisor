/**
 * Voice Input Handler — Web Speech API
 *
 * Enables microphone-based speech input using the browser's built-in
 * Web Speech API. No external dependencies or API costs required.
 * Supports Hindi, Bhojpuri (via Hindi locale), and Marathi.
 */

'use strict';

const VoiceHandler = (() => {
  // Language code to BCP-47 locale mapping for Speech Recognition
  const LANG_LOCALES = {
    hi:  'hi-IN',  // Hindi (India)
    bho: 'hi-IN',  // Bhojpuri — uses Hindi locale (closest match)
    mr:  'mr-IN',  // Marathi (India)
    en:  'en-IN',  // English (India)
  };

  let recognition = null;
  let isListening = false;

  const voiceBtn = document.getElementById('btn-voice');

  /**
   * Check if the Web Speech API is available in this browser.
   * @returns {boolean}
   */
  function isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Initialize the SpeechRecognition instance with language and callbacks.
   * @param {string} language - App language code ('hi', 'bho', 'mr', 'en')
   */
  function init(language) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[VoiceHandler] Web Speech API not supported in this browser.');
      if (voiceBtn) voiceBtn.style.display = 'none';
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_LOCALES[language] || 'hi-IN';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      setListeningState(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(`[VoiceHandler] Recognized: "${transcript}"`);

      // Hand transcript to app.js via global callback
      if (typeof onVoiceTranscript === 'function') {
        onVoiceTranscript(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('[VoiceHandler] Recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow mic access and try again.');
      }
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };
  }

  /**
   * Toggle voice listening state.
   * @param {string} language - Current app language
   */
  function toggle(language) {
    if (!isSupported()) {
      alert('Voice input is not supported in your browser. Please use Chrome for this feature.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  }

  function startListening(language) {
    // Re-initialize with current language in case it changed
    init(language);
    if (!recognition) return;

    try {
      recognition.start();
    } catch (e) {
      console.error('[VoiceHandler] Could not start recognition:', e);
    }
  }

  function stopListening() {
    isListening = false;
    setListeningState(false);
    if (recognition) {
      try { recognition.stop(); } catch (_) { /* already stopped */ }
    }
  }

  /**
   * Update the microphone button visual state.
   * @param {boolean} active - Whether mic is currently listening
   */
  function setListeningState(active) {
    if (!voiceBtn) return;
    if (active) {
      voiceBtn.classList.add('listening');
      voiceBtn.setAttribute('title', 'Listening... click to stop');
      voiceBtn.setAttribute('aria-label', 'Stop voice input');
    } else {
      voiceBtn.classList.remove('listening');
      voiceBtn.setAttribute('title', 'Voice input — speak your question');
      voiceBtn.setAttribute('aria-label', 'Start voice input');
    }
  }

  // Public API
  return { toggle, isSupported };
})();
