
import uuid
from pathlib import Path

from django.conf import settings
from rest_framework.exceptions import ValidationError

from properties.storage import (
    StorageError,
    upload_file,
    delete_file,
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def upload_review_image(image):
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationError(
            "Only JPEG, PNG and WebP images are allowed."
        )

    if image.size > MAX_IMAGE_SIZE:
        raise ValidationError(
            "Image size must not exceed 5 MB."
        )

    extension = Path(image.name).suffix.lower()

    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise ValidationError("Unsupported image extension.")

    object_key = f"reviews/{uuid.uuid4().hex}{extension}"

    try:
        return upload_file(
            file_obj=image,
            object_key=object_key,
            content_type=image.content_type,
            bucket_name=settings.REVIEWS_STORAGE_BUCKET_NAME,
        )
    except StorageError:
        raise ValidationError(
            "Failed to upload review image."
        )


def delete_review_image(image_key):
    if not image_key:
        return

    try:
        delete_file(
            object_key=image_key,
            bucket_name=settings.REVIEWS_STORAGE_BUCKET_NAME,
        )
    except StorageError:
        raise ValidationError(
            "Failed to delete review image."
        )
