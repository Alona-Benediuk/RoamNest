import { useState, useEffect } from 'react';
import { getProperties } from '../api/properties';
import PropertyCard from '../components/property/PropertyCard';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getProperties()
            .then(setProperties)
            .catch((err) => {
                console.error(err);
                setError('Не вдалося завантажити список житла. Перевірте, чи запущений бекенд.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loader">Завантаження...</div>;
    if (error) return <div className="error-text">{error}</div>;

    return (
        <div>
            <h1>Знайдіть ідеальне житло</h1>
            <div className="property-grid">
                {properties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                ))}
            </div>
        </div>
    );
};

export default Home;