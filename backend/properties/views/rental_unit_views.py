
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Property, RentalUnit
from ..serializers import (
    RentalUnitSerializer,
    RentalUnitWriteSerializer,
)


class PropertyRentalUnitListCreateAPIView(APIView):
    """
    GET: отримання опублікованих кімнат об'єкта.
    POST: створення кімнати власником об'єкта.
    """

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk):
        property_obj = get_object_or_404(
            Property,
            pk=pk,
            status=Property.Status.PUBLISHED,
        )

        rental_units = RentalUnit.objects.filter(
            property=property_obj,
            is_published=True,
        ).prefetch_related("amenities", "images")

        serializer = RentalUnitSerializer(
            rental_units,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request, pk):
        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can create rooms."},
                status=status.HTTP_403_FORBIDDEN,
            )

        property_obj = get_object_or_404(
            Property,
            pk=pk,
        )

        if property_obj.owner_id != request.user.id:
            return Response(
                {"detail": "You can only add rooms to your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = RentalUnitWriteSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            serializer.validated_data.get("is_published", False)
            and property_obj.status != Property.Status.PUBLISHED
        ):
            return Response(
                {
                    "is_published": (
                        "Cannot publish a room while its property is not published."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        rental_unit = serializer.save(property=property_obj)

        return Response(
            RentalUnitSerializer(rental_unit).data,
            status=status.HTTP_201_CREATED,
        )


class RentalUnitDetailAPIView(APIView):
    """
    GET: перегляд кімнати.
    PATCH: редагування кімнати власником.
    DELETE: деактивація кімнати власником.
    """

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk):
        rental_unit = get_object_or_404(
            RentalUnit.objects.select_related("property").prefetch_related(
                "amenities",
                "images",
            ),
            pk=pk,
            is_published=True,
            property__status=Property.Status.PUBLISHED,
        )

        serializer = RentalUnitSerializer(rental_unit)

        return Response(serializer.data)

    def _get_owner_room(self, request, pk):
        if not hasattr(request.user, "profile"):
            return None, Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return None, Response(
                {"detail": "Only owners can manage rooms."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            rental_unit = RentalUnit.objects.select_related(
                "property"
            ).get(pk=pk)
        except RentalUnit.DoesNotExist:
            return None, Response(
                {"detail": "Room not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if rental_unit.property.owner_id != request.user.id:
            return None, Response(
                {"detail": "You can only manage your own rooms."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return rental_unit, None

    def patch(self, request, pk):
        rental_unit, error = self._get_owner_room(request, pk)

        if error:
            return error

        serializer = RentalUnitWriteSerializer(
            rental_unit,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            serializer.validated_data.get("is_published") is True
            and rental_unit.property.status != Property.Status.PUBLISHED
        ):
            return Response(
                {
                    "is_published": (
                        "Cannot publish a room while its property is not published."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        rental_unit = serializer.save()

        return Response(
            RentalUnitSerializer(rental_unit).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        rental_unit, error = self._get_owner_room(request, pk)

        if error:
            return error

        rental_unit.is_published = False
        rental_unit.save(update_fields=["is_published", "updated_at"])

        return Response(
            {
                "detail": "Room deactivated successfully.",
                "id": rental_unit.id,
                "is_published": rental_unit.is_published,
            },
            status=status.HTTP_200_OK,
        )
