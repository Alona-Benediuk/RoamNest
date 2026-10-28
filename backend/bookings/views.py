
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from datetime import date

from mock_data import MOCK_BOOKINGS, MOCK_PROPERTIES, MOCK_USERS



class BookingListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = str(request.user.id)

        bookings = [
            booking
            for booking in MOCK_BOOKINGS
            if str(booking["user"]) == user_id
        ]

        return Response(bookings)

    def post(self, request):
        required_fields = [
            "rental_unit",
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
            rental_unit_id = int(request.data["rental_unit"])
            guests = int(request.data["guests"])
            check_in = date.fromisoformat(request.data["check_in"])
            check_out = date.fromisoformat(request.data["check_out"])
        except (ValueError, TypeError):
            return Response(
                {
                    "detail": (
                        "Invalid rental unit, guests, or date format."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if rental_unit_id < 1:
            return Response(
                {"detail": "Invalid rental unit ID."},
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

        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "USER":
            return Response(
                {"detail": "Only guests can create bookings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Знаходимо опубліковане помешкання
        # з опублікованою одиницею житла.
        property_data = next(
            (
                item
                for item in MOCK_PROPERTIES
                if item["status"] == "PUBLISHED"
                and any(
                    rental_unit["id"] == rental_unit_id
                    and rental_unit["is_published"]
                    for rental_unit in item["rental_units"]
                )
            ),
            None,
        )

        if property_data is None:
            return Response(
                {"detail": "Published rental unit not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        rental_unit_data = next(
            rental_unit
            for rental_unit in property_data["rental_units"]
            if rental_unit["id"] == rental_unit_id
            and rental_unit["is_published"]
        )

        if guests > rental_unit_data["max_guests"]:
            return Response(
                {
                    "detail": (
                        "Too many guests for this rental unit."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Перевіряємо перетин дат з іншими бронюваннями.
        overlapping_bookings = [
            booking
            for booking in MOCK_BOOKINGS
            if (
                booking["rental_unit"] == rental_unit_id
                and booking["status"] in ("PENDING", "CONFIRMED")
                and check_in.isoformat() < booking["check_out"]
                and check_out.isoformat() > booking["check_in"]
            )
        ]

        # Кількість одночасно доступних одиниць житла.
        rooms_count = rental_unit_data.get("rooms_count", 1)

        if len(overlapping_bookings) >= rooms_count:
            return Response(
                {"detail": "No rental units available for these dates."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        nights = (check_out - check_in).days
        price = float(rental_unit_data["price_per_night"])

        new_booking = {
            "id": max(
                (item["id"] for item in MOCK_BOOKINGS),
                default=0,
            ) + 1,
            "user": request.user.id,
            "rental_unit": rental_unit_id,
            "property_id": property_data["id"],
            "property_title": property_data["title"],
            "rental_unit_title": rental_unit_data["title"],
            "check_in": check_in.isoformat(),
            "check_out": check_out.isoformat(),
            "guests": guests,
            "contact_name": request.data["contact_name"],
            "contact_phone": request.data["contact_phone"],
            "contact_email": request.data["contact_email"],
            "special_requests": request.data.get(
                "special_requests", ""
            ),
            "price_per_night": rental_unit_data["price_per_night"],
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
    permission_classes = [IsAuthenticated]

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
                status=status.HTTP_404_NOT_FOUND,
            )

        if str(booking["user"]) != str(request.user.id):
            return Response(
                {"detail": "You can only view your own bookings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(booking)


class BookingCancelAPIView(APIView):
    permission_classes = [IsAuthenticated]

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
                status=status.HTTP_404_NOT_FOUND,
            )

        if str(booking["user"]) != str(request.user.id):
            return Response(
                {"detail": "You can only cancel your own bookings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking["status"] == "CANCELLED":
            return Response(
                {"detail": "Booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking["status"] = "CANCELLED"

        return Response(booking, status=status.HTTP_200_OK)


class OwnerBookingListAPIView(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request):
        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can access this resource."},
                status=status.HTTP_403_FORBIDDEN,
            )

        owner_id = str(request.user.id)

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
    permission_classes = [IsAuthenticated]

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

            
        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can update bookings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        property_data = next(
            (
                item
                for item in MOCK_PROPERTIES
                if item["id"] == booking["property_id"]
            ),
            None,
        )

        if property_data is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if str(property_data["owner"]) != str(request.user.id):
            return Response(
                {"detail": "You can only update bookings for your own properties."},
                status=status.HTTP_403_FORBIDDEN,
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
