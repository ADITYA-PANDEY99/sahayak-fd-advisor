/**
 * Sahayak — Main Chat Application Logic
 *
 * Handles message rendering, API communication, conversation state,
 * quick action interactions, bank rate display, and modal coordination.
 * All code and comments are in English.
 */

'use strict';

// ─── Application State ───────────────────────────────────────────────────────

const state = {
  language: 'hi',
  userName: '',
  history: [],            // Conversation history for Gemini multi-turn
  isLoading: false,
  currentTenure: '1_year',
};

// ─── DOM References ───────────────────────────────────────────────────────────

const els = {
  messagesContainer: document.getElementById('messages-container'),
  messageInput:      document.getElementById('message-input'),
  btnSend:           document.getElementById('btn-send'),
  btnVoice:          document.getElementById('btn-voice'),
  typingIndicator:   document.getElementById('typing-indicator'),
  bankRatesList:     document.getElementById('bank-rates-list'),
  btnCalculatePlan:  document.getElementById('btn-calculate-plan'),
  planModal:         document.getElementById('plan-modal'),
  modalClose:        document.getElementById('modal-close'),
  modalBody:         document.getElementById('modal-body'),
  nameModal:         document.getElementById('name-modal'),
  userNameInput:     document.getElementById('user-name-input'),
  btnStartChat:      document.getElementById('btn-start-chat'),
  tenureTabs:        document.getElementById('tenure-tabs'),
};

// ─── Bank Logo Registry (Base64 SVG) ─────────────────────────────────────────
// All logos are Base64-encoded SVGs. This ensures they work in:
//   1. <img> tags in sidebar and plan cards
//   2. canvas ctx.drawImage() in the FD ladder chart (no CORS issues)

const BANK_LOGOS = {
  'SBI':         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzFCNEY5QiIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iMzYiIHI9IjE0IiBmaWxsPSJ3aGl0ZSIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iMzYiIHI9IjYiIGZpbGw9IiMxQjRGOUIiLz4KICA8cG9seWdvbiBwb2ludHM9IjQ1LDQ2IDU1LDQ2IDUzLDc0IDQ3LDc0IiBmaWxsPSJ3aGl0ZSIvPgogIDxyZWN0IHg9IjQwIiB5PSI3MiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjUiIHJ4PSIyIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
  'HDFC':        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNEM4RiIgcng9IjEwIi8+CiAgPHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIGZpbGw9IiNFRDFDMjQiLz4KICA8cmVjdCB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSI0MyIgeT0iMTIiIHdpZHRoPSIxNCIgaGVpZ2h0PSI3NiIgZmlsbD0iIzAwNEM4RiIvPgogIDxyZWN0IHg9IjEyIiB5PSI0MyIgd2lkdGg9Ijc2IiBoZWlnaHQ9IjE0IiBmaWxsPSIjMDA0QzhGIi8+Cjwvc3ZnPg==',
  'ICICI':       'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI0Y1ODIyMCIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iMzAiIHI9IjkiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3QgeD0iNDMiIHk9IjQ1IiB3aWR0aD0iMTQiIGhlaWdodD0iMzUiIHJ4PSIzIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
  'Post Office': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0M4MTAyRSIgcng9IjEwIi8+CiAgPCEtLSBDZW50cmFsIGdvbGRlbiBwb3N0YWwgZW52ZWxvcGUgb3ZlcmxhcHBpbmcgd2luZ3MgLS0+CiAgPHBvbHlnb24gcG9pbnRzPSIxNSw2NSAzNSwyNSA4NSwyNSA2NSw2NSIgZmlsbD0iI0ZGQ0MwMCIvPgogIDxwb2x5Z29uIHBvaW50cz0iMTUsNDUgMzUsNSA4NSw1IDY1LDQ1IiBmaWxsPSIjRkZDQzAwIiBvcGFjaXR5PSIwLjgiLz4KICA8cG9seWdvbiBwb2ludHM9IjE1LDg1IDM1LDQ1IDg1LDQ1IDY1LDg1IiBmaWxsPSIjRkZDQzAwIiBvcGFjaXR5PSIwLjYiLz4KPC9zdmc+',
  'AU SFB':      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0Y1OUUwQiIgcng9IjEwIi8+CiAgPHBhdGggZD0iTSA1MCAxNSBMIDg1IDUwIEwgNTAgODUgTCAxNSA1MCBaIiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik0gNTAgMzUgTCA2NSA1MCBMIDUwIDY1IEwgMzUgNTAgWiIgZmlsbD0iI0Y1OUUwQiIvPgo8L3N2Zz4=',
  'Unity SFB':   'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzNCMUY4QyIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjI1IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkI4MUMiIHN0cm9rZS13aWR0aD0iMTIiLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjI1IiByPSI2IiBmaWxsPSIjRkZCODFDIi8+Cjwvc3ZnPg==',
  'Jana SFB':    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzAwNEI4RCIvPgogIDxwYXRoIGQ9Ik0gMzUgNzAgQyAyNSA3MCAyNSA2MCAyNSA2MCBMIDM1IDYwIEMgMzUgNjAgMzUgNjMgNDMgNjMgTCA0MyAyNSBMIDUzIDI1IEwgNTMgNjMgQyA2NSA2MyA2NSA1MCA2NSA1MCBMIDc1IDUwIEMgNzUgNzAgNTUgNzAgMzUgNzAgWiIgZmlsbD0iI0Y1OUUwQiIvPgogIDxjaXJjbGUgY3g9IjY1IiBjeT0iNDAiIHI9IjciIGZpbGw9IiNGNTlFMEIiLz4KPC9zdmc+',
  'Suryoday SFB':'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI0YzNzAyMSIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNjUiIHI9IjIyIiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik0gNTAgMjUgTCA1NSAxNSBMIDQ1IDE1IFoiIGZpbGw9IndoaXRlIi8+CiAgPHBhdGggZD0iTSAyOCA0NSBMIDE1IDQwIEwgMjAgMzAgWiIgZmlsbD0id2hpdGUiLz4KICA8cGF0aCBkPSJNIDcyIDQ1IEwgODUgNDAgTCA4MCAzMCBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
};

