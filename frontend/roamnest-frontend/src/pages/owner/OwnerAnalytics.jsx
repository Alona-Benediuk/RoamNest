import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getOwnerProperties } from '../../api/owner';

const OwnerAnalytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        if (user) {
            getOwnerProperties(user.id)
                .then(data => setProperties(Array.isArray(data) ? data : data.results || []))
                .catch(console.error);
        }
    }, [user]);

    return (
        <div className="analytics-page">
            <div className="container analytics-container">
                
                {/* Кнопка Назад */}
                <button className="btn-back-pill-white profile-back" onClick={() => navigate(-1)}>
                    ↩ Назад
                </button>

                <h1 className="analytics-main-title">Аналітика та фінанси</h1>

                <div className="analytics-grid">
                    
                    {/* ЛЕВАЯ КОЛОНКА (Ожидаемые выплаты + Мои объекты) */}
                    <div className="analytics-col-left">
                        
                        {/* Очікувані виплати */}
                        <div className="analytics-card">
                            <h2 className="analytics-card-title">Очікувані виплати</h2>
                            
                            <div className="payout-timeline">
                                <div className="timeline-row">
                                    <div className="timeline-info">
                                        <span className="timeline-date">13.12.2026 - 15.12.2026</span>
                                        <span className="timeline-prop">Lakefront Cabin...</span>
                                    </div>
                                    <div className="timeline-bar green-bar">$246</div>
                                </div>
                                <div className="timeline-row">
                                    <div className="timeline-info">
                                        <span className="timeline-date">17.02.2027</span>
                                        <span className="timeline-prop">Lakefront Cabin...</span>
                                    </div>
                                    <div className="timeline-bar green-bar">$1 500</div>
                                </div>
                            </div>
                        </div>

                        {/* Мої об'єкти */}
                        <div className="analytics-card" style={{ marginTop: '20px' }}>
                            <h2 className="analytics-card-title">Мої об'єкти</h2>
                            
                            <div className="analytics-properties-grid">
                                {properties.length > 0 ? (
                                    properties.map(property => (
                                        <div key={property.id} className="analytics-prop-card">
                                            <img src={property.main_image || 'https://via.placeholder.com/300x200'} alt={property.title} />
                                            <div className="analytics-prop-info">
                                                <h4>{property.title}</h4>
                                                <p>📍 {property.city}</p>
                                                
                                                <div className="prop-price-row">
                                                    <div className="price-input-group">
                                                        <span>$</span>
                                                        <input type="number" defaultValue={property.price_per_night || 341} readOnly />
                                                    </div>
                                                    <div className="price-edit-icon">✏️</div>
                                                </div>

                                                <div className="prop-actions-row">
                                                    <span className="prop-old-price">${property.price_per_night || 341}</span>
                                                    <Link to={`/owner/properties/${property.id}`} className="btn-calendar-prop">
                                                        Календар
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>У вас поки немає об'єктів.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ПРАВА КОЛОНКА (Доходы) */}
                    <div className="analytics-col-right">
                        
                        {/* Загальний дохід */}
                        <div className="analytics-card income-card">
                            <div className="income-header">
                                <span>Загальний дохід</span>
                                <select className="income-select">
                                    <option>За рік</option>
                                </select>
                            </div>
                            <div className="income-amount">$98 340</div>
                            <div className="income-subtext">без податків</div>
                        </div>

                        {/* Комісія та податки */}
                        <div className="analytics-card fees-card">
                            <div className="fee-row">
                                <span>Комісія RoamNest (3%)</span>
                                <strong>$3 207</strong>
                            </div>
                            <div className="fee-row">
                                <span>Утримані податки та збори</span>
                                <strong>$5 344</strong>
                            </div>
                        </div>

                        {/* Історія виплат */}
                        <div className="analytics-card" style={{ marginTop: '20px' }}>
                            <h2 className="analytics-card-title">Історія виплат</h2>
                            
                            <div className="payout-history-list">
                                <div className="history-item">
                                    <div className="history-date">30.09.2026</div>
                                    <div className="history-amount">+$3 248</div>
                                    <div className="history-status">Зараховано</div>
                                </div>
                                <div className="history-item">
                                    <div className="history-date">30.09.2026</div>
                                    <div className="history-amount">+$5 246</div>
                                    <div className="history-status">Зараховано</div>
                                </div>
                                <div className="history-item">
                                    <div className="history-date">30.09.2026</div>
                                    <div className="history-amount">+$5 246</div>
                                    <div className="history-status">Зараховано</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerAnalytics;