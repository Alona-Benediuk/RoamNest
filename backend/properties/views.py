
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from mock_data import MOCK_PROPERTIES, MOCK_AMENITIES


class PropertyListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Працюємо з копією списку, щоб не змінювати початкові mock-дані.
        properties = [
            {
                **item,
                "rooms": [dict(room) for room in item["rooms"]],
            }
            for item in MOCK_PROPERTIES
            if item["status"] == "PUBLISHED"
        ]

        city = request.query_params.get("city")
        country = request.query_params.get("country")
        property_type = request.query_params.get("property_type")
        guests = request.query_params.get("guests")
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")
        max_guests = request.query_params.get("max_guests")
        amenities = request.query_params.getlist("amenities")
        ordering = request.query_params.get("ordering")

        # Пошук за містом.
        if city:
            properties = [
                item for item in properties
                if city.casefold() in item["city"].casefold()
            ]

        # Пошук за країною.
        if country:
            properties = [
                item for item in properties
                if country.casefold() in item["country"].casefold()
            ]

        # Фільтр за типом житла.
        if property_type:
            properties = [
                item for item in properties
                if item["property_type"].upper() == property_type.upper()
            ]

        # Перевіряємо числові параметри.
        try:
            guests_count = int(guests) if guests is not None else None
            max_guests_count = (
                int(max_guests) if max_guests is not None else None
            )
            minimum = float(min_price) if min_price is not None else None
            maximum = float(max_price) if max_price is not None else None

            if guests_count is not None and guests_count < 1:
                raise ValueError

            if max_guests_count is not None and max_guests_count < 1:
                raise ValueError

            if minimum is not None and minimum < 0:
                raise ValueError

            if maximum is not None and maximum < 0:
                raise ValueError

            if (
                minimum is not None
                and maximum is not None
                and minimum > maximum
            ):
                return Response(
                    {"detail": "min_price cannot exceed max_price."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid numeric filter parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Залишаємо тільки опубліковані типи розміщення.
        for item in properties:
            item["rooms"] = [
                room for room in item["rooms"]
                if room["is_published"]
            ]

        # Фільтри застосовуються до одного й того самого номера.
        if guests_count is not None:
            properties = [
                item for item in properties
                if any(
                    room["max_guests"] >= guests_count
                    for room in item["rooms"]
                )
            ]

        if max_guests_count is not None:
            properties = [
                item for item in properties
                if any(
                    room["max_guests"] <= max_guests_count
                    for room in item["rooms"]
                )
            ]

        if minimum is not None or maximum is not None:
            filtered_properties = []

            for item in properties:
                matching_rooms = [
                    room for room in item["rooms"]
                    if (
                        minimum is None
                        or float(room["price_per_night"]) >= minimum
                    )
                    and (
                        maximum is None
                        or float(room["price_per_night"]) <= maximum
                    )
                ]

                if matching_rooms:
                    filtered_properties.append({
                        **item,
                        "rooms": matching_rooms,
                    })

            properties = filtered_properties

        # Фільтр за зручностями.
        if amenities:
            try:
                amenity_ids = {int(value) for value in amenities}
            except ValueError:
                return Response(
                    {"detail": "amenities must contain integer IDs."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            properties = [
                item for item in properties
                if amenity_ids.issubset({
                    amenity["id"] for amenity in item["amenities"]
                })
            ]

        # Сортування за мінімальною ціною номера.
        if ordering in ("price", "-price"):
            properties.sort(
                key=lambda item: min(
                    float(room["price_per_night"])
                    for room in item["rooms"]
                ),
                reverse=(ordering == "-price"),
            )
        elif ordering not in (None, "", "price", "-price"):
            return Response(
                {"detail": "Unsupported ordering parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(properties)

        
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can create properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        required_fields = [
            "title",
            "description",
            "property_type",
            "address",
            "city",
            "country",
        ]

        missing_fields = [
            field for field in required_fields
            if not request.data.get(field)
        ]

        if missing_fields:
            return Response(
                {
                    "detail": "Required fields are missing.",
                    "fields": missing_fields,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        property_data = {
            "id": max(
                (item["id"] for item in MOCK_PROPERTIES),
                default=0,
            ) + 1,
            "owner": request.user.id,
            "title": request.data["title"],
            "description": request.data["description"],
            "property_type": request.data["property_type"],
            "address": request.data["address"],
            "city": request.data["city"],
            "country": request.data["country"],
            "status": "NEW",
            "amenities": [],
            "rooms": [],
            "images": [],
        }

        MOCK_PROPERTIES.append(property_data)

        return Response(
            property_data,
            status=status.HTTP_201_CREATED,
        )


class PropertyDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        property_data = next(
            (
                item for item in MOCK_PROPERTIES
                if item["id"] == pk
                and item["status"] == "PUBLISHED"
            ),
            None,
        )

        if property_data is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Не показуємо неопубліковані номери публічному відвідувачу.
        result = {
            **property_data,
            "rooms": [
                room for room in property_data["rooms"]
                if room["is_published"]
            ],
        }

        return Response(result)

    
    def patch(self, request, pk):
        property_data = next(
            (
                item for item in MOCK_PROPERTIES
                if item["id"] == pk
            ),
            None,
        )
        if property_data is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
                
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can update properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if str(property_data["owner"]) != str(request.user.id):
            return Response(
                {"detail": "You can only update your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )


        editable_fields = [
            "title",
            "description",
            "property_type",
            "address",
            "city",
            "country",
        ]

        for field in editable_fields:
            if field in request.data:
                value = request.data[field]

                if not isinstance(value, str) or not value.strip():
                    return Response(
                        {
                            "detail": (
                                f"{field} must be a non-empty string."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                property_data[field] = value.strip()

        return Response(
            property_data,
            status=status.HTTP_200_OK,
        )

    
    def delete(self, request, pk):
        property_data = next(
            (
                item for item in MOCK_PROPERTIES
                if item["id"] == pk
            ),
            None,
        )

        if property_data is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can delete properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if str(property_data["owner"]) != str(request.user.id):
            return Response(
                {"detail": "You can only delete your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        property_data["status"] = "INACTIVE"

        return Response(
            {
                "detail": "Property deactivated successfully.",
                "id": property_data["id"],
                "status": property_data["status"],
            },
            status=status.HTTP_200_OK,
        )


class AmenityListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(MOCK_AMENITIES)


class OwnerPropertyListAPIView(APIView):
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

        properties = [
            property_data
            for property_data in MOCK_PROPERTIES
            if str(property_data["owner"]) == owner_id
        ]

        return Response(properties)

    def post(self, request):
        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can create properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        required_fields = [
            "title",
            "description",
            "property_type",
            "address",
            "city",
            "country",
        ]

        missing_fields = [
            field for field in required_fields
            if not request.data.get(field)
        ]

        if missing_fields:
            return Response(
                {
                    "detail": "Required fields are missing.",
                    "fields": missing_fields,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        property_data = {
            "id": max(
                (item["id"] for item in MOCK_PROPERTIES),
                default=0,
            ) + 1,
            "owner": request.user.id,
            "title": request.data["title"],
            "description": request.data["description"],
            "property_type": request.data["property_type"],
            "address": request.data["address"],
            "city": request.data["city"],
            "country": request.data["country"],
            "status": "NEW",
            "amenities": [],
            "rooms": [],
            "images": [],
        }

        MOCK_PROPERTIES.append(property_data)

        return Response(
            property_data,
            status=status.HTTP_201_CREATED,
        )


class PropertyImageListCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        property_data = next(
            (
                item for item in MOCK_PROPERTIES
                if item["id"] == pk
            ),
            None,
        )

        if property_data is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can manage property images."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if str(property_data["owner"]) != str(request.user.id):
            return Response(
                {"detail": "You can only manage images of your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        image_url = request.data.get("image_url")

        if not isinstance(image_url, str) or not image_url.strip():
            return Response(
                {"detail": "image_url is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        images = property_data.setdefault("images", [])

        image_id = max(
            (image["id"] for image in images),
            default=0,
        ) + 1

        is_main = request.data.get("is_main", False)

        if not isinstance(is_main, bool):
            return Response(
                {"detail": "is_main must be a boolean."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if is_main:
            for image in images:
                image["is_main"] = False

        new_image = {
            "id": image_id,
            "image_url": image_url.strip(),
            "is_main": is_main or not images,
            "room": request.data.get("room"),
        }

        images.append(new_image)

        return Response(
            new_image,
            status=status.HTTP_201_CREATED,
        )


class PropertyImageDeleteAPIView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk, image_id):
        property_data = next(
            (
                item for item in MOCK_PROPERTIES
                if item["id"] == pk
            ),
            None,
        )

        if property_data is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
                    
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != "OWNER":
            return Response(
                {"detail": "Only owners can manage property images."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if str(property_data["owner"]) != str(request.user.id):
            return Response(
                {"detail": "You can only manage images of your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        images = property_data.get("images", [])

        image = next(
            (
                item for item in images
                if item["id"] == image_id
            ),
            None,
        )

        if image is None:
            return Response(
                {"detail": "Image not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        images.remove(image)

        return Response(status=status.HTTP_204_NO_CONTENT)




