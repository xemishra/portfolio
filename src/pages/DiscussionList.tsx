import { useEffect, useState } from "react";
import { type DiscussionTopic, getDiscussionTopics } from "../api";
import Seo from "../components/Seo";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function DiscussionList() {
    const [topics, setTopics] = useState<DiscussionTopic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDiscussionTopics()
            .then(setTopics)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [])

    return (
        <main className="blog-page">
            <Seo
                title="Discussions | Shivanand Mishra"
                description="Live discussion threads. Sign in with GitHub to join the conversation."
                canonical="https://xemishra.xyz/discussions"
                keywords={["developer discussion", "tech chat", "Shivanand Mishra"]}
                og={{
                    type: "website",
                    title: "Discussions | Shivanand Mishra",
                    description: "Live discussion threads. Sign in with GitHub to join the conversation.",
                    url: "https://xemishra.xyz/discussions",
                }}
            />

            <section className="blog-hero">
                <h1>Discussions</h1>
                <p className="hero-copy">Live threads. Sign in with GitHub and jump in.</p>
            </section>

            <section>
                {loading && <p className="muted">Loading...</p>}
                {!loading && !topics.length && <p className="muted">No discussion yet.</p>}
                <div className="blog-list">
                    {topics.map((t) => (
                        <Link className="blog-row" to={`/discussions/${t.slug}`} key={t.id} >
                            <div className="blog-row-link">
                                <div>
                                    <h3>{t.title}</h3>
                                    {t.description && <p>{t.description}</p>}
                                    <small className="muted">
                                        <MessageSquare size={12} className="inline-icon" />
                                        {t.message_count} message{t.message_count === 1 ? "" : "s"}
                                    </small>
                                </div>
                                <ArrowUpRight size={18} className="tile-arrow" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    )
}
