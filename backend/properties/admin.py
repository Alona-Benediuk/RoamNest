
from django.contrib import admin
from .models import Property, Room, Amenity, PropertyImage

admin.site.register(Property)
admin.site.register(Room)
admin.site.register(Amenity)
admin.site.register(PropertyImage)
