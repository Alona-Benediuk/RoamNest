import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
    // Используем данные с бэкенда, а если их нет - ставим заглушки как на макете
    const price = property.price_per_night || 341;
    const title = property.title || 'Lakefront Cabin: Private Beach...';
    const location = property.city ? `${property.city}, ${property.country}` : 'Канада';

    return (
        <div className="property-card-modern">
            <Link to={`/properties/${property.id}`} className="card-link">
                <div className="card-image-wrapper">
                    <img 
                        src={property.main_image || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600&auto=format&fit=crop'} 
                        alt={title} 
                        className="card-image"
                    />
                    <button className="card-heart-btn">♡</button>
                </div>
                
                <div className="card-content">
                    <h3 className="card-title">{title}</h3>
                    <p className="card-location">{location}</p>
                    <p className="card-features">8 rooms • 2 guests</p>
                    
                    <div className="card-price-tag">
                        ${price}
                    </div>
                </div>
                <div className="card-bottom-line"></div>
            </Link>
        </div>
    );
};

export default PropertyCard;