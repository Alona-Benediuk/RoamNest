import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SearchMap.css';

// Фикс для дефолтных иконок Leaflet в React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SearchMap = ({ properties = [] }) => {
    // Центр по умолчанию (Полтава, как сказал бэкенд-разработчик)
    const defaultCenter = [49.5883, 34.5514];

    // Фильтруем объекты, у которых есть координаты
    const visibleProperties = properties.filter(
        property => property.latitude != null && property.longitude != null
    );

    if (visibleProperties.length === 0) {
        return (
            <div className="search-map-empty">
                <p>Немає об'єктів з координатами для відображення.</p>
            </div>
        );
    }

    return (
        <div className="search-map-wrapper">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="search-map-container"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {visibleProperties.map(property => (
                    <Marker
                        key={property.id}
                        // ОБЯЗАТЕЛЬНО Number(), как сказал бэкенд-разработчик
                        position={[
                            Number(property.latitude),
                            Number(property.longitude)
                        ]}
                    >
                        <Popup>
                            <div className="map-popup-content">
                                <h4>{property.title}</h4>
                                <p>{property.city}</p>
                                <p className="price">
                                    ${property.price_per_night || property.rental_units?.[0]?.price_per_night || '—'} / ніч
                                </p>
                                <Link to={`/properties/${property.id}`} className="popup-link">
                                    Детальніше
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default SearchMap;