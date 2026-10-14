
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from datetime import date

from mock_data import MOCK_BOOKINGS, MOCK_PROPERTIES, MOCK_USERS


class BookingListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get("user_id", "1")

        bookings = [
            booking
            for booking in MOCK_BOOKINGS
            if str(booking["user"]) == user_id
        ]

        return Response(bookings)

    def post(self, request):
        required_fields = [
            "room",
            "check_in",
            "check_out",
            "guests",
            "contact_name",
            "contact_phone",
            "contact_email",
        ]

        missing_fields = [
            field
            for field in required_fields
            if field not in request.data
            or request.data[field] in (None, "")
        ]

        if missing_fields:
            return Response(
                {
                    "detail": "Required fields are missing.",
                    "fields": missing_fields,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            room_id = int(request.data["room"])
            guests = int(request.data["guests"])
            check_in = date.fromisoformat(request.data["check_in"])
            check_out = date.fromisoformat(request.data["check_out"])
        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid room, guests, or date format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if check_in < date.today():
            return Response(
                {"detail": "Check-in cannot be in the past."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if check_out <= check_in:
            return Response(
                {"detail": "Check-out must be after check-in."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if guests < 1:
            return Response(
                {"detail": "Guests must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        property_data = next(
            (
                item for item in MOCK_PROPERTIES
                if item["status"] == "PUBLISHED"
                and any(
                    room["id"] == room_id and room["is_published"]
                    for room in item["rooms"]
                )
            ),
            None,
        )

        if property_data is None:
            return Response(
                {"detail": "Published room not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        room_data = next(
            room for room in property_data["rooms"]
            if room["id"] == room_id and room["is_published"]
        )

        if guests > room_data["max_guests"]:
            return Response(
                {"detail": "Too many guests for this room."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_id = request.data.get("user", 1)

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return Response(
                {"detail": "User ID must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = next(
            (item for item in MOCK_USERS if item["id"] == user_id),
            None,
        )

        if user is None or user["role"] != "USER":
            return Response(
                {"detail": "Guest user not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        overlapping_bookings = [
            booking
            for booking in MOCK_BOOKINGS
            if (
                booking["room"] == room_id
                and booking["status"] in ("PENDING", "CONFIRMED")
                and check_in.isoformat() < booking["check_out"]
                and check_out.isoformat() > booking["check_in"]
            )
        ]

        rooms_count = room_data.get("rooms_count", 1)

        if len(overlapping_bookings) >= rooms_count:
            return Response(
                {"detail": "No rooms available for these dates."},
                status=status.HTTP_400_BAD_REQUEST,
            )


        nights = (check_out - check_in).days
        price = float(room_data["price_per_night"])

        new_booking = {
            "id": max(
                (item["id"] for item in MOCK_BOOKINGS),
                default=0,
            ) + 1,
            "user": user_id,
            "room": room_id,
            "property_id": property_data["id"],
            "property_title": property_data["title"],
            "room_title": room_data["title"],
            "check_in": check_in.isoformat(),
            "check_out": check_out.isoformat(),
            "guests": guests,
            "contact_name": request.data["contact_name"],
            "contact_phone": request.data["contact_phone"],
            "contact_email": request.data["contact_email"],
            "special_requests": request.data.get("special_requests", ""),
            "price_per_night": room_data["price_per_night"],
            "total_price": f"{price * nights:.2f}",
            "status": "PENDING",
            "created_at": None,
            "updated_at": None,
        }

        MOCK_BOOKINGS.append(new_booking)

        return Response(
            new_booking,
            status=status.HTTP_201_CREATED,
        )



class BookingDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        booking = next(
            (
                item
                for item in MOCK_BOOKINGS
                if item["id"] == pk
            ),
            None,
        )

        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=404,
            )

        return Response(booking)



class BookingCancelAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        booking = next(
            (
                item for item in MOCK_BOOKINGS
                if item["id"] == pk
            ),
            None,
        )

        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=404,
            )

        if booking["status"] == "CANCELLED":
            return Response(
                {"detail": "Booking is already cancelled."},
                status=400,
            )

        booking["status"] = "CANCELLED"

        return Response(booking, status=200)



class OwnerBookingListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        owner_id = request.query_params.get("owner_id", "2")

        owner_properties = {
            str(property_data["id"])
            for property_data in MOCK_PROPERTIES
            if str(property_data["owner"]) == owner_id
        }

        bookings = [
            booking
            for booking in MOCK_BOOKINGS
            if str(booking["property_id"]) in owner_properties
        ]

        return Response(bookings)



class OwnerBookingUpdateAPIView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        booking = next(
            (
                item for item in MOCK_BOOKINGS
                if item["id"] == pk
            ),
            None,
        )

        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_status = request.data.get("status")

        allowed_statuses = {"PENDING", "CONFIRMED", "CANCELLED"}

        if new_status not in allowed_statuses:
            return Response(
                {
                    "detail": "Invalid booking status.",
                    "allowed_statuses": sorted(allowed_statuses),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking["status"] = new_status

        return Response(booking, status=status.HTTP_200_OK)
