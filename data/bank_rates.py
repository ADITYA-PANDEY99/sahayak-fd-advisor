"""
Bank FD Rate Data.

Realistic Fixed Deposit interest rates for Indian banks, based on
publicly available 2024-25 rate schedules. Includes trust scoring
derived from bank type, RBI licensing, DICGC coverage, and stability.

Note: Rates are for general public (non-senior). Senior citizen rates
are typically 0.25% to 0.50% higher.
"""


# Complete bank dataset with rates, trust metadata, and DICGC info
BANKS: list[dict] = [
    {
        "id": "sbi",
        "name": "State Bank of India",
        "short": "SBI",
        "type": "Public Sector Bank",
        "rbi_license": "Scheduled Commercial Bank",
        "dicgc_covered": True,
        "dicgc_limit": 500000,
        "trust_score": 9.5,
        "trust_label": "Highest Safety",
        "color": "#10B981",  # green
        "senior_extra": 0.50,
        "rates": {
            "7_days": 3.50,
            "14_days": 3.50,
            "30_days": 4.00,
            "3_months": 5.50,
            "6_months": 6.50,
            "9_months": 6.75,
            "1_year": 6.80,
            "2_year": 7.00,
            "3_year": 6.75,
            "5_year": 6.50,
        },
        "note": "India's largest bank — government-owned, maximum trust.",
    },
    {
        "id": "hdfc",
        "name": "HDFC Bank",
        "short": "HDFC",
        "type": "Private Sector Bank",
        "rbi_license": "Scheduled Commercial Bank",
        "dicgc_covered": True,
        "dicgc_limit": 500000,
        "trust_score": 9.2,
        "trust_label": "Very High Safety",
        "color": "#10B981",
        "senior_extra": 0.50,
        "rates": {
            "7_days": 3.00,
            "14_days": 3.00,
            "30_days": 3.50,
            "3_months": 4.50,
            "6_months": 6.60,
            "9_months": 7.00,
            "1_year": 7.00,
            "2_year": 7.00,
            "3_year": 7.00,
            "5_year": 7.00,
        },
        "note": "India's largest private bank — strong regulatory compliance.",
    },
    {
        "id": "icici",
        "name": "ICICI Bank",
        "short": "ICICI",
        "type": "Private Sector Bank",
        "rbi_license": "Scheduled Commercial Bank",
        "dicgc_covered": True,
        "dicgc_limit": 500000,
        "trust_score": 9.0,
        "trust_label": "Very High Safety",
        "color": "#10B981",
        "senior_extra": 0.50,
        "rates": {
            "7_days": 3.00,
            "14_days": 3.00,
            "30_days": 3.50,
            "3_months": 4.75,
            "6_months": 6.90,
            "9_months": 7.00,
            "1_year": 6.90,
            "2_year": 7.00,
            "3_year": 7.00,
            "5_year": 7.00,
        },
        "note": "One of India's most technologically advanced banks.",
    },
    {
        "id": "post_office",
        "name": "India Post (Post Office TD)",
        "short": "Post Office",
        "type": "Government Scheme",
        "rbi_license": "Government of India Backed",
        "dicgc_covered": False,
        "dicgc_limit": 0,
        "trust_score": 10.0,
        "trust_label": "Sovereign Guarantee",
        "color": "#6366F1",
        "senior_extra": 0.0,
        "rates": {
            "1_year": 6.90,
            "2_year": 7.00,
            "3_year": 7.10,
            "5_year": 7.50,
        },
        "note": "Government of India backed — 100% sovereign guarantee. Available at any post office.",
    },
    {
        "id": "suryoday_sfb",
        "name": "Suryoday Small Finance Bank",
        "short": "Suryoday SFB",
        "type": "Small Finance Bank",
        "rbi_license": "RBI Licensed Small Finance Bank",
        "dicgc_covered": True,
        "dicgc_limit": 500000,
        "trust_score": 7.8,
        "trust_label": "High Safety (up to ₹5L)",
        "color": "#F59E0B",
        "senior_extra": 0.50,
        "rates": {
            "3_months": 5.25,
            "6_months": 7.25,
            "9_months": 7.75,
            "1_year": 8.50,
            "2_year": 8.25,
            "3_year": 8.00,
            "5_year": 7.75,
        },
        "note": "High returns — DICGC insured up to ₹5 lakh. Best for amounts under ₹5L.",
    },
    {
        "id": "au_sfb",
        "name": "AU Small Finance Bank",
        "short": "AU SFB",
        "type": "Small Finance Bank",
        "rbi_license": "RBI Licensed Small Finance Bank",
        "dicgc_covered": True,
        "dicgc_limit": 500000,
        "trust_score": 8.0,
        "trust_label": "High Safety (up to ₹5L)",
        "color": "#F59E0B",
        "senior_extra": 0.50,
        "rates": {
            "3_months": 5.00,
            "6_months": 7.00,
            "9_months": 7.25,
            "1_year": 7.75,
            "2_year": 7.50,
            "3_year": 7.25,
            "5_year": 7.00,
        },
        "note": "Strong Small Finance Bank — well-capitalised, RBI compliant.",
    },
    {
        "id": "jana_sfb",
        "name": "Jana Small Finance Bank",
        "short": "Jana SFB",
        "type": "Small Finance Bank",
        "rbi_license": "RBI Licensed Small Finance Bank",
        "dicgc_covered": True,
        "dicgc_limit": 500000,
        "trust_score": 7.5,
        "trust_label": "Good Safety (up to ₹5L)",
        "color": "#F59E0B",
        "senior_extra": 0.50,
        "rates": {
            "3_months": 4.50,
            "6_months": 7.00,
            "9_months": 7.50,
            "1_year": 8.10,
            "2_year": 7.90,
            "3_year": 7.75,
            "5_year": 7.50,
        },
        "note": "Competitive rates — DICGC insured. Suitable for savvy investors.",
    },
    {
        "id": "unity_sfb",
        "name": "Unity Small Finance Bank",
        "short": "Unity SFB",
        "type": "Small Finance Bank",
        "rbi_license": "RBI Licensed Small Finance Bank",
        "dicgc_covered": True,
        "dicgc_limit": 500000,
        "trust_score": 7.2,
        "trust_label": "Good Safety (up to ₹5L)",
        "color": "#F59E0B",
        "senior_extra": 0.50,
        "rates": {
            "3_months": 4.50,
            "6_months": 7.50,
            "9_months": 8.00,
            "1_year": 9.00,
            "2_year": 8.50,
            "3_year": 8.25,
            "5_year": 8.00,
        },
        "note": "Highest rates in the market — DICGC insured. Ideal for amounts under ₹5L.",
    },
]

