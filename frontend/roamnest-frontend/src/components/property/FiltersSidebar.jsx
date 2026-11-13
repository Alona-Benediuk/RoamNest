import { useState } from 'react';
import './FiltersSidebar.css';

// Групи фільтрів за макетом Figma. Перші 4 пункти видно одразу, решту — після «Більше».
const FILTER_GROUPS = [
    {
        id: 'type',
        title: 'Тип розміщення',
        options: ['Готелі', 'Апартаменти', 'Мотелі', 'Капсульні готелі', 'Хостели', 'Будинки', 'Кемпінги'],
    },
    {
        id: 'amenities',
        title: 'Зручності',
        options: ['Паркування', 'Басейн', 'Wi-Fi', 'Спа та оздоровчі центри', 'Фітнес-центр', 'Ресторан'],
    },
    {
        id: 'room',
        title: 'Зручності помешкання',
        options: ['Кондиціонер', 'Балкон', 'Кухня', 'Міні-кухня', 'Пральна машина', 'Можна з тваринами'],
    },
    {
        id: 'distance',
        title: 'Відстань від центра міста',
        options: ['Менше 1 км', 'Менше 3 км', 'Менше 5 км'],
    },
    {
        id: 'area',
        title: 'Тип місцевості',
        options: ['У центрі міста', 'Пляж', 'За містом', 'У горах', 'Біля озера', 'У лісі'],
    },
];

const VISIBLE_COUNT = 4;

/**
 * Панель фільтрів (ТЗ п. 4.2).
 * selected — обрані значення { type: ['Готелі'], ... }, onChange — зміна вибору.
 */
const FiltersSidebar = ({ selected = {}, onChange = () => {} }) => {
    const [expanded, setExpanded] = useState({});

    const toggleOption = (groupId, option) => {
        const current = selected[groupId] || [];
        const next = current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option];
        onChange({ ...selected, [groupId]: next });
    };

    return (
        <aside className="rn-filters" aria-labelledby="rn-filters-title">
            <h2 id="rn-filters-title" className="rn-filters__title">Фільтри</h2>

            {FILTER_GROUPS.map((group) => {
                const isOpen = expanded[group.id];
                const hasMore = group.options.length > VISIBLE_COUNT;
                const options = isOpen ? group.options : group.options.slice(0, VISIBLE_COUNT);

                return (
                    <fieldset key={group.id} className="rn-filters__group">
                        <legend className="rn-filters__group-title">{group.title}</legend>

                        {options.map((option) => (
                            <label key={option} className="rn-filters__option">
                                <input
                                    type="checkbox"
                                    checked={(selected[group.id] || []).includes(option)}
                                    onChange={() => toggleOption(group.id, option)}
                                />
                                <span className="rn-filters__check" aria-hidden="true" />
                                {option}
                            </label>
                        ))}

                        {hasMore && (
                            <button
                                type="button"
                                className="rn-filters__more"
                                aria-expanded={!!isOpen}
                                onClick={() => setExpanded({ ...expanded, [group.id]: !isOpen })}
                            >
                                {isOpen ? 'Менше' : 'Більше'}
                                <span className={`rn-filters__chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
                            </button>
                        )}
                    </fieldset>
                );
            })}
        </aside>
    );
};

export default FiltersSidebar;