// Returns a guaranteed-working logo URL for any bank short name.
// Base64 SVGs work in <img> tags AND Canvas ctx.drawImage() — zero CORS issues.
const popLogo = (bankShort) => {
  if (!bankShort) return BANK_LOGOS['SBI'];
  if (BANK_LOGOS[bankShort]) return BANK_LOGOS[bankShort];
  // Try partial match (e.g. "State Bank of India" → SBI)
  for (const key of Object.keys(BANK_LOGOS)) {
    if (bankShort.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(bankShort.toLowerCase())) {
      return BANK_LOGOS[key];
    }
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(bankShort)}&background=4F46E5&color=fff&bold=true&size=64`;
};



const getShortName = (fullName, providedShort) => {
  if (providedShort && providedShort !== fullName) return providedShort;
  const name = fullName || '';
  if (name.includes('State Bank')) return 'SBI';
  if (name.includes('HDFC')) return 'HDFC';
  if (name.includes('ICICI')) return 'ICICI';
  if (name.includes('Post Office')) return 'Post Office';
  if (name.includes('AU ')) return 'AU SFB';
  if (name.includes('Unity')) return 'Unity SFB';
  if (name.includes('Jana')) return 'Jana SFB';
  if (name.includes('Suryoday')) return 'Suryoday SFB';
  return name.split(' ')[0];
};


const localizeBankName = (name, lang) => {
  if (lang === 'en') return name;
  const map = {
    'SBI': { hi: 'एसबीआई', bho: 'एसबीआई', mr: 'एसबीआय' },
    'State Bank of India': { hi: 'स्टेट बैंक ऑफ इंडिया', bho: 'स्टेट बैंक ऑफ इंडिया', mr: 'स्टेट बँक ऑफ इंडिया' },
    'HDFC Bank': { hi: 'एचडीएफसी बैंक', bho: 'एचडीएफसी बैंक', mr: 'एचडीएफसी बँक' },
    'ICICI Bank': { hi: 'आईसीआईसीआई बैंक', bho: 'आईसीआईसीआई बैंक', mr: 'आयसीआयसीआय बँक' },
    'Post Office': { hi: 'पोस्ट ऑफिस', bho: 'पोस्ट ऑफिस', mr: 'पोस्ट ऑफिस' },
    'Post Office TD': { hi: 'पोस्ट ऑफिस टीडी', bho: 'पोस्ट ऑफिस टीडी', mr: 'पोस्ट ऑफिस टीडी' },
    'India Post (Post Office TD)': { hi: 'इंडिया पोस्ट (पोस्ट ऑफिस)', bho: 'इंडिया पोस्ट (पोस्ट ऑफिस)', mr: 'इंडिया पोस्ट (पोस्ट ऑफिस)' },
    'AU Small Finance Bank': { hi: 'एयू स्मॉल फाइनेंस बैंक', bho: 'एयू स्मॉल फाइनेंस बैंक', mr: 'एयू स्मॉल फायनान्स बँक' },
    'AU SFB': { hi: 'एयू बैंक', bho: 'एयू बैंक', mr: 'एयू बँक' },
    'Unity Small Finance Bank': { hi: 'यूनिटी स्मॉल फाइनेंस बैंक', bho: 'यूनिटी स्मॉल फाइनेंस बैंक', mr: 'युनिटी स्मॉल फायनान्स बँक' },
    'Unity SFB': { hi: 'यूनिटी बैंक', bho: 'यूनिटी बैंक', mr: 'युनिटी बँक' },
    'Jana Small Finance Bank': { hi: 'जना स्मॉल फाइनेंस बैंक', bho: 'जना स्मॉल फाइनेंस बैंक', mr: 'जना स्मॉल फायनान्स बँक' },
    'Jana SFB': { hi: 'जना बैंक', bho: 'जना बैंक', mr: 'जना बँक' },
    'Suryoday Small Finance Bank': { hi: 'सूर्योदय स्मॉल फाइनेंस बैंक', bho: 'सूर्योदय स्मॉल फाइनेंस बैंक', mr: 'सूर्योदय स्मॉल फायनान्स बँक' },
    'Suryoday SFB': { hi: 'सूर्योदय बैंक', bho: 'सूर्योदय बैंक', mr: 'सूर्योदय बँक' }
  };
  
  // Try exact match
  if (map[name] && map[name][lang]) return map[name][lang];
  
  // Try partial match for common names
  for (const key in map) {
    if (name.includes(key)) return map[key][lang];
  }
  
  return name;
};

// ─── Initialization ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  const savedTheme = localStorage.getItem('sahayak_theme_v2') || 'ocean';
  document.getElementById('theme-selector').value = savedTheme;
  switchTheme(savedTheme);
  
  // Show language modal first
  const langModal = document.getElementById('language-modal');
  if(langModal) langModal.removeAttribute('hidden');
});

function selectInitialLanguage(langCode) {
  // Update state
  state.language = langCode;

  // Sync the header lang pills active state
  document.querySelectorAll('.lang-pill').forEach(p => {
    const isActive = p.dataset.lang === langCode;
    p.classList.toggle('active', isActive);
    p.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    if (isActive && typeof LanguageManager !== 'undefined') {
      LanguageManager.positionSlider(p);
    }
  });

  // Apply all UI translations for the chosen language
  if (typeof LanguageManager !== 'undefined') {
    LanguageManager.applyLanguage(langCode);
  }

  // Update name modal text to match the selected language
  const nameTitles = {
    hi:  'स्वागत है! 🙏',
    bho: 'स्वागत बा! 🙏',
    mr:  'स्वागत आहे! 🙏',
    en:  'Welcome! 🙏',
  };
  const nameSubtitles = {
    hi:  'मैं रमेश भैया हूँ — आपका FD सलाहकार।<br/>आपका नाम बताएं ताकि मैं आपकी मदद कर सकूं।',
    bho: 'हमार नाम रमेश भैया बा — राउर FD सलाहकार।<br/>राउर नाम बताईं ताकि हम मदद कर सकीं।',
    mr:  'मी रमेश भाऊ आहे — तुमचा FD सल्लागार.<br/>तुमचे नाव सांगा म्हणजे मी तुम्हाला मदत करू शकेन.',
    en:  "I'm Ramesh Bhaiya — your FD advisor.<br/>Tell me your name so I can help you personally.",
  };
  const namePlaceholders = {
    hi: 'आपका नाम...', bho: 'राउर नाम...', mr: 'तुमचे नाव...', en: 'Your name...',
  };
  const startBtnText = {
    hi: 'शुरू करें →', bho: 'शुरु करीं →', mr: 'सुरू करा →', en: 'Start →',
  };
  const titleEl = document.getElementById('name-modal-title');
  const subtitleEl = document.querySelector('#name-modal .name-modal-subtitle');
  const placeholderEl = document.getElementById('user-name-input');
  const startBtn = document.getElementById('btn-start-chat');
  if (titleEl)    titleEl.textContent = nameTitles[langCode] || nameTitles.en;
  if (subtitleEl) subtitleEl.innerHTML = nameSubtitles[langCode] || nameSubtitles.en;
  if (placeholderEl) placeholderEl.placeholder = namePlaceholders[langCode] || namePlaceholders.en;
  if (startBtn)   startBtn.textContent = startBtnText[langCode] || startBtnText.en;

  // Hide language modal, show name modal
  const langModal = document.getElementById('language-modal');
  if (langModal) langModal.setAttribute('hidden', '');
  if (els.nameModal) els.nameModal.removeAttribute('hidden');
}

function switchTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sahayak_theme_v2', theme);
  const sel = document.getElementById('theme-selector');
  if (sel) sel.value = theme;
}

function setupEventListeners() {
  // Send message
  els.btnSend.addEventListener('click', handleSend);

  // Auto-resize textarea + enable/disable send button
  els.messageInput.addEventListener('input', () => {
    autoResizeTextarea(els.messageInput);
    els.btnSend.disabled = !els.messageInput.value.trim();
  });

  // Send on Enter (Shift+Enter for newline)
  els.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!els.btnSend.disabled) handleSend();
    }
  });

  // Voice input
  els.btnVoice.addEventListener('click', () => VoiceHandler.toggle(state.language));

  // Goal Planner
  els.btnCalculatePlan.addEventListener('click', handlePlanCalculation);

  // Close plan modal
  els.modalClose.addEventListener('click', closePlanModal);
  els.planModal.addEventListener('click', (e) => {
    if (e.target === els.planModal) closePlanModal();
  });

  // Name modal submit
  els.btnStartChat.addEventListener('click', handleNameSubmit);
  els.userNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleNameSubmit();
  });

  // Tenure tab switching
  els.tenureTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tenure-tab');
    if (tab) {
      document.querySelectorAll('.tenure-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      state.currentTenure = tab.dataset.tenure;
      loadBankRates(state.currentTenure);
    }
  });
}

// ─── Name Modal ───────────────────────────────────────────────────────────────

function handleNameSubmit() {
  const rawName = els.userNameInput.value.trim();
  if (!rawName) {
    els.userNameInput.style.borderColor = 'var(--danger)';
    setTimeout(() => { els.userNameInput.style.borderColor = ''; }, 1500);
    return;
  }

  // Convert Latin name to native script for address in welcome message
  state.userName = convertNameToScript(rawName, state.language);
  state.rawName  = rawName; // keep original for API calls
  els.nameModal.setAttribute('hidden', '');

  // Initialize app after name is set
  initializeApp();
}

/**
 * Converts an English-typed Indian name to its native script.
 * Uses a curated lookup dictionary for accuracy.
 * Falls back to original name if not found (better than garbled output).
 * @param {string} name - Raw English name input
 * @param {string} lang - Language code ('hi','bho','mr','en')
 * @returns {string} - Name in native script or original
 */
function convertNameToScript(name, lang) {
  if (lang === 'en') return name;

  // Comprehensive lookup dictionary — covers 200+ common Indian names
  // Devanagari works for Hindi, Bhojpuri AND Marathi (same script)
  const nameDict = {
    // A
    'aditya':    'आदित्य',  'aditi':    'अदिति',   'ajay':     'अजय',
    'ajit':      'अजीत',    'akash':    'आकाश',    'akhil':    'अखिल',
    'akshay':    'अक्षय',   'alka':     'अल्का',   'amit':     'अमित',
    'amita':     'अमिता',   'amitabh':  'अमिताभ',  'amol':     'अमोल',
    'anand':     'आनंद',    'anil':     'अनिल',    'anita':    'अनिता',
    'anjali':    'अंजली',   'ankita':   'अंकिता',  'ankit':    'अंकित',
    'anuj':      'अनुज',    'anurag':   'अनुराग',  'anushka':  'अनुष्का',
    'arjun':     'अर्जुन',  'arnav':    'अर्णव',   'arpita':   'अर्पिता',
    'aryan':     'आर्यन',   'asha':     'आशा',     'ashish':   'आशीष',
    'ashok':     'अशोक',    'asif':     'आसिफ',    'avni':     'अवनी',
    'ayush':     'आयुष',    'azhar':    'अज़हर',
    // B
    'babita':    'बबिता',   'balraj':   'बलराज',   'bharat':   'भरत',
    'bhushan':   'भूषण',    'bijay':    'विजय',    'bindu':    'बिंदु',
    'bipasha':   'बिपाशा',
    // C
    'chandra':   'चंद्र',   'chandni':  'चांदनी',
    // D
    'deepa':     'दीपा',    'deepak':   'दीपक',    'devika':   'देविका',
    'dhruv':     'ध्रुव',   'dinesh':   'दिनेश',   'divya':    'दिव्या',
    // G
    'gaurav':    'गौरव',    'gauri':    'गौरी',    'geeta':    'गीता',
    'girish':    'गिरीश',   'gopal':    'गोपाल',   'govind':   'गोविंद',
    'gulshan':   'गुलशन',   'gunjan':   'गुंजन',
    // H
    'hari':      'हरि',     'harish':   'हरीश',    'harsh':    'हर्ष',
    'harsha':    'हर्षा',   'hemant':   'हेमंत',   'hema':     'हेमा',
    'himanshu':  'हिमांशु',
    // I
    'ila':       'इला',     'isha':     'ईशा',     'ishaan':   'ईशान',
    'ishan':     'ईशान',
    // J
    'jagdish':   'जगदीश',   'jai':      'जय',      'jaya':     'जया',
    'jayesh':    'जयेश',    'jyoti':    'ज्योति',  'jyotika':  'ज्योतिका',
    // K
    'kamal':     'कमल',     'kamla':    'कमला',    'karan':    'करण',
    'kartik':    'कार्तिक', 'kavita':   'कविता',   'kavya':    'काव्या',
    'kiran':     'किरण',    'kirti':    'कीर्ति',  'komal':    'कोमल',
    'krishna':   'कृष्ण',   'kuldeep':  'कुलदीप',  'kunal':    'कुणाल',
    'kushagra':  'कुशाग्र',
    // L
    'lata':      'लता',     'latika':   'लतिका',   'lavanya':  'लावण्या',
    'lokesh':    'लोकेश',
    // M
    'madhav':    'माधव',    'madhuri':  'माधुरी',  'mahesh':   'महेश',
    'manav':     'मानव',    'manisha':  'मनीषा',   'manish':   'मनीष',
    'manju':     'मंजू',    'manjula':  'मंजुला',  'meena':    'मीना',
    'meenu':     'मीनू',    'mihir':    'मिहिर',   'mohan':    'मोहन',
    'mohit':     'मोहित',   'mona':     'मोना',    'mukesh':   'मुकेश',
    'munna':     'मुन्ना',
    // N
    'namrata':   'नम्रता',  'nandini':  'नंदिनी',  'narayan':  'नारायण',
    'naresh':    'नरेश',    'naveen':   'नवीन',    'neema':    'नीमा',
    'neha':      'नेहा',    'nikhil':   'निखिल',   'nikita':   'निकिता',
    'nilesh':    'नीलेश',   'niraj':    'नीरज',    'nisha':    'निशा',
    'nitesh':    'नितेश',
    // P
    'pallavi':   'पल्लवी',  'pankaj':   'पंकज',    'parag':    'पराग',
    'payal':     'पायल',    'pooja':    'पूजा',    'poonam':   'पूनम',
    'pradeep':   'प्रदीप',  'prakash':  'प्रकाश',  'prashant': 'प्रशांत',
    'pratik':    'प्रतीक',  'pratima':  'प्रतिमा', 'prerna':   'प्रेरणा',
    'priti':     'प्रीति',  'priya':    'प्रिया',  'priyansh': 'प्रियांश',
    'punit':     'पुनीत',
    // R
    'rahul':     'राहुल',   'raj':      'राज',     'rajat':    'रजत',
    'rajesh':    'राजेश',   'rajesh':   'राजेश',   'raju':     'राजू',
    'rakesh':    'राकेश',   'rama':     'रमा',     'ramesh':   'रमेश',
    'randhir':   'रणधीर',   'ravi':     'रवि',     'ravindra': 'रवींद्र',
    'reena':     'रीना',    'rekha':    'रेखा',    'ritesh':   'रितेश',
    'rohit':     'रोहित',   'rohan':    'रोहन',    'riya':     'रिया',
    // S
    'sahil':     'साहिल',   'samir':    'समीर',    'sanjay':   'संजय',
    'sandhya':   'संध्या',  'sangeeta': 'संगीता',  'sanjana':  'संजना',
    'santosh':   'संतोष',   'sapna':    'सपना',    'sarita':   'सरिता',
    'saurabh':   'सौरभ',    'seema':    'सीमा',    'shailesh': 'शैलेश',
    'shalu':     'शालू',    'sharma':   'शर्मा',   'shefali':  'शेफाली',
    'shikha':    'शिखा',    'shilpa':   'शिल्पा',  'shreya':   'श्रेया',
    'shruti':    'श्रुति',  'shweta':   'श्वेता',  'sid':      'सिद',
    'siddharth': 'सिद्धार्थ','simran':   'सिमरन',  'sneha':    'स्नेहा',
    'sonam':     'सोनम',    'sonal':    'सोनल',    'sonali':   'सोनाली',
    'sudhir':    'सुधीर',   'sumit':    'सुमित',   'sunita':   'सुनीता',
    'suraj':     'सूरज',    'suresh':   'सुरेश',   'swati':    'स्वाति',
    // T
    'tanvi':     'तन्वी',   'tarun':    'तरुण',    'tejas':    'तेजस',
    'trishna':   'तृष्णा',
    // U
    'uday':      'उदय',     'umesh':    'उमेश',    'usha':     'उषा',
    // V
    'vaibhav':   'वैभव',    'vandana':  'वंदना',   'varsha':   'वर्षा',
    'vikas':     'विकास',   'vikram':   'विक्रम',  'vimal':    'विमल',
    'vineeta':   'विनीता',  'vinit':    'विनीत',   'vinod':    'विनोद',
    'vishal':    'विशाल',   'vivek':    'विवेक',
    // Y
    'yash':      'यश',      'yogesh':   'योगेश',   'yogita':   'योगिता',
    // Z
    'zara':      'ज़ारा',
  };

  // Convert each word of the name separately
  const converted = name.trim().split(/\s+/).map(word => {
    const key = word.toLowerCase();
    return nameDict[key] || word; // Return original word if not in dict
  }).join(' ');

  return converted;
}

function initializeApp() {
  loadBankRates(state.currentTenure);
  showWelcomeMessage();
}

// ─── Welcome Message ──────────────────────────────────────────────────────────

function showWelcomeMessage() {
  const welcomes = {
    hi:  `नमस्ते **${state.userName} जी**! 🙏\n\nमैं रमेश भैया हूँ — आपका भरोसेमंद सावधि जमा (FD) सलाहकार। मैं आपको सावधि जमा यानी Fixed Deposits के बारे में समझाता हूँ — बिल्कुल आसान भाषा में, बिना किसी मुश्किल शब्दों के।\n\nबताएं, आज मैं आपकी क्या मदद कर सकता हूँ? क्या कोई FD समझनी है, या किसी बैंक के बारे में जानना चाहते हैं?`,
    bho: `प्रणाम **${state.userName} जी**! 🙏\n\nहमार नाम रमेश भैया बा — राउर भरोसेमंद बचत सलाहकार। सावधि जमा माने फिक्स्ड डिपॉजिट के बारे में कुछु भी पूछीं — बिल्कुल आसान भोजपुरी में समझाईं। जइसे मसाला चाय बनावे में समय लागेला, वइसहीं पइसा फिक्स करे पर ब्याज मिलेला! ☕\n\nबताईं, आज का जाने के मन बा?`,
    mr:  `नमस्कार **${state.userName} जी**! 🙏\n\nमी रमेश भाऊ आहे — तुमचा विश्वासू मुदत ठेव (FD) सल्लागार. मुदत ठेव म्हणजे Fixed Deposit बद्दल काहीही विचारा — सहज मराठीत सांगतो.\n\nसांगा, आज कशात मदत हवी?`,
    en:  `Hello **${state.userName}**! 🙏\n\nI'm Ramesh Bhaiya — your trusted Fixed Deposit (FD) advisor. I'm here to make FDs easy to understand, without any confusing jargon.\n\nWhat would you like to know today?`,
  };

  const welcomeActions = {
    hi: ['FD क्या होता है?', 'सबसे अच्छा रेट कौन सा बैंक देता है?', 'मैं एक गोल प्लान करना चाहता हूँ'],
    bho: ['FD के मतलब का बा?', 'सबसे बढ़िया रेट कवन बैंक देला?', 'गोल प्लान बनावे के बा'],
    mr: ['FD म्हणजे काय?', 'सर्वात चांगले रेट्स कोणती बँक देते?', 'मला एक गोल प्लॅन करायचा आहे'],
    en: ['What is a Fixed Deposit?', 'Which bank gives the best rates?', 'I want to plan a goal'],
  };

  appendAdvisorMessage(
    welcomes[state.language] || welcomes.hi,
    'NEUTRAL',
    welcomeActions[state.language] || welcomeActions.hi
  );
}

/**
 * Re-render the welcome message when language flips, 
 * but only if the user hasn't sent any messages yet.
 */
function reRenderWelcomeIfChatNotStarted() {
  if (state.history.length === 0 && state.userName) {
    // Clear out the previous welcome message
    els.messagesContainer.innerHTML = '';
    // Optional: Keep typing indicator if present, but since it's hidden normally:
    els.messagesContainer.appendChild(els.typingIndicator);
    
    showWelcomeMessage();
  }
}

// ─── Message Handling ─────────────────────────────────────────────────────────

async function handleSend() {
  const text = els.messageInput.value.trim();
  if (!text || state.isLoading) return;

  // Render user message
  appendUserMessage(text);

  // Add to history
  state.history.push({ role: 'user', content: text });

  // Clear input
  els.messageInput.value = '';
  els.messageInput.style.height = '';
  els.btnSend.disabled = true;

  // Show typing indicator
  showTyping();
  state.isLoading = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        language: state.language,
        history: state.history.slice(-12),  // Last 6 turns
        user_name: state.userName,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // Add AI response to history
    state.history.push({ role: 'assistant', content: data.reply });

    hideTyping();
    appendAdvisorMessage(data.reply, data.emotion_detected, data.quick_actions, data.ladder_plan);

    // If ladder plan was generated, automatically show modal and render chart
    if (data.ladder_plan && data.ladder_plan.slices) {
      if (els.planModal) {
        els.planModal.removeAttribute('hidden');
        if (typeof FDChart !== 'undefined') {
          const devanagariNumber = (num) => {
            if (state.language === 'en') return num;
            const str = num.toString();
            const map = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
            return str.replace(/[0-9]/g, d => map[d]);
          };
          const STR_MO = {hi:'महीने', bho:'महिना', mr:'महीने', en:'mo'}[state.language] || 'mo';
          const labels = data.ladder_plan.slices.map(s => {
             const bName = localizeBankName(getShortName(s.bank_name, s.bank_short_name), state.language);
             return `${bName} · ${devanagariNumber(s.tenure_months)} ${STR_MO}`;
          });
          const logoUrls = data.ladder_plan.slices.map(s => popLogo(getShortName(s.bank_name, s.bank_short_name)));
          FDChart.renderLadder(data.ladder_plan.slices, state.language, logoUrls, labels);
        }
      }
    }

  } catch (error) {
    console.error('[Sahayak] Chat error:', error);
    hideTyping();
    appendAdvisorMessage(
      'Sorry, technical issue aa gayi. Thodi der baad try karein.',
      'NEUTRAL',
      [],
      null
    );
  } finally {
    state.isLoading = false;
  }
}

// ─── Message Rendering ────────────────────────────────────────────────────────

/**
 * Append an advisor (AI) message bubble to the chat.
 * @param {string} text - Message text (supports **bold**)
 * @param {string} emotion - Detected emotion for badge display
 * @param {string[]} quickActions - Follow-up action button labels
 * @param {Object} planData - Internal laddering plan to display
 */
function appendAdvisorMessage(text, emotion = 'NEUTRAL', quickActions = [], planData = null) {
  const div = document.createElement('div');
  div.className = 'message advisor';

  const emotionBadge = (emotion && emotion !== 'NEUTRAL')
    ? `<span class="emotion-badge ${emotion}">${emotionEmoji(emotion)} ${emotion}</span>`
    : '';

  const actionsHtml = quickActions.length > 0
    ? `<div class="quick-actions">
        ${quickActions.map(a =>
          `<button class="quick-action-btn" onclick="sendQuickAction('${escapeAttr(a)}')">${escapeHtml(a)}</button>`
        ).join('')}
       </div>`
    : '';

  let planEmbedHtml = '';
  if (planData && planData.slices) {
    const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    const lang = state.language;
    const STR_PA = {hi: 'सालाना', bho: 'सालाना', mr: 'वार्षिक', en: 'p.a.'};
    const STR_MO = {hi: 'महीने', bho: 'महिना', mr: 'महिने', en: 'months'};
    const STR_ON = {hi: 'जमा:', bho: 'जमा:', mr: 'जमा:', en: 'on'};
    
    // Quick inline translators for embedded presentation
    const tLabel = (l) => {
      let r=l;
      if(lang!=='en') {
        r=r.replace('Single FD — Full amount at maturity', lang==='hi'?'एकल FD':'एकच FD');
        r=r.replace(/Tranche \d+ — .*/, lang==='hi'?'हिस्सा':'टप्पा');
      }
      return escapeHtml(r);
    };
      
    const slicesHtml = planData.slices.map((slice, i) => {
      const bankDisplayName = localizeBankName(slice.bank_name, lang);
      const logoUrl = popLogo(slice.bank_short_name || slice.bank_name);
      
      return `
      <div class="plan-slice-card" style="margin-top:8px; animation-delay:${i * 0.1}s; padding:12px; background:rgba(0,0,0,0.1); border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
          <div style="width:28px; height:28px; border-radius:50%; overflow:hidden; background:white; display:flex; align-items:center; justify-content:center; padding:2px; flex-shrink:0;">
            <img src="${logoUrl}" style="max-width:100%; max-height:100%; object-fit:contain;">
          </div>
          <div class="slice-left" style="display:flex; flex-direction:column; gap:2px;">
            <span class="slice-bank" style="font-weight:600; color:var(--text-light); font-size:0.9rem;">${escapeHtml(bankDisplayName)}</span>
            <span class="slice-label" style="font-size:0.75rem; color:var(--text-muted);">${tLabel(slice.label)} · ${slice.tenure_months} ${STR_MO[lang]||'months'} · ${slice.annual_rate}% ${STR_PA[lang]||'p.a.'}</span>
          </div>
        </div>
        <div class="slice-right" style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; margin-top:8px;">
          <span class="slice-maturity" style="color:var(--success); font-weight:600;">Return: ${fmt(slice.maturity_amount)}</span>
          <div class="slice-rate" style="font-size:0.75rem; color:var(--text-muted);">${STR_ON[lang]||'on'} ${fmt(slice.principal)}</div>
        </div>
      </div>
    `;}).join('');
    
    let aiInsightHtml = '';
    if (planData.slices.length > 0) {
      let topRateSlice = planData.slices.reduce((prev, current) => (prev.annual_rate > current.annual_rate) ? prev : current);
      let safestSlice = planData.slices.find(s => s.bank_name.includes('SBI') || s.bank_name.includes('Post Office')) || planData.slices[0];
      
      const insightHeading = {hi:"🤖 निष्पक्ष सलाह", bho:"🤖 हमार साफ-साफ सलाह", mr:"🤖 निष्पक्ष सल्ला", en:"🤖 Unbiased AI Insight"}[lang] || "🤖 AI Insight";
      const insightText = {
        hi:`सबसे ज़्यादा रिटर्न के लिए <img src="${popLogo(topRateSlice.bank_short_name)}" style="width:16px;height:16px;vertical-align:middle;border-radius:50%;background:white;padding:2px;"> <b>${topRateSlice.bank_name}</b> सबसे उचित है (${topRateSlice.annual_rate}%), लेकिन अगर आप 100% सुरक्षा चाहते हैं तो <img src="${popLogo(safestSlice.bank_short_name)}" style="width:16px;height:16px;vertical-align:middle;border-radius:50%;background:white;padding:2px;"> <b>${safestSlice.bank_name}</b> को चुनें। छोटे बैंकों में सारा पैसा टालने से बचें।`,
        bho:`अगर रउवा सबसे जादे फायदा चाहीं त <img src="${popLogo(topRateSlice.bank_short_name)}" style="width:16px;height:16px;vertical-align:middle;border-radius:50%;background:white;padding:2px;"> <b>${topRateSlice.bank_name}</b> में डालीं (${topRateSlice.annual_rate}%), बाकिर पूरा गारंटी खातिर <img src="${popLogo(safestSlice.bank_short_name)}" style="width:16px;height:16px;vertical-align:middle;border-radius:50%;background:white;padding:2px;"> <b>${safestSlice.bank_name}</b> सबसे बढ़िया बा। छोटका बैंक में एकठ्ठे पइसा बचावल ठीक ना होला।`,
        mr:`सर्वाधिक परताव्याससाठी <b>${topRateSlice.bank_name}</b> योग्य आहे (${topRateSlice.annual_rate}%), परंतु 100% सुरक्षिततेसाठी <b>${safestSlice.bank_name}</b> निवडा. जास्त जोखमीच्या बँकांमध्ये गुंतवणूक टाळा.`,
        en:`For the highest yield, <b>${topRateSlice.bank_name}</b> is optimal (${topRateSlice.annual_rate}%), but for 100% security, allocate to <b>${safestSlice.bank_name}</b>. Avoid dumping all funds in lower-trust banks.`
      }[lang] || "AI Recommended strategy generated.";
      
      aiInsightHtml = `<div style="margin-top:12px; padding:10px; background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); border-radius:8px; font-size:0.8rem; line-height:1.4;">
        <div style="font-weight:bold; color:var(--purple); margin-bottom:4px;">${insightHeading}</div>
        <div style="color:var(--text-secondary);">${insightText}</div>
      </div>`;
    }

    const planHeading = {
      hi: '✨ आपका FD प्लान', bho: '✨ राउर बचत योजना', mr: '✨ तुमचा FD प्लॅन', en: '✨ YOUR FD PLAN'
    }[lang] || '✨ YOUR FD PLAN';
    const viewChartBtn = {
      hi: 'विस्तृत चार्ट और रणनीति देखें →', bho: 'पूरा चार्ट और रणनीति देखीं →',
      mr: 'तपशीलवार चार्ट आणि धोरण पहा →', en: 'View Detailed Charts & Strategy →'
    }[lang] || 'View Detailed Charts & Strategy →';

    planEmbedHtml = `<div class="in-chat-plan" style="margin-top: 16px;">
      <div style="font-size:0.8rem; font-weight:600; letter-spacing:0.5px; margin-bottom:8px; color:var(--accent-gold);">${planHeading}</div>
      ${slicesHtml}
      ${aiInsightHtml}
      <button onclick="openPlanModal()" style="margin-top:8px; width:100%; padding:8px; border-radius:8px; background:var(--accent-gold); color:var(--text-inverse); font-weight:bold; border:none; cursor:pointer;">${viewChartBtn}</button>
    </div>`;
    
    // Auto trigger the global modal
    setTimeout(() => {
        renderPlanModal(planData);
        openPlanModal();
    }, 500);
  }

  const avatarText = state.language === 'en' ? 'RB' : 'रब';
  div.innerHTML = `
    <div class="message-avatar">${avatarText}</div>
    <div class="message-content">
      ${emotionBadge}
      <div class="message-bubble">
         ${formatMarkdown(text)}
         ${planEmbedHtml}
      </div>
      ${actionsHtml}
      <span class="message-time">${currentTime()}</span>
    </div>
  `;

  els.messagesContainer.appendChild(div);
  scrollToBottom();
}

/**
 * Append a user message bubble to the chat.
 * @param {string} text - Raw user message text
 */
function appendUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'message user';

  const initials = state.userName
    ? state.userName.charAt(0).toUpperCase()
    : '?';

  div.innerHTML = `
    <div class="message-avatar">${escapeHtml(initials)}</div>
    <div class="message-content">
      <div class="message-bubble">${escapeHtml(text)}</div>
      <span class="message-time">${currentTime()}</span>
    </div>
  `;

  els.messagesContainer.appendChild(div);
  scrollToBottom();
}

/**
 * Handle a quick action button click — send as a chat message.
 * @param {string} text - The quick action label
 */
function sendQuickAction(text) {
  els.messageInput.value = text;
  els.btnSend.disabled = false;
  handleSend();
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function showTyping() {
  const tAvatar = els.typingIndicator.querySelector('.typing-avatar');
  if (tAvatar) {
    tAvatar.textContent = state.language === 'en' ? 'RB' : 'रब';
  }
  els.typingIndicator.removeAttribute('hidden');
  els.messagesContainer.appendChild(els.typingIndicator);
  scrollToBottom();
}

function hideTyping() {
  els.typingIndicator.setAttribute('hidden', '');
}

// ─── Bank Rates ───────────────────────────────────────────────────────────────

async function loadBankRates(tenure) {
  // Show skeleton
  els.bankRatesList.innerHTML = `
    <div class="rate-skeleton"></div>
    <div class="rate-skeleton"></div>
    <div class="rate-skeleton"></div>
    <div class="rate-skeleton"></div>
  `;

  try {
    const res = await fetch(`/api/banks?tenure=${tenure}`);
    const data = await res.json();
    renderBankRates(data.banks);
  } catch (e) {
    console.error('[Sahayak] Failed to load bank rates:', e);
    els.bankRatesList.innerHTML = '<p style="color:var(--text-muted);font-size:0.75rem;padding:8px;">Could not load rates.</p>';
  }
}

/**
 * Render bank rate cards in the sidebar.
 * @param {Object[]} banks - Array of bank data objects
 */
function renderBankRates(banks) {
  const devanagariNumber = (num, lang) => {
    if (lang === 'en') return num;
    const str = num.toString();
    const map = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return str.replace(/[0-9]/g, d => map[d]);
  };


  els.bankRatesList.innerHTML = '';
  const tooltip = document.getElementById('rich-tooltip');

  banks.forEach((bank, index) => {
    const card = document.createElement('div');
    card.className = 'bank-rate-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${bank.name}: ${bank.rate}% per annum`);

    const trustColor = bank.trust_score >= 9 ? 'var(--success)' :
                       bank.trust_score >= 7.5 ? 'var(--warning)' : 'var(--accent-ember)';

    let mappedTrust = escapeHtml(bank.trust_label);
    let mappedPa = "p.a.";
    
    if (state.language === 'hi') {
       mappedPa = "सालाना";
       if (mappedTrust === 'Highest Safety') mappedTrust = 'सर्वोच्च सुरक्षा';
       if (mappedTrust === 'Very High Safety') mappedTrust = 'बहुत उच्च सुरक्षा';
       if (mappedTrust === 'High Safety (up to ₹5L)') mappedTrust = 'उच्च सुरक्षा (₹5L तक)';
       if (mappedTrust === 'Good Safety (up to ₹5L)') mappedTrust = 'अच्छी सुरक्षा (₹5L तक)';
       if (mappedTrust === 'Sovereign Guarantee') mappedTrust = 'सरकारी गारंटी';
    } else if (state.language === 'bho') {
       mappedPa = "सालाना";
       if (mappedTrust === 'Highest Safety') mappedTrust = 'सबसे बड़हन सुरक्षा';
       if (mappedTrust === 'Very High Safety') mappedTrust = 'बहुत नीमन सुरक्षा';
       if (mappedTrust === 'High Safety (up to ₹5L)') mappedTrust = 'ठीक सुरक्षा (₹5L ले)';
       if (mappedTrust === 'Good Safety (up to ₹5L)') mappedTrust = 'बड़हन सुरक्षा (₹5L ले)';
       if (mappedTrust === 'Sovereign Guarantee') mappedTrust = 'सरकारी गारंटी';
    } else if (state.language === 'mr') {
       mappedPa = "वार्षिक";
       if (mappedTrust === 'Highest Safety') mappedTrust = 'सर्वोच्च सुरक्षा';
       if (mappedTrust === 'Very High Safety') mappedTrust = 'अति उच्च सुरक्षा';
       if (mappedTrust === 'High Safety (up to ₹5L)') mappedTrust = 'उच्च सुरक्षा (₹5L पर्यंत)';
       if (mappedTrust === 'Good Safety (up to ₹5L)') mappedTrust = 'चांगली सुरक्षा (₹5L पर्यंत)';
       if (mappedTrust === 'Sovereign Guarantee') mappedTrust = 'सरकारी हमी';
    } else if (state.language === 'en') {
       if (mappedTrust === 'Highest Safety') mappedTrust = 'Highest Safety';
       if (mappedTrust === 'Very High Safety') mappedTrust = 'Very High Safety';
    }

    const localizedName = escapeHtml(localizeBankName(bank.short, state.language));
    const localizedRate = devanagariNumber(bank.rate.toFixed(2), state.language);
    const logoUrl = popLogo(bank.short);
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(bank.short)}&background=random`;

    card.innerHTML = `
      <div class="bank-card-left" style="display:flex; flex-direction:row; align-items:center; gap:12px; text-align:left;">
        <div class="bank-logo-wrap" style="width:40px; height:40px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:white; border-radius:50%; border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
          <img src="${logoUrl}" alt="logo" style="width:36px; height:36px; object-fit:contain; padding:2px;">
        </div>
        <div>
          <span class="bank-short-name" style="display:block;">${localizedName}</span>
          <div class="bank-trust-badge">
            <span class="trust-dot" style="background:${trustColor}"></span>
            <span>${mappedTrust}</span>
          </div>
        </div>
      </div>
      <div class="bank-card-right">
        <span class="bank-rate-value">${localizedRate}%</span>
        <span class="bank-rate-unit">${mappedPa}</span>
      </div>
    `;

    // Tooltip Hover Logic
    const fullDesc = {
      hi: `यह बैंक ${mappedTrust} के साथ 1 साल के लिए ${localizedRate}% ब्याज देता है। क्लिक करके रमेश भैया से इसके बारे में पूछें।`,
      bho: `ई बैंक ${mappedTrust} के साथ 1 साल खातिर ${localizedRate}% ब्याज देला। क्लिक करीं आ रमेश भैया से पूछीं।`,
      mr: `ही बँक ${mappedTrust} सह 1 वर्षासाठी ${localizedRate}% व्याज देते. रमेश भाऊंना विचारण्यासाठी क्लिक करा.`,
      en: `This bank offers ${localizedRate}% p.a. with ${mappedTrust}. Click to ask Ramesh Bhaiya for more details.`
    }[state.language] || `Detailed info for ${bank.name}`;

    card.addEventListener('mouseenter', (e) => {
      if(!tooltip) return;
      tooltip.style.display = 'block';
      tooltip.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <img src="${logoUrl}" style="width:24px; height:24px; border-radius:50%; object-fit:contain; background:white; padding:2px;">
          <div style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${localizedName}</div>
        </div>
        <div style="font-size:0.75rem; color:var(--text-secondary);">${fullDesc}</div>
      `;
      // Position tooltip near card
      const rect = card.getBoundingClientRect();
      let top = rect.top + window.scrollY;
      let left = rect.right + 15;
      
      // Keep within viewport height
      if (top + 100 > window.innerHeight) top -= 50;
      
      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
      card.style.transition = 'all 0.2s';
    });

    card.addEventListener('mouseleave', () => {
      if(!tooltip) return;
      tooltip.style.display = 'none';
      card.style.transform = '';
      card.style.boxShadow = '';
    });

    // Click to ask Ramesh Bhaiya about this bank
    card.addEventListener('click', () => {
      let query;
      if (state.language === 'hi') {
        query = `मुझे ${bank.name} FD के बारे में विस्तार से बताएं, और अगर मैं 1 लाख जमा करूँ तो क्या फायदा होगा?`;
      } else if (state.language === 'bho') {
        query = `हमरा के ${bank.name} FD के बारे में बताईं, 1 लाख जमा करे पर का मिली?`;
      } else if (state.language === 'mr') {
        query = `मला ${bank.name} FD बद्दल सांगा, 1 लाख जमा केल्यास किती फायदा होईल?`;
      } else {
        query = `Tell me about ${bank.name} FD — is it safe and what rate does it give?`;
      }
      els.messageInput.value = query;
      els.btnSend.disabled = false;
      handleSend();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });

    els.bankRatesList.appendChild(card);
  });
}

