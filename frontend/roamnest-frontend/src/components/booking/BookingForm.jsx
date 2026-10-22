import { useState } from 'react';
import SearchCalendar from '../calendar/SearchCalendar';

const BookingForm = ({ roomId, maxGuests, pricePerNight, onSubmit }) => {
    const [dates, setDates] = useState([null, null]);
    const [guests, setGuests] = useState(1);
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');

    const [startDate, endDate] = dates;
    const nights = startDate && endDate ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) : 0;
    const total = nights * pricePerNight;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!startDate || !endDate) return alert('Будь ласка, оберіть дати');
        onSubmit({
            room: roomId,
            check_in: startDate.toISOString().slice(0, 10),
            check_out: endDate.toISOString().slice(0, 10),
            guests,
            contact_name: contactName,
            contact_phone: contactPhone,
            contact_email: contactEmail,
            special_requests: specialRequests,
        });
    };

    return (
        <div className="booking-form-container">
            <h3>Забронювати кімнату</h3>
            <form onSubmit={handleSubmit} className="auth-form">
                <SearchCalendar onDateChange={setDates} />
                
                <label className="form-group">
                    Кількість гостей:
                    <input type="number" min="1" max={maxGuests} value={guests} onChange={(e) => setGuests(+e.target.value)} className="form-input" />
                </label>
                <label className="form-group">
                    Ім'я:
                    <input value={contactName} onChange={(e) => setContactName(e.target.value)} required className="form-input" />
                </label>
                <label className="form-group">
                    Телефон:
                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required className="form-input" />
                </label>
                <label className="form-group">
                    Email:
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="form-input" />
                </label>
                <label className="form-group">
                    Побажання:
                    <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="form-textarea" />
                </label>

                {nights > 0 && (
                    <p className="total-price">
                        {nights} ночей × {pricePerNight} грн = <span className="text-green">{total} грн</span>
                    </p>
                )}
                <button type="submit" className="btn-success">
                    Забронювати
                </button>
            </form>
        </div>
    );
};

export default BookingForm;