
from django.conf import settings
from django.db import models


class Profile(models.Model):

    class Role(models.TextChoices):
        USER = "USER", "User"
        OWNER = "OWNER", "Owner"
        ADMIN = "ADMIN", "Administrator"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
    )

    phone = models.CharField(max_length=20, blank=True)
    avatar = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
