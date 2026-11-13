import { Link } from 'react-router-dom';
import LogoMark from '../common/LogoMark';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">

                {/* Левая часть: Логотип */}
                <Link to="/" className="footer-brand">
                    <LogoMark size={70} />
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