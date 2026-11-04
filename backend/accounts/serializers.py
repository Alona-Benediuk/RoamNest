
from django.contrib.auth.models import User
from django.db import transaction
from django.utils.text import slugify
from rest_framework import serializers

from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
    )

    email = serializers.EmailField(
        required=True,
    )

    first_name = serializers.CharField(
        required=True,
        max_length=150,
    )

    last_name = serializers.CharField(
        required=True,
        max_length=150,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "password_confirm",
        ]

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "Користувач із такою електронною поштою вже існує."
            )

        return email

    def validate_username(self, value):
        username = value.strip()

        if username and User.objects.filter(
            username__iexact=username
        ).exists():
            raise serializers.ValidationError(
                "Це ім'я користувача вже зайняте."
            )

        return username

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": "Паролі не збігаються."
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("password_confirm")

        username = validated_data.pop("username", "").strip()

        if not username:
            base_username = (
                slugify(validated_data["email"].split("@")[0]) or "user"
            )[:140]

            username = base_username
            counter = 1

            while User.objects.filter(
                username__iexact=username
            ).exists():
                suffix = str(counter)
                username = (
                    f"{base_username[:150 - len(suffix)]}{suffix}"
                )
                counter += 1

        user = User.objects.create_user(
            username=username,
            password=password,
            **validated_data,
        )

        Profile.objects.create(user=user)

        return user
