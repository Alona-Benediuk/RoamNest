
# backend/mock_data.py
# Тестові дані RoamNest для розробки frontend.
# Дані поки що зберігаються в пам'яті, а не в базі даних.

# Три тестові користувачі з різними ролями.
# Чотири об'єкти житла, зокрема один неопублікований.
# Різні ціни, місткість, фотографії та зручності.
# Приклад номера, де rooms_count = 5, для майбутнього тестування доступності.
# Два бронювання з різними статусами.

MOCK_USERS = [
    {
        "id": 1,
        "username": "guest_user",
        "email": "guest@example.com",
        "first_name": "Olena",
        "last_name": "Benediuk",
        "role": "USER",
        "phone": "+380501112233",
        "avatar": "",
        "is_active": True,
    },
    {
        "id": 2,
        "username": "property_owner",
        "email": "owner@example.com",
        "first_name": "Andrii",
        "last_name": "Koval",
        "role": "OWNER",
        "phone": "+380671112233",
        "avatar": "",
        "is_active": True,
    },
    {
        "id": 3,
        "username": "admin_user",
        "email": "admin@example.com",
        "first_name": "Admin",
        "last_name": "RoamNest",
        "role": "ADMIN",
        "phone": "",
        "avatar": "",
        "is_active": True,
    },
]

MOCK_AMENITIES = [
    {"id": 1, "name": "Wi-Fi"},
    {"id": 2, "name": "Parking"},
    {"id": 3, "name": "Swimming pool"},
    {"id": 4, "name": "Kitchen"},
    {"id": 5, "name": "Air conditioning"},
    {"id": 6, "name": "Breakfast"},
    {"id": 7, "name": "Pet friendly"},
]

MOCK_PROPERTIES = [
    {
        "id": 1,
        "owner": 3,
        "title": "Cozy Apartment in Kyiv",
        "description": "Modern apartment near the city center.",
        "property_type": "APARTMENT",
        "address": "Khreshchatyk 10",
        "city": "Kyiv",
        "country": "Ukraine",
        "status": "PUBLISHED",
        "amenities": [
            {"id": 1, "name": "Wi-Fi"},
            {"id": 4, "name": "Kitchen"},
            {"id": 5, "name": "Air conditioning"},
        ],
        "rooms": [
            {
                "id": 1,
                "title": "One-bedroom apartment",
                "description": "Entire apartment for a comfortable stay.",
                "room_type": "APARTMENT",
                "price_per_night": "1800.00",
                "max_guests": 4,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1,
                "rooms_count": 1,
                "amenities": [
                    {"id": 1, "name": "Wi-Fi"},
                    {"id": 4, "name": "Kitchen"},
                ],
                "is_published": True,
            }
        ],
        "images": [
            {
                "id": 1,
                "image_url": "https://placehold.co/1200x800?text=Kyiv+Apartment",
                "is_main": True,
                "room": None,
            }
        ],
    },
    {
        "id": 2,
        "owner": 2,
        "title": "Mountain View House",
        "description": "A spacious house with a beautiful mountain view.",
        "property_type": "HOUSE",
        "address": "Example Street 5",
        "city": "Yaremche",
        "country": "Ukraine",
        "status": "PUBLISHED",
        "amenities": [
            {"id": 1, "name": "Wi-Fi"},
            {"id": 2, "name": "Parking"},
            {"id": 7, "name": "Pet friendly"},
        ],
        "rooms": [
            {
                "id": 2,
                "title": "Entire house",
                "description": "House suitable for families.",
                "room_type": "HOUSE",
                "price_per_night": "2500.00",
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 2,
                "rooms_count": 1,
                "amenities": [
                    {"id": 1, "name": "Wi-Fi"},
                    {"id": 2, "name": "Parking"},
                ],
                "is_published": True,
            }
        ],
        "images": [
            {
                "id": 2,
                "image_url": "https://placehold.co/1200x800?text=Mountain+House",
                "is_main": True,
                "room": None,
            }
        ],
    },
    {
        "id": 3,
        "owner": 2,
        "title": "Hotel Standard Room",
        "description": "A comfortable hotel room near the city center.",
        "property_type": "HOTEL",
        "address": "Example Avenue 12",
        "city": "Lviv",
        "country": "Ukraine",
        "status": "PUBLISHED",
        "amenities": [
            {"id": 1, "name": "Wi-Fi"},
            {"id": 2, "name": "Parking"},
            {"id": 6, "name": "Breakfast"},
        ],
        "rooms": [
            {
                "id": 3,
                "title": "Standard double room",
                "description": "Double room with one double bed.",
                "room_type": "HOTEL_ROOM",
                "price_per_night": "1500.00",
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1,
                "rooms_count": 5,
                "amenities": [
                    {"id": 1, "name": "Wi-Fi"},
                    {"id": 6, "name": "Breakfast"},
                ],
                "is_published": True,
            }
        ],
        "images": [
            {
                "id": 3,
                "image_url": "https://placehold.co/1200x800?text=Hotel+Room",
                "is_main": True,
                "room": None,
            }
        ],
    },
    {
        "id": 4,
        "owner": 2,
        "title": "Private Room in Odesa",
        "description": "A simple private room for a short stay.",
        "property_type": "ROOM",
        "address": "Example Street 20",
        "city": "Odesa",
        "country": "Ukraine",
        "status": "NEW",
        "amenities": [
            {"id": 1, "name": "Wi-Fi"},
        ],
        "rooms": [
            {
                "id": 4,
                "title": "Private room",
                "description": "Private room with shared facilities.",
                "room_type": "PRIVATE_ROOM",
                "price_per_night": "900.00",
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1,
                "rooms_count": 1,
                "amenities": [
                    {"id": 1, "name": "Wi-Fi"},
                ],
                "is_published": True,
            }
        ],
        "images": [],
    },
]

