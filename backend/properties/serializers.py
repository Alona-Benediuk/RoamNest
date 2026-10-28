
from rest_framework import serializers

from .models import Property, RentalUnit, Amenity, PropertyImage


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name"]


class RentalUnitSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)

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


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ["id", "image_url", "is_main", "rental_unit"]


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
