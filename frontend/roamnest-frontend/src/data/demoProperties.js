import poolside from '../assets/photos/poolside.jpg';
import oceanTerrace from '../assets/photos/ocean-terrace.jpg';
import palmTerrace from '../assets/hero.jpg';
import fireLodge from '../assets/photos/fire-lodge.jpg';
import citySuite from '../assets/photos/city-suite.jpg';
import nightLounge from '../assets/photos/night-lounge.jpg';
import snowHotel from '../assets/photos/snow-hotel.jpg';
import lakeCabins from '../assets/photos/lake-cabins.jpg';
import mountainTerrace from '../assets/photos/mountain-terrace.jpg';

const make = (id, title, city, country, price, guests, rooms, photo, category, extra = {}) => ({
    id,
    title,
    city,
    country,
    property_type: extra.type || 'HOTEL',
    categories: [{ slug: category }],
    amenities: (extra.amenities || ['Wi-Fi', 'Паркування', 'Басейн']).map((name, i) => ({ id: i + 1, name })),
    rating: extra.rating ?? 9.2,
    reviews_count: extra.reviews ?? 23,
    image_position: extra.position || 'center',
    images: [{ image_url: photo, is_main: true }],
    rental_units: Array.from({ length: rooms }, (_, i) => ({
        id: id * 100 + i,
        price_per_night: price + i * 15,
        max_guests: guests,
        beds: extra.beds ?? 3,
    })),
});

export const DEMO_PROPERTIES = [
    make(1, 'Lakefront Cabin: Private Beach, Kayaks', 'Макіно-Сіті', 'Мічиган', 341, 5, 8, poolside, 'beach',
        { rating: 9.8, reviews: 23, amenities: ['Wi-Fi', 'Басейн', 'Кондиціонер'], position: 'center 60%' }),
    make(2, 'Ocean View Villa', 'Кауаї', 'Гаваї', 289, 4, 5, oceanTerrace, 'beach',
        { type: 'HOUSE', rating: 9.5, reviews: 41, amenities: ['Басейн', 'Кухня', 'Wi-Fi'] }),
    make(3, 'Palm Terrace Retreat', 'Тулум', 'Мексика', 412, 2, 6, palmTerrace, 'beach',
        { rating: 9.9, reviews: 112, beds: 1, position: 'center 70%' }),
    make(4, 'Sunset Fire Lodge', 'Ватерберг', 'ПАР', 198, 6, 4, fireLodge, 'nature',
        { type: 'HOUSE', rating: 9.7, reviews: 64, beds: 4, amenities: ['Басейн', 'Паркування', 'Кухня'], position: 'center 75%' }),
    make(5, 'Skyline Suite з видом на місто', 'Осака', 'Японія', 220, 2, 3, citySuite, 'city',
        { type: 'APARTMENT', rating: 9.1, reviews: 18, beds: 2, amenities: ['Wi-Fi', 'Кондиціонер', 'Кухня'], position: 'center 55%' }),
    make(6, 'Night Lounge Hotel', 'Осака', 'Японія', 260, 2, 10, nightLounge, 'city',
        { rating: 9.4, reviews: 87, beds: 1, amenities: ['Wi-Fi', 'Паркування', 'Кондиціонер'], position: 'center 55%' }),
    make(7, 'Snow Peak Mountain Hotel', 'Червінія', 'Італія', 310, 4, 12, snowHotel, 'nature',
        { rating: 9.6, reviews: 35, beds: 2, amenities: ['Паркування', 'Wi-Fi', 'Кухня'], position: 'center 72%' }),
    make(8, 'Alpine Lake Cabins', 'Леоганг', 'Австрія', 240, 4, 6, lakeCabins, 'nature',
        { type: 'HOUSE', rating: 9.3, reviews: 52, beds: 3, amenities: ['Басейн', 'Кухня', 'Wi-Fi'], position: 'center 62%' }),
    make(9, 'Mountain Sunset Chalet', 'Буковель', 'Україна', 160, 6, 4, mountainTerrace, 'nature',
        { type: 'HOUSE', rating: 8.9, reviews: 12, beds: 4, amenities: ['Паркування', 'Кухня', 'Wi-Fi'], position: 'center 55%' }),
];