from django.urls import path

from .views import FavoriteListAPIView, PropertyFavoriteAPIView


urlpatterns = [
    path(
        "favorites/",
        FavoriteListAPIView.as_view(),
        name="favorite-list",
    ),
    path(
        "properties/<int:pk>/favorite/",
        PropertyFavoriteAPIView.as_view(),
        name="property-favorite",
    ),
]