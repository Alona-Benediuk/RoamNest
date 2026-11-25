
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import time


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


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

    categories = models.ManyToManyField(
        "Category",
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
    latitude = models.DecimalField(
        max_digits=18,
        decimal_places=14,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(-90),
            MaxValueValidator(90),
        ],
    )
    longitude = models.DecimalField(
        max_digits=18,
        decimal_places=14,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(-180),
            MaxValueValidator(180),
        ],
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.city}"


class PropertyPolicy(models.Model):
    property = models.OneToOneField(
        Property,
        on_delete=models.CASCADE,
        related_name="policy",
    )

    check_in_time = models.TimeField(default=time(12, 0))
    check_out_time = models.TimeField(default=time(10, 0))

    minimum_age = models.PositiveSmallIntegerField(default=18)

    children_allowed = models.BooleanField(default=True)
    children_min_age = models.PositiveSmallIntegerField(default=3)
    children_max_age = models.PositiveSmallIntegerField(default=17)

    pets_allowed = models.BooleanField(default=False)
    smoking_allowed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Policy - {self.property.title}"


class CheckoutInstruction(models.Model):
    policy = models.ForeignKey(
        PropertyPolicy,
        on_delete=models.CASCADE,
        related_name="checkout_instructions",
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title


class PropertyCollection(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    properties = models.ManyToManyField(
        Property,
        blank=True,
        related_name="collections",
    )

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Property collection"
        verbose_name_plural = "Property collections"

    def __str__(self):
        return self.name


class Amenity(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class RentalUnit(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="rental_units",
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
        related_name="rental_units",
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
    rental_unit = models.ForeignKey(
        RentalUnit,
        on_delete=models.CASCADE,
        related_name="images",
        null=True,
        blank=True,
    )
    image_url = models.URLField(max_length=500)
    image_key = models.CharField(
        max_length=500,
        blank=True,
        default="",
    )
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image - {self.property.title}"
