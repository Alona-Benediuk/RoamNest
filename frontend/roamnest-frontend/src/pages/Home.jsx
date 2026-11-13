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

                const items = Array.isArray(data)
                    ? data
                    : data.results || [];

                setProperties(items);
            } catch (err) {
                console.error('Помилка завантаження:', err.response || err);
                setError(
                    err.response?.data?.detail ||
                    'Не вдалося завантажити помешкання.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadProperties();
    }, []);

    return (
        <div className="page-container">
            <section>
                <h1>Знайди своє ідеальне місце для відпочинку</h1>
                <p>
                    Відкривай нові місця та бронюй помешкання
                    для незабутніх подорожей.
                </p>
            </section>

            <section>
                <h2>Популярні помешкання</h2>
                {loading && <p>Завантаження...</p>}
                {error && <p>{error}</p>}
                {!loading && !error && properties.length === 0 && (
                    <p>Наразі немає доступних помешкань.</p>
                )}
                    <div className="properties-grid">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                            />
                        ))}
                    </div>
            </section>
        </div>
    );
};

export default Home;