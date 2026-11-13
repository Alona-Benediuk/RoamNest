import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../common/Icon';
import LogoMark from '../common/LogoMark';

// Логотип
const Logo = () => (
    <div className="logo-container">
        <LogoMark size={36} />
        <span className="logo-text">RoamNest</span>
    </div>
);

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Показываем большой блок с поиском только на главной странице
    const isHomePage = location.pathname === '/';

    // Определяем, куда вести пользователя в зависимости от роли
    const cabinetLink = user?.role === 'OWNER' ? '/owner/dashboard' : '/profile';

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

                            <Link to="/search">Варіанти проживання</Link>

                            <span className="separator">\</span>
                            <span className="current">Lakefront Cabin: Private Beach...</span>
                            <span className="separator">\</span>

                            {/* Ссылка "Кабінет" теперь ведет в зависимости от роли */}
                            <Link to={cabinetLink}>Кабінет</Link>
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

                                {/* Аватарка теперь тоже кликабельная и ведет в кабинет */}
                                <Link to={cabinetLink}>
                                    <div className="avatar-circle"></div>
                                </Link>
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
                                        <span className="search-icon"><Icon name="search" /></span>
                                        <input type="text" placeholder="Країна, місто, адреса..." className="search-input" />
                                    </div>

                                    <div className="search-categories">
                                        <div className="category-btn">
                                            <span className="cat-icon"><Icon name="hotel" /></span>
                                            <span className="cat-text">Готелі</span>
                                        </div>
                                        <div className="category-btn">
                                            <span className="cat-icon"><Icon name="home" /></span>
                                            <span className="cat-text">Житло</span>
                                        </div>
                                        <div className="category-btn">
                                            <span className="cat-icon is-dark"><Icon name="clock" /></span>
                                            <span className="cat-text">Тривала оренда</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="search-row-bottom">
                                    <div className="search-field">
                                        <span className="field-icon"><Icon name="checkIn" /></span>
                                        <div className="field-info">
                                            <span className="field-label">В'їзд</span>
                                            <span className="field-value">Обрати дату</span>
                                        </div>
                                    </div>
                                    <div className="search-field">
                                        <span className="field-icon"><Icon name="checkOut" /></span>
                                        <div className="field-info">
                                            <span className="field-label">Виїзд</span>
                                            <span className="field-value">Обрати дату</span>
                                        </div>
                                    </div>
                                    <div className="search-field">
                                        <span className="field-icon"><Icon name="people" /></span>
                                        <div className="field-info">
                                            <span className="field-label">Кількість</span>
                                            <span className="field-value">2 особи</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
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