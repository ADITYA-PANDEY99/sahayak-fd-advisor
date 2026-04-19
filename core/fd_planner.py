"""
FD Laddering Calculator.

Implements goal-based Fixed Deposit laddering strategy — splitting available
funds across multiple FDs with staggered maturities to maximize returns while
maintaining milestone-based liquidity.
"""

from dataclasses import dataclass, field
from typing import Optional
from data.bank_rates import get_recommended_banks


@dataclass
class FDSlice:
    """Represents a single FD in the laddering plan."""
    bank_name: str
    bank_short_name: str
    principal: float
    annual_rate: float
    tenure_months: int
    maturity_amount: float
    maturity_date_offset_months: int  # Months from today when this FD matures
    label: str  # Human-readable milestone label (e.g., "Tranche 1 — Early milestone")


@dataclass
class LadderingPlan:
    """Complete FD laddering plan for a financial goal."""
    goal_amount: float
    available_funds: float
    months_to_goal: int
    slices: list[FDSlice] = field(default_factory=list)
    total_maturity_value: float = 0.0
    goal_achievable: bool = False
    shortfall: float = 0.0
    surplus: float = 0.0
    strategy_note: str = ""


class FDPlanner:
    """
    Calculates optimal FD laddering plans based on user financial goals.

    Laddering splits the investment into multiple FDs maturing at different
    intervals, ensuring:
    - Liquidity at key milestones
    - Higher returns from longer-tenure FDs
    - Reduced reinvestment risk
    """

    def calculate_ladder(
        self,
        goal_amount: float,
        available_funds: float,
        months_to_goal: int,
    ) -> dict:
        """
        Generate a layered FD laddering plan.

        Strategy:
        - For goals <= 12 months: single FD in highest-rate bank
        - For goals 13-24 months: 2-tranche ladder (50/50 split)
        - For goals >= 25 months: 3-tranche ladder (33/33/34 split at 1/3, 2/3, full tenure)

        Args:
            goal_amount: Target amount needed in INR
            available_funds: Total investable amount in INR
            months_to_goal: Time horizon in months

        Returns:
            Serializable dictionary representing the LadderingPlan
        """
        plan = LadderingPlan(
            goal_amount=goal_amount,
            available_funds=available_funds,
            months_to_goal=months_to_goal,
        )

        recommended_banks = get_recommended_banks()

        if months_to_goal <= 12:
            plan = self._single_tranche_plan(plan, recommended_banks)
        elif months_to_goal <= 24:
            plan = self._two_tranche_plan(plan, recommended_banks)
        else:
            plan = self._three_tranche_plan(plan, recommended_banks)

        # Compute totals and goal assessment
        plan.total_maturity_value = sum(s.maturity_amount for s in plan.slices)
        plan.goal_achievable = plan.total_maturity_value >= goal_amount

        if plan.goal_achievable:
            plan.surplus = plan.total_maturity_value - goal_amount
            plan.strategy_note = (
                f"Your laddering plan will yield ₹{plan.total_maturity_value:,.0f} "
                f"against your goal of ₹{goal_amount:,.0f} — "
                f"a surplus of ₹{plan.surplus:,.0f}."
            )
        else:
            plan.shortfall = goal_amount - plan.total_maturity_value
            plan.strategy_note = (
                f"With the current investment, you will accumulate ₹{plan.total_maturity_value:,.0f}. "
                f"To meet your goal of ₹{goal_amount:,.0f}, consider investing an additional "
                f"₹{plan.shortfall:,.0f} or extending the tenure slightly."
            )

        return self._serialize(plan)

    # ─── Private Plan Builders ────────────────────────────────────────────────

    def _single_tranche_plan(self, plan: LadderingPlan, banks: list) -> LadderingPlan:
        """Single FD for short-horizon goals (≤ 12 months)."""
        bank = banks[0]  # Highest trust + rate for short tenure
        rate = bank["rates"].get("1_year", bank["rates"].get("6_months", 7.0))
        maturity = self._compound_maturity(plan.available_funds, rate, plan.months_to_goal)

        plan.slices.append(FDSlice(
            bank_name=bank["name"],
            bank_short_name=bank.get("short", bank["name"]),
            principal=plan.available_funds,
            annual_rate=rate,
            tenure_months=plan.months_to_goal,
            maturity_amount=maturity,
            maturity_date_offset_months=plan.months_to_goal,
            label="Single FD — Full amount at maturity",
        ))
        return plan

    def _two_tranche_plan(self, plan: LadderingPlan, banks: list) -> LadderingPlan:
        """Two-tranche ladder for medium-horizon goals (13–24 months)."""
        half = plan.available_funds / 2
        mid_months = plan.months_to_goal // 2

        # Tranche 1: matures at midpoint
        bank_a = banks[0]
        rate_a = self._get_rate_for_tenure(bank_a, mid_months)
        maturity_a = self._compound_maturity(half, rate_a, mid_months)

        plan.slices.append(FDSlice(
            bank_name=bank_a["name"],
            bank_short_name=bank_a.get("short", bank_a["name"]),
            principal=half,
            annual_rate=rate_a,
            tenure_months=mid_months,
            maturity_amount=maturity_a,
            maturity_date_offset_months=mid_months,
            label="Tranche 1 — Mid-milestone liquidity",
        ))

        # Tranche 2: matures at full tenure
        bank_b = banks[1] if len(banks) > 1 else banks[0]
        rate_b = self._get_rate_for_tenure(bank_b, plan.months_to_goal)
        maturity_b = self._compound_maturity(half, rate_b, plan.months_to_goal)

        plan.slices.append(FDSlice(
            bank_name=bank_b["name"],
            bank_short_name=bank_b.get("short", bank_b["name"]),
            principal=half,
            annual_rate=rate_b,
            tenure_months=plan.months_to_goal,
            maturity_amount=maturity_b,
            maturity_date_offset_months=plan.months_to_goal,
            label="Tranche 2 — Goal maturity",
        ))

        return plan

    def _three_tranche_plan(self, plan: LadderingPlan, banks: list) -> LadderingPlan:
        """Three-tranche ladder for long-horizon goals (≥ 25 months)."""
        third = plan.available_funds / 3
        first_months = plan.months_to_goal // 3
        second_months = (plan.months_to_goal * 2) // 3
        final_months = plan.months_to_goal

        tranches = [
            (first_months, "Tranche 1 — Early liquidity checkpoint"),
            (second_months, "Tranche 2 — Mid-goal milestone"),
            (final_months, "Tranche 3 — Final goal maturity"),
        ]

        for i, (tenure, label) in enumerate(tranches):
            bank = banks[min(i, len(banks) - 1)]
            rate = self._get_rate_for_tenure(bank, tenure)
            maturity = self._compound_maturity(third, rate, tenure)

            plan.slices.append(FDSlice(
                bank_name=bank["name"],
                bank_short_name=bank.get("short", bank["name"]),
                principal=third,
                annual_rate=rate,
                tenure_months=tenure,
                maturity_amount=maturity,
                maturity_date_offset_months=tenure,
                label=label,
            ))

        return plan

    # ─── Utility Methods ──────────────────────────────────────────────────────

    @staticmethod
    def _compound_maturity(principal: float, annual_rate: float, months: int) -> float:
        """
        Calculate FD maturity amount using quarterly compounding formula.

        Formula: P × (1 + r/4)^(4t)
        Where r = annual rate / 100, t = tenure in years

        Args:
            principal: Initial deposit amount in INR
            annual_rate: Annual interest rate as percentage (e.g., 7.5)
            months: Tenure in months

        Returns:
            Maturity amount rounded to 2 decimal places
        """
        r = annual_rate / 100
        t = months / 12
        maturity = principal * ((1 + r / 4) ** (4 * t))
        return round(maturity, 2)

    @staticmethod
    def _get_rate_for_tenure(bank: dict, months: int) -> float:
        """
        Select the closest applicable FD rate from a bank's rate schedule.

        Args:
            bank: Bank data dictionary with nested 'rates' dict
            months: Desired tenure in months

        Returns:
            Best matching annual rate as float
        """
        rates = bank.get("rates", {})

        # Tenure-to-rate-key mapping (approximate)
        mapping = [
            (3, "3_months"),
            (6, "6_months"),
            (9, "9_months"),
            (12, "1_year"),
            (18, "1_year"),
            (24, "2_year"),
            (36, "3_year"),
            (60, "5_year"),
        ]

        selected_rate = rates.get("1_year", 7.0)  # Default fallback
        for threshold, key in mapping:
            if months <= threshold:
                selected_rate = rates.get(key, selected_rate)
                break
        else:
            selected_rate = rates.get("5_year", rates.get("3_year", 7.0))

        return selected_rate

    @staticmethod
    def _serialize(plan: LadderingPlan) -> dict:
        """Convert LadderingPlan dataclass to a JSON-serializable dictionary."""
        return {
            "goal_amount": plan.goal_amount,
            "available_funds": plan.available_funds,
            "months_to_goal": plan.months_to_goal,
            "total_maturity_value": plan.total_maturity_value,
            "goal_achievable": plan.goal_achievable,
            "shortfall": plan.shortfall,
            "surplus": plan.surplus,
            "strategy_note": plan.strategy_note,
            "slices": [
                {
                    "bank_name": s.bank_name,
                    "bank_short_name": s.bank_short_name,
                    "principal": s.principal,
                    "annual_rate": s.annual_rate,
                    "tenure_months": s.tenure_months,
                    "maturity_amount": s.maturity_amount,
                    "maturity_date_offset_months": s.maturity_date_offset_months,
                    "label": s.label,
                }
                for s in plan.slices
            ],
        }
