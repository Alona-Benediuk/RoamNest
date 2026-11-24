
from rest_framework.permissions import BasePermission

from accounts.models import Profile


class IsProfileAdmin(BasePermission):
    message = "Only administrators can moderate reviews."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return Profile.objects.filter(
            user=request.user,
            role=Profile.Role.ADMIN,
        ).exists()
