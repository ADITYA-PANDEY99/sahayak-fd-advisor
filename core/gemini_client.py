"""
Google Gemini API Client for Sahayak.

Wraps the Gemini generative model with conversation history management,
persona injection, and graceful fallback for missing API keys.
Uses pure HTTP requests to bypass Python 3.14 / Protobuf incompatibilities.
"""

import os
import requests
from typing import Optional

from core.persona import build_system_prompt

# Language display names for prompt context
LANGUAGE_NAMES = {
    "hi": "Hindi",
    "bho": "Bhojpuri",
    "mr": "Marathi",
    "en": "English",
}

# Fallback responses when API key is unavailable (demo mode)
DEMO_RESPONSES = {
    "hi": "नमस्ते! मैं रमेश भैया हूँ। सहায়ক में आपका स्वागत है — आपका अपना FD सलाहकार। बताओ, आज किस चीज़ में मदद चाहिए? क्या कोई FD के बारे में जानना है, या कोई विशेष बैंक के बारे में पूछना चाहते हो?",
    "bho": "प्रणाम! हमार नाम रमेश भैया बा। सहায়ক में राउर स्वागत बा — राउर आपन FD सलाहकार। बताईं, आज का जाने के चाहत बानी? कवनो FD के बारे में, या कवन बैंक में पैसा लगाईं?",
    "mr": "नमस्कार! मी रमेश भाऊ आहे. Sahayak मध्ये आपले स्वागत आहे — तुमचा FD सल्लागार. सांगा, आज कशात मदत हवी आहे?",
    "en": "Hello! I'm Ramesh Bhaiya, your trusted FD advisor at Sahayak. Welcome! How can I help you today — looking to open an FD, understand how it works, or compare banks?",
}


class GeminiClient:
    """
    Manages communication with the Gemini generative AI model via REST API.

    Handles system prompt construction, conversation history formatting,
    and graceful degradation when the API key is not configured.
    """

    MODEL_NAME = "gemini-2.5-flash"
    API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}"

    def __init__(self, api_key: str):
        """
        Initialize the Gemini client.

        Args:
            api_key: Google AI Studio API key. If empty, runs in demo mode.
        """
        self.api_key = api_key
        self.is_configured = bool(self.api_key)

    def chat(
        self,
        message: str,
        language: str = "hi",
        history: Optional[list] = None,
        user_name: str = "",
        emotion: str = "NEUTRAL",
    ) -> str:
        """
        Send a user message and retrieve an AI response.

        Constructs a full system prompt from the Ramesh Bhaiya persona,
        applies emotion-specific behavioral augmentation, formats conversation
        history, and submits to the Gemini Chat API via REST.

        Args:
            message: Current user message text
            language: Target response language code
            history: List of previous turns as {'role': ..., 'parts': ...}
            user_name: Optional user name for personalized addressing
            emotion: Detected emotional state for prompt augmentation

        Returns:
            AI-generated advisory response as a plain string
        """
        if not self.is_configured:
            return DEMO_RESPONSES.get(language, DEMO_RESPONSES["en"])

        try:
            # Build persona-driven system prompt with emotion layer
            system_prompt = build_system_prompt(emotion)

            # Append language and user context
            lang_name = LANGUAGE_NAMES.get(language, "Hindi")
            context_addendum = f"\n\n## Response Context\n- Language: Respond ONLY in {lang_name}\n"
            if user_name:
                context_addendum += f"- User Name: {user_name} (use their name naturally in conversation)\n"

            full_system_prompt = system_prompt + context_addendum

            # Format conversation history for Gemini REST schema
            raw_contents = []
            if history:
                for turn in history[-10:]:  # Keep last 10 turns
                    role = "model" if turn.get("role", "user") == "assistant" else "user"
                    content = turn.get("content", "").strip()
                    if content:
                        raw_contents.append({
                            "role": role,
                            "parts": [{"text": content}]
                        })
            
            # Add the current user message
            raw_contents.append({
                "role": "user",
                "parts": [{"text": message.strip()}]
            })

            # Gemini requires strict alternating roles. Squish consecutive matching roles together.
            contents = []
            for item in raw_contents:
                if not contents:
                    contents.append(item)
                else:
                    if contents[-1]["role"] == item["role"]:
                        # Merge content if the role is the same as the previous one
                        contents[-1]["parts"][0]["text"] += "\n" + item["parts"][0]["text"]
                    else:
                        contents.append(item)

            # Create payload per Gemini REST API spec
            payload = {
                "system_instruction": {
                    "parts": [{"text": full_system_prompt}]
                },
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.7,
                }
            }

            url = self.API_URL.format(self.MODEL_NAME, self.api_key)
            response = requests.post(url, json=payload, timeout=20)
            response.raise_for_status()
            
            data = response.json()
            # Extract text from: data.candidates[0].content.parts[0].text
            reply_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            return reply_text.strip() or self._fallback_response(language)

        except Exception as exc:
            # Graceful degradation: log error and return a safe fallback
            print(f"[GeminiClient] API error: {exc}")
            return self._fallback_response(language)

    def _fallback_response(self, language: str) -> str:
        """Return a safe fallback response on API failure."""
        fallbacks = {
            "hi": "माफी चाहता हूँ, अभी कुछ तकनीकी दिक्कत आ रही है। थोड़ी देर बाद कोशिश करें। अगर कोई बहुत ज़रूरी सवाल है तो सीधा अपने बैंक से संपर्क करें।",
            "bho": "माफी चाहत बानी, अभी तनी तकनीकी दिक्कत बा। थोरी देर बाद कोशिश करीं।",
            "mr": "माफ करा, तांत्रिक अडचण आली आहे. थोड्या वेळाने पुन्हा प्रयत्न करा.",
            "en": "Sorry, I'm experiencing a technical issue right now. Please try again in a moment.",
        }
        return fallbacks.get(language, fallbacks["en"])
