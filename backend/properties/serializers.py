
from rest_framework import serializers
from .models import Property, Room, Amenity, PropertyImage


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name"]


class RoomSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)

    class Meta:
        model = Room
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
        ]


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ["id", "image_url", "is_main", "room"]


class PropertyListSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
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
            "rooms",
            "images",
        ]
