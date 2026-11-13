import { useEffect, useMemo, useState } from 'react';
import { getProperties } from '../api/properties';
import PropertyCarousel from '../components/home/PropertyCarousel';
import AppPromo from '../components/home/AppPromo';
import { DEMO_PROPERTIES } from '../data/demoProperties';
import './Home.css';

const CATEGORY_TABS = [
    { slug: 'beach', label: 'Пляж', icon: '⛱️' },
    { slug: 'city', label: 'Місто', icon: '🏙️' },
    { slug: 'nature', label: 'Природа', icon: '🌲' },
];

const SectionTitle = ({ id, children }) => (
    <div className="rn-section__head">
        <h2 id={id} className="rn-section__title">{children}</h2>
        <button type="button" className="rn-section__more">Дивитись далі</button>
    </div>
);

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('beach');

    useEffect(() => {
        const loadProperties = async () => {
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
        loadProperties();
    }, []);

    const tabProperties = useMemo(() => {
        const filtered = properties.filter((p) =>
            (p.categories || []).some((c) => c.slug === activeTab)
        );
        return filtered.length ? filtered : properties;
    }, [properties, activeTab]);

    if (loading) return <div className="loader">Завантаження...</div>;

    return (
        <div className="rn-home">
            <div className="rn-home__inner">

                {/* 1. Категорії: Пляж / Місто / Природа */}
                <section className="rn-section" aria-label="Категорії житла">
                    <div className="rn-tabs" role="tablist">
                        {CATEGORY_TABS.map((tab) => (
                            <button
                                key={tab.slug}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.slug}
                                className={`rn-tabs__tab ${activeTab === tab.slug ? 'is-active' : ''}`}
                                onClick={() => setActiveTab(tab.slug)}
                            >
                                <span aria-hidden="true">{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="rn-tabs__panel" role="tabpanel">
                        <PropertyCarousel properties={tabProperties} dark />
                    </div>
                </section>

                {/* 2. Популярні */}
                <section className="rn-section" aria-labelledby="popular-title">
                    <SectionTitle id="popular-title">Популярні</SectionTitle>
                    <PropertyCarousel properties={properties} />
                </section>

                {/* 3. Довгострокова оренда */}
                <section className="rn-section" aria-labelledby="long-title">
                    <SectionTitle id="long-title">Довгострокова оренда</SectionTitle>
                    <PropertyCarousel properties={[...properties].reverse()} />
                </section>

                {/* 4. Банер мобільного застосунку */}
                <AppPromo />

                {/* 5. Раннє бронювання */}
                <section className="rn-section" aria-labelledby="early-title">
                    <SectionTitle id="early-title">Раннє бронювання</SectionTitle>
                    <PropertyCarousel properties={properties} variant="deal" />
                </section>

            </div>
        </div>
    );
};

export default Home;