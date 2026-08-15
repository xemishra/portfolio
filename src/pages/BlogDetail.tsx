import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { type Blog, getBlog, mediaUrl, type VoteSummary } from "../api";
import Seo from "../components/Seo";
import { ArrowLeft } from "lucide-react";
import Markdown from "../components/Markdown";
import VoteButtons from "../components/VoteButtons";

const SITE_URL = "https://xemishra.xyz";

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!slug) return;
        setBlog(null);
        setError(false);
        getBlog(slug)
            .then(setBlog)
            .catch(() => setError(true));
    }, [slug]);

    if (error) {
        return (
            <main className="blog-page">
                <Seo title="Post not found | Shivanand Mishra" robots="noindex" />
                <p className="muted">That post couldn't be found.</p>
                <Link className="view-all" to="/">
                    <ArrowLeft size={14} /> Back to blog
                </Link>
            </main>
        );
    }

    if (!blog) {
        return (
            <main className="blog-page">
                <p className="muted">Loading...</p>
            </main>
        )
    }

    const url = `${SITE_URL}/blog/${blog.slug}`;

    return (
        <main className="blog-page">
            <Seo
                title={`${blog.title} | Shivanand Mishra`}
                description={blog.excerpt}
                canonical={url}
                keywords={[...blog.tags, "Shivanand Mishra", "software engineering blog"]}
                og={{
                    type: "article",
                    title: blog.title,
                    description: blog.excerpt,
                    url,
                    image: blog.cover_image ? mediaUrl(blog.cover_image) : undefined,
                }}
                twitterCard="summary_large_image"
                extraMeta={[
                    { property: "article:published_time", content: blog.created_at },
                    { property: "article:modified_time", content: blog.updated_at },
                    { property: "article:author", content: "Shivanand Mishra" },
                    ...blog.tags.map((t) => ({ property: "article:tag", content: t })),
                ]}
                jsonLd={[
                    {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: blog.title,
                        description: blog.excerpt,
                        datePublished: blog.created_at,
                        dateModified: blog.updated_at,
                        author: { "@type": "Person", name: "Shivanand Mishra", url: "https://xemishra.xyz" },
                        publisher: {
                            "@type": "Person",
                            name: "Shivanand Mishra",
                            url: "https://xemishra.xyz/",
                        },
                        image: blog.cover_image ? mediaUrl(blog.cover_image) : "https://xemishra.xyz/assets/og-default.png",
                        mainEntityOfPage: { "@type": "Webpage", "@id": url },
                        url,
                        keywords: blog.tags.join(", ")
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Home", item: "https://xemishra.xyz/" },
                            { "@type": "ListItem", position: 2, name: "Blog", item: "https://xemishra.xyz/blog" },
                            { "@type": "ListItem", position: 3, name: blog.title, item: url },
                        ],
                    },
                ]}
            />

            <Link className="back-link" to='/blog'>
                <ArrowLeft size={14} /> Back to blog
            </Link>
            <article className="blog-article">
                <div className="tags">
                    {blog.tags.map((t) => (
                        <span key={t}>{t}</span>
                    ))}
                </div>
                <h1>{blog.title}</h1>
                <small className="muted">
                    {new Date(blog.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </small>
                <Markdown content={blog.content} />
                <VoteButtons
                    itemType="blog"
                    itemId={blog.id}
                    votes={blog.votes}
                    onVoted={(v: VoteSummary) => setBlog((prev) => prev ? { ...prev, votes: v } : prev)}
                />
            </article>
        </main>
    )
}
