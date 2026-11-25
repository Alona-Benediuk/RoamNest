from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from properties.models import Property

from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteListAPIView(APIView):
    """
    Returns the current user's favorite properties.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = (
            Favorite.objects
            .filter(user=request.user, property__status="PUBLISHED")
            .select_related("property")
        )

        serializer = FavoriteSerializer(favorites, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class PropertyFavoriteAPIView(APIView):
    """
    Adds or removes a property from the current user's favorites.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        property_obj = get_object_or_404(
            Property,
            pk=pk,
            status="PUBLISHED",
        )

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            property=property_obj,
        )

        serializer = FavoriteSerializer(favorite)

        return Response(
            serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

    def delete(self, request, pk):
        deleted, _ = Favorite.objects.filter(
            user=request.user,
            property_id=pk,
        ).delete()

        if not deleted:
            return Response(
                {"detail": "Favorite not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)