
from django.db import transaction, IntegrityError
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .storage import upload_review_image, delete_review_image
from .models import Review, ReviewImage
from .serializers import ReviewSerializer
from .permissions import IsProfileAdmin



class ReviewCreateAPIView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def perform_create(self, serializer):
        uploaded_keys = []

        try:
            with transaction.atomic():
                review = serializer.save()

                images = self.request.FILES.getlist("images")

                if len(images) > 5:
                    raise ValidationError({
                        "images": "You can upload a maximum of 5 images."
                    })

                for image in images:
                    image_key = upload_review_image(image)
                    uploaded_keys.append(image_key)

                    ReviewImage.objects.create(
                        review=review,
                        image_key=image_key,
                    )

        except IntegrityError:
            for key in uploaded_keys:
                try:
                    delete_review_image(key)
                except Exception:
                    pass

            raise ValidationError({
                "booking": "A review for this booking already exists."
            })

        except Exception:
            for key in uploaded_keys:
                try:
                    delete_review_image(key)
                except Exception:
                    pass

            raise


class ReviewListAPIView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.filter(
            status=Review.Status.APPROVED
        ).select_related(
            "booking",
            "booking__rental_unit",
            "booking__rental_unit__property",
            "booking__user",
        ).prefetch_related("images")


class ReviewDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.filter(
            status=Review.Status.APPROVED
        ).prefetch_related("images")


class MyReviewListAPIView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(
            booking__user=self.request.user
        ).select_related(
            "booking",
            "booking__rental_unit",
            "booking__rental_unit__property",
        ).prefetch_related("images")


class ReviewModerationAPIView(APIView):
    permission_classes = [IsProfileAdmin]

    def patch(self, request, pk):
        review = get_object_or_404(Review, pk=pk)

        new_status = request.data.get("status")

        if new_status not in [
            Review.Status.APPROVED,
            Review.Status.REJECTED,
        ]:
            return Response(
                {"detail": "Invalid moderation status."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        review.status = new_status
        review.save(update_fields=["status"])

        return Response(ReviewSerializer(review).data)
