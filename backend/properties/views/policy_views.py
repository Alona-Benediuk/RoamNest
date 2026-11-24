
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Property
from ..serializers import PropertyPolicySerializer
from .property_views import _check_owner


class PropertyPolicyAPIView(APIView):

    def post(self, request, pk):
        error = _check_owner(request)
        if error:
            return error

        try:
            property_obj = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if property_obj.owner_id != request.user.id:
            return Response(
                {"detail": "You can only manage your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if hasattr(property_obj, "policy"):
            return Response(
                {"detail": "Property policy already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PropertyPolicySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        policy = serializer.save(property=property_obj)

        return Response(
            PropertyPolicySerializer(policy).data,
            status=status.HTTP_201_CREATED,
        )

    def patch(self, request, pk):
        error = _check_owner(request)
        if error:
            return error

        try:
            property_obj = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if property_obj.owner_id != request.user.id:
            return Response(
                {"detail": "You can only manage your own properties."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            policy = property_obj.policy
        except Property.policy.RelatedObjectDoesNotExist:
            return Response(
                {"detail": "Property policy not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PropertyPolicySerializer(
            policy,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        policy = serializer.save()

        return Response(
            PropertyPolicySerializer(policy).data,
            status=status.HTTP_200_OK,
        )
