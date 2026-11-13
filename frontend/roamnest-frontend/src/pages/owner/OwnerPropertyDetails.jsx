import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPropertyById, createProperty, updateProperty } from '../../api/properties'; // <-- Импортируем новые функции
import { useAuth } from '../../hooks/useAuth';

const OwnerPropertyDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const isNew = !id || id === 'new'; 

    const [property, setProperty] = useState({
        title: 'Lakefront Cabin: Private Beach, Kayaks',
        city: 'Маямі-Біч',
        country: 'Флорида',
        address: '2d Lakelet street',
        price_per_night: '3341',
        description: 'Тут ви можете вказати додаткові деталі про помешкання...',
        main_image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop'
    });
    
    const [loading, setLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false); // Состояние для кнопки "Створити"

    useEffect(() => {
        if (isNew) {
            setLoading(false);
            return; 
        }

        const loadProperty = async () => {
            try {
                const data = await getPropertyById(id);
                setProperty(data);
            } catch (err) {
                console.error(err);
                alert('Не вдалося завантажити інформацію.');
            } finally {
                setLoading(false);
            }
        };
        loadProperty();
    }, [id, isNew]);

    const handleChange = (e) => {
        setProperty({ ...property, [e.target.name]: e.target.value });
    };

    // РЕАЛЬНОЕ СОХРАНЕНИЕ НА БЭКЕНД
    const handleSave = async () => {
        setIsSaving(true);
        
        // Формируем данные, которые ждет бэкенд. 
        // (Если каких-то полей не хватает, Django вернет 400 ошибку и укажет каких)
        const payload = {
            title: property.title,
            city: property.city,
            country: property.country,
            address: property.address,
            price_per_night: parseFloat(property.price_per_night),
            description: property.description,
            main_image: property.main_image,
            // owner: user.id // (Если бэкенд требует передавать ID владельца вручную)
        };

        try {
            if (isNew) {
                // Создаем новый объект (POST)
                await createProperty(payload);
            } else {
                // Обновляем существующий (PATCH)
                await updateProperty(id, payload);
            }
            
            // Если всё успешно — возвращаемся в кабинет
            navigate('/owner/dashboard');
        } catch (err) {
            console.error('Помилка збереження:', err.response?.data);
            // Показываем ошибку от Django (например, "title: This field is required")
            if (err.response?.data) {
                const errors = Object.entries(err.response.data).map(([k, v]) => `${k}: ${v[0]}`).join(' | ');
                alert(`Помилка: ${errors}`);
            } else {
                alert('Сталася помилка при збереженні.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="loader">Завантаження...</div>;

    const { title, city, country, address, price_per_night, description, main_image } = property;

    return (
        <div className="property-details-page">
            {/* ... Фоновая картинка и кнопка Назад (осталось без изменений) ... */}
            <div className="pd-hero" style={{ backgroundImage: `url(${main_image})` }}>
                <div className="pd-hero-overlay"></div>
                <div className="container pd-hero-container">
                    <button className="btn-back-pill-white" onClick={() => navigate(-1)}>
                        ↩ Назад
                    </button>
                    <div className="owner-badge">{isNew ? 'Створення' : 'Власник'}</div>
                </div>
            </div>

            <div className="container pd-main-content">
                <div className="pd-header">
                    <div className="pd-header-left">
                        {isNew ? (
                            <input 
                                type="text" name="title" value={title} onChange={handleChange} 
                                className="owner-title-input" placeholder="Назва"
                            />
                        ) : (
                            <h1 className="pd-title">{title}</h1>
                        )}

                        <div className="pd-address-row">
                            <span className="pd-label">Дім</span>
                            <span className="pd-label">Адреса</span>
                            {isNew ? (
                                <div className="owner-address-inputs">
                                    <input type="text" name="address" value={address} onChange={handleChange} placeholder="Вулиця" />
                                    <input type="text" name="city" value={city} onChange={handleChange} placeholder="Місто" />
                                    <input type="text" name="country" value={country} onChange={handleChange} placeholder="Країна" />
                                </div>
                            ) : (
                                <p className="pd-address-text">📍 {address}, {city}, {country}</p>
                            )}
                        </div>

                        <div className="pd-amenities-list">
                            <span className="pd-amenity-pill">👨‍👩‍👧 3 гостя</span>
                            <span className="pd-amenity-pill">🛏️ 1 спальня</span>
                            <span className="pd-amenity-pill">🛁 1 ванна</span>
                            <span className="pd-amenity-pill">📶 Wi-Fi</span>
                            <span className="pd-amenity-pill">🚗 Парковка</span>
                        </div>
                    </div>

                    <div className="pd-header-right">
                        <div className="owner-price-panel">
                            {isNew ? (
                                <div className="owner-price-input-box">
                                    <span>$</span>
                                    <input 
                                        type="number" name="price_per_night" value={price_per_night} onChange={handleChange} 
                                    />
                                </div>
                            ) : (
                                <div className="owner-price-display">${price_per_night}</div>
                            )}
                            <div className="owner-price-subtext">ціна за ніч</div>
                            
                            <button 
                                className="owner-edit-btn" 
                                onClick={handleSave} 
                                disabled={isSaving}
                            >
                                {isSaving ? 'Збереження...' : (isNew ? 'Створити' : 'Зберегти зміни')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ... Остальной код (галерея, карточки, календарь) остался без изменений ... */}
                <div className="pd-layout">
                    <div className="pd-left-col">
                        <div className="pd-gallery">
                            <img src={main_image} alt="Фото 1" className="pd-gallery-main" />
                            <img src="https://images.unsplash.com/photo-1542314831-c6a4d1424b94?q=80&w=400" alt="Фото 2" className="pd-gallery-side" />
                            <img src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=400" alt="Фото 3" className="pd-gallery-side" />
                        </div>

                        <div className="pd-features-grid">
                            <div className="pd-feature-card">
                                <h4>Зручності</h4>
                                <p>Басейн, кухня, Wi-Fi, кондиціонер, пральна машина, тераса та багато іншого.</p>
                            </div>
                            <div className="pd-feature-card">
                                <h4>Розташування</h4>
                                <p>Тихе місце, поруч з пляжем та супермаркетом. Ідеально для сімейного відпочинку.</p>
                            </div>
                            <div className="pd-feature-card">
                                <h4>Особливості</h4>
                                <p>Можна з тваринами, безпечна територія, є дитячий майданчик.</p>
                            </div>
                        </div>

                        <h2 className="pd-section-title">Правила проживання</h2>
                        <div className="pd-rules-list">
                            <span className="pd-rule-pill">Заїзд: після 15:00</span>
                            <span className="pd-rule-pill">Виїзд: до 12:00</span>
                            <span className="pd-rule-pill">Заборонено палити</span>
                            <span className="pd-rule-pill">Можна з тваринами</span>
                            <span className="pd-rule-pill">Тихі години: 22:00 - 08:00</span>
                        </div>

                        <h2 className="pd-section-title">Додаткова інформація</h2>
                        <div className="pd-info-block">
                            {isNew ? (
                                <textarea 
                                    name="description" value={description} onChange={handleChange} 
                                    className="owner-edit-textarea" rows="5"
                                />
                            ) : (
                                <p>{description || 'Власник ще не додав детальний опис.'}</p>
                            )}
                        </div>

                        <h2 className="pd-section-title">Опис</h2>
                        <div className="pd-description-block">
                            <p>{description || 'Затишний будиночок біля озера з власним пляжем. Ідеально підходить для пар або сімей з дітьми.'}</p>
                        </div>

                        <h2 className="pd-section-title" style={{ marginTop: '40px' }}>Залишити записк 📝</h2>
                        <div className="pd-question-box">
                            <div className="pd-avatar-small"></div>
                            <input type="text" placeholder="Напишіть записку..." className="pd-question-input" />
                        </div>

                        <div className="owner-calendar-section">
                            <div className="calendar-header-title">
                                <h2 className="pd-section-title">Календар</h2>
                                <button className="btn-add-calendar">Додати</button>
                            </div>
                            
                            <div className="owner-calendar-layout">
                                <div className="calendar-grid-wrapper">
                                    <div className="calendar-top-bar">
                                        <span className="calendar-month">2026 Відносний для заїзду</span>
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
                                <div className="calendar-events-list">
                                    <div className="calendar-search">
                                        <input type="text" placeholder="🔍 Пошук" />
                                    </div>
                                    <div className="events-scroll">
                                        <div className="calendar-event-item event-color-0">
                                            <div className="event-title">Сергій</div>
                                            <div className="event-dates">Підтверджено (14.08 - 16.08)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerPropertyDetails;