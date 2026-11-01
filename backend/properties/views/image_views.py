from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Property, PropertyImage
from ..serializers import (
    PropertyImageSerializer,
    PropertyImageWriteSerializer,
)


class PropertyImageListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        with transaction.atomic():
            try:
                property_obj = Property.objects.select_for_update().get(
                    pk=pk
                )
            except Property.DoesNotExist:
                return Response(
                    {"detail": "Property not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if not hasattr(request.user, "profile"):
                return Response(
                    {"detail": "User profile not found."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if request.user.profile.role != "OWNER":
                return Response(
                    {"detail": "Only owners can manage property images."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if property_obj.owner_id != request.user.id:
                return Response(
                    {
                        "detail": (
                            "You can only manage images of your own properties."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = PropertyImageWriteSerializer(
                data=request.data,
                context={"property": property_obj},
            )

            if not serializer.is_valid():
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST,
                )

            rental_unit = serializer.validated_data.get("rental_unit")
            is_main = serializer.validated_data.get("is_main", False)

            # Визначаємо групу фотографій:
            # окремо для Property або конкретного RentalUnit.
            images = PropertyImage.objects.filter(
                property=property_obj,
                rental_unit=rental_unit,
            )

            has_main_image = images.filter(is_main=True).exists()

            # Перше фото групи автоматично стає головним.
            make_main = is_main or not has_main_image

            # Скидаємо головне фото тільки в межах цієї групи.
            if make_main:
                images.filter(is_main=True).update(is_main=False)

            image = PropertyImage.objects.create(
                property=property_obj,
                rental_unit=rental_unit,
                image_url=serializer.validated_data["image_url"],
                is_main=make_main,
            )

        return Response(
            PropertyImageSerializer(image).data,
            status=status.HTTP_201_CREATED,
        )


class PropertyImageDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, image_id):
        with transaction.atomic():
            try:
                property_obj = Property.objects.select_for_update().get(
                    pk=pk
                )
            except Property.DoesNotExist:
                return Response(
                    {"detail": "Property not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if not hasattr(request.user, "profile"):
                return Response(
                    {"detail": "User profile not found."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if request.user.profile.role != "OWNER":
                return Response(
                    {"detail": "Only owners can manage property images."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if property_obj.owner_id != request.user.id:
                return Response(
                    {
                        "detail": (
                            "You can only manage images of your own properties."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            try:
                image = PropertyImage.objects.select_for_update().get(
                    pk=image_id,
                    property=property_obj,
                )
            except PropertyImage.DoesNotExist:
                return Response(
                    {"detail": "Image not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Запам'ятовуємо групу, до якої належало фото.
            rental_unit_id = image.rental_unit_id

            image.delete()

            # Перевіряємо, чи залишилося головне фото в цій групі.
            remaining_images = PropertyImage.objects.filter(
                property=property_obj,
                rental_unit_id=rental_unit_id,
            )

            if not remaining_images.filter(is_main=True).exists():
                next_image = remaining_images.order_by(
                    "created_at",
                    "id",
                ).first()

                if next_image:
                    next_image.is_main = True
                    next_image.save(update_fields=["is_main"])

        return Response(status=status.HTTP_204_NO_CONTENT)