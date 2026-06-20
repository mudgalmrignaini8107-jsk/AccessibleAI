import sys
import os

# Append backend directory to python path
sys.path.append(os.getcwd())

from app.scoring.engine import ScoringEngine

def test_scoring_engine():
    print("--- Backend Scoring Engine Verification ---")

    # Mock location features (like a stepped cafe without a ramp)
    stepped_cafe = {
        "has_ramp": False,
        "has_elevator": False,
        "has_handrail": True,
        "has_accessible_washroom": False,
        "has_nursing_room": False,
        "has_step_free_entrance": False,
        "stair_count": 5,
        "has_seating": True,
        "has_parking": False,
        "is_verified": False,
    }

    # Case 1: Wheelchair User (Ramp is critical, stairs penalize)
    wc_result = ScoringEngine.calculate_accessibility_index(stepped_cafe, "wheelchair")
    print(f"Wheelchair profile score: {wc_result['score']}/100 ({wc_result['grade']})")
    print(f" - Barriers: {wc_result['barriers']}")
    print(f" - Recs: {wc_result['recommendations']}")
    assert wc_result["score"] < 50, "Wheelchair score should be low for stepped entryway"

    # Case 2: Senior Citizen
    sr_result = ScoringEngine.calculate_accessibility_index(stepped_cafe, "senior")
    print(f"\nSenior profile score: {sr_result['score']}/100 ({sr_result['grade']})")
    print(f" - Barriers: {sr_result['barriers']}")
    assert sr_result["score"] >= 50, "Senior score should remain moderate due to handrails/seating"

    # Case 3: Nursing Mother (without nursing room)
    mom_result = ScoringEngine.calculate_accessibility_index(stepped_cafe, "mother")
    print(f"\nMother profile score: {mom_result['score']}/100 ({mom_result['grade']})")
    print(f" - Barriers: {mom_result['barriers']}")
    assert mom_result["score"] == 0, "Mother score should be 0 without nursing room/elevator/washroom"

    # Case 4: General Access (No profile selected)
    gen_result = ScoringEngine.calculate_accessibility_index(stepped_cafe, "none")
    print(f"\nGeneral access score: {gen_result['score']}/100 ({gen_result['grade']})")
    print(f" - Barriers: {gen_result['barriers']}")

    print("\n[SUCCESS] Scoring calculations functioning correctly under all profiles.")

if __name__ == '__main__':
    test_scoring_engine()
