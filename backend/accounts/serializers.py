
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.db import transaction
from django.utils.text import slugify
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers

from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
    )

    first_name = serializers.CharField(
        required=True,
        max_length=150,
        trim_whitespace=True,
    )

    last_name = serializers.CharField(
        required=True,
        max_length=150,
        trim_whitespace=True,
    )

    email = serializers.EmailField(required=True)

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
    )

    role = serializers.ChoiceField(
        choices=[
            (Profile.Role.USER, "Гість"),
            (Profile.Role.OWNER, "Власник"),
        ],
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
            "role",
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

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Прізвище обов'язкове."
            )

        return value.strip()

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Ім'я обов'язкове."
            )

        return value.strip()

    def validate_password(self, value):
        try:
            django_validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages)

        return value

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

        role = validated_data.pop("role")
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

        Profile.objects.create(
            user=user,
            role=role,
        )

        return user
