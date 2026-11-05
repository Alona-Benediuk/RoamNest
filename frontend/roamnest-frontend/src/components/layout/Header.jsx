import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Показываем большой блок с поиском только на главной странице
    const isHomePage = location.pathname === '/';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header-wrapper">
            {/* 1. Верхняя темная панель навигации */}
            <div className="top-nav">
                <div className="nav-left">
                    {/* Твой логотип. Замени на картинку, если есть */}
                    <Link to="/" className="logo-text">
                        <span className="logo-icon">⛱️</span> RoamNest
                    </Link>
                    
                    {/* Хлебные крошки (текст рядом с логотипом) */}
                    <div className="breadcrumbs">
                        <Link to="/">Головна</Link>
                        <span className="separator">\</span>
                        <Link to="/">Варіанти проживання</Link>
                        <span className="separator">\</span>
                        <span className="current">Lakefront Cabin: Private Beach...</span>
                        <span className="separator">\</span>
                        <Link to="/profile">Кабінет</Link>
                    </div>
                </div>

                <nav className="nav-right">
                    <button className="nav-btn">Підтримка</button>
                    <button className="nav-btn">
                        USD <span className="arrow">▼</span> <div className="flag-icon"></div>
                    </button>
                    
                    {user ? (
                        <>
                            <button onClick={handleLogout} className="nav-btn">Вийти</button>
                            <div className="avatar-circle"></div>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="nav-btn">Реєстрація</Link>
                            <div className="avatar-circle"></div>
                        </>
                    )}
                </nav>
            </div>

            {/* 2. Главный экран с фоновым фото и поиском (только на главной) */}
            {isHomePage && (
                <section className="hero-section">
                    <div className="hero-bg-image"></div>
                    <div className="hero-overlay"></div>
                    
                    <div className="hero-content">
                        <h1 className="hero-title">RoamNest</h1>
                        <h2 className="hero-subtitle">
                            Твоє затишне гніздечко<br />
                            у будь-якій подорожі
                        </h2>

                        <div className="search-container">
                            <div className="search-box">
                                {/* Верхний ряд: Инпут + 3 категории */}
                                <div className="search-row-top">
                                    <div className="search-input-wrapper">
                                        <span className="search-icon">🔍</span>
                                        <input type="text" placeholder="Країна, місто, адреса..." className="search-input" />
                                    </div>
                                    
                                    <div className="search-categories">
                                        <div className="category-btn">
                                            <span className="cat-icon">🏨</span>
                                            <span className="cat-text">Готелі</span>
                                        </div>
                                        <div className="category-btn">
                                            <span className="cat-icon">🏠</span>
                                            <span className="cat-text">Житло</span>
                                        </div>
                                        <div className="category-btn">
                                            <span className="cat-icon">⏱️</span>
                                            <span className="cat-text">Тривала оренда</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Нижний ряд: Даты и гости */}
                                <div className="search-row-bottom">
                                    <div className="search-field">
                                        <span className="field-icon">📅</span>
                                        <div className="field-info">
                                            <span className="field-label">Виїзд</span>
                                            <span className="field-value">26.10.2026</span>
                                        </div>
                                    </div>
                                    <div className="search-field">
                                        <span className="field-icon">📅</span>
                                        <div className="field-info">
                                            <span className="field-label">В'їзд</span>
                                            <span className="field-value">Обрати дату</span>
                                        </div>
                                    </div>
                                    <div className="search-field">
                                        <span className="field-icon">👤</span>
                                        <div className="field-info">
                                            <span className="field-label">Кількість</span>
                                            <span className="field-value">2 особи</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="main-search-btn">Пошук</button>
                        </div>
                    </div>
                </section>
            )}
        </header>
    );
};

export default Header;