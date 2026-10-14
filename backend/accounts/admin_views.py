
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from mock_data import MOCK_USERS


class AdminUserListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(MOCK_USERS)



class AdminUserUpdateAPIView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        user = next(
            (
                item for item in MOCK_USERS
                if item["id"] == pk
            ),
            None,
        )

        if user is None:
            return Response(
                {"detail": "User not found."},
                status=404,
            )

        if not request.data:
            return Response(
                {"detail": "Provide at least one field to update."},
                status=400,
            )

        allowed_fields = {"role", "is_active"}
        received_fields = set(request.data.keys())

        if not received_fields.issubset(allowed_fields):
            return Response(
                {
                    "detail": "Only role and is_active can be updated.",
                },
                status=400,
            )

        if "role" in request.data:
            role = request.data["role"]

            if role not in {"USER", "OWNER", "ADMIN"}:
                return Response(
                    {"detail": "Invalid role."},
                    status=400,
                )

            user["role"] = role

        if "is_active" in request.data:
            is_active = request.data["is_active"]

            if not isinstance(is_active, bool):
                return Response(
                    {"detail": "is_active must be a boolean."},
                    status=400,
                )

            user["is_active"] = is_active

        return Response(user, status=200)
