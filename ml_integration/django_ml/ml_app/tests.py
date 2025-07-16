from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class CourseRecommendationTests(APITestCase):
    def setUp(self):
        self.url = reverse('recommend-courses')

    # Integration Test: Full recommendation flow with valid input
    def test_recommendation_success(self):
        data = {
            "query": "web development",
            "category": "Computer Science"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("recommendations", response.data)
        self.assertIsInstance(response.data["recommendations"], list)

    # Functional Test: Missing 'query' field validation
    def test_missing_query_field(self):
        data = {
            "category": "Computer Science"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    # Integration Test: Query with default category
    def test_default_category_all(self):
        data = {
            "query": "python"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("recommendations", response.data)

    # Functional Test: Invalid category value should not break the system
    def test_invalid_category_value(self):
        data = {
            "query": "design",
            "category": "Astronomy"  # invalid category
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("recommendations", response.data)
        self.assertIsInstance(response.data["recommendations"], list)