# Valid tenure keys for API queries
VALID_TENURES = [
    "3_months", "6_months", "9_months",
    "1_year", "2_year", "3_year", "5_year"
]


def get_all_banks(tenure: str = "1_year") -> list[dict]:
    """
    Return all banks with the rate for a specific tenure, sorted by rate descending.

    Args:
        tenure: Rate tenure key (e.g., '1_year', '3_months')

    Returns:
        List of bank dicts with a flat 'rate' field for the requested tenure
    """
    if tenure not in VALID_TENURES:
        tenure = "1_year"

    result = []
    for bank in BANKS:
        rate = bank["rates"].get(tenure)
        if rate is not None:
            entry = {k: v for k, v in bank.items() if k != "rates"}
            entry["rate"] = rate
            entry["tenure"] = tenure
            result.append(entry)

    return sorted(result, key=lambda b: b["rate"], reverse=True)


def get_recommended_banks(min_trust: float = 7.0) -> list[dict]:
    """
    Return banks with trust score above threshold, sorted by trust score descending.
    Used internally by the FD planner for laddering recommendations.

    Args:
        min_trust: Minimum trust score threshold (0–10)

    Returns:
        Filtered and sorted list of full bank dicts (with rates)
    """
    filtered = [b for b in BANKS if b["trust_score"] >= min_trust]
    return sorted(filtered, key=lambda b: b["trust_score"], reverse=True)


def get_bank_by_id(bank_id: str) -> dict | None:
    """
    Retrieve a single bank's complete data by its ID.

    Args:
        bank_id: Unique bank identifier string

    Returns:
        Bank dictionary or None if not found
    """
    return next((b for b in BANKS if b["id"] == bank_id), None)
