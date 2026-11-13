import { Link } from 'react-router-dom';
import LogoMark from '../common/LogoMark';

const AppPromo = () => (
    <section className="rn-promo" aria-labelledby="rn-promo-title">
        <div className="rn-promo__text">
            <h2 id="rn-promo-title" className="rn-promo__title">Нехай кожна подорож буде затишною</h2>
            <p className="rn-promo__desc">
                Бажаємо тобі нових міст, теплих світанків і місць, куди хочеться повертатися.
                А ми подбаємо, щоб твій дім чекав на тебе — у горах, біля моря чи в самому серці міста.
            </p>
        </div>

        <div className="rn-promo__logo">
            <LogoMark size={96} color="#26382E" />
        </div>

        <Link to="/search" className="rn-promo__cta">Знайти →</Link>
    </section>
);

export default AppPromo;