
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from ..models import Property, RentalUnit, PropertyImage
from ..serializers import PropertyImageSerializer


class PropertyImageListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Перевіряємо роль користувача.
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

        # Знаходимо житло в базі.
        try:
            property_obj = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Власник може керувати фотографіями лише свого житла.
        if property_obj.owner_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You can only manage images of your own properties."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        image_url = request.data.get("image_url")
        is_main = request.data.get("is_main", False)
        rental_unit_id = request.data.get("rental_unit")

        if not isinstance(image_url, str) or not image_url.strip():
            return Response(
                {"detail": "image_url is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(is_main, bool):
            return Response(
                {"detail": "is_main must be a boolean."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Якщо фотографія належить одиниці оренди, перевіряємо її.
        rental_unit = None

        if rental_unit_id is not None:
            try:
                rental_unit = RentalUnit.objects.get(
                    pk=rental_unit_id,
                    property=property_obj,
                )
            except (RentalUnit.DoesNotExist, ValueError, TypeError):
                return Response(
                    {
                        "detail": (
                            "Rental unit not found for this property."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Для одного житла залишаємо лише одну головну фотографію.
        if is_main:
            PropertyImage.objects.filter(
                property=property_obj,
                is_main=True,
            ).update(is_main=False)

        has_images = PropertyImage.objects.filter(
            property=property_obj
        ).exists()

        image = PropertyImage.objects.create(
            property=property_obj,
            rental_unit=rental_unit,
            image_url=image_url.strip(),
            is_main=is_main or not has_images,
        )

        return Response(
            PropertyImageSerializer(image).data,
            status=status.HTTP_201_CREATED,
        )


class PropertyImageDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, image_id):
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

        try:
            property_obj = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
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
            image = PropertyImage.objects.get(
                pk=image_id,
                property=property_obj,
            )
        except PropertyImage.DoesNotExist:
            return Response(
                {"detail": "Image not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        image.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
