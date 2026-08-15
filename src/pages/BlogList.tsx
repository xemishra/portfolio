import { useEffect, useState } from "react";
import { useInfiniteList } from "../hooks/useInfiniteList";
import { type BlogListItem, getBlogs, type VoteSummary } from "../api";
import Seo from "../components/Seo";
import { ArrowUpRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import VoteButtons from "../components/VoteButtons";

export default function BlogList() {
    const [q, setQ] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedQ(q), 300);
        return () => clearTimeout(handle);
    }, [q]);

    const { items, total, loading, loadingMore, hasMore, sentinelRef } = useInfiniteList<BlogListItem>(
        (skip, limit) => getBlogs(debouncedQ, skip, limit),
        20,
        [debouncedQ]
    );
    const [VotesById, setVotesbyId] = useState<Record<string, VoteSummary>>({});

    function votesFor(item: BlogListItem): VoteSummary {
        return VotesById[item.id] ?? item.votes;
    }

    return (
        <main className="blog-page">
            <Seo
                title="Blog | Shivanand Mishra"
                description="Writing on systems, software engineering, networking and the projects Shivanand Mishra is building."
                canonical="https://xemishra.xyz/blog"
                keywords={[
                    "software engineering blog",
                    "systems programming",
                    "networking",
                    "backend development",
                    "open source",
                    ...Array.from(new Set(items.flatMap((i) => i.tags))),
                ]}
                og={{
                    type: "website",
                    title: "Blog | Shivanand Mishra",
                    description: "Writing on systems, software engineering, networking and the projects Shivanand Mishra is building.",
                    url: "https://xemishra.xyz/blog",
                }}
                jsonLd={
                    items.length
                        ? {
                            "@context": "https://schema.org",
                            "@type": "Blog",
                            name: "Shivanand Mishra | Blog",
                            url: "https://xemishra.xyz/blog",
                            blogPost: items.slice(0, 20).map((item) => ({
                                "@type": "BlogPosting",
                                headline: item.title,
                                description: item.excerpt,
                                url: `https://xemishra.xyz/blog/${item.slug}`,
                                datePublished: item.created_at,
                            })),
                        }
                        : undefined
                }
            />

            <section className="blog-hero">
                <h1>Blog</h1>
                <p className="hero-copy">Writing on systems, software and things I'm building.</p>
                <div className="search-box">
                    <Search size={15} />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search blogs..."
                        aria-label="Search blogs"
                    />
                </div>
            </section>

            <section>
                {loading && !items.length && <p className="muted">Loading...</p>}
                {!loading && !items.length && <p className="muted">No posts found</p>}
                <div className="blog-list">
                    {items.map((b) => (
                        <div className="blog-row" key={b.id}>
                            <Link to={`/blog/${b.slug}`} className="blog-row-link">
                                <div>
                                    <h3>{b.title}</h3>
                                    <p>{b.excerpt}</p>
                                    <div className="tags">
                                        {b.tags.map((t) => (
                                            <span key={t}>{t}</span>
                                        ))}
                                    </div>
                                    <small className="muted">{new Date(b.created_at).toLocaleDateString()}</small>
                                </div>
                                <ArrowUpRight size={18} className="tile-arrow" />
                            </Link>
                            <VoteButtons
                                itemType="blog"
                                itemId={b.id}
                                votes={votesFor(b)}
                                onVoted={(v) => setVotesbyId((prev) => ({ ...prev, [b.id]: v }))}
                            />
                        </div>
                    ))}
                </div>
                {hasMore && (
                    <div ref={sentinelRef} className="scroll-sentinel">
                        {loadingMore && <p className="muted">Loading more...</p>}
                    </div>
                )}
                {!loading && !!items.length && !hasMore && (
                    <p className="muted total-count">
                        {total} post{total === 1 ? "" : "s"}
                    </p>
                )}
            </section>

        </main>
    )
}
