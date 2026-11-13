import { Link } from 'react-router-dom';

const PropertyListItem = ({ property }) => {
    return (
        <div className="list-card">
            <Link to={`/properties/${property.id}`} className="list-card-image-wrapper">
                <img 
                    src={property.main_image || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600'} 
                    alt={property.title} 
                />
            </Link>
            
            <div className="list-card-content">
                <div className="list-card-header">
                    <div>
                        <h3 className="list-card-title">{property.title}</h3>
                        <p className="list-card-location">{property.city || 'Київ'}</p>
                    </div>
                    <button className="list-heart-btn">♡</button>
                </div>

                <div className="list-card-amenities">
                    <span className="amenity-icon">🛜</span>
                    <span className="amenity-icon">☕</span>
                    <span className="amenity-icon">🚗</span>
                    <span className="amenity-icon">🌊</span>
                    <span className="amenity-icon">🏊</span>
                </div>

                <div className="list-card-footer">
                    <div className="rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="score">8.5</span>
                    </div>
                    <div className="price-block">
                        <span className="old-price">{property.old_price || 1200} ₴</span>
                        <span className="new-price">{property.price_per_night || 341} ₴</span>
                    </div>
                </div>
            </div>
            
            {/* Желтая оранжевая полоска снизу */}
            <div className="list-card-bottom-line"></div>
        </div>
    );
};

export default PropertyListItem;