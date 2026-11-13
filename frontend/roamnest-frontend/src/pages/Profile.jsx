import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api/profile';
import { getMyBookings } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            
            try {
                // Стучимся на реальный бэкенд
                const profileData = await getProfile();
                setProfile(profileData);

                const bookingsData = await getMyBookings(user.id);
                setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.results || []);
            } catch (err) {
                console.error('Помилка доступу до кабінету (можливо, токен протух):', err);
                // Если бэкенд вернул 401, разлогиниваем и кидаем на вход
                if (err.response?.status === 401) {
                    logout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user, logout, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) return <div className="loader">Завантаження...</div>;
    // Если профиль не загрузился (ошибка), не показываем пустую страницу
    if (!profile) return <div className="loader">Немає доступу до даних...</div>;

    const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
    const historyBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');

    return (
        <div className="profile-page">
            <div className="container profile-layout">
                
                {/* ЛЕВАЯ КОЛОНКА (Сайдбар) */}
                <aside className="profile-sidebar">
                    <button className="btn-back-pill-white profile-back" onClick={() => navigate(-1)}>
                        ↩ Назад
                    </button>

                    <div className="profile-avatar">
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#d1c7b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', color: '#fff' }}>
                            {profile.first_name ? profile.first_name[0] : 'U'}
                        </div>
                    </div>

                    <div className="profile-info-section">
                        <h3 className="profile-section-title">Загальна інформація <span className="info-icon">ⓘ</span></h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Ім'я</span>
                                <span className="info-value">{profile.first_name || '—'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Прізвище</span>
                                <span className="info-value">{profile.last_name || '—'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Роль</span>
                                <span className="info-value">{profile.role || 'USER'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-info-section">
                        <h3 className="profile-section-title">Контакти</h3>
                        <div className="info-item">
                            <span className="info-label">Телефон</span>
                            <span className="info-value">{profile.phone || 'Не вказано'}</span>
                        </div>
                        <div className="info-item" style={{ marginTop: '10px' }}>
                            <span className="info-label">Пошта</span>
                            <span className="info-value">{profile.email || user?.email || '—'}</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn-outline" onClick={handleLogout}>Вихід</button>
                    </div>
                </aside>

                {/* ПРАВАЯ КОЛОНКА (Контент) */}
                <main className="profile-main">
                    
                    {/* Заброньоване житло */}
                    <div className="profile-card">
                        <div className="card-header-orange">
                            <h2 className="card-title-text">Заброньоване житло</h2>
                        </div>
                        
                        {activeBookings.length > 0 ? (
                            activeBookings.map(booking => (
                                <div key={booking.id} className="booking-history-item">
                                    <img src="https://via.placeholder.com/200" alt="Property" />
                                    <div className="booking-info">
                                        <h4>{booking.room_title || `Кімната ID: ${booking.room}`}</h4>
                                        <p>📍 {booking.city || 'Місто не вказано'}</p>
                                        <span className="booking-tag">Відмінне бронювання</span>
                                    </div>
                                    <div className="booking-price-dates">
                                        <div className="booking-price">${booking.total_price || 0}</div>
                                        <div className="booking-dates">
                                            <span>{booking.check_in}</span>
                                            <span>{booking.check_out}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ padding: '20px', color: '#666' }}>У вас немає активних бронювань.</p>
                        )}
                    </div>

                    {/* Історія */}
                    <div className="profile-card">
                        <div className="card-header-orange">
                            <h2 className="card-title-text">Історія</h2>
                        </div>
                        {historyBookings.length > 0 ? (
                            historyBookings.map(booking => (
                                <div key={booking.id} className="booking-history-item">
                                    <img src="https://via.placeholder.com/200" alt="Property" />
                                    <div className="booking-info">
                                        <h4>{booking.room_title || `Кімната ID: ${booking.room}`}</h4>
                                        <p>📍 {booking.city || 'Місто не вказано'}</p>
                                        <span className="booking-tag">Завершена відпустка</span>
                                    </div>
                                    <div className="booking-price-dates">
                                        <div className="booking-price">${booking.total_price || 0}</div>
                                        <div className="booking-dates">
                                            <span>{booking.check_in}</span>
                                            <span>{booking.check_out}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ padding: '20px', color: '#666' }}>Історія бронювань порожня.</p>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default Profile;