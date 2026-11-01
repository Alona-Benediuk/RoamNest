
from rest_framework import serializers

from .models import Property, RentalUnit, Amenity, PropertyImage


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name"]


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ["id", "image_url", "is_main", "rental_unit"]


class PropertyImageWriteSerializer(serializers.ModelSerializer):
    rental_unit = serializers.PrimaryKeyRelatedField(
        queryset=RentalUnit.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = PropertyImage
        fields = ["image_url", "is_main", "rental_unit"]
        extra_kwargs = {
            "is_main": {"required": False},
        }

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
    images = PropertyImageSerializer(many=True, read_only=True)

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
            "rental_units",
            "images",
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
