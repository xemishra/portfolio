import { getValues, ValueItem } from "../api";
import Markdown from "../components/Markdown";
import Seo from "../components/Seo";
import VoteButtons from "../components/VoteButtons";
import { useInfiniteList } from "../hooks/useInfiniteList";

export default function ValuesPage() {
    const { items, loading, loadingMore, hasMore, sentinelRef } = useInfiniteList<ValueItem>(
        (skip, limit) => getValues(skip, limit),
        20,
        []
    );

    return (
        <main className="blog-page">
            <Seo
                title="Values | Shivanand Mishra"
                description="Short thoughts and personal advice from Shivanand Mishra."
                canonical="https://xemishra.xyz/values"
                keywords={["personal values", "engineer philosophy", "Shivanand Mishra"]}
                og={{
                    type: "website",
                    title: "Values | Shivanand Mishra",
                    description: "Short thoughts and personal advice from Shivanand Mishra.",
                    url: "https://xemishra.xyz/values",
                }}
            />

            <section className="blog-hero">
                <h1>Values</h1>
                <p className="hero-copy">Short thoughts, not blog posts. Things I believe.</p>
            </section>

            <section>
                {loading && !items.length && <p className="muted">Loading...</p>}
                {!loading && !items.length && <p className="muted">Nothing here yet.</p>}
                <div className="values-list">
                    {items.map((v) => (
                        <ValueCard key={v.id} value={v} />
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

export function ValueCard({ value }: { value: ValueItem }) {
    return (
        <article className="value-card">
            <Markdown content={value.content} compact />
            <div className="value-footer">
                <small className="muted">
                    {new Date(value.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </small>
                <VoteButtons itemType="value" itemId={value.id} votes={value.votes} />
            </div>
        </article>
    )
}
