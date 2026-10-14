
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from mock_data import MOCK_PROPERTIES


class AdminPropertyListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(MOCK_PROPERTIES)


class AdminPropertyUpdateAPIView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        property_item = next(
            (item for item in MOCK_PROPERTIES if item["id"] == pk),
            None,
        )

        if property_item is None:
            return Response(
                {"error": "Property not found."},
                status=404,
            )

        if "status" not in request.data:
            return Response(
                {"error": "Status is required."},
                status=400,
            )

        allowed_statuses = ["NEW", "PUBLISHED", "INACTIVE"]
        new_status = request.data["status"]

        if new_status not in allowed_statuses:
            return Response(
                {
                    "error": (
                        "Invalid status. Allowed values: "
                        "NEW, PUBLISHED, INACTIVE."
                    )
                },
                status=400,
            )

        property_item["status"] = new_status

        return Response(property_item, status=200)

    def delete(self, request, pk):
        property_item = next(
            (item for item in MOCK_PROPERTIES if item["id"] == pk),
            None,
        )

        if property_item is None:
            return Response(
                {"error": "Property not found."},
                status=404,
            )

        MOCK_PROPERTIES.remove(property_item)

        return Response(status=204)
