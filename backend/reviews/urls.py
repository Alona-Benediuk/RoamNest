
from django.urls import path

from .views import (
    ReviewCreateAPIView,
    ReviewListAPIView,
    ReviewDetailAPIView,
    MyReviewListAPIView,
    ReviewModerationAPIView,
)


urlpatterns = [
    path("", ReviewListAPIView.as_view(), name="review-list"),
    path("create/", ReviewCreateAPIView.as_view(), name="review-create"),
    path("my/", MyReviewListAPIView.as_view(), name="my-reviews"),
    path("<int:pk>/", ReviewDetailAPIView.as_view(), name="review-detail"),
    path(
        "<int:pk>/moderate/",
        ReviewModerationAPIView.as_view(),
        name="review-moderate",
    ),
]
