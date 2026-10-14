
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from mock_data import MOCK_USERS


class ProfileAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get("user_id", "1")

        user = next(
            (
                item
                for item in MOCK_USERS
                if str(item["id"]) == user_id
            ),
            None,
        )

        if user is None:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(user)

    def patch(self, request):
        user_id = request.query_params.get("user_id", "1")

        user = next(
            (
                item
                for item in MOCK_USERS
                if str(item["id"]) == user_id
            ),
            None,
        )

        if user is None:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        editable_fields = [
            "first_name",
            "last_name",
            "phone",
            "avatar",
        ]

        for field in editable_fields:
            if field in request.data:
                value = request.data[field]

                if not isinstance(value, str):
                    return Response(
                        {"detail": f"{field} must be a string."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                user[field] = value.strip()

        return Response(user, status=status.HTTP_200_OK)
