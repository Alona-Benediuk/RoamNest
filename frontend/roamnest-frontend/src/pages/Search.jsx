import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties } from '../api/properties';
import PropertyListItem from '../components/property/PropertyListItem';
import FiltersSidebar from '../components/property/FiltersSidebar';

const Search = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Заглушка данных для демонстрации (так как реальная база может быть пустой)
    const mockProperties = Array(8).fill(null).map((_, i) => ({
        id: i,
        title: 'Lakefront Cabin: Private Beach, Kayaks',
        city: 'Київ',
        price_per_night: 341,
        old_price: 1200,
        main_image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600&auto=format&fit=crop'
    }));

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getProperties();
                const items = Array.isArray(data) ? data : data.results || [];
                // Если бэкенд вернул пустой массив, используем заглушки для красоты
                setProperties(items.length > 0 ? items : mockProperties);
            } catch (err) {
                setProperties(mockProperties);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="search-page">
            {/* Верхняя панель поиска */}
            <div className="search-top-panel">
                <div className="search-input-group">
                    <span className="icon">🔍</span>
                    <input type="text" placeholder="Країна, місто, адреса..." />
                </div>
                <div className="search-input-small">
                    <span className="icon">📅</span>
                    <div>
                        <span className="label">Виїзд</span>
                        <span className="val">Обрати дату</span>
                    </div>
                </div>
                <div className="search-input-small">
                    <span className="icon">📅</span>
                    <div>
                        <span className="label">В'їзд</span>
                        <span className="val">Обрати дату</span>
                    </div>
                </div>
                <div className="search-input-small">
                    <span className="icon">👤</span>
                    <div>
                        <span className="label">Кількість</span>
                        <span className="val">2 особи</span>
                    </div>
                </div>
            </div>

            <div className="search-page-container">
                <button className="btn-back-pill" onClick={() => navigate(-1)}>
                    ↩ Назад
                </button>

                <div className="search-layout">
                    {/* Левая колонка - Список жилья */}
                    <div className="search-results">
                        {properties.map((prop) => (
                            <PropertyListItem key={prop.id} property={prop} />
                        ))}
                        
                        {/* Пагинация */}
                        <div className="pagination">
                            <span className="dot active"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>

                    {/* Правая колонка - Карта и Фильтры */}
                    <div className="search-sidebar">
                        {/* Блок карты */}
                        <div className="map-placeholder">
                            <div className="map-pins">
                                <span className="pin" style={{ top: '20%', left: '30%' }}>📍</span>
                                <span className="pin" style={{ top: '40%', left: '60%' }}>📍</span>
                                <span className="pin" style={{ top: '70%', left: '40%' }}>📍</span>
                                <span className="pin" style={{ top: '60%', left: '20%' }}>📍</span>
                                <span className="pin" style={{ top: '30%', left: '70%' }}>📍</span>
                            </div>
                            <button className="map-btn">На карті</button>
                        </div>

                        {/* Блок фильтров */}
                        <FiltersSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;