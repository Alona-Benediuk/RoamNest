import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties } from '../api/properties';
import PropertyListItem from '../components/property/PropertyListItem';
import FiltersSidebar from '../components/property/FiltersSidebar';
import SearchMap from '../components/search/SearchMap';
import { DEMO_PROPERTIES } from '../data/demoProperties';
import './Search.css';

const PAGE_SIZE = 5;

const TYPE_MAP = {
    'Готелі': ['HOTEL'],
    'Апартаменти': ['APARTMENT', 'ROOM'],
    'Хостели': ['HOSTEL'],
    'Будинки': ['HOUSE', 'VILLA'],
};

const AREA_MAP = {
    'Пляж': 'beach',
    'У центрі міста': 'city',
    'У горах': 'nature',
    'Біля озера': 'nature',
    'У лісі': 'nature',
};

const hasAmenity = (property, name) =>
    (property.amenities || []).some((a) => a.name.toLowerCase() === name.toLowerCase());

const applyFilters = (items, f) => items.filter((p) => {
    if (f.type?.length) {
        const types = f.type.flatMap((t) => TYPE_MAP[t] || []);
        if (!types.includes(p.property_type)) return false;
    }
    const wanted = [...(f.amenities || []), ...(f.room || [])];
    if (wanted.some((name) => !hasAmenity(p, name))) return false;
    if (f.area?.length) {
        const slugs = f.area.map((a) => AREA_MAP[a]).filter(Boolean);
        if (!(p.categories || []).some((c) => slugs.includes(c.slug))) return false;
    }
    return true;
});

const SearchField = ({ icon, label, value }) => (
    <button type="button" className="rn-search-bar__field">
        <span className="rn-search-bar__icon" aria-hidden="true">{icon}</span>
        <span>
            <span className="rn-search-bar__label">{label}</span>
            <span className="rn-search-bar__value">{value}</span>
        </span>
    </button>
);

const Search = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [page, setPage] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getProperties();
                const items = Array.isArray(data) ? data : data.results || [];
                setProperties(items.length ? items : DEMO_PROPERTIES);
            } catch {
                setProperties(DEMO_PROPERTIES);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filtered = useMemo(() => applyFilters(properties, filters), [properties, filters]);
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const handleFiltersChange = (next) => {
        setFilters(next);
        setPage(0);
    };

    const goToPage = (index) => {
        setPage(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="rn-search">
            <div className="rn-search__inner">
                <div className="rn-search-bar">
                    <label className="rn-search-bar__input">
                        <span aria-hidden="true">🔍</span>
                        <input type="text" placeholder="Країна, місто, адреса..." aria-label="Країна, місто, адреса" />
                    </label>
                    <SearchField icon="📅" label="В'їзд" value="Обрати дату" />
                    <SearchField icon="📅" label="Виїзд" value="Обрати дату" />
                    <SearchField icon="👥" label="Кількість" value="2 особи" />
                </div>

                <div className="rn-search__toolbar">
                    <button type="button" className="rn-search__back" onClick={() => navigate(-1)}>
                        <span aria-hidden="true">↩</span> Назад
                    </button>
                    {!loading && (
                        <span className="rn-search__count">Знайдено варіантів: {filtered.length}</span>
                    )}
                </div>

                <div className="rn-search__layout">
                    <section className="rn-search__results" aria-label="Результати пошуку">
                        {loading && <div className="loader">Завантаження...</div>}

                        {!loading && visible.map((p) => <PropertyListItem key={p.id} property={p} />)}

                        {!loading && filtered.length === 0 && (
                            <div className="rn-search__empty">
                                <p>За обраними фільтрами нічого не знайдено.</p>
                                <button type="button" onClick={() => handleFiltersChange({})}>Скинути фільтри</button>
                            </div>
                        )}

                        {pageCount > 1 && (
                            <nav className="rn-pagination" aria-label="Сторінки">
                                {Array.from({ length: pageCount }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className={i === page ? 'is-active' : ''}
                                        aria-label={`Сторінка ${i + 1}`}
                                        aria-current={i === page ? 'page' : undefined}
                                        onClick={() => goToPage(i)}
                                    />
                                ))}
                            </nav>
                        )}
                    </section>

                    <div className="rn-search__sidebar">
                        <SearchMap />
                        <FiltersSidebar selected={filters} onChange={handleFiltersChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;