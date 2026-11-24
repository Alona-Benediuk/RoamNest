from rest_framework import serializers
from django.conf import settings
from django.db import transaction

from bookings.models import Booking
from properties.storage import get_signed_url, StorageError
from .models import Review, ReviewImage


class ReviewImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ReviewImage
        fields = [
            "id",
            "image_url",
            "created_at",
        ]
        read_only_fields = ["id", "image_url", "created_at"]

    def get_image_url(self, obj):
        if not obj.image_key:
            return ""

        try:
            return get_signed_url(
                obj.image_key,
                bucket_name=settings.REVIEWS_STORAGE_BUCKET_NAME,
            )
        except StorageError:
            return ""


class ReviewSerializer(serializers.ModelSerializer):

    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "booking",
            "overall_rating",
            "cleanliness",
            "location",
            "amenities",
            "comment",
            "status",
            "images",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at",
        ]

    def validate_booking(self, booking):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if booking.user_id != request.user.id:
            raise serializers.ValidationError(
                "You can only review your own booking."
            )

        if booking.status != Booking.Status.COMPLETED:
            raise serializers.ValidationError(
                "You can only review completed bookings."
            )

        if Review.objects.filter(booking=booking).exists():
            raise serializers.ValidationError(
                "A review for this booking already exists."
            )

        return booking
