# Sahayak — Intelligent Vernacular FD Advisor

> **Blostem AI Builder Hackathon Submission | Vernacular FD Advisor Track**

[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)](https://flask.palletsprojects.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-orange?logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## The Problem

A user in Gorakhpur sees: **"Suryoday Small Finance Bank — 8.50% p.a. — 12M tenor"**

They have no idea:
- What 8.50% p.a. means in rupees
- What a "tenor" is
- Whether their money is safe
- How this compares to keeping money in a savings account or buying gold
- What they should actually do next

This is the reality for millions of Indian savers in Tier 2 and Tier 3 cities.

---

## The Solution: Sahayak

Sahayak ("Helper" in Hindi) is a multilingual, AI-powered Fixed Deposit advisor that goes far beyond translating jargon. It understands the **psychology** of the rural Indian investor, plans for their **real life goals**, and responds with **culturally resonant guidance** — not textbook definitions.

### What Makes Sahayak Different

| What competitors build | What Sahayak delivers |
|---|---|
| Generic AI chatbot | "Ramesh Bhaiya" — a trusted neighborhood advisor persona |
| Language toggle | Emotion-aware multilingual responses in 4 languages |
| FD term definitions | Goal-based FD laddering planner with visual timeline |
| Mock or no bank data | Real bank FD rates + DICGC trust scoring |
| Text-only input | Voice-first interface (Web Speech API, no cost) |
| Plain chat UI | Premium glassmorphism dark UI with micro-animations |

---

## Key Features

### 1. Behavioral Emotion Detection Engine
The system analyzes each user message for emotional signals **before** sending to the AI:
- `FEAR` — *"dar lag raha hai", "safe hai kya", "doob toh nahi jayega"*
- `CONFUSION` — *"samajh nahi", "kya matlab", "kaise hota hai"*
- `COMPARISON` — *"gold se better hai kya", "neighbour ne bola"*
- `EXCITEMENT` — investment intent signals
- `URGENCY` — time-sensitive queries

Each detected emotion activates a specialized system prompt layer that adjusts tone, adds trust signals, or addresses cognitive biases — before the user even finishes typing.

### 2. "Ramesh Bhaiya" Persona
Not a generic AI assistant. A warmly authoritative neighborhood advisor who:
- Addresses users by name after the first interaction
- Uses culturally resonant Indian analogies (*"FD matlab bharosemand sahukar jo RBI ka approved hai"*)
- Speaks Hindi, Bhojpuri, Marathi, or English — matching dialect and formality to the user's preference
- Never uses financial jargon without immediately explaining it in plain terms

### 3. Goal-Based FD Laddering Planner
Users set a financial goal (amount + timeline) and receive an optimized FD ladder plan:
- **Short horizon (≤12m):** Single FD in highest-rate bank
- **Medium horizon (13–24m):** Two-tranche ladder for mid-milestone liquidity
- **Long horizon (≥25m):** Three-tranche ladder for maximum returns + checkpoints

Each plan includes a **Chart.js visualization** showing principal vs. interest earned per tranche.

### 4. Bank Trust Score System
Every bank recommendation includes:
- Current FD rate (2024-25 realistic rates for 8 major banks)
- DICGC insurance status and coverage limit
- RBI license type
- Trust Score (0–10) with color-coded safety indicator
- Plain-language safety explanation

### 5. Voice-First Input
Microphone input using the browser's built-in Web Speech API:
- Supports Hindi (hi-IN), Marathi (mr-IN), English (en-IN)
- Zero external API cost — runs entirely in the browser
- Designed for low-typing-comfort users in rural India

---

## Supported Languages

| Language | Code | Characters |
|---|---|---|
| Hindi | `hi` | हिन्दी |
| Bhojpuri | `bho` | भोजपुरी |
| Marathi | `mr` | मराठी |
| English | `en` | English |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Flask 3.0 |
| AI | Google Gemini 1.5 Flash |
| Frontend | HTML5, CSS3 (Glassmorphism), Vanilla JS |
| Charts | Chart.js 4.4 |
| Voice | Web Speech API (browser-native) |
| Deployment | Render.com |

---

## Project Structure

```
sahayak/
├── app.py                      # Flask application entry point
├── requirements.txt
├── .env.example
│
├── core/
│   ├── gemini_client.py        # Gemini API wrapper with persona injection
│   ├── emotion_detector.py     # Behavioral emotion analysis engine
│   ├── persona.py              # Ramesh Bhaiya system prompts
│   └── fd_planner.py           # Goal-based FD laddering calculator
│
├── data/
│   ├── bank_rates.py           # 8-bank FD rate database with trust scoring
│   └── dicgc_info.py           # DICGC deposit insurance data
│
├── static/
│   ├── css/style.css           # Full premium design system
│   └── js/
│       ├── app.js              # Main chat application logic
│       ├── voice.js            # Web Speech API handler
│       ├── charts.js           # FD laddering Chart.js visualizer
│       └── language.js         # Animated language switcher
│
└── templates/
    └── index.html              # Single-page application shell
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sahayak.git
cd sahayak

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### Run Locally

```bash
python app.py
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

> **Note:** If `GEMINI_API_KEY` is not set, the app runs in **demo mode** with pre-written welcome responses. All other features (bank rates, goal planner, UI) work fully.

---

## API Reference

### `POST /api/chat`
Process a user message and return an AI advisory response.

**Request:**
```json
{
  "message": "mera 1 lakh safe rahega kya?",
  "language": "hi",
  "history": [],
  "user_name": "Rajesh"
}
```

**Response:**
```json
{
  "reply": "Haan Rajesh bhai, bilkul safe rahega...",
  "emotion_detected": "FEAR",
  "quick_actions": ["DICGC insurance kya hai?", "Sabse safe bank kaun sa?"]
}
```

### `GET /api/banks?tenure=1_year`
Returns all bank FD rates sorted by rate, with trust scores.

### `POST /api/plan`
Calculates an FD laddering plan for a financial goal.

**Request:**
```json
{
  "goal_amount": 500000,
  "available_funds": 200000,
  "months_to_goal": 24
}
```

---

## Design Philosophy

> *"A working deployed app with a tight narrative beats an impressive codebase that nobody can run."* — Blostem Team

Sahayak is built for the **real user** first:
- Voice input because many rural users are uncomfortable typing in regional scripts
- Desi analogies because textbook finance alienates people who didn't study commerce
- DICGC prominently featured because fear of losing money is the #1 barrier to FD adoption
- Goal-based planning because abstract rates mean nothing without a concrete outcome

---

## Behavioral Finance Layer

Most FD apps show you rates. Sahayak understands why you're asking.

| Detected State | What Happens |
|---|---|
| **FEAR** | System acknowledges anxiety, explains ₹5L DICGC cover, recommends high-trust banks only |
| **CONFUSION** | Switches to simplest-possible explanation mode with one relatable analogy |
| **COMPARISON** | Delivers objective comparison across safety, returns, and liquidity |
| **EXCITEMENT** | Channels motivation into actionable next steps (how much, how long, which bank) |
| **URGENCY** | Skips preamble, delivers one clear confident recommendation immediately |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built for the Blostem AI Builder Hackathon 2025 — Vernacular FD Advisor Track.*
