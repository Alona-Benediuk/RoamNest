import { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getMyBookings(user.id)
                .then(setBookings)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleCancel = async (id) => {
        if (!window.confirm('Скасувати бронювання?')) return;
        try {
            await cancelBooking(id);
            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
            );
        } catch (e) {
            alert('Помилка скасування');
        }
    };

    const getStatusUkr = (status) => {
        switch(status) {
            case 'PENDING': return 'Очікує підтвердження';
            case 'CONFIRMED': return 'Підтверджено';
            case 'CANCELLED': return 'Скасовано';
            case 'COMPLETED': return 'Завершено';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'PENDING': return 'status-pending';
            case 'CONFIRMED': return 'status-confirmed';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    };

    if (loading) return <div className="loader">Завантаження...</div>;

    return (
        <div>
            <h2>Мої бронювання</h2>
            {bookings.length === 0 && <p>У вас поки немає бронювань.</p>}
            <div className="auth-form">
                {bookings.map((b) => (
                    <div key={b.id} className="booking-section">
                        <h3>Бронь #{b.id} — Кімната {b.room}</h3>
                        <p>Дати: {b.check_in} по {b.check_out}</p>
                        <p>Гостей: {b.guests}</p>
                        <p>Статус: <span className={getStatusClass(b.status)}>{getStatusUkr(b.status)}</span></p>
                        
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                            <button onClick={() => handleCancel(b.id)} className="btn-danger mt-10">
                                Скасувати
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyBookings;