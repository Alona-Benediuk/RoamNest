import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [userId, setUserId] = useState('1');
    const [role, setRole] = useState('USER');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        login({ id: parseInt(userId), username: `user_${userId}`, role });
        navigate('/');
    };

    return (
        <div className="auth-container">
            <h2>Вхід (Емуляція)</h2>
            <p className="text-muted mt-10">
                Бекенд поки не використовує JWT. Оберіть ID та роль, щоб перевірити роботу інтерфейсу.
            </p>
            <form onSubmit={handleSubmit} className="auth-form">
                <label className="form-group">
                    User ID (наприклад, 1, 2, 3):
                    <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} required className="form-input" />
                </label>
                <label className="form-group">
                    Роль:
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="form-input">
                        <option value="USER">USER (Гість)</option>
                        <option value="OWNER">OWNER (Власник)</option>
                        <option value="ADMIN">ADMIN (Адміністратор)</option>
                    </select>
                </label>
                <button type="submit" className="btn-primary">
                    Увійти
                </button>
            </form>
        </div>
    );
};

export default Login;