import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                
                {/* Левая часть: Логотип */}
                <Link to="/" className="footer-brand">
                    <svg width="70" height="70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Крыша и стены домика */}
                        <path d="M50 10L15 40V65H85V40L50 10Z" fill="#F2D59D" />
                        {/* Труба */}
                        <rect x="75" y="20" width="8" height="15" rx="2" fill="#F2D59D" />
                        {/* Окна (вырезаны цветом фона) */}
                        <rect x="40" y="40" width="8" height="8" rx="1" fill="#4F5B46" />
                        <rect x="52" y="40" width="8" height="8" rx="1" fill="#4F5B46" />
                        <rect x="40" y="52" width="8" height="8" rx="1" fill="#4F5B46" />
                        <rect x="52" y="52" width="8" height="8" rx="1" fill="#4F5B46" />
                        {/* Гнездо снизу */}
                        <path d="M15 70C25 80 75 80 85 70C85 85 70 95 50 95C30 95 15 85 15 70Z" fill="#F2D59D" />
                        {/* Изогнутая полоска на гнезде (цвет фона) */}
                        <path d="M15 75C35 85 65 85 85 75" stroke="#4F5B46" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <span className="footer-logo-text">RoamNest</span>
                </Link>

                {/* Правая часть: Колонки */}
                <div className="footer-links-wrapper">
                    
                    <div className="footer-col">
                        <h4 className="footer-heading">Підтримка</h4>
                        <Link to="/faq" className="footer-link">FAQ</Link>
                        <a href="mailto:Roam.Nest@gmail.com" className="footer-link">Пошта - Roam.Nest@gmail.com</a>
                        <Link to="/cancel" className="footer-link">Скасувати бронювання</Link>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">Для партнерів</h4>
                        <Link to="/add-property" className="footer-link">Додати своє житло</Link>
                        <Link to="/my-property" className="footer-link">“Моє житло”</Link>
                        <Link to="/calculator" className="footer-link">Калькулятор доходу</Link>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-heading">Юридична інформація</h4>
                        <Link to="/privacy" className="footer-link">Політика конфіденційності</Link>
                        <Link to="/terms" className="footer-link">Умови використання сайту</Link>
                        <Link to="/refund" className="footer-link">Правила скасування та повернення коштів</Link>
                    </div>
                    
                </div>
            </div>
        </footer>
    );
};

export default Footer;