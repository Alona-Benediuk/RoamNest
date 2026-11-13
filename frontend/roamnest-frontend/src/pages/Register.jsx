import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Выбор роли, 2: Форма, 3: Успех
    const [role, setRole] = useState('USER'); 
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Валидация на клиенте (бэкенд тоже проверит)
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
                username: formData.username || undefined, // Можно не передавать, бэкенд сгенерирует
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.confirmPassword, // Важно: имя поля как в бэкенде
                role: role,
            };

            await authApi.register(payload);
            
            // После успешной регистрации сразу логинимся через email
            await login(formData.email, formData.password);
            
            setStep(3); // Переход на экран успеха
        } catch (err) {
            console.error("Помилка від бекенду:", err.response?.data);
            const errorData = err.response?.data;
            let errorMessage = 'Помилка реєстрації.';
            if (errorData && typeof errorData === 'object') {
                // Собираем все ошибки в одну строку
                errorMessage = Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${value[0]}`)
                    .join(' | ');
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = () => navigate('/');

    return (
        <div className="auth-page-bg">
            <div className="auth-container">
                <button className="btn-back" onClick={() => step === 1 ? navigate(-1) : setStep(1)}>
                    ↩ Назад
                </button>

                {step === 1 && (
                    <div className="auth-step-centered">
                        <h2 className="auth-title">Зареєструватися як</h2>
                        <div className="role-buttons">
                            <button className="role-btn" onClick={() => { setRole('OWNER'); setStep(2); }}>Власник</button>
                            <span className="role-or">або</span>
                            <button className="role-btn" onClick={() => { setRole('USER'); setStep(2); }}>Гість</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="auth-step-form">
                        <h2 className="auth-title">Зареєструватися як {role === 'OWNER' ? 'Власник' : 'Гість'}</h2>
                        
                        {error && <p style={{ color: '#ff5252', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>{error}</p>}

                        <form onSubmit={handleSubmit} className="auth-form-modern">
                            <div className="input-group">
                                <span className="input-label">Ім'я *</span>
                                <input type="text" name="first_name" placeholder="Олександр" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <span className="input-label">Прізвище *</span>
                                <input type="text" name="last_name" placeholder="Шевченко" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <span className="input-label">Email *</span>
                                <input type="email" name="email" placeholder="example@gmail.com" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <span className="input-label">Логін (необов'язково)</span>
                                <input type="text" name="username" placeholder="Залиште пустим для автогенерації" onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <span className="input-label">Пароль (мін. 8 символів) *</span>
                                <input type="password" name="password" onChange={handleChange} required />
                            </div>
                            <div className="input-group">
                                <span className="input-label">Підтвердіть пароль *</span>
                                <input type="password" name="confirmPassword" onChange={handleChange} required />
                            </div>

                            <button type="submit" className="btn-main-action" disabled={isLoading}>
                                {isLoading ? 'Завантаження...' : 'Зареєструватися'}
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