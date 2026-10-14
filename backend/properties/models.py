
from django.conf import settings
from django.db import models


class Property(models.Model):

    class PropertyType(models.TextChoices):
        APARTMENT = "APARTMENT", "Apartment"
        HOUSE = "HOUSE", "House"
        ROOM = "ROOM", "Room"
        HOTEL = "HOTEL", "Hotel"
        HOSTEL = "HOSTEL", "Hostel"
        VILLA = "VILLA", "Villa"

    class Status(models.TextChoices):
        NEW = "NEW", "New"
        PUBLISHED = "PUBLISHED", "Published"
        INACTIVE = "INACTIVE", "Inactive"

    amenities = models.ManyToManyField(
        "Amenity",
        blank=True,
        related_name="properties",
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties",
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    property_type = models.CharField(
        max_length=20,
        choices=PropertyType.choices,
    )
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default="Ukraine")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.city}"


class Amenity(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Room(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="rooms",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    room_type = models.CharField(max_length=30)
    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    max_guests = models.PositiveIntegerField()
    bedrooms = models.PositiveIntegerField(default=1)
    beds = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    rooms_count = models.PositiveIntegerField(default=1)
    amenities = models.ManyToManyField(
        Amenity,
        blank=True,
        related_name="rooms",
    )
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.property.title}"


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="images",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="images",
        null=True,
        blank=True,
    )
    image_url = models.URLField(max_length=500)
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image - {self.property.title}"
