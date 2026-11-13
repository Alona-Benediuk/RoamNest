import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Логотип
const Logo = () => (
    <div className="logo-container">
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10L15 40V65H85V40L50 10Z" fill="#F3C770" />
            <rect x="75" y="20" width="8" height="15" rx="2" fill="#F3C770" />
            <rect x="40" y="40" width="8" height="8" rx="1" fill="#2d312a" />
            <rect x="52" y="40" width="8" height="8" rx="1" fill="#2d312a" />
            <rect x="40" y="52" width="8" height="8" rx="1" fill="#2d312a" />
            <rect x="52" y="52" width="8" height="8" rx="1" fill="#2d312a" />
            <path d="M15 70C25 80 75 80 85 70C85 85 70 95 50 95C30 95 15 85 15 70Z" fill="#F3C770" />
            <path d="M15 75C35 85 65 85 85 75" stroke="#2d312a" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="logo-text">RoamNest</span>
    </div>
);

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
            {/* 1. Верхняя панель навигации */}
            <div className="top-nav">
                <div className="container header-container">
                    <div className="nav-left">
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <Logo />
                        </Link>
                        
                        <div className="breadcrumbs">
                            <Link to="/">Головна</Link>
                            <span className="separator">\</span>
                            
                            {/* ВОТ ЗДЕСЬ ИЗМЕНЕНА ССЫЛКА НА /search */}
                            <Link to="/search">Варіанти проживання</Link>
                            
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
            </div>

            {/* 2. Главный экран (показывается ТОЛЬКО на главной странице) */}
            {isHomePage && (
                <section className="hero-section">
                    <div className="hero-bg-image"></div>
                    <div className="hero-overlay"></div>
                    
                    <div className="hero-content container">
                        <h1 className="hero-title">RoamNest</h1>
                        <h2 className="hero-subtitle">
                            Твоє затишне гніздечко<br />
                            у будь-якій подорожі
                        </h2>

                        <div className="search-container">
                            <div className="search-box">
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

                                <div className="search-row-bottom">
                                    <div className="search-field">
                                        <span className="field-icon">📅</span>
                                        <div className="field-info">
                                            <span className="field-label">В'їзд</span>
                                            <span className="field-value">Обрати дату</span>
                                        </div>
                                    </div>
                                    <div className="search-field">
                                        <span className="field-icon">📅</span>
                                        <div className="field-info">
                                            <span className="field-label">Виїзд</span>
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
                            
                            {/* Кнопка пошуку, которая ведет на страницу результатов */}
                            <Link to="/search" className="main-search-btn" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', color: '#000' }}>
                                Пошук
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </header>
    );
};

export default Header;