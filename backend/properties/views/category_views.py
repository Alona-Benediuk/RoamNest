from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Category
from ..serializers import CategorySerializer


class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.filter(
            is_active=True
        ).order_by("sort_order", "name")

        serializer = CategorySerializer(categories, many=True)

        return Response(serializer.data)