import mapImage from '../../assets/map.jpg';

/**
 * Карта з пінами об'єктів (зображення з макета Figma: 573 × 559, радіус 32, рамка 8px).
 * Поки це статичне зображення; справжню карту (Google Maps / Leaflet)
 * можна підключити пізніше — ТЗ п. 20, «Додаткова функціональність».
 */
const SearchMap = () => (
    <div className="rn-map">
        <img src={mapImage} alt="Карта з розташуванням об'єктів житла" className="rn-map__img" />
    </div>
);

export default SearchMap;