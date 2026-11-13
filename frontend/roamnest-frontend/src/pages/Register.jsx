import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
    const [step, setStep] = useState(1); 
    const [role, setRole] = useState('USER'); 
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: ''
    });

    // ВОТ ЭТА СТРОКА БЫЛА УДАЛЕНА, ИЗ-ЗА НЕЕ ОШИБКА!
    const [error, setError] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Теперь setError существует
        
        if (formData.password.length < 8) {
            setError('Пароль повинен містити щонайменше 8 символів');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Паролі не співпадають');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.confirmPassword,
                role: role,
                first_name: formData.first_name,
                last_name: formData.last_name
            };

            await authApi.register(payload);
            await login(formData.username, formData.password);
            setStep(3); 
        } catch (err) {
            console.error("Помилка від бекенду:", err.response?.data);
            
            const errorData = err.response?.data;
            let errorMessage = 'Помилка реєстрації. Можливо, такий користувач вже існує.';
            
            if (errorData && typeof errorData === 'object') {
                const errors = Object.entries(errorData).map(
                    ([key, value]) => `${key}: ${value[0]}`
                );
                errorMessage = errors.join(' | ');
            } else if (errorData?.detail) {
                errorMessage = errorData.detail;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = () => {
        navigate('/');
    };

    return (
        <div className="auth-page-bg">
            <div className="auth-container">
                <button className="btn-back" onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
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

                {step === 1 && (
                    <div className="auth-step-centered">
                        <h2 className="auth-title">Зареєструватися як</h2>
                        <div className="role-buttons">
                            <button className="role-btn" onClick={() => { setRole('OWNER'); setStep(2); }}>
                                Власник
                            </button>
                            <span className="role-or">або</span>
                            <button className="role-btn" onClick={() => { setRole('USER'); setStep(2); }}>
                                Гість
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="auth-step-form">
                        <h2 className="auth-title">Зареєструватися як</h2>
                        
                        <div className="role-tabs">
                            <button type="button" className={`role-tab ${role === 'OWNER' ? 'active' : ''}`} onClick={() => setRole('OWNER')}>Власник</button>
                            <button type="button" className={`role-tab ${role === 'USER' ? 'active' : ''}`} onClick={() => setRole('USER')}>Гість</button>
                        </div>

                        {error && <p style={{ color: '#ff5252', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>{error}</p>}

                        <form onSubmit={handleSubmit} className="auth-form-modern">
                            <div className="input-group">
                                <span className="input-label">Логін</span>
                                <input type="text" name="username" placeholder="Ваш логін" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <span className="input-label">Email</span>
                                <input type="email" name="email" placeholder="example@gmail.com" onChange={handleChange} required />
                            </div>
                            
                            <div className="input-group">
                                <span className="input-label">Пароль (мін. 8 символів)</span>
                                <input type="password" name="password" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <span className="input-label">Підтвердіть пароль</span>
                                <input type="password" name="confirmPassword" onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <span className="input-label">Ім'я</span>
                                <input type="text" name="first_name" placeholder="Олександр" onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <span className="input-label">Прізвище</span>
                                <input type="text" name="last_name" placeholder="Шевченко" onChange={handleChange} />
                            </div>

                            <button type="submit" className="btn-main-action" disabled={isLoading}>
                                {isLoading ? 'Завантаження...' : 'Далі'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="auth-step-success">
                        <div className="success-left">
                            <h2 className="success-title">Гніздечко звите, час вирушати в дорогу!</h2>
                            <button onClick={handleFinish} className="btn-main-action">Далі</button>
                        </div>
                        <div className="success-right">
                            <p className="success-text">
                                Дякуємо, що приєдналися до RoamNest. Ми подбаємо про те, щоб у будь-якому куточку світу ви почувалися як удома.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;