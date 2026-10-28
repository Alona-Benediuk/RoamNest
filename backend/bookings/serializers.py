
from rest_framework import serializers
from django.utils import timezone

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(
        source="rental_unit.property.title",
        read_only=True,
    )
    rental_unit_title = serializers.CharField(
        source="rental_unit.title",
        read_only=True,
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "rental_unit",
            "property_title",
            "rental_unit_title",
            "check_in",
            "check_out",
            "guests",
            "contact_name",
            "contact_phone",
            "contact_email",
            "special_requests",
            "price_per_night",
            "total_price",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "property_title",
            "rental_unit_title",
            "price_per_night",
            "total_price",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        check_in = attrs.get("check_in")
        check_out = attrs.get("check_out")
        guests = attrs.get("guests")
        rental_unit = attrs.get("rental_unit")

        if check_in and check_in < timezone.localdate():
            raise serializers.ValidationError({
                "check_in": "Check-in cannot be in the past."
            })

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError({
                "check_out": "Check-out must be after check-in."
            })

        if (
            rental_unit
            and guests is not None
            and guests > rental_unit.max_guests
        ):
            raise serializers.ValidationError({
                "guests": "Guest count exceeds rental unit capacity."
            })

        if rental_unit and not rental_unit.is_published:
            raise serializers.ValidationError({
                "rental_unit": "This rental unit is not available for booking."
            })

        if rental_unit and rental_unit.property.status != "PUBLISHED":
            raise serializers.ValidationError({
                "rental_unit": "This property is not published."
            })

        if rental_unit and check_in and check_out:
            overlapping_bookings = Booking.objects.filter(
                rental_unit=rental_unit,
                check_in__lt=check_out,
                check_out__gt=check_in,
                status__in=[
                    Booking.Status.PENDING,
                    Booking.Status.CONFIRMED,
                ],
            )

            # Під час оновлення не враховуємо поточне бронювання.
            if self.instance:
                overlapping_bookings = overlapping_bookings.exclude(
                    pk=self.instance.pk
                )

            if overlapping_bookings.exists():
                raise serializers.ValidationError({
                    "check_in": (
                        "This rental unit is already booked for these dates."
                    )
                })

        return attrs
