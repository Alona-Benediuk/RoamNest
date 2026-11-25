from rest_framework import serializers

from .models import Favorite
from properties.serializers import PropertyListSerializer


class FavoriteSerializer(serializers.ModelSerializer):

    property = PropertyListSerializer(read_only=True)
    property_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Favorite
        fields = [
            "id",
            "property",
            "property_id",
            "created_at",
        ]
        read_only_fields = fields