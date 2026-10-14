
from django.urls import path

from .views import (
    BookingListAPIView,
    BookingDetailAPIView,
    BookingCancelAPIView,
)

urlpatterns = [
    path("", BookingListAPIView.as_view(), name="booking-list"),
    path(
        "<int:pk>/cancel/",
        BookingCancelAPIView.as_view(),
        name="booking-cancel",
    ),
    path(
        "<int:pk>/",
        BookingDetailAPIView.as_view(),
        name="booking-detail",
    ),
]
