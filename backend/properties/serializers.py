
from rest_framework import serializers

from .models import Property, RentalUnit, Amenity, PropertyImage, Category, PropertyCollection


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image_url",
            "sort_order",
        ]


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ["id", "image_url", "is_main", "rental_unit"]



class PropertyImageWriteSerializer(serializers.ModelSerializer):
    image = serializers.FileField(write_only=True)

    rental_unit = serializers.PrimaryKeyRelatedField(
        queryset=RentalUnit.objects.all(),
        required=False,
        allow_null=True,
    )

    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

    class Meta:
        model = PropertyImage
        fields = ["image", "is_main", "rental_unit"]
        extra_kwargs = {
            "is_main": {"required": False},
        }

    def validate_image(self, value):
        if value.size > self.MAX_IMAGE_SIZE:
            raise serializers.ValidationError(
                "Image size must not exceed 10 MB."
            )

        # Перевіряємо фактичний формат файлу за його сигнатурою.
        value.seek(0)
        header = value.read(12)
        value.seek(0)

        if header.startswith(b"\xff\xd8\xff"):
            content_type = "image/jpeg"
            extension = "jpg"

        elif header.startswith(b"\x89PNG\r\n\x1a\n"):
            content_type = "image/png"
            extension = "png"

        elif header[:4] == b"RIFF" and header[8:12] == b"WEBP":
            content_type = "image/webp"
            extension = "webp"

        else:
            raise serializers.ValidationError(
                "Only JPEG, PNG and WEBP images are supported."
            )

        value.storage_content_type = content_type
        value.storage_extension = extension

        return value

    def validate_rental_unit(self, value):
        property_obj = self.context["property"]

        if value is not None and value.property_id != property_obj.id:
            raise serializers.ValidationError(
                "Rental unit not found for this property."
            )

        return value


class RentalUnitSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = RentalUnit
        fields = [
            "id",
            "title",
            "description",
            "room_type",
            "price_per_night",
            "max_guests",
            "bedrooms",
            "beds",
            "bathrooms",
            "rooms_count",
            "amenities",
            "images",
            "is_published",
        ]


class PropertyListSerializer(serializers.ModelSerializer):
    rental_units = RentalUnitSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "description",
            "property_type",
            "address",
            "city",
            "country",
            "status",
            "amenities",
            "categories",
            "rental_units",
            "images",
        ]

    def get_images(self, obj):
        images = getattr(
            obj,
            "_prefetched_objects_cache",
            {},
        ).get("images")

        if images is None:
            images = obj.images.all()

        property_images = [
            image
            for image in images
            if image.rental_unit_id is None
        ]

        return PropertyImageSerializer(
            property_images,
            many=True,
        ).data


class PropertyCollectionSerializer(serializers.ModelSerializer):
    properties = PropertyListSerializer(many=True, read_only=True)

    class Meta:
        model = PropertyCollection
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image_url",
            "sort_order",
            "properties",
        ]


class RentalUnitWriteSerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Amenity.objects.all(),
        required=False,
    )

    class Meta:
        model = RentalUnit
        fields = [
            "id",
            "title",
            "description",
            "room_type",
            "price_per_night",
            "max_guests",
            "bedrooms",
            "beds",
            "bathrooms",
            "rooms_count",
            "amenities",
            "is_published",
        ]
        read_only_fields = ["id"]

    def validate_price_per_night(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )
        return value

    def validate_max_guests(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Maximum guests must be at least one."
            )
        return value

    def validate_bedrooms(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Bedrooms cannot be negative."
            )
        return value

    def validate_beds(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Beds must be at least one."
            )
        return value

    def validate_bathrooms(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Bathrooms must be at least one."
            )
        return value

    def validate_rooms_count(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Rooms count must be at least one."
            )
        return value
