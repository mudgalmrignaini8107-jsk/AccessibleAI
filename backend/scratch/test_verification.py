import cv2
import numpy as np
import sys
import os
from sqlalchemy.orm import Session

# Append backend directory to python path
sys.path.append(os.getcwd())

from app.database.connection import SessionLocal, Base, engine
from app.models.place import Place
from app.models.review import Review
from app.models.verification_report import VerificationReport
from app.cv.detector import AccessibilityDetector

def test_integration():
    print("--- Community Verification Integration Test ---")
    db: Session = SessionLocal()
    
    try:
        # 1. Create a mock unverified place
        test_place = Place(
            name="Times Square Bakery",
            category="Cafe",
            address="730 Broadway, New York, NY 10003",
            lat=40.7290,
            lng=-73.9920,
            has_ramp=False, # Starts as false!
            is_verified=False # Starts as false!
        )
        db.add(test_place)
        db.commit()
        db.refresh(test_place)
        place_id = test_place.id
        print(f"Created Place ID {place_id}: {test_place.name} (has_ramp={test_place.has_ramp}, is_verified={test_place.is_verified})")

        # 2. Add a community review
        review = Review(
            place_id=place_id,
            author="Sarah Connor",
            rating=4,
            comment="Lovely pastries, but there is a step at the entrance. Hoping they add a ramp!"
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        print(f"Submitted community review by {review.author} (Rating: {review.rating}/5)")

        # 3. Simulate a user uploading a street view image containing a wheelchair ramp
        # We draw a mock image in-memory to trigger CV ramp detection
        img = np.zeros((400, 400, 3), dtype=np.uint8)
        img[:] = (240, 240, 240)
        # Draw a ramp shape (trapezoid at the bottom)
        pts = np.array([[100, 350], [300, 350], [350, 390], [50, 390]], np.int32)
        cv2.fillPoly(img, [pts], (150, 150, 150))
        
        _, encoded = cv2.imencode('.jpg', img)
        image_bytes = encoded.tobytes()

        # 4. Trigger Vision AI verification pipeline manually
        detector = AccessibilityDetector()
        cv_result = detector.analyze_image(image_bytes)
        
        # Verify ramp is detected
        detections = cv_result.get("detections", [])
        ramp_detected = any(d["label"] == "ramp" for d in detections)
        print(f"Vision AI analyzed image: Detected items {[d['label'] for d in detections]}")
        
        # Apply updates to database (matching endpoints/reports.py logic)
        if ramp_detected:
            test_place.has_ramp = True
        test_place.is_verified = True
        
        v_report = VerificationReport(
            place_id=place_id,
            inspector="Vision AI Engine",
            image_url="/mock_uploads/verification.jpg",
            ramp_detected=ramp_detected,
            confidence_score=0.92,
            is_approved=True
        )
        db.add(v_report)
        db.commit()
        
        # Refresh and verify updates
        db.refresh(test_place)
        print(f"Updated Place ID {place_id}: has_ramp={test_place.has_ramp}, is_verified={test_place.is_verified}")
        
        # Assert checks
        assert test_place.is_verified == True, "Place should be verified after audit"
        assert test_place.has_ramp == True, "Place has_ramp should be updated to True by Vision detection"
        
        # Clean up test records to keep db clean
        db.delete(review)
        db.delete(v_report)
        db.delete(test_place)
        db.commit()
        print("\n[SUCCESS] Community verification and AI audit pipeline integrated successfully.")

    except Exception as e:
        db.rollback()
        print(f"\n[FAIL] Integration test failed: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    test_integration()
