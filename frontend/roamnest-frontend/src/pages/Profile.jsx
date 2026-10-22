import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api/profile';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getProfile(user.id)
                .then(setProfile)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleSave = async () => {
        try {
            const updated = await updateProfile(user.id, profile);
            setProfile(updated);
            setEditMode(false);
        } catch (e) {
            alert('Помилка збереження');
        }
    };

    if (loading) return <div className="loader">Завантаження...</div>;
    if (!profile) return <div>Профіль не знайдено</div>;

    return (
        <div className="profile-container">
            <h2>Профіль</h2>
            {editMode ? (
                <div className="auth-form">
                    <label className="form-group">Ім'я: <input value={profile.first_name || ''} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} className="form-input" /></label>
                    <label className="form-group">Прізвище: <input value={profile.last_name || ''} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} className="form-input" /></label>
                    <label className="form-group">Телефон: <input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="form-input" /></label>
                    
                    <div className="flex-row-gap">
                        <button onClick={handleSave} className="btn-success">Зберегти</button>
                        <button onClick={() => setEditMode(false)} className="btn-secondary">Скасувати</button>
                    </div>
                </div>
            ) : (
                <div className="auth-form">
                    <p><strong>ID:</strong> {profile.id}</p>
                    <p><strong>Ім'я:</strong> {profile.first_name} {profile.last_name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Роль:</strong> {profile.role}</p>
                    <p><strong>Телефон:</strong> {profile.phone || '—'}</p>
                    <button onClick={() => setEditMode(true)} className="btn-primary btn-w-150">Редагувати</button>
                </div>
            )}
        </div>
    );
};

export default Profile;