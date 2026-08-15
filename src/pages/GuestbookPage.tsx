import { useEffect, useState } from "react";
import { getGuestbook, getMe, type GuestbookEntry } from "../api";
import { useInfiniteList } from "../hooks/useInfiniteList";
import Seo from "../components/Seo";
import GuestbookComposer from "../components/GuestbookComposer";
import GuestbookEntryItem from "../components/GuestbookEntryItem";

export default function GuestbookPage() {
    const [me, setMe] = useState<any>(null);
    const [freshEntries, setFreshEntries] = useState<GuestbookEntry[]>([]);

    useEffect(() => {
        getMe().then(setMe);
    }, []);

    const { items, total, loading, loadingMore, hasMore, sentinelRef } = useInfiniteList<GuestbookEntry>(
        (skip, limit) => getGuestbook(skip, limit),
        20,
        []
    );

    function handlePosted(entry: GuestbookEntry) {
        setFreshEntries((prev) => [entry, ...prev]);
    }

    const allItems = [...freshEntries, ...items];

    return (
        <main className="blog-page">
            <Seo
                title="Guestbook | Shivanand Mishra"
                description="Messages left by visitors to Shivanand Mishra's portfolio. Sign in with GitHub to leave your own note."
                canonical="https://xemishra.xyz/guestbook"
                keywords={["guestbook", "Shivanand Mishra"]}
                og={{
                    type: "website",
                    title: "Guestbook | Shivanand Mishra",
                    description: "Messages left by visitors to Shivanand Mishra's portfolio. Sign in with GitHub to leave your own note.",
                    url: "https://xemishra.xyz/guestbook",
                }}
            />

            <section className="blog-hero">
                <h1>Guestbook</h1>
                <p className="hero-copy">
                    {total ? `${total + freshEntries.length} message${total + freshEntries.length === 1 ? "" : "s"} from visitors.` : "Leave a note below."}
                </p>
            </section>

            <section>
                <GuestbookComposer me={me} onPosted={handlePosted} />
            </section>

            <section>
                {loading && !allItems.length && <p className="muted">Loading...</p>}
                {!loading && !allItems.length && <p className="muted">No messages yet. Be the first.</p>}
                <div className="entries">
                    {allItems.map((e) => (
                        <GuestbookEntryItem entry={e} key={e.id} />
                    ))}
                </div>
                {hasMore && (
                    <div ref={sentinelRef} className="scroll-sentinel">
                        {loadingMore && <p className="muted">Loading more...</p>}
                    </div>
                )}
            </section>
        </main>
    )
}
