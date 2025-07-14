from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .recommender import recommend_courses

class CourseRecommendView(APIView):
    def post(self, request):
        query = request.data.get("query", "")
        category = request.data.get("category", "ALL")
        
        if not query:
            return Response({"error": "Query is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        results = recommend_courses(query, category)
        return Response({"recommendations": results}, status=status.HTTP_200_OK)
