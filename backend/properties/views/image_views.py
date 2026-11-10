import logging
import uuid

from django.db import transaction

from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Property, PropertyImage
from ..serializers import (
    PropertyImageSerializer,
    PropertyImageWriteSerializer,
)
from ..storage import (
    StorageError,
    delete_file,
    get_public_url,
    upload_file,
)


logger = logging.getLogger(__name__)


def cleanup_uploaded_file(object_key):
    """Try to remove an uploaded file if database saving fails."""
    if not object_key:
        return

    try:
        delete_file(object_key)
    except StorageError:
        logger.exception(
            "Failed to clean up uploaded file: %s",
            object_key,
        )


class PropertyImageListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        uploaded_key = None

        try:
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
                                "You can only manage images "
                                "of your own properties."
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

                image_file = serializer.validated_data["image"]

                # Формуємо унікальний ключ файла.
                if rental_unit:
                    folder = (
                        f"properties/{property_obj.id}"
                        f"/units/{rental_unit.id}"
                    )
                else:
                    folder = f"properties/{property_obj.id}"

                extension = image_file.storage_extension
                object_key = f"{folder}/{uuid.uuid4().hex}.{extension}"

                # Завантажуємо файл у Supabase Storage через S3 API.
                try:
                    uploaded_key = upload_file(
                        file_obj=image_file,
                        object_key=object_key,
                        content_type=image_file.storage_content_type,
                    )

                    image_url = get_public_url(uploaded_key)

                except StorageError:
                    cleanup_uploaded_file(uploaded_key)
                    logger.exception(
                        "Failed to upload property image. Property ID: %s",
                        property_obj.id,
                    )
                    return Response(
                        {"detail": "Failed to upload image to storage."},
                        status=status.HTTP_502_BAD_GATEWAY,
                    )

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
                    image_url=image_url,
                    image_key=uploaded_key,
                    is_main=make_main,
                )

        except Exception:
            # Якщо запис у БД не вдалося зберегти,
            # видаляємо вже завантажений файл.
            cleanup_uploaded_file(uploaded_key)
            raise

        return Response(
            PropertyImageSerializer(image).data,
            status=status.HTTP_201_CREATED,
        )


class PropertyImageDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, image_id):
        object_key = None

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
                            "You can only manage images "
                            "of your own properties."
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

            # Запам'ятовуємо ключ файла до видалення запису.
            object_key = image.image_key

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

        # Видаляємо файл зі Storage після успішного видалення запису з БД.
        # Для старих записів без image_key цей крок пропускається.
        if object_key:
            try:
                delete_file(object_key)
            except StorageError:
                logger.exception(
                    "Image record deleted, but storage cleanup failed: %s",
                    object_key,
                )
                return Response(
                    {
                        "detail": (
                            "Image record was deleted, but the file "
                            "could not be removed from storage."
                        )
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

        return Response(status=status.HTTP_204_NO_CONTENT)