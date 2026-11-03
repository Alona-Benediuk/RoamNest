
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Profile

User = get_user_model()


class IsAdminUser(IsAuthenticated):
    """
    Дозволяє доступ тільки авторизованим користувачам
    із роллю ADMIN.
    """

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        return (
            hasattr(request.user, "profile")
            and request.user.profile.role == Profile.Role.ADMIN
        )


def serialize_admin_user(user):
    """
    Формує відповідь у форматі, сумісному з попереднім MOCK_USERS.
    """
    profile = getattr(user, "profile", None)

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": profile.role if profile else None,
        "phone": profile.phone if profile else "",
        "avatar": profile.avatar if profile else "",
        "is_active": user.is_active,
    }


class AdminUserListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = (
            User.objects
            .select_related("profile")
            .all()
            .order_by("id")
        )

        data = [serialize_admin_user(user) for user in users]

        return Response(data, status=status.HTTP_200_OK)


class AdminUserUpdateAPIView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def patch(self, request, pk):
        if not isinstance(request.data, dict):
            return Response(
                {"detail": "Request body must be a JSON object."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.data:
            return Response(
                {"detail": "Provide at least one field to update."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_fields = {"role", "is_active"}
        received_fields = set(request.data.keys())

        if not received_fields.issubset(allowed_fields):
            return Response(
                {
                    "detail": (
                        "Only role and is_active can be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "role" in request.data:
            role = request.data["role"]
            allowed_roles = {
                choice[0] for choice in Profile.Role.choices
            }

            if role not in allowed_roles:
                return Response(
                    {"detail": "Invalid role."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "is_active" in request.data:
            is_active = request.data["is_active"]

            if type(is_active) is not bool:
                return Response(
                    {"detail": "is_active must be a boolean."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Блокуємо активних адміністраторів у визначеному порядку,
        # щоб не допустити одночасного видалення останнього ADMIN.
        active_admins = list(
            User.objects
            .select_for_update()
            .filter(
                is_active=True,
                profile__role=Profile.Role.ADMIN,
            )
            .order_by("id")
        )

        try:
            user = (
                User.objects
                .select_related("profile")
                .get(pk=pk)
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = getattr(user, "profile", None)
        current_role = profile.role if profile else None

        new_role = request.data.get("role", current_role)
        new_is_active = request.data.get("is_active", user.is_active)

        # Забороняємо адміністратору деактивувати власний акаунт.
        if user.id == request.user.id and new_is_active is False:
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Не дозволяємо залишити систему без активного адміністратора.
        removing_active_admin = (
            user.is_active
            and current_role == Profile.Role.ADMIN
            and (
                new_role != Profile.Role.ADMIN
                or new_is_active is False
            )
        )

        if removing_active_admin and len(active_admins) <= 1:
            return Response(
                {
                    "detail": (
                        "Cannot deactivate or demote the last active administrator."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "role" in request.data:
            if profile is None:
                profile = Profile.objects.create(user=user)

            profile.role = new_role
            profile.save(update_fields=["role", "updated_at"])

        if "is_active" in request.data:
            user.is_active = new_is_active
            user.save(update_fields=["is_active"])

        user.refresh_from_db()
        return Response(
            serialize_admin_user(user),
            status=status.HTTP_200_OK,
        )