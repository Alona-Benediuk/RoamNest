
from decimal import Decimal, InvalidOperation

from django.db.models import Min, Q, Prefetch

from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Amenity, Property, RentalUnit
from ..serializers import PropertyListSerializer


class PropertyCreateSerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(
            many=True,
            queryset=Amenity.objects.all(),
            required=False,
        )

    class Meta:
        model = Property
        fields = [
            "title",
            "description",
            "property_type",
            "address",
            "city",
            "country",
            "amenities",
        ]


def _check_owner(request):
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Authentication credentials were not provided."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    profile = getattr(request.user, "profile", None)

    if profile is None:
        return Response(
            {"detail": "User profile not found."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if profile.role != "OWNER":
        return Response(
            {"detail": "Only owners can access this resource."},
            status=status.HTTP_403_FORBIDDEN,
        )

    return None


def _create_property(request):
    required_fields = [
        "title",
        "description",
        "property_type",
        "address",
        "city",
        "country",
    ]
    missing_fields = [
        field for field in required_fields if not request.data.get(field)
    ]

    if missing_fields:
        return Response(
            {
                "detail": "Required fields are missing.",
                "fields": missing_fields,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = PropertyCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    property_obj = serializer.save(
        owner=request.user,
        status=Property.Status.NEW,
    )
    return Response(
        PropertyListSerializer(property_obj).data,
        status=status.HTTP_201_CREATED,
    )


class PropertyListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        city = request.query_params.get("city")
        country = request.query_params.get("country")
        property_type = request.query_params.get("property_type")
        guests = request.query_params.get("guests")
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")
        max_guests = request.query_params.get("max_guests")
        amenities = request.query_params.getlist("amenities")
        ordering = request.query_params.get("ordering")

        # Перевіряємо числові параметри.
        try:
            guests_count = int(guests) if guests is not None else None
            max_guests_count = (
                int(max_guests) if max_guests is not None else None
            )
            minimum = Decimal(min_price) if min_price is not None else None
            maximum = Decimal(max_price) if max_price is not None else None

            if (
                (guests_count is not None and guests_count < 1)
                or (max_guests_count is not None and max_guests_count < 1)
                or (minimum is not None and minimum < 0)
                or (maximum is not None and maximum < 0)
            ):
                raise ValueError

        except (ValueError, TypeError, InvalidOperation):
            return Response(
                {"detail": "Invalid numeric filter parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            minimum is not None
            and maximum is not None
            and minimum > maximum
        ):
            return Response(
                {"detail": "min_price cannot exceed max_price."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ordering not in (None, "", "price", "-price"):
            return Response(
                {"detail": "Unsupported ordering parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Базовий запит до опублікованих одиниць оренди.
        rental_unit_query = RentalUnit.objects.filter(is_published=True)

        if guests_count is not None:
            rental_unit_query = rental_unit_query.filter(
                max_guests__gte=guests_count
            )

        if max_guests_count is not None:
            rental_unit_query = rental_unit_query.filter(
                max_guests__lte=max_guests_count
            )

        if minimum is not None:
            rental_unit_query = rental_unit_query.filter(
                price_per_night__gte=minimum
            )

        if maximum is not None:
            rental_unit_query = rental_unit_query.filter(
                price_per_night__lte=maximum
            )

        properties = Property.objects.filter(
            status=Property.Status.PUBLISHED
        )

        if city:
            properties = properties.filter(city__icontains=city)

        if country:
            properties = properties.filter(country__icontains=country)

        if property_type:
            properties = properties.filter(
                property_type__iexact=property_type
            )

        # Усі цінові фільтри та фільтри місткості
        # мають відповідати одній одиниці оренди.
        rental_unit_filters_used = any(
            value is not None
            for value in (
                guests_count,
                max_guests_count,
                minimum,
                maximum,
            )
        )

        if rental_unit_filters_used:
            properties = properties.filter(
                rental_units__in=rental_unit_query
            )

        # Фільтр за всіма вказаними зручностями житла.
        if amenities:
            try:
                amenity_ids = {int(value) for value in amenities}
            except ValueError:
                return Response(
                    {"detail": "amenities must contain integer IDs."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for amenity_id in amenity_ids:
                properties = properties.filter(
                    amenities__id=amenity_id
                )

        # Сортування за мінімальною ціною одиниці оренди.
        if ordering in ("price", "-price"):
            properties = properties.annotate(
                min_rental_unit_price=Min(
                    "rental_units__price_per_night",
                    filter=Q(rental_units__is_published=True),
                )
            ).filter(min_rental_unit_price__isnull=False)

            properties = properties.order_by(
                "min_rental_unit_price"
                if ordering == "price"
                else "-min_rental_unit_price"
            )

        # У відповіді повертаємо опубліковані одиниці оренди.
        rental_unit_query = rental_unit_query.order_by("id").prefetch_related(
            "amenities",
            "images",
        )

        properties = properties.prefetch_related(
            Prefetch(
                "rental_units",
                queryset=rental_unit_query,
            ),
            "amenities",
            "images",
        ).distinct()

        serializer = PropertyListSerializer(properties, many=True)
        return Response(serializer.data)

    def post(self, request):
        error = _check_owner(request)
        if error:
            return error
        return _create_property(request)


class PropertyDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        published_units = RentalUnit.objects.filter(
            is_published=True
        ).prefetch_related("amenities", "images")

        try:
            property_obj = Property.objects.prefetch_related(
                Prefetch(
                    "rental_units",
                    queryset=published_units,
                ),
                "amenities",
                "images",
            ).get(
                pk=pk,
                status=Property.Status.PUBLISHED,
            )
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(PropertyListSerializer(property_obj).data)


    def patch(self, request, pk):
        error = _check_owner(request)
        if error:
            return error

        try:
            property_obj = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if property_obj.owner_id != request.user.id:
            return Response(
                {"detail": "You can only update your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PropertyCreateSerializer(
            property_obj,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        property_obj = serializer.save()

        return Response(
            PropertyListSerializer(property_obj).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        error = _check_owner(request)
        if error:
            return error

        try:
            property_obj = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if property_obj.owner_id != request.user.id:
            return Response(
                {"detail": "You can only delete your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        property_obj.status = Property.Status.INACTIVE
        property_obj.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "detail": "Property deactivated successfully.",
                "id": property_obj.id,
                "status": property_obj.status,
            },
            status=status.HTTP_200_OK,
        )


class OwnerPropertyListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        error = _check_owner(request)
        if error:
            return error

        properties = (
            Property.objects.filter(owner=request.user)
            .prefetch_related(
                "amenities",
                "rental_units__amenities",
                "rental_units__images",
                "images",
            )
            .order_by("-created_at")
        )

        serializer = PropertyListSerializer(properties, many=True)
        return Response(serializer.data)

    def post(self, request):
        error = _check_owner(request)
        if error:
            return error
        return _create_property(request)