// ─── Goal Planner ─────────────────────────────────────────────────────────────

async function handlePlanCalculation() {
  const goalAmount    = parseFloat(document.getElementById('goal-amount').value);
  const availableFunds = parseFloat(document.getElementById('available-funds').value);
  const monthsToGoal  = parseInt(document.getElementById('months-to-goal').value, 10);

  if (!goalAmount || !availableFunds || !monthsToGoal) {
    alert('Please fill in all three fields to calculate your plan.');
    return;
  }

  const calcBtnText = {
    hi: 'गणना हो रही है...', bho: 'हिसाब लागाइल जा रहल बा...', mr: 'गणना होत आहे...', en: 'Calculating...'
  }[state.language] || 'Calculating...';
  els.btnCalculatePlan.textContent = calcBtnText;
  els.btnCalculatePlan.disabled = true;

  try {
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal_amount: goalAmount, available_funds: availableFunds, months_to_goal: monthsToGoal }),
    });

    const data = await res.json();
    renderPlanModal(data.plan);
    openPlanModal();

  } catch (e) {
    console.error('[Sahayak] Plan error:', e);
    alert('Could not calculate plan. Please try again.');
  } finally {
    els.btnCalculatePlan.textContent = 'Calculate Plan ✨';
    els.btnCalculatePlan.disabled = false;
  }
}

