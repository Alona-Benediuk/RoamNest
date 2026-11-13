import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Невірний email або пароль');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page-bg">
            <div className="auth-container">
                <button className="btn-back" onClick={() => navigate(-1)}>↩ Назад</button>

                <div className="auth-step-form">
                    <h2 className="auth-title" style={{ textAlign: 'center', marginBottom: '30px' }}>Увійти</h2>
                    
                    {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

                    <form onSubmit={handleSubmit} className="auth-form-modern">
                        <div className="input-group">
                            <span className="input-label">Email</span>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="example@gmail.com"
                            />
                        </div>
                        <div className="input-group">
                            <span className="input-label">Пароль</span>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="********"
                            />
                        </div>
                        <button type="submit" className="btn-main-action" disabled={isLoading}>
                            {isLoading ? 'Завантаження...' : 'Далі'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px', color: '#fff' }}>
                        Немає акаунту? <Link to="/register" style={{ color: '#F5C770', fontWeight: 'bold' }}>Зареєструватися</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;