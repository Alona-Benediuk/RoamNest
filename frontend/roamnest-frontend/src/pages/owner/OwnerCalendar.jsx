import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerBookings } from '../../api/owner';

const OwnerCalendar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Состояние для переключения вкладок (Керування / Встановити)
    const [activeTab, setActiveTab] = useState('manage'); 
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        // Загружаем реальные бронирования с бэкенда
        if (user) {
            getOwnerBookings(user.id)
                .then(data => setBookings(Array.isArray(data) ? data : data.results || []))
                .catch(console.error);
        }
    }, [user]);

    return (
        <div className="calendar-page">
            <div className="container">
                <button className="btn-back-pill-white profile-back" onClick={() => navigate(-1)}>
                    ↩ Назад
                </button>

                <div className="calendar-header-area">
                    <h1 className="calendar-main-title">Календар</h1>
                    <button className="btn-save-calendar">Зберегти</button>
                </div>

                {/* Вкладки */}
                <div className="calendar-tabs">
                    <button 
                        className={`cal-tab ${activeTab === 'manage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manage')}
                    >
                        {activeTab === 'manage' ? 'Керування датами' : 'Встановити дати'}
                    </button>
                    <button className="cal-year">2026</button>
                </div>

                <div className="calendar-layout">
                    {/* ЛЕВАЯ ЧАСТЬ - СЕТКА КАЛЕНДАРЯ */}
                    <div className="calendar-main-grid">
                        <div className="calendar-days-header">
                            <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Нд</span>
                        </div>
                        
                        <div className="calendar-grid">
                            {/* Пустые ячейки для выравнивания (если месяц начинается не с понедельника) */}
                            <div className="cal-day empty">29</div>
                            <div className="cal-day empty">30</div>
                            
                            {/* Дни месяца */}
                            {[...Array(31)].map((_, i) => {
                                const day = i + 1;
                                // Примеры стилей для разных дней, как на макете
                                const isBlocked = day === 27 || day === 28;
                                const isSelected = day === 14 || day === 15 || day === 16 || day === 17 || day === 18 || day === 19;
                                const isLightBlue = day >= 20 && day <= 26;
                                
                                return (
                                    <div 
                                        key={day} 
                                        className={`cal-day 
                                            ${isBlocked ? 'blocked' : ''} 
                                            ${isSelected ? 'selected-range' : ''}
                                            ${isLightBlue ? 'light-blue' : ''}
                                        `}
                                    >
                                        {day}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="calendar-legend">
                            <span className="legend-dot green"></span> Вільні дати
                            <span className="legend-dot grey"></span> Заблоковані
                        </div>
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ - СПИСОК СОБЫТИЙ */}
                    <div className="calendar-side-events">
                        <div className="cal-events-header">
                            <span>Обрати всі</span>
                            <span>✓</span>
                        </div>
                        
                        <div className="cal-events-list">
                            {bookings.length > 0 ? (
                                bookings.map((booking, idx) => (
                                    <div key={booking.id} className={`cal-event-card color-${idx % 3}`}>
                                        <div className="event-info">
                                            <span className="event-title">{booking.room_title || `Бронь #${booking.id}`}</span>
                                            <span className="event-dates">{booking.check_in} - {booking.check_out}</span>
                                        </div>
                                        <span className="event-check">✓</span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {/* Заглушки для красоты, если бронирований нет */}
                                    <div className="cal-event-card color-0">
                                        <div className="event-info">
                                            <span className="event-title">Lakefront Cabin...</span>
                                            <span className="event-dates">15 тра - 18 тра</span>
                                        </div>
                                        <span className="event-check">✓</span>
                                    </div>
                                    <div className="cal-event-card color-1">
                                        <div className="event-info">
                                            <span className="event-title">Lakefront Cabin...</span>
                                            <span className="event-dates">16 тра - 20 тра</span>
                                        </div>
                                        <span className="event-check">✓</span>
                                    </div>
                                    <div className="cal-event-card color-2">
                                        <div className="event-info">
                                            <span className="event-title">Lakefront Cabin...</span>
                                            <span className="event-dates">20 тра - 25 тра</span>
                                        </div>
                                        <span className="event-check">✓</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Нижняя кнопка (как на первом скрине) */}
                <div className="calendar-footer-action">
                    <button className="btn-toggle-status">
                        <span className="status-circle"></span> Закрити дати
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default OwnerCalendar;