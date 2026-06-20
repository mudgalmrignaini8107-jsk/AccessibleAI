import unittest
import json
from fastapi.testclient import TestClient
import sys
import os

# Append backend directory to python path
sys.path.append(os.getcwd())

from app.main import app

class TestAccessibleAI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        """Test the baseline root health check endpoint"""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "Accessible AI Backend")

    def test_scoring_endpoint(self):
        """Test dynamic score calculation API"""
        payload = {
            "features": {
                "has_ramp": True,
                "has_elevator": True,
                "has_handrail": True,
                "has_accessible_washroom": True,
                "has_step_free_entrance": True,
                "stair_count": 0,
                "is_verified": True
            },
            "profile": "wheelchair"
        }
        response = self.client.post("/api/scoring/calculate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["profile"], "wheelchair")
        self.assertEqual(data["grade"], "Fully Accessible")
        self.assertGreaterEqual(data["score"], 85)

    def test_places_and_seeding(self):
        """Test querying places and verify seeder populates SQLite on startup"""
        response = self.client.get("/api/places/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data), 0)
        self.assertEqual(data[0]["name"], "Sweet Pastel Cafe")

    def test_ai_recommendations(self):
        """Test query recommendations ranked by profile preferences"""
        response = self.client.get("/api/places/recommendations?profile=wheelchair")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data), 0)
        # Top recommendations should be verified with ramps
        self.assertTrue(data[0]["features"]["has_ramp"])

    def test_reviews_submission(self):
        """Test community review submission pipeline"""
        # Submit review for Times Square Cafe (ID 1)
        payload = {
            "place_id": 1,
            "author": "Test Reviewer",
            "rating": 5,
            "comment": "Outstanding wheelchair access! Handrails are solid."
        }
        response = self.client.post("/api/reviews/", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["author"], "Test Reviewer")
        self.assertEqual(data["rating"], 5)

        # Retrieve reviews to verify persistence
        get_res = self.client.get("/api/reviews/place/1")
        self.assertEqual(get_res.status_code, 200)
        reviews = get_res.json()
        self.assertGreater(len(reviews), 0)
        self.assertEqual(reviews[0]["author"], "Test Reviewer")

if __name__ == "__main__":
    unittest.main()