MOCK_BOOKINGS = [
    {
        "id": 1,
        "user": 1,
        "room": 1,
        "property_id": 1,
        "property_title": "Cozy Apartment in Kyiv",
        "room_title": "One-bedroom apartment",
        "check_in": "2026-11-10",
        "check_out": "2026-11-13",
        "guests": 2,
        "contact_name": "Olena Benediuk",
        "contact_phone": "+380501112233",
        "contact_email": "guest@example.com",
        "special_requests": "Late check-in",
        "price_per_night": "1800.00",
        "total_price": "5400.00",
        "status": "CONFIRMED",
        "created_at": "2026-10-10T12:00:00Z",
        "updated_at": "2026-10-10T12:00:00Z",
    },
    {
        "id": 2,
        "user": 1,
        "room": 3,
        "property_id": 3,
        "property_title": "Hotel Standard Room",
        "room_title": "Standard double room",
        "check_in": "2026-12-01",
        "check_out": "2026-12-03",
        "guests": 2,
        "contact_name": "Olena Benediuk",
        "contact_phone": "+380501112233",
        "contact_email": "guest@example.com",
        "special_requests": "",
        "price_per_night": "1500.00",
        "total_price": "3000.00",
        "status": "PENDING",
        "created_at": "2026-10-12T12:00:00Z",
        "updated_at": "2026-10-12T12:00:00Z",
    },
    
    {
        "id": 3,
        "user": 2,
        "room": 1,
        "property_id": 1,
        "property_title": "Cozy Apartment in Kyiv",
        "room_title": "One-bedroom apartment",
        "check_in": "2027-06-10",
        "check_out": "2027-06-13",
        "guests": 2,
        "contact_name": "Test Guest",
        "contact_phone": "+380501234567",
        "contact_email": "test_guest@example.com",
        "special_requests": "",
        "price_per_night": "1800.00",
        "total_price": "5400.00",
        "status": "PENDING",
        "created_at": None,
        "updated_at": None,
    },

]
