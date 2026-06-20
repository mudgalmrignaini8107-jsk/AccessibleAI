import sys
import os
from sqlalchemy.orm import Session

# Append backend directory to python path
sys.path.append(os.getcwd())

from app.database.connection import SessionLocal
from app.api.endpoints.places import check_and_seed_db
from app.ai.recommendation import RecommendationEngine

def test_recommendations():
    print("--- AI Recommendations Verification ---")
    db: Session = SessionLocal()
    
    try:
        # 1. Seed database if empty
        check_and_seed_db(db)
        
        # 2. Get recommendations for Wheelchair profile
        wc_recs = RecommendationEngine.get_recommendations(db, "wheelchair", limit=2)
        print("\n[WHEELCHAIR USER PROFILE RECOMMENDATIONS]")
        for i, rec in enumerate(wc_recs):
            print(f"{i+1}. {rec['name']} ({rec['category']}) - Rec Rank: {rec['recommendation_rank']:.1f}")
            print(f"   Score: {rec['score']}/100, Verified: {rec['is_verified']}")
            print(f"   AI Tip: {rec['ai_tip']}")
        
        # Wheelchair priority locations should have ramps/step-free
        assert wc_recs[0]["score"] >= 80, "Top wheelchair recommendation should have high accessibility score"

        # 3. Get recommendations for Breastfeeding Mother profile
        mom_recs = RecommendationEngine.get_recommendations(db, "mother", limit=2)
        print("\n[BREASTFEEDING MOTHER PROFILE RECOMMENDATIONS]")
        for i, rec in enumerate(mom_recs):
            print(f"{i+1}. {rec['name']} ({rec['category']}) - Rec Rank: {rec['recommendation_rank']:.1f}")
            print(f"   Score: {rec['score']}/100, Has Nursing Room: {rec['features']['has_nursing_room']}")
            print(f"   AI Tip: {rec['ai_tip']}")

        # Mother priority locations should have nursing room
        assert mom_recs[0]["features"]["has_nursing_room"] == True, "Top mother recommendation should feature nursing room"

        print("\n[SUCCESS] AI Recommendation Engine successfully ranks and personalizes advice.")

    except Exception as e:
        print(f"\n[FAIL] Recommendation test failed: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    test_recommendations()
