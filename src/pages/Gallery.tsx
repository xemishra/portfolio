import { useMemo, useState } from "react";
import { type GalleryItem, getGallery, mediaUrl } from "../api";
import { useInfiniteList } from "../hooks/useInfiniteList";
import Seo from "../components/Seo";
import VoteButtons from "../components/VoteButtons";
import Lightbox from "../components/Lightbox";

export default function Gallery() {
    const { items, loading, loadingMore, hasMore, sentinelRef } = useInfiniteList<GalleryItem>(
        (skip, limit) => getGallery(skip, limit),
        20,
        []
    );
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const imageItems = useMemo(() => items.filter((i) => i.media_type === "image"), [items]);

    const lightboxImages = useMemo(
        () => imageItems.map((i) => ({ src: mediaUrl(i.media_url), alt: i.caption || "Gallery photo", caption: i.caption })),
        [imageItems]
    );

    return (
        <main className="blog-page">
            <Seo
                title="Gallery | Shivanand Mishra"
                description="Photos and videos from Shivanand Mishra."
                canonical="https://xemishra.xyz/gallery"
                keywords={["photo gallery", "Shivanand Mishra"]}
                og={{
                    type: "website",
                    title: "Gallery | Shivanand Mishra",
                    description: "Photos and videos from Shivanand Mishra.",
                    url: "https://xemishra.xyz/gallery",
                }}
            />

            <section className="blog-hero">
                <h1>Gallery</h1>
                <p className="hero-copy">Photos and videos, with a little context for each.</p>
            </section>

            <section>
                {loading && !items.length && <p className="muted">Loading...</p>}
                {!loading && !items.length && <p className="muted">Nothing here yet.</p>}
                <div className="gallery-grid">
                    {items.map((item) => (
                        <figure className="gallery-item" key={item.id}>
                            {item.media_type === "image" ? (
                                <button
                                    type="button"
                                    className="gallery-image-button"
                                    onClick={() => setLightboxIndex(imageItems.findIndex((i) => i.id === item.id))}
                                    aria-label={`open ${item.caption || "gallery photo"} in full screen`}
                                >
                                    <img src={mediaUrl(item.media_url)} alt={item.caption || "Gallery photo"} loading="lazy" />
                                </button>
                            ) : (
                                <video src={mediaUrl(item.media_url)} controls preload="metadata" />
                            )}
                            <figcaption>
                                {item.caption && <p>{item.caption}</p>}
                                <VoteButtons itemType="gallery" itemId={item.id} votes={item.votes} />
                            </figcaption>
                        </figure>
                    ))}
                </div>
                {hasMore && (
                    <div ref={sentinelRef} className="scroll-sentinel">
                        {loadingMore && <p className="muted">Loading more...</p>}
                    </div>
                )}
            </section>
            {lightboxIndex !== null && (
                <Lightbox
                    images={lightboxImages}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onIndexChange={setLightboxIndex}
                />
            )}
        </main>
    );
}
