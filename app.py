"""
Sahayak — Intelligent Vernacular FD Advisor
Main Flask application entry point.

All code, comments, and documentation are in English.
The application itself serves users in Hindi, Bhojpuri, and Marathi.
"""

import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

from core.gemini_client import GeminiClient
from core.emotion_detector import EmotionDetector
from core.fd_planner import FDPlanner
from data.bank_rates import get_all_banks
from data.dicgc_info import get_dicgc_summary

load_dotenv()

app = Flask(__name__)

# Initialize core services
gemini = GeminiClient(api_key=os.getenv("GEMINI_API_KEY", ""))
emotion_detector = EmotionDetector()
fd_planner = FDPlanner()


@app.route("/")
def index():
    """Serve the main single-page application."""
    return render_template("index.html")


@app.route("/api/health")
def health():
    """Health check endpoint for deployment monitoring."""
    return jsonify({"status": "ok", "service": "Sahayak FD Advisor", "version": "1.0.0"})


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Process a user message and return an AI-generated advisory response.

    Request body:
        message (str): User's input text
        language (str): Target language code — 'hi', 'bho', 'mr', 'en'
        history (list): Previous conversation turns
        user_name (str): Optional user name for personalization

    Returns:
        JSON with reply, detected emotion, suggested banks, and quick actions
    """
    data = request.get_json(force=True)
    message = data.get("message", "").strip()
    language = data.get("language", "hi")
    history = data.get("history", [])
    user_name = data.get("user_name", "")

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Behavioral analysis: detect emotional state from message
    emotion = emotion_detector.detect(message)

    # Generate response through Gemini with persona and language context
    reply = gemini.chat(
        message=message,
        language=language,
        history=history,
        user_name=user_name,
        emotion=emotion,
    )

    # Derive quick follow-up actions based on detected emotion
    quick_actions = _get_quick_actions(emotion, language)

    # Check if the "Noob" persona triggered a goal planner
    import re
    ladder_plan = None
    calc_match = re.search(r"\[CALC_PLAN\|(\d+)\|(\d+)\|(\d+)\]", reply)
    if calc_match:
        try:
            p_goal = float(calc_match.group(1))
            p_avail = float(calc_match.group(2))
            p_months = int(calc_match.group(3))
            ladder_plan = fd_planner.calculate_ladder(p_goal, p_avail, p_months)
            
            # Wipes out the backend command string from user view
            reply = re.sub(r"\[CALC_PLAN\|(\d+)\|(\d+)\|(\d+)\]", "", reply).strip()
        except Exception as e:
            print("Failed to run embedded planner:", e)

    return jsonify({
        "reply": reply,
        "emotion_detected": emotion,
        "quick_actions": quick_actions,
        "ladder_plan": ladder_plan
    })


@app.route("/api/banks")
def banks():
    """
    Return all bank FD rates with trust scores.

    Query params:
        tenure (str): Tenure key — e.g. '1_year', '2_year', '3_year'
    """
    tenure = request.args.get("tenure", "1_year")
    bank_data = get_all_banks(tenure=tenure)
    dicgc = get_dicgc_summary()
    return jsonify({"banks": bank_data, "tenure": tenure, "dicgc": dicgc})


@app.route("/api/plan", methods=["POST"])
def plan():
    """
    Calculate an optimal FD laddering plan for a financial goal.

    Request body:
        goal_amount (float): Target amount in INR
        available_funds (float): Investable amount in INR
        months_to_goal (int): Time horizon in months
    """
    data = request.get_json(force=True)
    goal_amount = float(data.get("goal_amount", 0))
    available_funds = float(data.get("available_funds", 0))
    months_to_goal = int(data.get("months_to_goal", 12))

    if available_funds <= 0 or months_to_goal <= 0:
        return jsonify({"error": "Invalid input values"}), 400

    ladder = fd_planner.calculate_ladder(
        goal_amount=goal_amount,
        available_funds=available_funds,
        months_to_goal=months_to_goal,
    )

    return jsonify({"plan": ladder})


def _get_quick_actions(emotion: str, language: str) -> list:
    """
    Return context-aware follow-up action suggestions based on detected emotion.

    Args:
        emotion: Detected emotional state string
        language: Language code

    Returns:
        List of 3 quick action button labels
    """
    actions = {
        "hi": {
            "FEAR": ["DICGC बीमा क्या है?", "सबसे सुरक्षित बैंक कौन सा है?", "क्या मेरा पैसा सुरक्षित है?"],
            "CONFUSION": ["सरल भाषा में FD क्या है?", "ब्याज कैसे मिलता है?", "FD कैसे खोलें?"],
            "COMPARISON": ["FD vs सोना — क्या बेहतर है?", "FD vs PPF", "FD vs म्यूचुअल फंड"],
            "EXCITEMENT": ["FD कैलकुलेटर आज़माएं", "गोल प्लानर खोलें", "सबसे अच्छे रेट्स देखें"],
            "URGENCY": ["आज सबसे अच्छा विकल्प क्या है?", "क्विक FD गाइड", "टॉप 3 बैंक"],
            "NEUTRAL": ["FD कैलकुलेटर", "बैंकों की तुलना करें", "गोल प्लानर"],
        },
        "bho": {
            "FEAR": ["DICGC बीमा के मतलब?", "सबसे सुरक्षित बैंक कौन बा?", "हमार पइसा सेफ बा?"],
            "CONFUSION": ["FD के का मतलब होला?", "ब्याज कइसे मिलेला?", "FD कइसे खोलीं?"],
            "COMPARISON": ["FD या सोना — का नीमन बा?", "FD या PPF", "FD या म्यूचुअल फंड"],
            "EXCITEMENT": ["FD कैलकुलेटर देखीं", "गोल प्लानर", "सबसे बढ़िया रेट"],
            "URGENCY": ["आज कहाँ इन्वेस्ट करीं?", "क्विक गाइड", "टॉप 3 बैंक"],
            "NEUTRAL": ["FD कैलकुलेटर", "बैंक के तुलना करीं", "गोल प्लानर"],
        },
        "mr": {
            "FEAR": ["DICGC विमा काय आहे?", "सर्वात सुरक्षित बँक कोणती?", "माझे पैसे सुरक्षित आहेत का?"],
            "CONFUSION": ["FD म्हणजे काय?", "व्याज कसे मिळते?", "FD कशी उघडावी?"],
            "COMPARISON": ["FD vs सोने — काय चांगले?", "FD vs PPF", "FD vs Mutual Fund"],
            "EXCITEMENT": ["FD calculator वापरा", "Goal planner", "Best rates पाहा"],
            "URGENCY": ["आज कुठे गुंतवणूक करावी?", "Quick guide", "Top 3 banks"],
            "NEUTRAL": ["FD कॅल्क्युलेटर", "बँकांची तुलना करा", "गोल प्लॅनर"],
        },
        "en": {
            "FEAR": ["What is DICGC insurance?", "Safest banks in India", "Is my money insured?"],
            "CONFUSION": ["What is a Fixed Deposit?", "How does FD interest work?", "How to open an FD?"],
            "COMPARISON": ["FD vs Gold — which is better?", "FD vs PPF", "FD vs Mutual Fund"],
            "EXCITEMENT": ["Try FD Calculator", "Open Goal Planner", "View Best Rates"],
            "URGENCY": ["Where to invest today?", "Quick FD Guide", "Top 3 Banks 2025"],
            "NEUTRAL": ["FD Calculator", "Compare Banks", "Goal Planner"],
        },
    }

    lang_actions = actions.get(language, actions["en"])
    return lang_actions.get(emotion, lang_actions["NEUTRAL"])


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=os.getenv("FLASK_DEBUG", "True") == "True", host="0.0.0.0", port=port)
