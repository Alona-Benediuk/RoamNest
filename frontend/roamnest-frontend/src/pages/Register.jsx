import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as authApi from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import LogoMark from '../components/common/LogoMark';
import Icon from '../components/common/Icon';
import './Register.css';

// кроки: вибір статусу → вхід → реєстрація → успіх
const STEP = { ROLE: 'role', LOGIN: 'login', REGISTER: 'register', SUCCESS: 'success' };

const ROLE_NAME = { OWNER: 'Власник', USER: 'Гість' };

// текст помилки з відповіді бекенду
const errorText = (err, fallback) => {
    const data = err.response?.data;
    if (data && typeof data === 'object') {
        return Object.values(data).map((v) => (Array.isArray(v) ? v[0] : v)).join(' ');
    }
    return fallback;
};

const PasswordField = ({ label, name, value, onChange }) => {
    const [visible, setVisible] = useState(false);
    return (
        <label className="rn-field rn-field--password">
            <span className="rn-field__label">{label}</span>
            <input
                type={visible ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                required
            />
            <button
                type="button"
                className="rn-field__eye"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Сховати пароль' : 'Показати пароль'}
            >
                <Icon name={visible ? 'eye' : 'eyeClosed'} size="22" />
            </button>
        </label>
    );
};

const GoogleLogo = () => (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
);

const Register = () => {
    const [step, setStep] = useState(STEP.ROLE);
    const [role, setRole] = useState('USER');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const goTo = (next) => {
        setError('');
        setStep(next);
    };

    const chooseRole = (value) => {
        setRole(value);
        goTo(STEP.LOGIN);
    };

    const handleBack = () => {
        if (step === STEP.ROLE) navigate(-1);
        else if (step === STEP.REGISTER) goTo(STEP.LOGIN);
        else goTo(STEP.ROLE);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(errorText(err, 'Невірний email або пароль.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

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
            await authApi.register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.confirmPassword,
                role,
            });
            await login(formData.email, formData.password);
            goTo(STEP.SUCCESS);
        } catch (err) {
            setError(errorText(err, 'Помилка реєстрації.'));
        } finally {
            setIsLoading(false);
        }
    };

    const rolePill = <span className="rn-auth__pill">{ROLE_NAME[role]}</span>;

    return (
        <div className={`rn-auth rn-auth--${step}`}>
            {step === STEP.ROLE && (
                <div className="rn-auth__panel">
                    <div className="rn-auth__logo">
                        <LogoMark color="#FFE4B9" />
                    </div>
                    <div className="rn-auth__choose">
                        <h2 className="rn-auth__title">Увійти в систему</h2>
                        <p className="rn-auth__subtitle">Оберіть статус</p>
                        <div className="rn-auth__roles">
                            <button className="rn-auth__role rn-auth__role--owner" onClick={() => chooseRole('OWNER')}>Власник</button>
                            <span className="rn-auth__or">або</span>
                            <button className="rn-auth__role rn-auth__role--guest" onClick={() => chooseRole('USER')}>Гість</button>
                        </div>
                    </div>
                </div>
            )}

            {step === STEP.LOGIN && (
                <div className="rn-auth__column">
                    <h2 className="rn-auth__heading">Увійти в систему як {rolePill}</h2>

                    <form className="rn-auth__form" onSubmit={handleLogin}>
                        <label className="rn-field">
                            <span className="rn-field__label">Email</span>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </label>
                        <PasswordField label="Пароль" name="password" value={formData.password} onChange={handleChange} />

                        {error && <p className="rn-auth__error">{error}</p>}

                        <button type="submit" className="rn-auth__submit" disabled={isLoading}>
                            {isLoading ? 'Зачекайте…' : 'Увійти'}
                        </button>
                    </form>

                    <span className="rn-auth__or-small">або</span>

                    <button type="button" className="rn-auth__google" title="Вхід через Google з'явиться пізніше" disabled>
                        <GoogleLogo /> Продовжити через Google
                    </button>

                    <p className="rn-auth__switch">
                        <button type="button" onClick={() => goTo(STEP.REGISTER)}>Створити</button> якщо не маєте акаунта
                    </p>
                </div>
            )}

            {step === STEP.REGISTER && (
                <div className="rn-auth__column">
                    <h2 className="rn-auth__heading">Зареєструватися як {rolePill}</h2>

                    <form className="rn-auth__form" onSubmit={handleRegister}>
                        <label className="rn-field">
                            <span className="rn-field__label">Ім’я</span>
                            <input type="text" name="first_name" placeholder="Олександр" value={formData.first_name} onChange={handleChange} required />
                        </label>
                        <label className="rn-field">
                            <span className="rn-field__label">Прізвище</span>
                            <input type="text" name="last_name" placeholder="Шевченко" value={formData.last_name} onChange={handleChange} required />
                        </label>
                        <label className="rn-field">
                            <span className="rn-field__label">Email</span>
                            <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
                        </label>

                        <div className="rn-auth__gap" />

                        <PasswordField label="Пароль" name="password" value={formData.password} onChange={handleChange} />
                        <PasswordField label="Повторити пароль" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />

                        {error && <p className="rn-auth__error">{error}</p>}

                        <button type="submit" className="rn-auth__submit rn-auth__submit--short" disabled={isLoading}>
                            {isLoading ? 'Зачекайте…' : 'Створити акаунт'}
                        </button>
                    </form>

                    <p className="rn-auth__terms">
                        Продовжуючи, ви підтверджуєте, що ознайомилися та погоджуєтеся з нашими{' '}
                        <Link to="/terms">Умовами надання послуг</Link>,{' '}
                        <Link to="/privacy">Положенням про конфіденційність</Link> та{' '}
                        <Link to="/rewards">Умовами програми винагород</Link>.
                    </p>
                </div>
            )}

            {step === STEP.SUCCESS && (
                <div className="rn-auth__column rn-auth__column--success">
                    <div className="rn-auth__success">
                        <h2 className="rn-auth__success-title">Гніздечко звите, час вирушати в дорогу!</h2>
                        <p className="rn-auth__success-text">
                            Дякуємо, що приєдналися до RoamNest. Ми подбаємо про те, щоб у будь-якому куточку світу ви почувалися як удома
                        </p>
                    </div>
                    <button type="button" className="rn-auth__submit rn-auth__submit--next" onClick={() => navigate('/')}>
                        Далі
                    </button>
                </div>
            )}

            {step !== STEP.SUCCESS && (
                <button className="rn-auth__back" onClick={handleBack}>
                    <span aria-hidden="true">↰</span> Назад
                </button>
            )}
        </div>
    );
};

export default Register;