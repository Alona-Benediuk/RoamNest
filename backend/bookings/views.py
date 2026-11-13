
from django.db import transaction
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import Booking
from .serializers import BookingSerializer
from properties.models import RentalUnit


def get_profile_role(user):
    profile = getattr(user, "profile", None)
    return profile.role if profile else None


def get_locked_booking(pk):
    """
    Блокуємо спочатку RentalUnit, а потім Booking.
    Це дозволяє узгодити зміну статусу бронювання
    зі створенням нових бронювань цієї одиниці житла.

    Викликати тільки всередині transaction.atomic().
    """

    booking_reference = (
        Booking.objects
        .filter(pk=pk)
        .values("rental_unit_id")
        .first()
    )

    if booking_reference is None:
        return None

    rental_unit = (
        RentalUnit.objects
        .select_for_update()
        .filter(pk=booking_reference["rental_unit_id"])
        .first()
    )

    if rental_unit is None:
        return None

    return (
        Booking.objects
        .select_for_update()
        .select_related("user", "rental_unit__property")
        .filter(pk=pk)
        .first()
    )


class BookingListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = (
            Booking.objects
            .filter(user=request.user)
            .select_related("user", "rental_unit__property")
            .order_by("-created_at")
        )

        serializer = BookingSerializer(bookings, many=True)

        return Response(serializer.data)

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
            or request.data[field] is None
            or (
                isinstance(request.data[field], str)
                and not request.data[field].strip()
            )
        ]

        if missing_fields:
            return Response(
                {
                    "detail": "Required fields are missing.",
                    "fields": missing_fields,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Перевіряємо ID RentalUnit.
        raw_rental_unit_id = request.data["rental_unit"]

        try:
            if isinstance(raw_rental_unit_id, bool):
                raise ValueError

            if isinstance(raw_rental_unit_id, int):
                rental_unit_id = raw_rental_unit_id
            elif (
                isinstance(raw_rental_unit_id, str)
                and raw_rental_unit_id.strip().isdigit()
            ):
                rental_unit_id = int(raw_rental_unit_id.strip())
            else:
                raise ValueError

        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid rental unit ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if rental_unit_id < 1:
            return Response(
                {"detail": "Invalid rental unit ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Перевіряємо роль користувача.
        role = get_profile_role(request.user)

        if role is None:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if role != "USER":
            return Response(
                {"detail": "Only guests can create bookings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Блокуємо RentalUnit на час перевірки
        # доступності та створення бронювання.
        with transaction.atomic():

            try:
                rental_unit = (
                    RentalUnit.objects
                    .select_for_update()
                    .get(pk=rental_unit_id)
                )

            except RentalUnit.DoesNotExist:
                return Response(
                    {"detail": "Rental unit not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = BookingSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST,
                )

            check_in = serializer.validated_data["check_in"]
            check_out = serializer.validated_data["check_out"]

            nights = (check_out - check_in).days

            # Ціну та загальну вартість визначає backend.
            price_per_night = rental_unit.price_per_night
            total_price = price_per_night * nights

            booking = serializer.save(
                user=request.user,
                rental_unit=rental_unit,
                price_per_night=price_per_night,
                total_price=total_price,
            )

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class BookingDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        booking = (
            Booking.objects
            .select_related("user", "rental_unit__property")
            .filter(pk=pk)
            .first()
        )

        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.user_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You can only view your own bookings."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(BookingSerializer(booking).data)


class BookingCancelAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        with transaction.atomic():

            booking = get_locked_booking(pk)

            if booking is None:
                return Response(
                    {"detail": "Booking not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if booking.user_id != request.user.id:
                return Response(
                    {
                        "detail": (
                            "You can only cancel your own bookings."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if booking.status == Booking.Status.CANCELLED:
                return Response(
                    {"detail": "Booking is already cancelled."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Гість може скасувати тільки активне бронювання.
            cancellable_statuses = {
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
            }

            if booking.status not in cancellable_statuses:
                return Response(
                    {
                        "detail": (
                            "Booking cannot be cancelled "
                            "in its current status."
                        ),
                        "current_status": booking.status,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            booking.status = Booking.Status.CANCELLED
            booking.save(
                update_fields=["status", "updated_at"]
            )

            response_data = BookingSerializer(booking).data

        return Response(
            response_data,
            status=status.HTTP_200_OK,
        )


class OwnerBookingListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = get_profile_role(request.user)

        if role is None:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if role != "OWNER":
            return Response(
                {"detail": "Only owners can access this resource."},
                status=status.HTTP_403_FORBIDDEN,
            )

        bookings = (
            Booking.objects
            .filter(rental_unit__property__owner=request.user)
            .select_related("user", "rental_unit__property")
            .order_by("-created_at")
        )

        serializer = BookingSerializer(bookings, many=True)

        return Response(serializer.data)


class OwnerBookingUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    ALLOWED_TRANSITIONS = {
        Booking.Status.PENDING: {
            Booking.Status.CONFIRMED,
            Booking.Status.REJECTED,
        },
        Booking.Status.CONFIRMED: {
            Booking.Status.CANCELLED,
            Booking.Status.COMPLETED,
            Booking.Status.NO_SHOW,
        },
    }

    def patch(self, request, pk):
        role = get_profile_role(request.user)

        if role is None:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if role != "OWNER":
            return Response(
                {"detail": "Only owners can update bookings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get("status")

        if not isinstance(new_status, str):
            return Response(
                {"detail": "Status is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            booking = get_locked_booking(pk)

            if booking is None:
                return Response(
                    {"detail": "Booking not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if (
                booking.rental_unit.property.owner_id
                != request.user.id
            ):
                return Response(
                    {
                        "detail": (
                            "You can only update bookings "
                            "for your own properties."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Перевіряємо дозволені переходи
            # з поточного статусу.
            allowed_statuses = self.ALLOWED_TRANSITIONS.get(
                booking.status,
                set(),
            )

            if new_status not in allowed_statuses:
                return Response(
                    {
                        "detail": "Invalid status transition.",
                        "current_status": booking.status,
                        "allowed_statuses": sorted(allowed_statuses),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            today = timezone.localdate()

            # COMPLETED можна встановити тільки після виїзду.
            if (
                new_status == Booking.Status.COMPLETED
                and booking.check_out > today
            ):
                return Response(
                    {
                        "detail": (
                            "Booking can be completed "
                            "only after check-out."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # NO_SHOW можна встановити в день заїзду або пізніше.
            if (
                new_status == Booking.Status.NO_SHOW
                and booking.check_in > today
            ):
                return Response(
                    {
                        "detail": (
                            "No-show can be marked "
                            "on or after check-in date."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            booking.status = new_status
            booking.save(
                update_fields=["status", "updated_at"]
            )

            response_data = BookingSerializer(booking).data

        return Response(
            response_data,
            status=status.HTTP_200_OK,
        )