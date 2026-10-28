
from django.contrib import admin

from .models import Property, RentalUnit, Amenity, PropertyImage

admin.site.register(Property)
admin.site.register(RentalUnit)
admin.site.register(Amenity)
admin.site.register(PropertyImage)
