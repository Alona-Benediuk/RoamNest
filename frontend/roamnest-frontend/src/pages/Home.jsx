import { useEffect, useState } from 'react';
import { getProperties } from '../api/properties';
import PropertyCard from '../components/property/PropertyCard';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const data = await getProperties();
                const items = Array.isArray(data) ? data : data.results || [];
                setProperties(items);
            } catch (err) {
                setError('Не вдалося завантажити помешкання.');
            } finally {
                setLoading(false);
            }
        };
        loadProperties();
    }, []);

    if (loading) return <div className="loader">Завантаження...</div>;
    if (error) return <div className="error-text">{error}</div>;

    return (
        <div className="home-page-wrapper">
            {/* Секция 1: Пляж */}
            <section className="home-section">
                <div className="section-top-bar">
                    <div className="section-title-pill">Пляж</div>
                    <div className="search-pills">
                        <div className="search-pill">🔍 Місто</div>
                        <div className="search-pill">🌴 Природа</div>
                    </div>
                </div>
                <div className="properties-grid">
                    {properties.slice(0, 4).map((property) => (
                        <PropertyCard key={`beach-${property.id}`} property={property} />
                    ))}
                </div>
            </section>

            {/* Секция 2: Популярні */}
            <section className="home-section">
                <div className="section-header">
                    <h2>Популярні</h2>
                    <button className="btn-see-more">Дивитись далі</button>
                </div>
                <div className="properties-grid">
                    {properties.slice(0, 4).map((property) => (
                        <PropertyCard key={`pop-${property.id}`} property={property} />
                    ))}
                </div>
            </section>

            {/* Секция 3: Довгострокова оренда */}
            <section className="home-section">
                <div className="section-header">
                    <h2>Довгострокова оренда</h2>
                    <button className="btn-see-more">Дивитись далі</button>
                </div>
                <div className="properties-grid">
                    {properties.slice(0, 4).map((property) => (
                        <PropertyCard key={`long-${property.id}`} property={property} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;