import { useEffect, useRef } from "react";

type GalleryVideoProps = {
    src: string;
    className?: string;
};

export default function GalleryVideo({ src, className }: GalleryVideoProps) {
    const VideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const el = VideoRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.play().catch(() => { });
                    } else {
                        el.pause();
                    }
                });
            },
            { threshold: 0.25 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <video
            ref={VideoRef}
            src={src}
            className={className}
            muted
            loop
            playsInline
            preload="metadata"
        />
    );

}