/**
 * Render the FD laddering plan inside the modal.
 * @param {Object} plan - Plan data from /api/plan
 */
function renderPlanModal(plan) {
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const isSuccess = plan.goal_achievable;
  const lang = state.language;

  const STR = {
    months: {hi: 'महीने', bho: 'महीना', mr: 'महिने', en: 'months'},
    pa: {hi: 'सालाना', bho: 'सालाना', mr: 'वार्षिक', en: 'p.a.'},
    on: {hi: 'जमा:', bho: 'जमा:', mr: 'जमा:', en: 'on'},
    your_goal: {hi: 'आपका लक्ष्य', bho: 'राउर लक्ष्य', mr: 'तुमचे ध्येय', en: 'Your Goal'},
    you_invest: {hi: 'आपकी जमा राशि', bho: 'राउर जमा', mr: 'तुमची गुंतवणूक', en: 'You Invest'},
    total_return: {hi: 'कुल वापसी', bho: 'कुल वापसी', mr: 'एकूण परतावा', en: 'Total Return'},
  };

  // Build localized strategy note
  let noteHtml = escapeHtml(plan.strategy_note);
  if (lang === 'hi') {
     if (isSuccess) noteHtml = `आपका प्लान ₹${plan.goal_amount.toLocaleString('en-IN')} के लक्ष्य के मुकाबले ₹${plan.total_maturity_value.toLocaleString('en-IN')} की वापसी देगा — ₹${plan.surplus.toLocaleString('en-IN')} का सरप्लस।`;
     else noteHtml = `वर्तमान निवेश के साथ, आप ₹${plan.total_maturity_value.toLocaleString('en-IN')} जमा करेंगे। ₹${plan.goal_amount.toLocaleString('en-IN')} का लक्ष्य पूरा करने के लिए, ₹${plan.shortfall.toLocaleString('en-IN')} और निवेश करने या समय बढ़ाने पर विचार करें।`;
  } else if (lang === 'bho') {
     if (isSuccess) noteHtml = `राउर प्लान ₹${plan.goal_amount.toLocaleString('en-IN')} के लक्ष्य के मुकाबले ₹${plan.total_maturity_value.toLocaleString('en-IN')} दी — ₹${plan.surplus.toLocaleString('en-IN')} के फायदा।`;
     else noteHtml = `अभी के जमा से रउवा ₹${plan.total_maturity_value.toLocaleString('en-IN')} मिली। ₹${plan.goal_amount.toLocaleString('en-IN')} के लक्ष्य खातिर, ₹${plan.shortfall.toLocaleString('en-IN')} अउरी जमा करे के पड़ी।`;
  } else if (lang === 'mr') {
     if (isSuccess) noteHtml = `तुमचा प्लॅन ₹${plan.goal_amount.toLocaleString('en-IN')} च्या ध्येयाच्या तुलनेत ₹${plan.total_maturity_value.toLocaleString('en-IN')} परतावा देईल — ₹${plan.surplus.toLocaleString('en-IN')} चा नफा.`;
     else noteHtml = `सध्याच्या गुंतवणुकीसह तुम्हाला ₹${plan.total_maturity_value.toLocaleString('en-IN')} मिळतील. ₹${plan.goal_amount.toLocaleString('en-IN')} चे ध्येय गाठण्यासाठी, आणखी ₹${plan.shortfall.toLocaleString('en-IN')} गुंतवण्याचा किंवा वेळ वाढवण्याचा विचार करा.`;
  }

  // Localize Slice labels
  const localizeLabel = (label) => {
    let l = label;
    if (lang === 'hi') {
      l = l.replace('Single FD — Full amount at maturity', 'एकल FD — मैच्योरिटी पर पूरी राशि');
      l = l.replace('Tranche 1 — Mid-milestone liquidity', 'हिस्सा 1 — बीच के समय के लिए');
      l = l.replace('Tranche 2 — Goal maturity', 'हिस्सा 2 — लक्ष्य पूरा होने पर');
      l = l.replace('Tranche 1 — Early liquidity checkpoint', 'हिस्सा 1 — शुरुआती समय के लिए');
      l = l.replace('Tranche 2 — Mid-goal milestone', 'हिस्सा 2 — बीच के समय के लिए');
      l = l.replace('Tranche 3 — Final goal maturity', 'हिस्सा 3 — लक्ष्य पूरा होने पर');
    } else if (lang === 'bho') {
      l = l.replace('Single FD — Full amount at maturity', 'सिंगल FD — पूरा पइसा ओहि टाइम');
      l = l.replace('Tranche 1 — Mid-milestone liquidity', 'किस्त 1 — बीच के समय खातिर');
      l = l.replace('Tranche 2 — Goal maturity', 'किस्त 2 — लक्ष्य पूरा भइला पर');
      l = l.replace('Tranche 1 — Early liquidity checkpoint', 'किस्त 1 — शुरुवाती समय खातिर');
      l = l.replace('Tranche 2 — Mid-goal milestone', 'किस्त 2 — बीच के समय खातिर');
      l = l.replace('Tranche 3 — Final goal maturity', 'किस्त 3 — लक्ष्य पूरा भइला पर');
    } else if (lang === 'mr') {
      l = l.replace('Single FD — Full amount at maturity', 'एकच FD — मुदतीनंतर पूर्ण रक्कम');
      l = l.replace('Tranche 1 — Mid-milestone liquidity', 'टप्पा 1 — मध्य-मुदतीसाठी');
      l = l.replace('Tranche 2 — Goal maturity', 'टप्पा 2 — ध्येय पूर्ण झाल्यावर');
      l = l.replace('Tranche 1 — Early liquidity checkpoint', 'टप्पा 1 — सुरुवातीच्या मुदतीसाठी');
      l = l.replace('Tranche 2 — Mid-goal milestone', 'टप्पा 2 — मध्य-मुदतीसाठी');
      l = l.replace('Tranche 3 — Final goal maturity', 'टप्पा 3 — ध्येय पूर्ण झाल्यावर');
    }
    return escapeHtml(l);
  };

  const localizeBankName = (name, lang) => {
    const fullBanks = {
      'State Bank of India': { hi: 'स्टेट बैंक ऑफ इंडिया', bho: 'स्टेट बैंक ऑफ इंडिया', mr: 'स्टेट बँक ऑफ इंडिया' },
      'HDFC Bank': { hi: 'HDFC बैंक', bho: 'HDFC बैंक', mr: 'HDFC बँक' },
      'ICICI Bank': { hi: 'ICICI बैंक', bho: 'ICICI बैंक', mr: 'ICICI बँक' },
      'India Post (Post Office TD)': { hi: 'पोस्ट ऑफिस', bho: 'पोस्ट ऑफिस', mr: 'पोस्ट ऑफिस' },
      'Suryoday Small Finance Bank': { hi: 'सूर्योदय स्मॉल फाइनेंस बैंक', bho: 'सूर्योदय स्मॉल फाइनेंस', mr: 'सूर्योदय स्मॉल फायनान्स बँक' },
      'AU Small Finance Bank': { hi: 'AU स्मॉल फाइनेंस बैंक', bho: 'AU स्मॉल फाइनेंस', mr: 'AU स्मॉल फायनान्स बँक' },
      'Jana Small Finance Bank': { hi: 'जना स्मॉल फाइनेंस बैंक', bho: 'जना स्मॉल फाइनेंस', mr: 'जना स्मॉल फायनान्स बँक' },
      'Unity Small Finance Bank': { hi: 'यूनिटी स्मॉल फाइनेंस बैंक', bho: 'यूनिटी स्मॉल फाइनेंस', mr: 'युनिटी स्मॉल फायनान्स बँक' }
    };
    if (fullBanks[name] && fullBanks[name][lang]) return fullBanks[name][lang];
    return name;
  };

  const slicesHtml = plan.slices.map((slice, i) => `
    <div class="plan-slice-card" style="animation-delay:${i * 0.1}s">
      <div class="slice-left">
        <span class="slice-bank">${escapeHtml(localizeBankName(slice.bank_name, lang))}</span>
        <span class="slice-label">${localizeLabel(slice.label)} · ${slice.tenure_months} ${STR.months[lang]||STR.months.en} · ${slice.annual_rate}% ${STR.pa[lang]||STR.pa.en}</span>
      </div>
      <div class="slice-right">
        <span class="slice-maturity">${fmt(slice.maturity_amount)}</span>
        <div class="slice-rate">${STR.on[lang]||STR.on.en} ${fmt(slice.principal)}</div>
      </div>
    </div>
  `).join('');

  els.modalBody.innerHTML = `
    <div class="plan-summary">
      <div class="plan-stat">
        <div class="plan-stat-label">${STR.your_goal[lang]||STR.your_goal.en}</div>
        <div class="plan-stat-value">${fmt(plan.goal_amount)}</div>
      </div>
      <div class="plan-stat">
        <div class="plan-stat-label">${STR.you_invest[lang]||STR.you_invest.en}</div>
        <div class="plan-stat-value">${fmt(plan.available_funds)}</div>
      </div>
      <div class="plan-stat">
        <div class="plan-stat-label">${STR.total_return[lang]||STR.total_return.en}</div>
        <div class="plan-stat-value" style="color:var(--success)">${fmt(plan.total_maturity_value)}</div>
      </div>
    </div>

    <div class="plan-note ${isSuccess ? 'success' : 'warning'}">
      ${isSuccess ? '✅' : '⚠️'} ${noteHtml}
    </div>

    <div class="plan-slices">
      ${slicesHtml}
    </div>
  `;

  // Render Chart
  const devanagariNumber = (num) => {
    if (lang === 'en') return num;
    const str = num.toString();
    const map = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return str.replace(/[0-9]/g, d => map[d]);
  };
  const STR_MO = {hi:'महीने', bho:'महिना', mr:'महिने', en:'mo'}[lang] || 'mo';
  const labels = plan.slices.map(s => {
     const bName = localizeBankName(getShortName(s.bank_name, s.bank_short_name), lang);
     return `${bName} · ${devanagariNumber(s.tenure_months)} ${STR_MO}`;
  });
  const logoUrls = plan.slices.map(s => popLogo(getShortName(s.bank_name, s.bank_short_name)));
  FDChart.renderLadder(plan.slices, lang, logoUrls, labels);
}

function openPlanModal() {
  els.planModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closePlanModal() {
  els.planModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
  FDChart.destroy();
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function scrollToBottom() {
  requestAnimationFrame(() => {
    els.messagesContainer.scrollTop = els.messagesContainer.scrollHeight;
  });
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

function currentTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Convert **bold** and newlines to HTML.
 * @param {string} text
 * @returns {string} HTML string
 */
function formatMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

const EMOTION_EMOJIS = {
  FEAR: '😟', CONFUSION: '🤔', COMPARISON: '⚖️',
  EXCITEMENT: '😊', URGENCY: '⚡', NEUTRAL: '💬',
};

function emotionEmoji(emotion) {
  return EMOTION_EMOJIS[emotion] || '💬';
}

// ─── Public callback for VoiceHandler ────────────────────────────────────────

/**
 * Called by VoiceHandler when a transcript is ready.
 * @param {string} transcript - Recognized speech text
 */
function onVoiceTranscript(transcript) {
  els.messageInput.value = transcript;
  autoResizeTextarea(els.messageInput);
  els.btnSend.disabled = !transcript.trim();
  els.messageInput.focus();
}
