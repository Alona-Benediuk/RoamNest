import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createBooking } from '../api/bookings';

const BookingCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Достаем данные, переданные со страницы жилья
    const { property, roomId, checkIn, checkOut, guests } = location.state || {};

    // Если зашли напрямую без данных — редирект на главную
    if (!property || !roomId) {
        navigate('/');
        return null;
    }

    const [formData, setFormData] = useState({
        firstName: user?.username || '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        country: 'Україна',
        city: '',
        address: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Подсчет стоимости
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) || 1;
    
    // Цена (берем из базы или ставим дефолт как на скрине)
    const pricePerNight = property.price_per_night || 341;
    const basePrice = pricePerNight * nights;
    const taxes = Math.round(basePrice * 0.1); // Имитация налога (10%)
    const totalPrice = basePrice + taxes;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createBooking({
                room: roomId,
                check_in: checkIn,
                check_out: checkOut,
                guests: parseInt(guests),
                contact_name: `${formData.firstName} ${formData.lastName}`,
                contact_phone: formData.phone,
                contact_email: formData.email,
                special_requests: `Адреса: ${formData.city}, ${formData.address}`
            });
            alert('Бронювання успішно створено!');
            navigate('/my-bookings');
        } catch (err) {
            console.error(err);
            alert('Помилка при створенні бронювання. Перевірте дані.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container checkout-container">
                
                {/* Шапка с прогресс-баром */}
                <div className="checkout-progress">
                    <h1>Повернення коштів</h1>
                    <div className="progress-steps">
                        <div className="step active">Дані</div>
                        <div className="step active">Оплата</div>
                        <div className="step active">Підтвердження</div>
                    </div>
                </div>

                <form className="checkout-layout" onSubmit={handleSubmit}>
                    {/* ЛЕВАЯ КОЛОНКА - ФОРМА */}
                    <div className="checkout-left">
                        
                        <div className="checkout-section">
                            <h2>Хто бронює</h2>
                            <div className="checkout-grid-2">
                                <div className="checkout-input-box">
                                    <label>Ім'я</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Олександр" required />
                                </div>
                                <div className="checkout-input-box">
                                    <label>Прізвище</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Олександр" required />
                                </div>
                                <div className="checkout-input-box">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@gmail.com" required />
                                </div>
                                <div className="checkout-input-box">
                                    <label>Телефон</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+380" required />
                                </div>
                            </div>
                        </div>

                        <div className="checkout-section">
                            <h2>Оплата</h2>
                            <div className="payment-methods">
                                <label className="payment-radio">
                                    <input type="radio" name="payment" defaultChecked />
                                    <span>Банківська картка</span>
                                </label>
                                <div className="payment-inputs">
                                    <div className="checkout-input-box">
                                        <label>Номер карти</label>
                                        <input type="text" placeholder="0000 0000 0000 0000" />
                                    </div>
                                    <div className="checkout-grid-2">
                                        <div className="checkout-input-box">
                                            <label>Термін дії</label>
                                            <input type="text" placeholder="MM/YY" />
                                        </div>
                                        <div className="checkout-input-box">
                                            <label>CVV</label>
                                            <input type="password" placeholder="***" maxLength="3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-section">
                            <h2>Платника адреса</h2>
                            <div className="checkout-grid-2">
                                <div className="checkout-input-box">
                                    <label>Країна</label>
                                    <input type="text" name="country" value={formData.country} onChange={handleChange} />
                                </div>
                                <div className="checkout-input-box">
                                    <label>Місто</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Київ" required />
                                </div>
                                <div className="checkout-input-box full-width">
                                    <label>Адреса</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Вулиця, будинок, квартира" required />
                                </div>
                            </div>
                        </div>

                        <div className="checkout-section">
                            <h2>Правила проживання</h2>
                            <div className="rules-list">
                                <div className="rule-item">
                                    <span>Заїзд:</span> після 15:00
                                </div>
                                <div className="rule-item">
                                    <span>Виїзд:</span> до 12:00
                                </div>
                                <div className="rule-item">
                                    <span>Заборонено палити</span>
                                </div>
                                <div className="rule-item">
                                    <span>Можна з тваринами</span>
                                </div>
                                <div className="rule-item">
                                    <span>Тихі години:</span> 22:00 - 08:00
                                </div>
                            </div>
                            <p className="rules-warning">
                                Натискаючи кнопку «Забронювати», ви погоджуєтесь з правилами проживання та політикою скасування.
                            </p>
                            
                            <button type="submit" className="btn-checkout-submit" disabled={isLoading}>
                                {isLoading ? 'Обробка...' : 'Забронювати'}
                            </button>
                        </div>

                    </div>

                    {/* ПРАВАЯ КОЛОНКА - ИТОГОВАЯ КАРТОЧКА */}
                    <div className="checkout-right">
                        <div className="checkout-summary">
                            
                            <div className="summary-property">
                                <img src={property.main_image || 'https://via.placeholder.com/150'} alt={property.title} />
                                <div className="summary-property-info">
                                    <h3>{property.title}</h3>
                                    <p>{property.city}, {property.country}</p>
                                    <div className="summary-rating">9.8/10 <span>Високий рейтинг</span></div>
                                </div>
                            </div>

                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Заїзд</span>
                                    <strong>{checkIn || 'Не вказано'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Виїзд</span>
                                    <strong>{checkOut || 'Не вказано'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Кількість гостей</span>
                                    <strong>{guests} особи</strong>
                                </div>
                            </div>

                            <div className="summary-pricing">
                                <h4>Деталізація вартості</h4>
                                <div className="summary-price-row">
                                    <span>${pricePerNight} x {nights} ночей</span>
                                    <span>${basePrice}</span>
                                </div>
                                <div className="summary-price-row">
                                    <span>Податки</span>
                                    <span>${taxes}</span>
                                </div>
                                <div className="summary-total">
                                    <span>Разом</span>
                                    <strong>${totalPrice}</strong>
                                </div>
                            </div>

                            <button type="button" className="btn-summary-cancel" onClick={() => navigate(-1)}>
                                ↩ Скасувати
                            </button>

                            <div className="summary-guarantee">
                                <span className="guarantee-icon">🛡️</span>
                                <div>
                                    <strong>Надійна оплата</strong>
                                    <p>Ваші дані захищені</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingCheckout;