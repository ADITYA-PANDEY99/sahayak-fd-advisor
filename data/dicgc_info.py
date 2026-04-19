"""
DICGC (Deposit Insurance and Credit Guarantee Corporation) Information.

Provides plain-language explanations of India's deposit insurance scheme
used to build trust with fear-signaling users.
"""


DICGC_INFO = {
    "regulator": "Reserve Bank of India (RBI)",
    "body": "Deposit Insurance and Credit Guarantee Corporation (DICGC)",
    "coverage_per_depositor": 500000,  # INR — ₹5 lakh per depositor per bank
    "coverage_includes": ["principal", "interest"],
    "established": 1978,
    "backed_by": "Government of India",
    "applicable_to": [
        "Scheduled Commercial Banks",
        "Small Finance Banks",
        "Regional Rural Banks",
        "Co-operative Banks",
    ],
    "not_applicable_to": [
        "India Post / Post Office (Government Sovereign Guarantee — even safer)",
        "Primary Co-operative Societies",
    ],
    "plain_hindi": (
        "DICGC ek sarkari bima company hai jo RBI ke under kaam karti hai. "
        "Agar kisi bhi RBI registered bank ko koi dikkat aaye, tab bhi aapka "
        "paisa — element aur byaaj mila ke — maximum ₹5 lakh tak 100% safe hai. "
        "Yeh RBI ka diya hua guarantee hai."
    ),
    "plain_english": (
        "DICGC is a government-backed insurance body under RBI. "
        "Even if your bank were to face difficulties, your deposits "
        "(principal + interest combined) up to ₹5 lakh per bank are "
        "fully protected. This is a statutory guarantee."
    ),
    "key_points": [
        "Coverage: Up to ₹5,00,000 per depositor per bank",
        "Covers both principal AND accrued interest",
        "Backed by Government of India — not just a private insurer",
        "Applies to all RBI-licensed banks including Small Finance Banks",
        "Post Office TDs are even safer — direct sovereign government guarantee",
    ],
}


def get_dicgc_summary() -> dict:
    """
    Return the DICGC data structure for API responses.

    Returns:
        DICGC information dictionary
    """
    return DICGC_INFO
