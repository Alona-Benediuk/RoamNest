
from django.urls import path

from .views import (
    PropertyListAPIView,
    PropertyDetailAPIView,
    PropertyImageListCreateAPIView,
    PropertyImageDeleteAPIView,
)

urlpatterns = [
    path("", PropertyListAPIView.as_view(), name="property-list"),

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
    path(
        "<int:pk>/",
        PropertyDetailAPIView.as_view(),
        name="property-detail",
    ),
]
