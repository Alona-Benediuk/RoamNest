import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerProperties } from '../../api/owner';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        if (user) {
            getOwnerProperties(user.id).then(setProperties).catch(console.error);
        }
    }, [user]);

    return (
        <div>
            <h1>Панель власника</h1>

            <section className="mt-30">
                <div className="dashboard-header">
                    <h2>Мої об'єкти</h2>
                    <Link to="/owner/bookings" className="btn-primary">
                        Переглянути бронювання
                    </Link>
                </div>
                
                {properties.length === 0 ? (
                    <p>У вас поки немає доданих об'єктів.</p>
                ) : (
                    <ul className="styled-list">
                        {properties.map((p) => (
                            <li key={p.id}>
                                <strong>{p.title}</strong> — {p.city}, {p.country}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default OwnerDashboard;