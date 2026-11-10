from urllib.parse import quote

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings


class StorageError(Exception):
    """Raised when an object storage operation fails."""


def _get_bucket_name():
    bucket_name = settings.STORAGE_BUCKET_NAME

    if not bucket_name:
        raise StorageError("STORAGE_BUCKET_NAME is not configured.")

    return bucket_name


def _get_s3_client():
    required_settings = {
        "STORAGE_REGION": settings.STORAGE_REGION,
        "STORAGE_ACCESS_KEY_ID": settings.STORAGE_ACCESS_KEY_ID,
        "STORAGE_SECRET_ACCESS_KEY": settings.STORAGE_SECRET_ACCESS_KEY,
    }

    missing = [
        name for name, value in required_settings.items()
        if not value
    ]

    if missing:
        raise StorageError(
            f"Missing storage settings: {', '.join(missing)}"
        )

    config = Config(
        signature_version="s3v4",
        s3={
            "addressing_style": settings.STORAGE_ADDRESSING_STYLE,
        },
        request_checksum_calculation="when_required",
        response_checksum_validation="when_required",
    )

    return boto3.client(
        "s3",
        endpoint_url=settings.STORAGE_ENDPOINT_URL or None,
        region_name=settings.STORAGE_REGION,
        aws_access_key_id=settings.STORAGE_ACCESS_KEY_ID,
        aws_secret_access_key=settings.STORAGE_SECRET_ACCESS_KEY,
        config=config,
    )


def _validate_object_key(object_key):
    if not isinstance(object_key, str) or not object_key.strip():
        raise ValueError("Object key must be a non-empty string.")

    key = object_key.replace("\\", "/").strip("/")
    parts = key.split("/")

    if any(part in ("", ".", "..") for part in parts):
        raise ValueError("Invalid object key.")

    return key


def upload_file(file_obj, object_key, content_type=None):
    """
    Upload a file to the configured S3-compatible storage.

    Returns the storage object key, not a public URL.
    """
    key = _validate_object_key(object_key)
    bucket_name = _get_bucket_name()
    client = _get_s3_client()

    extra_args = {}

    if content_type:
        extra_args["ContentType"] = content_type

    try:
        if hasattr(file_obj, "seek"):
            file_obj.seek(0)

        client.upload_fileobj(
            Fileobj=file_obj,
            Bucket=bucket_name,
            Key=key,
            ExtraArgs=extra_args,
        )

    except (BotoCoreError, ClientError) as error:
        raise StorageError("Failed to upload file to storage.") from error

    return key


def delete_file(object_key):
    """Delete an object from the configured storage."""
    key = _validate_object_key(object_key)
    bucket_name = _get_bucket_name()
    client = _get_s3_client()

    try:
        client.delete_object(
            Bucket=bucket_name,
            Key=key,
        )

    except (BotoCoreError, ClientError) as error:
        raise StorageError("Failed to delete file from storage.") from error


def get_public_url(object_key):
    """Build a public URL for an object in a public bucket."""
    key = _validate_object_key(object_key)
    base_url = settings.STORAGE_PUBLIC_BASE_URL.rstrip("/")

    if not base_url:
        raise StorageError("STORAGE_PUBLIC_BASE_URL is not configured.")

    encoded_key = quote(key, safe="/")

    return f"{base_url}/{encoded_key}"
