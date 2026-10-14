
from rest_framework import serializers

from datetime import date
from django.utils import timezone


from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(
        source="room.property.title",
        read_only=True,
    )
    room_title = serializers.CharField(
        source="room.title",
        read_only=True,
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "room",
            "property_title",
            "room_title",
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
            "room_title",
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
        room = attrs.get("room")

        if check_in and check_in < timezone.localdate():
            raise serializers.ValidationError({
                "check_in": "Check-in cannot be in the past."
            })

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError({
                "check_out": "Check-out must be after check-in."
            })

        if room and guests and guests > room.max_guests:
            raise serializers.ValidationError({
                "guests": "Guest count exceeds room capacity."
            })

        if room and not room.is_published:
            raise serializers.ValidationError({
                "room": "This room is not available for booking."
            })

        if room and room.property.status != "PUBLISHED":
            raise serializers.ValidationError({
                "room": "This property is not published."
            })

        
        if room and check_in and check_out:
            overlapping_bookings = Booking.objects.filter(
                room=room,
                check_in__lt=check_out,
                check_out__gt=check_in,
                status__in=[
                    Booking.Status.PENDING,
                    Booking.Status.CONFIRMED,
                ],
            )

            if overlapping_bookings.exists():
                raise serializers.ValidationError({
                    "check_in": "This room is already booked for these dates."
                })

        return attrs
