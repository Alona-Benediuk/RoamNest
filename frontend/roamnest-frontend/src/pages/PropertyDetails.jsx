import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPropertyById } from '../api/properties';
import { createBooking } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';
import BookingForm from '../components/booking/BookingForm';

const PropertyDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPropertyById(id)
            .then(setProperty)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleBooking = async (bookingData) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await createBooking({ ...bookingData, user: user.id });
            alert('Бронювання створено!');
            navigate('/my-bookings');
        } catch (e) {
            alert('Помилка бронювання: можливо, дати вже зайняті');
        }
    };

    if (loading) return <div className="loader">Завантаження...</div>;
    if (!property) return <div>Об'єкт не знайдено</div>;

    return (
        <div>
            <h1>{property.title}</h1>
            <p><strong>Місто:</strong> {property.city}, {property.country}</p>
            <p><strong>Адреса:</strong> {property.address}</p>
            <p><strong>Опис:</strong> {property.description}</p>
            <p><strong>Зручності:</strong> {property.amenities?.map(a => a.name).join(', ')}</p>

            <h2 className="mt-30">Доступні кімнати</h2>
            {property.rooms && property.rooms.length > 0 ? (
                property.rooms.map((room) => (
                    <div key={room.id} className="booking-section">
                        <h3 className="room-title">Кімната {room.room_number} (ID: {room.id})</h3>
                        <p>Вмісткість: до {room.max_guests} гостей</p>
                        <p>Ціна: <strong>{room.price_per_night} грн/ніч</strong></p>
                        
                        {user ? (
                            <BookingForm 
                                roomId={room.id} 
                                maxGuests={room.max_guests} 
                                pricePerNight={room.price_per_night} 
                                onSubmit={handleBooking} 
                            />
                        ) : (
                            <p className="clickable-text" onClick={() => navigate('/login')}>
                                Увійдіть, щоб забронювати
                            </p>
                        )}
                    </div>
                ))
            ) : (
                <p>Немає доступних кімнат.</p>
            )}
        </div>
    );
};

export default PropertyDetails;