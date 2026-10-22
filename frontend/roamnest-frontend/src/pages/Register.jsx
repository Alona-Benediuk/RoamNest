import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password.length < 6) {
            setError('Пароль повинен містити щонайменше 6 символів');
            return;
        }

        const newUserId = Math.floor(Math.random() * 1000) + 10;
        
        login({ 
            id: newUserId, 
            username: formData.username, 
            role: 'USER' 
        });
        
        navigate('/');
    };

    return (
        <div className="auth-container">
            <h2>Реєстрація</h2>
            <p className="text-muted mt-10">
                Створіть новий акаунт для бронювання житла.
            </p>
            
            {error && <p className="error-text">{error}</p>}
            
            <form onSubmit={handleSubmit} className="auth-form">
                <label className="form-group">
                    Ім'я користувача (логін):
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        required 
                        className="form-input" 
                    />
                </label>
                
                <label className="form-group">
                    Email:
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        className="form-input" 
                    />
                </label>
                
                <label className="form-group">
                    Пароль:
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        className="form-input" 
                    />
                </label>
                
                <label className="form-group">
                    Ім'я:
                    <input 
                        type="text" 
                        name="first_name" 
                        value={formData.first_name} 
                        onChange={handleChange} 
                        className="form-input" 
                    />
                </label>
                
                <label className="form-group">
                    Прізвище:
                    <input 
                        type="text" 
                        name="last_name" 
                        value={formData.last_name} 
                        onChange={handleChange} 
                        className="form-input" 
                    />
                </label>

                <button type="submit" className="btn-primary mt-10">
                    Зареєструватися
                </button>
            </form>
            
            <div className="auth-switch">
                Вже маєте акаунт? <Link to="/login">Увійти</Link>
            </div>
        </div>
    );
};

export default Register;