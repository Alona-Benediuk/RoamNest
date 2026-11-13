import { useEffect, useRef, useState } from 'react';
import PropertyCard from '../property/PropertyCard';

const PropertyCarousel = ({ properties, variant = 'default', dark = false }) => {
    const trackRef = useRef(null);
    const [progress, setProgress] = useState({ size: 100, offset: 0 });

    const updateProgress = () => {
        const el = trackRef.current;
        if (!el) return;
        const size = Math.min(100, (el.clientWidth / el.scrollWidth) * 100);
        const maxScroll = el.scrollWidth - el.clientWidth;
        const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
        setProgress({ size, offset: ratio * (100 - size) });
    };

    useEffect(() => {
        updateProgress();
        window.addEventListener('resize', updateProgress);
        return () => window.removeEventListener('resize', updateProgress);
    }, [properties]);

    return (
        <div className={`rn-carousel ${dark ? 'rn-carousel--dark' : ''}`}>
            <div className="rn-carousel__track" ref={trackRef} onScroll={updateProgress}>
                {properties.map((p) => (
                    <div className="rn-carousel__item" key={p.id}>
                        <PropertyCard property={p} variant={variant} />
                    </div>
                ))}
            </div>

            <div className="rn-carousel__progress" aria-hidden="true">
                <span style={{ width: `${progress.size}%`, left: `${progress.offset}%` }} />
            </div>
        </div>
    );
};

export default PropertyCarousel;