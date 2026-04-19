"""
Behavioral Emotion Detection Engine.

Analyzes user message text for emotional signals to allow context-aware,
psychologically appropriate responses that address the underlying concern,
not just the surface question.
"""

import re


# Keyword patterns mapped to emotional states
# Each pattern list is checked case-insensitively against user messages.
EMOTION_PATTERNS: dict[str, list[str]] = {
    "FEAR": [
        "dar", "डर", "safe", "surakshit", "सुरक्षित", "doob", "डूब",
        "kho jayega", "khatre", "डरता", "scared", "afraid", "secure",
        "guarantee", "pakka", "bharosa nahi", "trust nahi",
        "bank fail", "bank doob", "paisa jayega", "risk", "khatarnak",
        "safe hai kya", "safe nahi", "डूब जाएगा", "डूब गया",
        "assured", "insured", "guaranteed",
    ],
    "CONFUSION": [
        "samajh nahi", "समझ नहीं", "kya matlab", "क्या मतलब",
        "explain", "samjhao", "समझाओ", "confused", "pata nahi",
        "kya hota hai", "kaise", "kyun", "matlab kya", "what is",
        "what does", "define", "meaning", "kya hai", "क्या है",
        "kaise kaam", "kaise milta", "kaise hoga",
    ],
    "EXCITEMENT": [
        "accha", "अच्छा", "badhiya", "invest karna chahta",
        "great", "excellent", "perfect", "sahi hai", "start karna",
        "ready", "haan zaroor", "bilkul", "awesome", "amazing",
        "kar leta", "laga deta", "laga dun", "lagayein",
    ],
    "COMPARISON": [
        "gold", "sona", "सोना", "ppf", "mutual fund", "stock", "share",
        "equity", "neighbour", "dost ne bola", "koi bola",
        "better hai", "alternative", " vs ", "versus", "ya phir",
        "compared to", "fark kya", "difference", "konsa achha",
        "real estate", "property",
    ],
    "URGENCY": [
        "jaldi", "जल्दी", "abhi", "अभी", "turant", "today",
        "aaj", "urgent", "emergency", "zaruri", "immediately",
        "asap", "right now", "jald se jald",
    ],
}

# Priority order: higher-priority emotions take precedence when multiple match
PRIORITY_ORDER = ["FEAR", "CONFUSION", "URGENCY", "COMPARISON", "EXCITEMENT"]


class EmotionDetector:
    """
    Detects the dominant emotional signal in a user's message.

    Uses keyword pattern matching with priority ranking to identify
    the most actionable emotional state for response customization.
    """

    def detect(self, message: str) -> str:
        """
        Analyze text and return the dominant emotional state.

        Args:
            message: Raw user input text (any language mix)

        Returns:
            Emotion string: one of FEAR, CONFUSION, URGENCY,
                            COMPARISON, EXCITEMENT, or NEUTRAL
        """
        if not message:
            return "NEUTRAL"

        message_lower = message.lower()
        matched_emotions: set[str] = set()

        for emotion, patterns in EMOTION_PATTERNS.items():
            for pattern in patterns:
                # Use word-boundary-aware search for short keywords
                if len(pattern) <= 4:
                    if re.search(rf"\b{re.escape(pattern)}\b", message_lower):
                        matched_emotions.add(emotion)
                        break
                else:
                    if pattern in message_lower:
                        matched_emotions.add(emotion)
                        break

        # Return highest-priority matched emotion
        for emotion in PRIORITY_ORDER:
            if emotion in matched_emotions:
                return emotion

        return "NEUTRAL"
