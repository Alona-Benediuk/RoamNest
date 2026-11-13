const AppPromo = () => (
    <section className="rn-promo" aria-labelledby="rn-promo-title">
        <div className="rn-promo__text">
            <h2 id="rn-promo-title" className="rn-promo__title">Твій RoamNest завжди під рукою</h2>
            <p className="rn-promo__desc">
                Завантажуй мобільний додаток, щоб знаходити та бронювати затишні гніздечка ще швидше.
                Усі твої подорожі, маршрути та квитки — в одному місці, навіть без інтернету.
            </p>
        </div>

        <div className="rn-promo__qr">
            <img
                src="/app-qr.svg"
                alt="QR-код RoamNest"
                width="116"
                height="116"
                onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
        </div>

        <p className="rn-promo__cta">Скануй та завантажуй →</p>
    </section>
);

export default AppPromo;