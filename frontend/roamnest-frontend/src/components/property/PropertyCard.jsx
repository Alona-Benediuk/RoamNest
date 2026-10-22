import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => (
    <div className="property-card">
        <img 
            src={property.main_image || 'https://via.placeholder.com/300x200?text=Немає+фото'} 
            alt={property.title} 
            className="property-image"
        />
        <h3><Link to={`/properties/${property.id}`}>{property.title}</Link></h3>
        <p>{property.city}, {property.country}</p>
        <p className="property-price">{property.price_per_night} грн/ніч</p>
    </div>
);

export default PropertyCard;