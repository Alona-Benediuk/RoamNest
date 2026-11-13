import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getProfile } from '../../api/profile';
import { getOwnerProperties, getOwnerBookings } from '../../api/owner';

const OwnerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [properties, setProperties] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            
            try {
                // Загружаем все данные параллельно
                const [profileData, propertiesData, bookingsData] = await Promise.all([
                    getProfile(),
                    getOwnerProperties(user.id),
                    getOwnerBookings(user.id)
                ]);
                
                setProfile(profileData);
                setProperties(Array.isArray(propertiesData) ? propertiesData : propertiesData.results || []);
                setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.results || []);
            } catch (err) {
                console.error('Помилка завантаження даних кабінету власника:', err);
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
    if (!profile) return <div className="loader">Немає доступу до даних...</div>;

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
                            {profile.first_name ? profile.first_name[0] : 'O'}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#F5A623', marginBottom: '15px' }}>
                        Роль: Власник
                    </div>

                    <div className="profile-info-section">
                        <h3 className="profile-section-title">Загальна інформація <span className="info-icon">ⓘ</span></h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Ім'я</span>
                                <span className="info-value">{profile.first_name || 'Не вказано'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Прізвище</span>
                                <span className="info-value">{profile.last_name || 'Не вказано'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Місто</span>
                                <span className="info-value">Не вказано</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Дата народження</span>
                                <span className="info-value">Не вказано</span>
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
                            <span className="info-value">{profile.email || user?.email || 'Не вказано'}</span>
                        </div>
                        <div className="info-item" style={{ marginTop: '10px' }}>
                            <span className="info-label">Адреса</span>
                            <span className="info-value">Не вказано</span>
                        </div>
                    </div>

                    <div className="profile-info-section">
                        <h3 className="profile-section-title">Дані карти <span className="info-icon">ⓘ</span></h3>
                        <div className="info-item">
                            <span className="info-label">Номер</span>
                            <span className="info-value">**** **** 4725</span>
                        </div>
                        <button className="btn-outline" style={{ marginTop: '10px' }}>Відв'язати карту</button>
                    </div>

                    <div className="profile-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
                        <button className="btn-outline">Календар</button>
                        <button className="btn-outline">Аналітика та фінанси</button>
                        <button className="btn-outline">Створити гніздечко</button>
                    </div>

                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                        <button className="btn-outline" onClick={handleLogout}>Вихід</button>
                    </div>
                </aside>

                {/* ПРАВАЯ КОЛОНКА (Контент) */}
                <main className="profile-main">
                    
                    {/* Блок Чату */}
                    <div className="profile-card">
                        <h2 className="card-title">Чат <span className="info-icon">ⓘ</span></h2>
                        <div className="chat-preview">
                            <div className="chat-avatar">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Chat" />
                            </div>
                            <div className="chat-bubble">
                                <p className="chat-author">Сергій (Lakefront Cabin: Private Beach, Kayaks)</p>
                                <p className="chat-text">Добрий день, чи можна змінити дати заїзду на наступний тиждень?</p>
                                <p className="chat-time">14:30</p>
                            </div>
                        </div>
                    </div>

                    {/* Мої об'єкти */}
                    <div className="profile-card">
                        <div className="card-header-orange">
                            <h2 className="card-title-text">Мої об'єкти</h2>
                            <span className="dropdown-arrow-orange">▼</span>
                        </div>
                        
                        {properties.length > 0 ? (
                            properties.map(property => (
                                <div key={property.id} className="owner-property-item">
                                    <img src={property.main_image || 'https://via.placeholder.com/200'} alt={property.title} />
                                    <div className="owner-property-info">
                                        <h4>{property.title}</h4>
                                        <p>📍 {property.city}, {property.country}</p>
                                        <p>{property.address}</p>
                                    </div>
                                    <button className="btn-edit-property" onClick={() => alert('Редагування в розробці')}>
                                        Редагувати
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p style={{ padding: '20px', color: '#666' }}>У вас поки немає об'єктів.</p>
                        )}
                    </div>

                    {/* Календар */}
                    <div className="profile-card">
                        <div className="card-header-orange">
                            <h2 className="card-title-text">Календар</h2>
                            <span className="dropdown-arrow-orange">▼</span>
                        </div>
                        
                        <div className="owner-calendar-layout">
                            {/* Сетка календаря (Визуальная) */}
                            <div className="calendar-grid-wrapper">
                                <div className="calendar-header">
                                    <button className="btn-cal-nav">2026</button>
                                </div>
                                <div className="calendar-days-header">
                                    <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Нд</span>
                                </div>
                                <div className="calendar-grid">
                                    {[...Array(31)].map((_, i) => (
                                        <div key={i} className={`calendar-day ${i === 13 || i === 14 ? 'selected' : ''}`}>
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Список подій (Бронирования из БД) */}
                            <div className="calendar-events-list">
                                <div className="calendar-search">
                                    <input type="text" placeholder="🔍 Пошук" />
                                </div>
                                <div className="events-scroll">
                                    {bookings.length > 0 ? (
                                        bookings.map((booking, idx) => (
                                            <div key={booking.id} className={`calendar-event-item event-color-${idx % 3}`}>
                                                <div className="event-title">{booking.room_title || `Бронь #${booking.id}`}</div>
                                                <div className="event-dates">{booking.check_in} - {booking.check_out}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#888', fontSize: '13px' }}>Немає бронювань</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                </main>
            </div>
        </div>
    );
};

export default OwnerDashboard;