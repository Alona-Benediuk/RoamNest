import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPropertyById } from '../api/properties';
import { createBooking } from '../api/bookings';
import { useAuth } from '../hooks/useAuth';

const PropertyDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [bookingStatus, setBookingStatus] = useState('idle');

    useEffect(() => {
        const loadProperty = async () => {
            try {
                const data = await getPropertyById(id);
                setProperty(data);
            } catch (err) {
                console.error(err);
                setError('Не вдалося завантажити інформацію.');
            } finally {
                setLoading(false);
            }
        };
        loadProperty();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        const roomId = property.rooms && property.rooms.length > 0 ? property.rooms[0].id : null;
        if (!roomId) {
            alert('Для цього помешкання ще не додано кімнат.');
            return;
        }

        setBookingStatus('loading');
        try {
            await createBooking({
                room: roomId,
                check_in: checkIn,
                check_out: checkOut,
                guests: parseInt(guests),
                contact_name: user.username || 'Гість',
                contact_phone: '+380000000000',
                contact_email: user.email || 'guest@example.com'
            });
            setBookingStatus('success');
            setTimeout(() => navigate('/my-bookings'), 2000);
        } catch (err) {
            console.error(err);
            setBookingStatus('error');
            alert('Помилка бронювання. Можливо, дати зайняті.');
        }
    };

    if (loading) return <div className="loader">Завантаження...</div>;
    if (error) return <div className="error-text">{error}</div>;
    if (!property) return <div>Об'єкт не знайдено</div>;

    const { title, city, country, address, price_per_night, description, main_image, amenities, images } = property;
    const galleryImages = images && images.length > 0 ? images.map(img => img.image) : [main_image, main_image, main_image]; 
    const price = price_per_night || 3341; // Берем из базы или ставим дефолт для красоты

    return (
        <div className="property-details-page">
            <div className="pd-hero" style={{ backgroundImage: `url(${main_image || ''})` }}>
                <div className="pd-hero-overlay"></div>
                <div className="container pd-hero-container">
                    <button className="btn-back-pill-white" onClick={() => navigate(-1)}>
                        ↩ Назад
                    </button>
                </div>
            </div>

            <div className="container pd-main-content">
                <div className="pd-header">
                    <h1 className="pd-title">{title}</h1>
                    <p className="pd-address">📍 {address ? `${address}, ` : ''}{city}, {country}</p>
                </div>

                {amenities && amenities.length > 0 && (
                    <div className="pd-amenities-list">
                        {amenities.map((amenity, index) => (
                            <span key={index} className="pd-amenity-pill">✓ {amenity.name || amenity}</span>
                        ))}
                    </div>
                )}

                <div className="pd-layout">
                    <div className="pd-left-col">
                        <div className="pd-gallery">
                            <img src={galleryImages[0]} alt="Фото 1" className="pd-gallery-main" />
                            {galleryImages[1] && <img src={galleryImages[1]} alt="Фото 2" className="pd-gallery-side" />}
                            {galleryImages[2] && <img src={galleryImages[2]} alt="Фото 3" className="pd-gallery-side" />}
                        </div>

                        <div className="pd-features-grid">
                            <div className="pd-feature-card">
                                <h4>Зручності</h4>
                                <p>Об'єкт обладнаний усім необхідним для комфортного проживання.</p>
                            </div>
                            <div className="pd-feature-card">
                                <h4>Розташування</h4>
                                <p>Зручне розташування в місті {city}.</p>
                            </div>
                            <div className="pd-feature-card">
                                <h4>Опис</h4>
                                <p>{description ? description.substring(0, 80) + '...' : 'Опис відсутній.'}</p>
                            </div>
                        </div>

                        <h2 className="pd-section-title">Опис</h2>
                        <div className="pd-description-block">
                            <p>{description || 'Власник ще не додав детальний опис.'}</p>
                        </div>

                        <h2 className="pd-section-title" style={{ marginTop: '40px' }}>Є запитання?</h2>
                        <div className="pd-question-box">
                            <div className="pd-avatar-small"></div>
                            <input type="text" placeholder="Напишіть запитання..." className="pd-question-input" />
                        </div>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА (НОВЫЙ ДИЗАЙН) */}
                    <div className="pd-right-col">
                        <div className="pd-sidebar-new">
                            
                            {/* Зеленая плашка */}
                            <div className="pd-availability-pill">
                                <span className="check-icon">✓</span> Ваші дати доступні!
                            </div>
                            
                            {/* Сердечко */}
                            <button className="pd-heart-icon">♡</button>

                            <form className="pd-booking-form-new" onSubmit={handleBooking}>
                                {/* Инпуты В'їзд / Виїзд */}
                                <div className="pd-inputs-row">
                                    <div className="pd-input-card">
                                        <span className="pd-input-icon">📅</span>
                                        <div className="pd-input-content">
                                            <label>В'їзд</label>
                                            <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="pd-input-card">
                                        <span className="pd-input-icon">📅</span>
                                        <div className="pd-input-content">
                                            <label>Виїзд</label>
                                            <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Инпут Кількість */}
                                <div className="pd-input-card full-width">
                                    <span className="pd-input-icon">👥</span>
                                    <div className="pd-input-content">
                                        <label>Кількість</label>
                                        <input type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} />
                                        <span className="pd-input-sub">2 особи</span>
                                    </div>
                                </div>

                                {/* Блок с ценой */}
                                <div className="pd-price-section">
                                    <div className="pd-price-main">${price}</div>
                                    <div className="pd-price-sub">${price} за ніч</div>
                                    <div className="pd-price-sub">Усі податки та збори включено</div>
                                </div>

                                {/* Кнопка Далі */}
                                <button type="submit" className="pd-btn-dali" disabled={bookingStatus === 'loading'}>
                                    {bookingStatus === 'loading' ? 'Обробка...' : 'Далі'}
                                </button>
                            </form>

                            {/* Блок Скасування */}
                            <div className="pd-cancel-section">
                                <h3>Скасування</h3>
                                <hr className="pd-divider" />
                                
                                <div className="pd-timeline">
                                    <div className="timeline-point">
                                        <span className="timeline-label">13 лист.</span>
                                        <div className="timeline-dot"></div>
                                    </div>
                                    <div className="timeline-line"></div>
                                    <div className="timeline-point">
                                        <span className="timeline-label">29 лист.</span>
                                        <div className="timeline-dot"></div>
                                    </div>
                                    <div className="timeline-line"></div>
                                    <div className="timeline-point">
                                        <span className="timeline-label">Заїзд</span>
                                        <div className="timeline-dot"></div>
                                    </div>
                                </div>
                                
                                <div className="pd-timeline-texts">
                                    <span>Повне повернення</span>
                                    <span>Часткове повернення</span>
                                    <span>Повернення відсутнє</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;