from django.db.models import Prefetch

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import PropertyCollection, Property, RentalUnit
from ..serializers import PropertyCollectionSerializer


class PropertyCollectionListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        published_units = RentalUnit.objects.filter(
            is_published=True
        ).prefetch_related(
            "amenities",
            "images",
        )

        published_properties = Property.objects.filter(
            status=Property.Status.PUBLISHED
        ).prefetch_related(
            Prefetch(
                "rental_units",
                queryset=published_units,
            ),
            "amenities",
            "images",
            "categories",
        )

        collections = (
            PropertyCollection.objects
            .filter(is_active=True)
            .prefetch_related(
                Prefetch(
                    "properties",
                    queryset=published_properties,
                )
            )
            .order_by("sort_order", "name")
        )

        serializer = PropertyCollectionSerializer(
            collections,
            many=True,
        )

        return Response(serializer.data)