import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPropertyById } from '../api/properties';
import { useAuth } from '../hooks/useAuth';

const PropertyDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Состояния для формы
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);

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

    const handleProceedToCheckout = (e) => {
        e.preventDefault();
        
        if (!user) {
            navigate('/login');
            return;
        }

        // Проверяем, есть ли комнаты у помешкання
        const roomId = property.rooms && property.rooms.length > 0 ? property.rooms[0].id : null;
        
        if (!roomId) {
            alert('На жаль, для цього помешкання ще не додано жодної кімнати для бронювання.');
            return;
        }

        // Переходим на страницу оформления, передавая данные через state
        navigate('/checkout', {
            state: {
                property,
                roomId,
                checkIn,
                checkOut,
                guests
            }
        });
    };

    if (loading) return <div className="loader">Завантаження...</div>;
    if (error) return <div className="error-text">{error}</div>;
    if (!property) return <div>Об'єкт не знайдено</div>;

    // Деструктуризация данных из БД
    const { title, city, country, address, price_per_night, description, main_image, amenities, images } = property;
    
    // Берем картинки из базы, если есть, иначе используем главную
    const galleryImages = images && images.length > 0 
        ? images.map(img => img.image) 
        : [main_image, main_image, main_image]; 

    const displayPrice = price_per_night || 3341; // Для красоты, если бэкенд не вернул цену

    return (
        <div className="property-details-page">
            {/* Верхнее фоновое изображение */}
            <div className="pd-hero" style={{ backgroundImage: `url(${main_image || ''})` }}>
                <div className="pd-hero-overlay"></div>
                <div className="container pd-hero-container">
                    <button className="btn-back-pill-white" onClick={() => navigate(-1)}>
                        ↩ Назад
                    </button>
                </div>
            </div>

            <div className="container pd-main-content">
                {/* Заголовок и адрес */}
                <div className="pd-header">
                    <h1 className="pd-title">{title}</h1>
                    <p className="pd-address">
                        📍 {address ? `${address}, ` : ''}{city}, {country}
                    </p>
                </div>

                {/* Плашки с удобствами из БД */}
                {amenities && amenities.length > 0 && (
                    <div className="pd-amenities-list">
                        {amenities.map((amenity, index) => (
                            <span key={index} className="pd-amenity-pill">
                                ✓ {amenity.name || amenity}
                            </span>
                        ))}
                    </div>
                )}

                {/* Двухколоночная верстка */}
                <div className="pd-layout">
                    
                    {/* ЛЕВАЯ КОЛОНКА */}
                    <div className="pd-left-col">
                        
                        {/* Галерея */}
                        <div className="pd-gallery">
                            <img src={galleryImages[0]} alt="Фото 1" className="pd-gallery-main" />
                            {galleryImages[1] && <img src={galleryImages[1]} alt="Фото 2" className="pd-gallery-side" />}
                            {galleryImages[2] && <img src={galleryImages[2]} alt="Фото 3" className="pd-gallery-side" />}
                        </div>

                        {/* Темно-зеленые карточки */}
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

                        {/* Опис */}
                        <h2 className="pd-section-title">Опис</h2>
                        <div className="pd-description-block">
                            <p>{description || 'Власник ще не додав детальний опис.'}</p>
                        </div>

                        {/* Блок із запитанням */}
                        <h2 className="pd-section-title" style={{ marginTop: '40px' }}>Є запитання?</h2>
                        <div className="pd-question-box">
                            <div className="pd-avatar-small"></div>
                            <input type="text" placeholder="Напишіть запитання..." className="pd-question-input" />
                        </div>

                    </div>

                    {/* ПРАВАЯ КОЛОНКА (Форма бронирования) */}
                    <div className="pd-right-col">
                        <div className="pd-sidebar-new">
                            
                            <div className="pd-availability-pill">
                                <span className="check-icon">✓</span> Ваші дати доступні!
                            </div>
                            
                            <button className="pd-heart-icon">♡</button>

                            <form className="pd-booking-form-new" onSubmit={handleProceedToCheckout}>
                                <div className="pd-inputs-row">
                                    <div className="pd-input-card">
                                        <span className="pd-input-icon">📅</span>
                                        <div className="pd-input-content">
                                            <label>В'їзд</label>
                                            <input 
                                                type="date" 
                                                required 
                                                value={checkIn} 
                                                onChange={(e) => setCheckIn(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    <div className="pd-input-card">
                                        <span className="pd-input-icon">📅</span>
                                        <div className="pd-input-content">
                                            <label>Виїзд</label>
                                            <input 
                                                type="date" 
                                                required 
                                                value={checkOut} 
                                                onChange={(e) => setCheckOut(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pd-input-card full-width">
                                    <span className="pd-input-icon">👥</span>
                                    <div className="pd-input-content">
                                        <label>Кількість</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={guests} 
                                            onChange={(e) => setGuests(e.target.value)} 
                                        />
                                        <span className="pd-input-sub">2 особи</span>
                                    </div>
                                </div>

                                <div className="pd-price-section">
                                    <div className="pd-price-main">${displayPrice}</div>
                                    <div className="pd-price-sub">${displayPrice} за ніч</div>
                                    <div className="pd-price-sub">Усі податки та збори включено</div>
                                </div>

                                <button type="submit" className="pd-btn-dali">
                                    Далі
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