
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import RegisterSerializer


class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": profile.role,
            "phone": profile.phone,
            "avatar": profile.avatar,
        })

    def patch(self, request):
        user = request.user
        profile = user.profile

        # Email cannot be changed
        if "email" in request.data:
            return Response(
                {"email": "Changing email is not allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        editable_user_fields = ["first_name", "last_name"]
        editable_profile_fields = ["phone", "avatar"]

        for field in editable_user_fields:
            if field in request.data:
                value = request.data[field]

                if not isinstance(value, str) or not value.strip():
                    return Response(
                        {"detail": f"{field} cannot be empty."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                setattr(user, field, value.strip())

        for field in editable_profile_fields:
            if field in request.data:
                value = request.data[field]

                if not isinstance(value, str):
                    return Response(
                        {"detail": f"{field} must be a string."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                setattr(profile, field, value.strip())

        user.save()
        profile.save()

        return self.get(request)


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Registration successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "role": user.profile.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find accounts by email.
        # Existing duplicate emails are handled without choosing
        # an arbitrary account.
        candidates = User.objects.filter(
            email__iexact=email.strip(),
            is_active=True,
        )

        authenticated_users = []

        for candidate in candidates:
            user = authenticate(
                request,
                username=candidate.username,
                password=password,
            )

            if user is not None:
                authenticated_users.append(user)

        if len(authenticated_users) != 1:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticated_users[0]
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "role": user.profile.role,
                },
            },
            status=status.HTTP_200_OK,
        )


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.profile.role,
            "phone": user.profile.phone,
            "avatar": user.profile.avatar,
        })


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "Logout successful."},
            status=status.HTTP_200_OK,
        )
