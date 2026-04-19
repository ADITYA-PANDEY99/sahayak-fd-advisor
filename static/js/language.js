/**
 * Language Switcher Module
 *
 * Manages the animated language selector pill UI and updates
 * the app state, input placeholder, and voice recognition locale
 * whenever the user changes the active language.
 */

'use strict';

const LanguageManager = (() => {
  // Status and placeholder strings
  const PLACEHOLDERS = {
    hi:  'रमेश भैया से कुछ भी पूछो...',
    bho: 'रमेश भैया से कुछ भी पूछीं...',
    mr:  'रमेश भाऊंना काहीही विचारा...',
    en:  'Ask Ramesh Bhaiya anything about FDs...',
  };

  const STATUS_TEXT = {
    hi:  'रमेश भैया ऑनलाइन हैं',
    bho: 'रमेश भैया ऑनलाइन बानी',
    mr:  'रमेश भाऊ ऑनलाइन आहेत',
    en:  'Ramesh Bhaiya Online',
  };

  // Static sidebar translations
  const UI_STRINGS = {
    live_rates: {
      hi: 'सावधि जमा दरें', bho: 'सावधि जमा के दर', mr: 'मुदत ठेव दर', en: 'Live FD Rates'
    },
    brand_tagline: {
      hi: 'विश्वसनीय एफडी सलाहकार', bho: 'भरोसेमंद बचत सलाहकार', mr: 'विश्वासू ठेव सल्लागार', en: 'Trusted FD Advisor'
    },
    theme_classic: {
      hi: '✨ क्लासिक डार्क', bho: '✨ क्लासिक डार्क', mr: '✨ क्लासिक डार्क', en: '✨ Classic Dark'
    },
    theme_cyberpunk: {
      hi: '📟 साइबरपंक', bho: '📟 साइबरपंक', mr: '📟 सायबरपंक', en: '📟 Cyberpunk'
    },
    theme_forest: {
      hi: '🌿 ज़ेन वन', bho: '🌿 ज़ेन जंगल', mr: '🌿 झेन अरण्य', en: '🌿 Zen Forest'
    },
    theme_ocean: {
      hi: '🌊 गहरा सागर', bho: '🌊 गहिर समुंदर', mr: '🌊 खोल समुद्र', en: '🌊 Deep Ocean'
    },
    '1_yr': { hi: '1 साल', bho: '1 साल', mr: '1 वर्ष', en: '1 Year' },
    '2_yr': { hi: '2 साल', bho: '2 साल', mr: '2 वर्ष', en: '2 Year' },
    '3_yr': { hi: '3 साल', bho: '3 साल', mr: '3 वर्ष', en: '3 Year' },
    '5_yr': { hi: '5 साल', bho: '5 साल', mr: '5 वर्ष', en: '5 Year' },
    dicgc_protected: {
      hi: 'DICGC सुरक्षित', bho: 'DICGC सुरक्षित', mr: 'DICGC सुरक्षित', en: 'DICGC Protected'
    },
    dicgc_desc: {
      hi: 'प्रति बैंक प्रति व्यक्ति सरकारी गारंटी',
      bho: 'हर बैंक में हर आदमी खातिर सरकारी गारंटी',
      mr: 'प्रत्येक बँकेत प्रति व्यक्ती सरकारी हमी',
      en: 'Govt. guaranteed per depositor per bank'
    },
    goal_planner: {
      hi: 'लक्ष्य प्लानर', bho: 'लक्ष्य प्लानर', mr: 'ध्येय प्लॅनर', en: 'Goal Planner'
    },
    goal_amt: {
      hi: 'लक्ष्य राशि (₹)', bho: 'लक्ष्य रकम (₹)', mr: 'ध्येय रक्कम (₹)', en: 'Goal Amount (₹)'
    },
    you_have: {
      hi: 'आपके पास हैं (₹)', bho: 'राउर लगे बा (₹)', mr: 'तुमच्याकडे आहेत (₹)', en: 'You Have (₹)'
    },
    timeline: {
      hi: 'समय (महीने)', bho: 'समय (महीना)', mr: 'वेळ (महिने)', en: 'Timeline (Months)'
    },
    calc_plan: {
      hi: 'प्लान कैलकुलेट करें ✨', bho: 'प्लान निकालीं ✨', mr: 'प्लॅनची गणना करा ✨', en: 'Calculate Plan ✨'
    },
    modal_title: {
      hi: '🎯 आपका FD लैडर प्लान', bho: '🎯 राउर FD लैडर प्लान', mr: '🎯 तुमचा FD लॅडर प्लॅन', en: '🎯 Your FD Ladder Plan'
    },
    advisor_online: {
      hi: 'रमेश भैया ऑनलाइन हैं', bho: 'रमेश भैया ऑनलाइन बानी', mr: 'रमेश भाऊ ऑनलाइन आहेत', en: 'Ramesh Bhaiya Online'
    },
    'SBI': { hi: 'एसबीआई', bho: 'एसबीआई', mr: 'एसबीआय', en: 'SBI' },
    'HDFC': { hi: 'एचडीएफसी', bho: 'एचडीएफसी', mr: 'एचडीएफसी', en: 'HDFC' },
    'ICICI': { hi: 'आईसीआईसीआई', bho: 'आईसीआईसीआई', mr: 'आयसीआयसीआय', en: 'ICICI' },
    'Post Office': { hi: 'पोस्ट ऑफिस', bho: 'पोस्ट ऑफिस', mr: 'पोस्ट ऑफिस', en: 'Post Office' },
    'AU SFB': { hi: 'एयू बैंक', bho: 'एयू बैंक', mr: 'एयू बँक', en: 'AU SFB' },
    'Unity SFB': { hi: 'यूनिटी बैंक', bho: 'यूनिटी बैंक', mr: 'युनिटी बँक', en: 'Unity SFB' },
    'Jana SFB': { hi: 'जना बैंक', bho: 'जना बैंक', mr: 'जना बँक', en: 'Jana SFB' },
    'Suryoday SFB': { hi: 'सूर्योदय बैंक', bho: 'सूर्योदय बैंक', mr: 'सूर्योदय बँक', en: 'Suryoday SFB' }
  };

  const selector   = document.getElementById('language-selector');
  const slider     = document.getElementById('lang-slider');
  const statusText = document.querySelector('.status-text');
  const msgInput   = document.getElementById('message-input');

  /**
   * Initialize the language switcher with click handlers and
   * set the initial slider position for the active pill.
   */
  function init() {
    if (!selector) return;

    const pills = selector.querySelectorAll('.lang-pill');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const lang = pill.dataset.lang;
        if (lang === state.language) return;

        // Update active pill styles
        pills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');

        // Animate the slider to the new pill position
        positionSlider(pill);

        // Update global app state
        state.language = lang;

        // Update UI text
        applyLanguage(lang);
        
        // Reload bank rates to apply translations to trust labels
        if (typeof loadBankRates === 'function') {
           loadBankRates(state.currentTenure);
        }

        // Re-render chat welcome message if no history yet
        if (typeof reRenderWelcomeIfChatNotStarted === 'function') {
           reRenderWelcomeIfChatNotStarted();
        }
      });
    });

    // Set initial slider position
    const activePill = selector.querySelector('.lang-pill.active');
    if (activePill) positionSlider(activePill);
    
    // Apply immediate translation on load if state exists
    applyLanguage(state.language);
  }

  /**
   * Move the animated slider background to match the given pill's position.
   * @param {HTMLElement} pill - The active language pill element
   */
  function positionSlider(pill) {
    if (!slider || !pill) return;
    const selectorRect = selector.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();

    slider.style.left = `${pillRect.left - selectorRect.left}px`;
    slider.style.width = `${pillRect.width}px`;
  }

  /**
   * Apply language-specific UI updates across the app.
   * @param {string} lang - Language code
   */
  function applyLanguage(lang) {
    // Update input placeholder
    if (msgInput) {
      msgInput.placeholder = PLACEHOLDERS[lang] || PLACEHOLDERS.en;
    }

    // Update advisor status text
    if (statusText) {
      statusText.textContent = STATUS_TEXT[lang] || STATUS_TEXT.en;
    }
    
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (UI_STRINGS[key] && UI_STRINGS[key][lang]) {
        // If element is input placeholder vs innerText
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
           el.placeholder = UI_STRINGS[key][lang];
        } else if (el.tagName === 'OPTION') {
          // For select option elements
          el.textContent = UI_STRINGS[key][lang];
        } else {
           // For calculate plan button: retain the star sparkle emoji by inserting it manually or replacing text
           if (key === 'calc_plan' && !UI_STRINGS[key][lang].includes('✨')) {
             el.textContent = UI_STRINGS[key][lang] + ' ✨';
           } else {
             el.textContent = UI_STRINGS[key][lang];
           }
        }
      }
    });

    console.log(`[LanguageManager] Switched to: ${lang}`);
  }

  return { init, positionSlider, applyLanguage };
})();

// Initialize once DOM is ready (scripts load at end of body)
document.addEventListener('DOMContentLoaded', () => {
  LanguageManager.init();
});
