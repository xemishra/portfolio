import { ChevronLeft, ChevronRight, DotSquare, X } from "lucide-react";
import { useCallback, useEffect } from "react";

export type LightboxImage = { src: string; alt: string; caption: string };

type LightboxProps = {
    images: LightboxImage[];
    index: number;
    onClose: () => void;
    onIndexChange: (index: number) => void;
};


export default function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
    const count = images.length;

    const goPrev = useCallback(() => {
        if (count > 1) onIndexChange((index - 1 + count) % count);
    }, [index, count, onIndexChange]);

    const goNext = useCallback(() => {
        if (count > 1) onIndexChange((index + 1) % count);
    }, [index, count, onIndexChange]);

    useEffect(() => {
        function onKeydown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowLeft") goPrev();
            else if (e.key === "ArrowRight") goNext();
        }
        document.addEventListener("keydown", onKeydown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeydown);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose, goNext, goPrev])

    const current = images[index];
    if (!current) return null;

    return (
        <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <button className="lightbox-close" onClick={onClose} aria-label="Close">
                <X size={22} />
            </button>

            {count > 1 && (
                <button
                    type="button"
                    className="lightbox-nav lightbox-prev"
                    onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                    }}
                    aria-label="Previous image"
                >
                    <ChevronLeft size={28} />
                </button>
            )}

            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <img src={current.src} alt={current.alt} />
                {(current.caption || count > 1) && (
                    <div className="lightbox-meta">
                        {current.caption && <p>{current.caption}</p>}
                        {count > 1 && (
                            <span className="lightbox-counter">
                                {index + 1} / {count}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {count > 1 && (
                <button
                    type="button"
                    className="lightbox-nav lightbox-next"
                    onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                    }}
                    aria-label="Next image"
                >
                    <ChevronRight size={28} />
                </button>
            )}
        </div>
    )
}