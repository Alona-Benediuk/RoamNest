
from django.urls import path

from .views import (
    PropertyListAPIView,
    PropertyDetailAPIView,
    PropertyImageListCreateAPIView,
    PropertyImageDeleteAPIView,
    PropertyRentalUnitListCreateAPIView,
    RentalUnitDetailAPIView,
)

urlpatterns = [
    path("", PropertyListAPIView.as_view(), name="property-list"),

    # Фотографії об'єкта
    path(
        "<int:pk>/images/",
        PropertyImageListCreateAPIView.as_view(),
        name="property-image-create",
    ),
    path(
        "<int:pk>/images/<int:image_id>/",
        PropertyImageDeleteAPIView.as_view(),
        name="property-image-delete",
    ),

    # Кімнати об'єкта
    path(
        "<int:pk>/rooms/",
        PropertyRentalUnitListCreateAPIView.as_view(),
        name="property-room-list-create",
    ),

    # Деталі об'єкта
    path(
        "<int:pk>/",
        PropertyDetailAPIView.as_view(),
        name="property-detail",
    ),

    # Окрема кімната
    path(
        "rooms/<int:pk>/",
        RentalUnitDetailAPIView.as_view(),
        name="rental-unit-detail",
    ),
]