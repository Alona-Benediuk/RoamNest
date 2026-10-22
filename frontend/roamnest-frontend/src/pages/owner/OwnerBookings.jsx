import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerBookings, updateBookingStatus } from '../../api/owner';

const OwnerBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getOwnerBookings(user.id)
                .then(setBookings)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleStatusChange = async (id, status) => {
        try {
            await updateBookingStatus(id, status);
            setBookings((prev) => 
                prev.map((b) => (b.id === id ? { ...b, status } : b))
            );
        } catch (e) {
            alert('Помилка оновлення статусу');
        }
    };

    const getStatusUkr = (status) => {
        switch(status) {
            case 'PENDING': return 'Очікує';
            case 'CONFIRMED': return 'Підтверджено';
            case 'CANCELLED': return 'Скасовано';
            case 'COMPLETED': return 'Завершено';
            default: return status;
        }
    };

    if (loading) return <div className="loader">Завантаження...</div>;

    return (
        <div>
            <div className="dashboard-header">
                <h2>Вхідні бронювання</h2>
                <Link to="/owner/dashboard" className="btn-secondary">
                    Назад до панелі
                </Link>
            </div>
            
            {bookings.length === 0 ? (
                <p>Наразі немає нових бронювань.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Кімната</th>
                            <th>Гість (ID)</th>
                            <th>Дати</th>
                            <th>Сума</th>
                            <th>Статус</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id}>
                                <td>{b.id}</td>
                                <td>{b.room_title || b.room}</td>
                                <td>{b.user || '—'}</td>
                                <td>{b.check_in} — {b.check_out}</td>
                                <td>{b.total_price} грн</td>
                                <td>
                                    <span className={`status-${b.status.toLowerCase()}`}>
                                        {getStatusUkr(b.status)}
                                    </span>
                                </td>
                                <td>
                                    {b.status === 'PENDING' && (
                                        <div className="flex-row-gap-sm">
                                            <button 
                                                onClick={() => handleStatusChange(b.id, 'CONFIRMED')} 
                                                className="btn-success"
                                            >
                                                Підтвердити
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(b.id, 'CANCELLED')} 
                                                className="btn-danger"
                                            >
                                                Відхилити
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OwnerBookings;