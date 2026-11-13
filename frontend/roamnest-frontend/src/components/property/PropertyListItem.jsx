import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PropertyListItem.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop';

/*
 * Дані для рядка списку з об'єкта API (GET /api/properties/).
 * Ціна, гості та ліжка зберігаються в кімнатах (rental_units).
 */
const toListData = (property) => {
    const units = property.rental_units || [];
    const prices = units.map((u) => Number(u.price_per_night)).filter(Boolean);
    const images = property.images || [];
    const mainImage = images.find((i) => i.is_main) || images[0];

    return {
        title: property.title || 'Без назви',
        location: [property.city, property.country].filter(Boolean).join(', '),
        price: prices.length ? Math.min(...prices) : property.price_per_night,
        guests: units.length ? Math.max(...units.map((u) => u.max_guests || 0)) : null,
        beds: units.length ? Math.max(...units.map((u) => u.beds || 0)) : null,
        image: mainImage?.image_url || property.main_image || FALLBACK_IMAGE,
        imagePosition: property.image_position || 'center', // яку частину фото показати
        amenities: (property.amenities || []).slice(0, 3),
        rating: property.rating,
        reviews: property.reviews_count,
    };
};

// Іконки зручностей у темно-синіх кружечках (як у макеті)
const AMENITY_ICONS = [
    { match: /wi-?fi|інтернет/i, path: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01' },
    { match: /парк/i, path: 'M8 20V4h5a4 4 0 0 1 0 8H8' },
    { match: /басейн|pool/i, path: 'M2 16c2 0 2-1.5 4-1.5S8 16 10 16s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 13V5a2 2 0 0 1 4 0M16 13V5' },
    { match: /кондиц|ac/i, path: 'M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11' },
    { match: /кухн/i, path: 'M7 2v9a2 2 0 0 0 4 0V2M9 11v11M17 2c-2 2-2 6 0 9v11' },
];
const iconFor = (name) => AMENITY_ICONS.find((i) => i.match.test(name))?.path || 'M12 8v8M8 12h8';

const HeartIcon = ({ filled }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path
            d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4z"
            fill={filled ? '#FF9800' : 'none'}
            stroke={filled ? '#FF9800' : '#26382E'}
            strokeWidth="1.5"
        />
    </svg>
);

/**
 * Рядок у списку «Варіанти проживання» (за макетом Figma: 1167 × 255, радіус 50px).
 * nights — кількість ночей для підрахунку загальної суми (з пошуку дат).
 */
const PropertyListItem = ({ property, nights = 7 }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const item = toListData(property);
    const link = `/properties/${property.id}`;

    return (
        <article className="rn-list-card">
            <Link to={link} className="rn-list-card__media" tabIndex={-1} aria-hidden="true">
                <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    style={{ objectPosition: item.imagePosition }}
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                />
                <span className="rn-list-card__dots"><i className="is-active" /><i /><i /><i /><i /></span>
            </Link>

            <div className="rn-list-card__content">
                <h3 className="rn-list-card__title">
                    <Link to={link}>{item.title}</Link>
                </h3>
                {item.location && <p className="rn-list-card__meta">{item.location}</p>}
                {item.guests ? <p className="rn-list-card__meta">{item.guests} людей</p> : null}
                {item.beds ? <p className="rn-list-card__meta">{item.beds} ліжка</p> : null}

                {item.amenities.length > 0 && (
                    <ul className="rn-list-card__amenities" aria-label="Зручності">
                        {item.amenities.map((a) => (
                            <li key={a.id ?? a.name} title={a.name}>
                                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                                    <path d={iconFor(a.name)} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="visually-hidden">{a.name}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    type="button"
                    className="rn-list-card__heart"
                    onClick={() => setIsFavorite((v) => !v)}
                    aria-label={isFavorite ? 'Видалити з обраного' : 'Додати до обраного'}
                    aria-pressed={isFavorite}
                >
                    <HeartIcon filled={isFavorite} />
                </button>

                <div className="rn-list-card__footer">
                    {item.price != null && (
                        <div className="rn-list-card__price-wrap">
                            <span className="rn-list-card__price">${item.price}</span>
                            <span className="rn-list-card__total">За {nights} ночей: <b>{item.price * nights}$</b></span>
                        </div>
                    )}
                    {item.rating != null && (
                        <div className="rn-list-card__rating">
                            <span className="rn-list-card__score"><b>{item.rating}</b>/10</span>
                            {item.reviews != null && <span className="rn-list-card__reviews">Відгуки({item.reviews})</span>}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

export default PropertyListItem;