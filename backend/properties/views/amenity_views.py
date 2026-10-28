
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Amenity
from ..serializers import AmenitySerializer


class AmenityListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        amenities = Amenity.objects.all().order_by("name")
        serializer = AmenitySerializer(amenities, many=True)
        return Response(serializer.data)
