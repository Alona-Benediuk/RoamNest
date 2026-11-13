import { useEffect, useRef, useState } from 'react';
import PropertyCard from '../property/PropertyCard';

const PropertyCarousel = ({ properties, variant = 'default', dark = false }) => {
    const trackRef = useRef(null);
    const barRef = useRef(null);
    const drag = useRef(null);
    const moved = useRef(false);
    const [progress, setProgress] = useState({ size: 100, offset: 0 });
    const [dragging, setDragging] = useState(false);

    const updateProgress = () => {
        const el = trackRef.current;
        if (!el) return;
        const size = Math.max(14, Math.min(100, (el.clientWidth / el.scrollWidth) * 100));
        const max = el.scrollWidth - el.clientWidth;
        const ratio = max > 0 ? el.scrollLeft / max : 0;
        setProgress({ size, offset: ratio * (100 - size) });
    };

    useEffect(() => {
        updateProgress();
        window.addEventListener('resize', updateProgress);
        return () => window.removeEventListener('resize', updateProgress);
    }, [properties]);

    // тягнути картки мишкою (тачпад працює сам)
    const onTrackDown = (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        drag.current = { x: e.clientX, scroll: trackRef.current.scrollLeft };
        moved.current = false;
    };

    const onTrackMove = (e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        if (!moved.current && Math.abs(dx) > 5) {
            moved.current = true;
            setDragging(true);
            trackRef.current.setPointerCapture(e.pointerId);
        }
        if (moved.current) trackRef.current.scrollLeft = drag.current.scroll - dx;
    };

    const onTrackUp = () => {
        drag.current = null;
        setDragging(false);
    };

    // після тягнення картка не відкривається
    const onTrackClick = (e) => {
        if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
        }
    };

    // тягнути помаранчеву лінію або клікнути по ній
    const scrollToBar = (clientX, grabOffset) => {
        const el = trackRef.current;
        const bar = barRef.current.getBoundingClientRect();
        const thumb = bar.width * (progress.size / 100);
        const free = bar.width - thumb;
        if (free <= 0) return;
        const ratio = Math.min(1, Math.max(0, (clientX - bar.left - grabOffset) / free));
        el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth);
    };

    const onBarDown = (e) => {
        if (e.button !== 0) return;
        const bar = barRef.current.getBoundingClientRect();
        const thumbLeft = bar.left + bar.width * (progress.offset / 100);
        const thumbWidth = bar.width * (progress.size / 100);
        const onThumb = e.clientX >= thumbLeft && e.clientX <= thumbLeft + thumbWidth;
        const grab = onThumb ? e.clientX - thumbLeft : thumbWidth / 2;

        trackRef.current.style.scrollSnapType = 'none';
        scrollToBar(e.clientX, grab);
        barRef.current.setPointerCapture(e.pointerId);

        const move = (ev) => scrollToBar(ev.clientX, grab);
        const up = () => {
            trackRef.current.style.scrollSnapType = '';
            barRef.current.removeEventListener('pointermove', move);
            barRef.current.removeEventListener('pointerup', up);
        };
        barRef.current.addEventListener('pointermove', move);
        barRef.current.addEventListener('pointerup', up);
    };

    return (
        <div className={`rn-carousel ${dark ? 'rn-carousel--dark' : ''}`}>
            <div
                className={`rn-carousel__track ${dragging ? 'is-dragging' : ''}`}
                ref={trackRef}
                onScroll={updateProgress}
                onPointerDown={onTrackDown}
                onPointerMove={onTrackMove}
                onPointerUp={onTrackUp}
                onPointerLeave={onTrackUp}
                onClickCapture={onTrackClick}
                onDragStart={(e) => e.preventDefault()}
            >
                {properties.map((p) => (
                    <div className="rn-carousel__item" key={p.id}>
                        <PropertyCard property={p} variant={variant} />
                    </div>
                ))}
            </div>

            <div className="rn-carousel__progress" ref={barRef} onPointerDown={onBarDown}>
                <span style={{ width: `${progress.size}%`, left: `${progress.offset}%` }} />
            </div>
        </div>
    );
};

export default PropertyCarousel;