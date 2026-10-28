
from django.conf import settings
from django.db import models


class Booking(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"
        NO_SHOW = "NO_SHOW", "No show"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    rental_unit = models.ForeignKey(
        "properties.RentalUnit",
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    check_in = models.DateField()
    check_out = models.DateField()

    guests = models.PositiveIntegerField()

    contact_name = models.CharField(max_length=150)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()

    special_requests = models.TextField(blank=True)

    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.status}"
