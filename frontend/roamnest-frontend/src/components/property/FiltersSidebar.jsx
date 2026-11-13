const FiltersSidebar = () => {
    return (
        <div className="filters-panel">
            <h3 className="filters-title">Фільтри</h3>
            
            <div className="filter-group">
                <h4 className="filter-group-title">Тип розміщення</h4>
                <label className="filter-label"><input type="checkbox" /> Готелі</label>
                <label className="filter-label"><input type="checkbox" /> Апартаменти</label>
                <label className="filter-label"><input type="checkbox" /> Хостели</label>
                <label className="filter-label"><input type="checkbox" /> Кемпінги</label>
            </div>

            <div className="filter-group">
                <h4 className="filter-group-title">Зручності</h4>
                <label className="filter-label"><input type="checkbox" /> Wi-Fi</label>
                <label className="filter-label"><input type="checkbox" /> Кухня</label>
                <label className="filter-label"><input type="checkbox" /> Пральна машина</label>
                <label className="filter-label"><input type="checkbox" /> Басейн</label>
            </div>

            <div className="filter-group">
                <h4 className="filter-group-title">Зручність помешкання</h4>
                <label className="filter-label"><input type="checkbox" /> Для некурців</label>
                <label className="filter-label"><input type="checkbox" /> Можна з тваринами</label>
                <label className="filter-label"><input type="checkbox" /> Кухня</label>
            </div>

            <div className="filter-group">
                <h4 className="filter-group-title">Відстань до центру міста</h4>
                <label className="filter-label"><input type="checkbox" /> Менше 1 км</label>
                <label className="filter-label"><input type="checkbox" /> Менше 3 км</label>
            </div>

            <div className="filter-group">
                <h4 className="filter-group-title">Тип місцевості</h4>
                <label className="filter-label"><input type="checkbox" /> У лісі</label>
                <label className="filter-label"><input type="checkbox" /> В горах</label>
                <label className="filter-label"><input type="checkbox" /> Біля озера</label>
            </div>
        </div>
    );
};

export default FiltersSidebar;