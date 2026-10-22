"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.contrib import admin
from rest_framework_simplejwt.views import TokenRefreshView
from properties.views import (
    AmenityListAPIView,
    OwnerPropertyListAPIView,
)
from accounts.views import (
    ProfileAPIView,
    RegisterAPIView,
    LoginAPIView,
    MeAPIView,
    LogoutAPIView,
)
from accounts.admin_views import AdminUserListAPIView, AdminUserUpdateAPIView
from properties.admin_views import AdminPropertyListAPIView, AdminPropertyUpdateAPIView
from bookings.views import OwnerBookingListAPIView, OwnerBookingUpdateAPIView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/properties/", include("properties.urls")),
    path("api/bookings/", include("bookings.urls")),
    path("api/amenities/", AmenityListAPIView.as_view(), name="amenity-list"),
    path("api/profile/", ProfileAPIView.as_view(), name="profile"),
    path("api/auth/register/", RegisterAPIView.as_view(), name="register"),
    path("api/auth/login/", LoginAPIView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/me/", MeAPIView.as_view(), name="me"),
    path("api/auth/logout/", LogoutAPIView.as_view(), name="logout"),
    path("api/admin/users/", AdminUserListAPIView.as_view(), name="admin-user-list"),
    path("api/admin/users/<int:pk>/", AdminUserUpdateAPIView.as_view(), name="admin-user-update"),
    path("api/admin/properties/", AdminPropertyListAPIView.as_view(), name="admin-property-list"),
    path("api/admin/properties/<int:pk>/", AdminPropertyUpdateAPIView.as_view(), name="admin-property-update"),
    path("api/owner/properties/", OwnerPropertyListAPIView.as_view(), name="owner-property-list"),
    path("api/owner/bookings/", OwnerBookingListAPIView.as_view(), name="owner-booking-list"),
    path("api/owner/bookings/<int:pk>/", OwnerBookingUpdateAPIView.as_view(), name="owner-booking-update"),
]
