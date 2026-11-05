import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [role, setRole] = useState('USER');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        login({ id: 1, username: 'User', role: role });
        navigate('/');
    };

    return (
        <div className="auth-page-bg">
            <div className="auth-container">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ↩ Назад
                </button>

                <div className="auth-bg-logo">
                    <svg width="160" height="160" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 10L15 40V65H85V40L50 10Z" fill="#F3C770" />
                        <rect x="75" y="20" width="8" height="15" rx="2" fill="#F3C770" />
                        <rect x="40" y="40" width="8" height="8" rx="1" fill="#2d312a" />
                        <rect x="52" y="40" width="8" height="8" rx="1" fill="#2d312a" />
                        <rect x="40" y="52" width="8" height="8" rx="1" fill="#2d312a" />
                        <rect x="52" y="52" width="8" height="8" rx="1" fill="#2d312a" />
                        <path d="M15 70C25 80 75 80 85 70C85 85 70 95 50 95C30 95 15 85 15 70Z" fill="#F3C770" />
                        <path d="M15 75C35 85 65 85 85 75" stroke="#2d312a" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="auth-step-form">
                    <h2 className="auth-title" style={{ textAlign: 'center', marginBottom: '30px' }}>Увійти як</h2>
                    
                    <div className="role-tabs">
                        <button className={`role-tab ${role === 'OWNER' ? 'active' : ''}`} onClick={() => setRole('OWNER')}>Власник</button>
                        <button className={`role-tab ${role === 'USER' ? 'active' : ''}`} onClick={() => setRole('USER')}>Гість</button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form-modern">
                        <div className="input-group">
                            <span className="input-label">Пароль</span>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-main-action">Далі</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;