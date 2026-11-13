import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
    const mainImage =
        property.images?.find((image) => image.is_main)?.image_url ||
        property.images?.[0]?.image_url ||
        property.main_image ||
        'https://placehold.co/600x400?text=No+photo';

    return (
        <article className="property-card">
            <Link to={`/properties/${property.id}`} className="property-card-link">
                <img
                    src={mainImage}
                    alt={property.title}
                    className="property-image"
                    onError={(e) => {
                        e.currentTarget.src =
                            'https://placehold.co/600x400?text=No+photo';
                    }}
                />
                <div className="property-card-content">
                    <h3>{property.title}</h3>
                    <p className="property-location">
                        {property.city}, {property.country}
                    </p>
                    <p className="property-description">
                        {property.description}
                    </p>
                    {property.price_per_night != null && (
                        <p className="property-price">
                            {property.price_per_night} грн / ніч
                        </p>
                    )}
                </div>
            </Link>
        </article>
    );
};

export default PropertyCard;