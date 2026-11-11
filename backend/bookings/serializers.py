
from django.db.models import Sum
from django.utils import timezone

from rest_framework import serializers

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    property_id = serializers.IntegerField(
        source="rental_unit.property.id",
        read_only=True,
    )

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
            "property_id",
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
            "property_id",
            "property_title",
            "rental_unit_title",
            "price_per_night",
            "total_price",
            "status",
            "created_at",
            "updated_at",
        ]

    @staticmethod
    def has_availability(
        rental_unit,
        check_in,
        check_out,
        guests,
        exclude_booking_id=None,
    ):
        overlapping_bookings = Booking.objects.filter(
            rental_unit=rental_unit,
            check_in__lt=check_out,
            check_out__gt=check_in,
            status__in=[
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
            ],
        )

        if exclude_booking_id:
            overlapping_bookings = overlapping_bookings.exclude(
                pk=exclude_booking_id
            )

        property_type = rental_unit.property.property_type

        # HOTEL: одне бронювання займає одну кімнату.
        if property_type == "HOTEL":
            return (
                overlapping_bookings.count()
                < rental_unit.rooms_count
            )

        # HOSTEL: кожен гість займає одне ліжко.
        if property_type == "HOSTEL":
            occupied_beds = (
                overlapping_bookings.aggregate(
                    total_guests=Sum("guests")
                )["total_guests"]
                or 0
            )

            return (
                occupied_beds + guests
                <= rental_unit.rooms_count
            )

        # APARTMENT, HOUSE, ROOM, VILLA:
        # одне бронювання на період.
        return not overlapping_bookings.exists()

    def validate(self, attrs):
        check_in = attrs.get(
            "check_in",
            self.instance.check_in if self.instance else None,
        )

        check_out = attrs.get(
            "check_out",
            self.instance.check_out if self.instance else None,
        )

        guests = attrs.get(
            "guests",
            self.instance.guests if self.instance else None,
        )

        rental_unit = attrs.get(
            "rental_unit",
            self.instance.rental_unit if self.instance else None,
        )

        if check_in and check_in < timezone.localdate():
            raise serializers.ValidationError({
                "check_in": "Check-in cannot be in the past."
            })

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError({
                "check_out": "Check-out must be after check-in."
            })

        if guests is not None and guests < 1:
            raise serializers.ValidationError({
                "guests": "Guests must be at least 1."
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
                "rental_unit": (
                    "This rental unit is not available for booking."
                )
            })

        if (
            rental_unit
            and rental_unit.property.status != "PUBLISHED"
        ):
            raise serializers.ValidationError({
                "rental_unit": "This property is not published."
            })

        if (
            rental_unit
            and check_in
            and check_out
            and guests is not None
        ):
            is_available = self.has_availability(
                rental_unit=rental_unit,
                check_in=check_in,
                check_out=check_out,
                guests=guests,
                exclude_booking_id=(
                    self.instance.pk if self.instance else None
                ),
            )

            if not is_available:
                raise serializers.ValidationError({
                    "check_in": (
                        "No rental units are available for these dates."
                    )
                })

        return attrs
