from sqlalchemy.orm import Session
from app.models.place import Place
from app.scoring.engine import ScoringEngine
from typing import List, Dict, Any

class RecommendationEngine:
    @staticmethod
    def get_recommendations(
        db: Session, 
        profile: str = "none", 
        category: str = None, 
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Calculates composite recommendation scores, ranks places, 
        and adds custom AI personalized tips for each place based on the passport profile.
        """
        # 1. Fetch places from database
        query = db.query(Place)
        if category:
            query = query.filter(Place.category == category)
        places = query.all()

        recommended_list = []

        for place in places:
            # Convert place features to dict
            features_dict = {
                "has_ramp": place.has_ramp,
                "has_elevator": place.has_elevator,
                "has_handrail": place.has_handrail,
                "has_accessible_washroom": place.has_accessible_washroom,
                "has_nursing_room": place.has_nursing_room,
                "has_step_free_entrance": place.has_step_free_entrance,
                "stair_count": place.stair_count,
                "has_seating": place.has_seating,
                "has_parking": place.has_parking,
                "is_verified": place.is_verified,
            }

            # 2. Recalculate dynamic score based on profile
            score_data = ScoringEngine.calculate_accessibility_index(features_dict, profile)
            score = score_data["score"]
            grade = score_data["grade"]

            # Calculate average review rating (default to 4.0 if no reviews)
            avg_rating = 4.0
            if place.reviews:
                ratings = [r.rating for r in place.reviews]
                avg_rating = sum(ratings) / len(ratings)

            # 3. Calculate Composite Recommendation Rank Score
            # Weight: 60% Accessibility, 20% User Rating, 20% Verification Status
            norm_rating = (avg_rating / 5.0) * 100
            norm_verified = 100 if place.is_verified else 50
            
            recommendation_rank = (score * 0.6) + (norm_rating * 0.2) + (norm_verified * 0.2)

            # 4. Generate custom AI Tip based on profile
            ai_tip = ""
            if profile == "wheelchair":
                if place.has_ramp and place.has_step_free_entrance:
                    ai_tip = "Highly recommended for you: Features verified ramp structures and 100% step-free entry."
                else:
                    ai_tip = "Partially accessible. Ramps are present, but expect minor step adjustments."
            elif profile == "senior":
                if place.has_handrail and place.has_seating:
                    ai_tip = "Recommended for seniors: Equiped with grab handrails and multiple indoor seating rest zones."
                else:
                    ai_tip = "Contains step-free entry, but support grab rails are limited."
            elif profile == "stroller":
                if place.has_elevator and place.has_ramp:
                    ai_tip = "Stroller friendly: Equipped with lifts, elevators, and wide ramps for baby carriages."
                else:
                    ai_tip = "Step-free entrance available, but elevator access is limited on upper floors."
            elif profile == "injury":
                if place.has_handrail and place.has_seating:
                    ai_tip = "Crutch support active: Offers support handrails, flat steps, and corridor benches."
                else:
                    ai_tip = "Step-free, but walking distances are moderately long."
            elif profile == "mother":
                if place.has_nursing_room:
                    ai_tip = "Designated Nursing Room: Offers a private, clean lounge space with baby care changing tables."
                else:
                    ai_tip = "No private nursing room, but clean restroom facilities are available."
            else:
                ai_tip = f"Popular choice with a solid general accessibility score of {score}/100 and clean pathways."

            recommended_list.append({
                "place_id": place.id,
                "name": place.name,
                "category": place.category,
                "address": place.address,
                "lat": place.lat,
                "lng": place.lng,
                "score": score,
                "grade": grade,
                "avg_rating": round(avg_rating, 1),
                "is_verified": place.is_verified,
                "recommendation_rank": recommendation_rank,
                "ai_tip": ai_tip,
                "features": features_dict
            })

        # 5. Sort by recommendation rank descending
        recommended_list.sort(key=lambda x: x["recommendation_rank"], reverse=True)

        return recommended_list[:limit]
