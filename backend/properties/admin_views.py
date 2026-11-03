from django.db import transaction

from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.admin_views import IsAdminUser

from .models import Property
from .serializers import (
    AmenitySerializer,
    RentalUnitSerializer,
    PropertyImageSerializer,
)


class AdminPropertySerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    rental_units = RentalUnitSerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "property_type",
            "address",
            "city",
            "country",
            "status",
            "amenities",
            "rental_units",
            "images",
        ]


def get_admin_property_queryset():
    return (
        Property.objects
        .select_related("owner")
        .prefetch_related(
            "amenities",
            "images",
            "rental_units__amenities",
            "rental_units__images",
        )
        .order_by("id")
    )


class AdminPropertyListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        properties = get_admin_property_queryset()
        serializer = AdminPropertySerializer(properties, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class AdminPropertyUpdateAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        if not request.data:
            return Response(
                {"error": "Status is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if set(request.data.keys()) != {"status"}:
            return Response(
                {"error": "Only status can be updated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_status = request.data.get("status")

        if (
            not isinstance(new_status, str)
            or new_status not in Property.Status.values
        ):
            return Response(
                {
                    "error": (
                        "Invalid status. Allowed values: "
                        "NEW, PUBLISHED, INACTIVE."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            property_obj = get_admin_property_queryset().get(pk=pk)
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        property_obj.status = new_status
        property_obj.save(update_fields=["status", "updated_at"])

        return Response(
            AdminPropertySerializer(property_obj).data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def delete(self, request, pk):
        try:
            property_obj = (
                Property.objects
                .select_for_update()
                .get(pk=pk)
            )
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        has_bookings = property_obj.rental_units.filter(
            bookings__isnull=False
        ).exists()

        if has_bookings:
            return Response(
                {
                    "error": (
                        "Cannot delete property because it has bookings. "
                        "Set its status to INACTIVE instead."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        property_obj.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)