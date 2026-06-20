class ScoringEngine:
    @staticmethod
    def calculate_accessibility_index(features: dict, profile: str = "none") -> dict:
        """
        Computes a profile-specific accessibility index (0-100) based on weighted features
        and returns the score, categorical grade, active barriers, and owner suggestions.
        """
        # Set default flags
        has_ramp = features.get("has_ramp", False)
        has_elevator = features.get("has_elevator", False)
        has_handrail = features.get("has_handrail", False)
        has_accessible_washroom = features.get("has_accessible_washroom", False)
        has_nursing_room = features.get("has_nursing_room", False)
        has_step_free_entrance = features.get("has_step_free_entrance", False)
        stair_count = features.get("stair_count", 0)
        has_seating = features.get("has_seating", False)
        has_parking = features.get("has_parking", False)
        is_verified = features.get("is_verified", False)

        score = 75 # Baseline general score
        barriers = []
        recommendations = []

        if is_verified:
            score += 5

        # Recalculate based on Active Passport Profile
        if profile == "none" or not profile:
            # General Score logic
            if has_ramp: score += 5
            else: recommendations.append("Install an entrance ramp (+5 points)")
            
            if has_elevator: score += 5
            else: recommendations.append("Install an elevator or lift lift (+5 points)")
            
            if has_handrail: score += 5
            else: recommendations.append("Install support handrails (+5 points)")
            
            if has_accessible_washroom: score += 5
            
            if has_step_free_entrance: score += 5
            else: barriers.append("Stepped entryway")
            
            if stair_count > 0:
                score -= min(stair_count * 2, 15)
                barriers.append(f"{stair_count} steps at entrance")

        elif profile == "wheelchair":
            # Wheelchair: Ramps and Elevators are critical
            points = 0
            points += 30 if has_ramp else 0
            points += 30 if has_elevator else 0
            points += 20 if has_step_free_entrance else 0
            points += 20 if has_accessible_washroom else 0
            score = points

            if not has_ramp:
                barriers.append("No wheelchair ramp detected at entrance")
                recommendations.append("Install an entrance ramp (+30 points)")
            if not has_elevator:
                barriers.append("Multi-level building without elevator access")
                recommendations.append("Install a vertical platform lift (+30 points)")
            if not has_accessible_washroom:
                barriers.append("No accessible restroom cabin")
                recommendations.append("Convert standard restroom to wide wheelchair cabin (+20 points)")
            if stair_count > 0 and not has_ramp:
                score -= min(stair_count * 8, 50)
                barriers.append(f"Inaccessible steps barrier ({stair_count} stairs)")

        elif profile == "senior":
            # Senior: Handrails, Elevators, seating are key
            points = 0
            points += 30 if has_handrail else 0
            points += 30 if has_elevator else 0
            points += 20 if has_seating else 0
            points += 20 if has_ramp else 0
            score = points

            if not has_handrail:
                barriers.append("Missing hallway or stairway support handrails")
                recommendations.append("Install steel grab handrails in corridors (+30 points)")
            if not has_seating:
                barriers.append("No resting seating zones in walking corridors")
                recommendations.append("Place resting benches every 50 meters (+20 points)")
            if stair_count > 5:
                score -= 20
                barriers.append(f"Significant stair count ({stair_count} steps) without elevator option")

        elif profile == "stroller":
            # Stroller: Elevators, Ramps, parking
            points = 0
            points += 35 if has_elevator else 0
            points += 35 if has_ramp else 0
            points += 15 if has_step_free_entrance else 0
            points += 15 if has_parking else 0
            score = points

            if not has_elevator:
                barriers.append("No lift option for baby carriage transport")
                recommendations.append("Add vertical elevator access (+35 points)")
            if stair_count > 0 and not has_ramp:
                score -= 30
                barriers.append("Entrance steps without side ramp")
                recommendations.append("Add side stroller ramp (+35 points)")

        elif profile == "injury":
            # Temporary Injury: Handrails, Elevators, seating
            points = 0
            points += 35 if has_handrail else 0
            points += 35 if has_elevator else 0
            points += 15 if has_seating else 0
            points += 15 if has_ramp else 0
            score = points

            if not has_handrail:
                barriers.append("No support handrails for crutch users")
                recommendations.append("Attach support grab rails (+35 points)")
            if stair_count > 0:
                score -= min(stair_count * 5, 35)
                barriers.append(f"Stepped stairs count ({stair_count} steps)")

        elif profile == "mother":
            # Mother: Nursing room is primary
            points = 0
            points += 55 if has_nursing_room else 0
            points += 25 if has_elevator else 0
            points += 20 if has_accessible_washroom else 0
            score = points

            if not has_nursing_room:
                barriers.append("No designated private nursing / feeding lounge")
                recommendations.append("Configure a private nursing room with baby changing station (+55 points)")

        # Bind score limits
        score = max(0, min(100, int(score)))

        # Assign grades
        if score >= 85:
            grade = "Fully Accessible"
        elif score >= 60:
            grade = "Partially Accessible"
        else:
            grade = "Inaccessible"

        return {
            "score": score,
            "grade": grade,
            "profile": profile,
            "barriers": barriers,
            "recommendations": recommendations
        }
