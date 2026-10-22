import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <Link to="/" className="logo">RoamNest</Link>
            
            <nav className="nav-links">
                <Link to="/" className="nav-link">Пошук житла</Link>

                {user ? (
                    <>
                        <Link to="/my-bookings" className="nav-link">Мої бронювання</Link>
                        <Link to="/profile" className="nav-link">Профіль</Link>

                        {user.role === 'OWNER' && (
                            <Link to="/owner/dashboard" className="nav-link owner-link">
                                Панель власника
                            </Link>
                        )}

                        {user.role === 'ADMIN' && (
                            <Link to="/admin/users" className="nav-link admin-link">
                                Адмін-панель
                            </Link>
                        )}

                        <button onClick={handleLogout} className="btn-logout">
                            Вийти ({user.username})
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Увійти</Link>
                        <Link to="/register" className="nav-link">Реєстрація</Link> {/* <-- Додано */}
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;