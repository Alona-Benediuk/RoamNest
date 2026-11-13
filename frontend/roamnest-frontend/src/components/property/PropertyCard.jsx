import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PropertyCard.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop';

const toCardData = (property) => {
    const units = property.rental_units || [];
    const prices = units.map((u) => Number(u.price_per_night)).filter(Boolean);
    const images = property.images || [];
    const mainImage = images.find((i) => i.is_main) || images[0];

    return {
        title: property.title || 'Без назви',
        location: [property.city, property.country].filter(Boolean).join(', '),
        price: prices.length ? Math.min(...prices) : property.price_per_night,
        guests: units.length ? Math.max(...units.map((u) => u.max_guests || 0)) : null,
        rooms: units.length || null,
        image: mainImage?.image_url || property.main_image || FALLBACK_IMAGE,
        imagePosition: property.image_position || 'center', // яку частину фото показати
    };
};

const MONTHS = ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв', 'Лип', 'Серп', 'Вер', 'Жовт', 'Лист', 'Груд'];
const formatDay = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const getDealDates = (nights) => {
    const start = new Date();
    start.setDate(start.getDate() + 30);
    const end = new Date(start);
    end.setDate(start.getDate() + nights);
    return `${formatDay(start)} - ${formatDay(end)}`;
};

const HeartIcon = ({ filled }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
            d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4z"
            fill={filled ? '#FF9800' : 'none'}
            stroke={filled ? '#FF9800' : '#26382E'}
            strokeWidth="1.6"
        />
    </svg>
);


const PropertyCard = ({ property, variant = 'default', nights = 3 }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const card = toCardData(property);
    const isDeal = variant === 'deal';

    const toggleFavorite = (e) => {
        e.preventDefault();
        setIsFavorite((v) => !v);
    };

    const details = [
        card.rooms && `${card.rooms} кімнат`,
        card.guests && `до ${card.guests} гостей`,
    ].filter(Boolean).join(' • ');

    const price = card.price != null && <span className="rn-card__price">${card.price}</span>;

    return (
        <article className={`rn-card ${isDeal ? 'rn-card--deal' : ''}`}>
            <Link to={`/properties/${property.id}`} className="rn-card__link">
                <div className="rn-card__media">
                    <img
                        src={card.image}
                        alt={card.title}
                        className="rn-card__image"
                        loading="lazy"
                        style={{ objectPosition: card.imagePosition }}
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                    <span className="rn-card__arrow" aria-hidden="true">›</span>
                    {isDeal && (
                        <span className="rn-card__dots" aria-hidden="true">
                            <i className="is-active" /><i /><i />
                        </span>
                    )}
                </div>

                <div className="rn-card__body">
                    <h3 className="rn-card__title">{card.title}</h3>
                    {card.location && <p className="rn-card__meta">{card.location}</p>}
                    {details && <p className="rn-card__meta">{details}</p>}

                    <button
                        type="button"
                        className="rn-card__heart"
                        onClick={toggleFavorite}
                        aria-label={isFavorite ? 'Видалити з обраного' : 'Додати до обраного'}
                        aria-pressed={isFavorite}
                    >
                        <HeartIcon filled={isFavorite} />
                    </button>

                    {isDeal ? (
                        <div className="rn-card__deal">
                            {price}
                            {card.price != null && (
                                <span className="rn-card__total">${card.price * nights} за {nights} дні</span>
                            )}
                            <span className="rn-card__dates">{getDealDates(nights)}</span>
                        </div>
                    ) : price}
                </div>
            </Link>
        </article>
    );
};

export default PropertyCard;