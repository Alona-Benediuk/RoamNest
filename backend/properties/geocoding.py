
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


PHOTON_API_URL = "https://photon.komoot.io/api/"


class AddressNotFoundError(Exception):
    """The address was not found by Photon."""


class GeocodingServiceError(Exception):
    """Photon service is unavailable or returned an invalid response."""


def get_coordinates(address, city, country):
    """
    Convert an address into latitude and longitude using Photon.
    Returns (latitude, longitude).
    """

    query = ", ".join(
        part.strip()
        for part in (address, city, country)
        if part and part.strip()
    )

    if not query:
        raise AddressNotFoundError("Address is empty.")

    params = urlencode({
        "q": query,
        "limit": 1,
    })

    request = Request(
        f"{PHOTON_API_URL}?{params}",
        headers={
            "User-Agent": "RoamNest/1.0 (property geocoding)"
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))

    except (HTTPError, URLError, TimeoutError, OSError):
        raise GeocodingServiceError(
            "Address search service is temporarily unavailable."
        )

    except (json.JSONDecodeError, UnicodeDecodeError):
        raise GeocodingServiceError(
            "Invalid response from address search service."
        )

    features = data.get("features", [])

    if not features:
        raise AddressNotFoundError(
            "The specified address could not be found."
        )

    try:
        coordinates = features[0]["geometry"]["coordinates"]

        longitude = float(coordinates[0])
        latitude = float(coordinates[1])

    except (KeyError, IndexError, TypeError, ValueError):
        raise GeocodingServiceError(
            "Invalid coordinates received from Photon."
        )

    if not (
        -90 <= latitude <= 90
        and -180 <= longitude <= 180
    ):
        raise GeocodingServiceError(
            "Received coordinates are outside valid ranges."
        )

    return latitude, longitude
