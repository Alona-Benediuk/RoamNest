import ICONS from './icons';

// <Icon name="beach" /> — розмір від шрифту, колір від color
const Icon = ({ name, size = '1.2em', className = '' }) => {
    const icon = ICONS[name];
    if (!icon) return null;

    return (
        <svg
            className={`rn-icon ${className}`}
            viewBox={icon.viewBox}
            width={size}
            height={size}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: icon.body }}
        />
    );
};

export default Icon;