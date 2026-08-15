import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    API_URL,
    type DiscussionMessage,
    type DiscussionTopic,
    discussionWebsocketUrl,
    getDiscussionMessages,
    getDiscussionTopic,
    getMe
} from "../api";
import Seo from "../components/Seo";
import { ArrowLeft, Github, Send } from "lucide-react";
import Markdown from "../components/Markdown";
import VoteButtons from "../components/VoteButtons";
import MarkdownEditor from "../components/MarkdownEditor";

type ConnectionState = "connecting" | "open" | "closed" | "unauthenticated";

export default function DiscussionRoom() {
    const { slug } = useParams<{ slug: string }>();
    const [topic, setTopic] = useState<DiscussionTopic | null>(null);
    const [messages, setMessages] = useState<DiscussionMessage[]>([]);
    const [me, setMe] = useState<any>(null);
    const [draft, setDraft] = useState("");
    const [status, setStatus] = useState<ConnectionState>("connecting");
    const [notFound, setNotFound] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const listEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        getMe().then(setMe);
    }, []);

    useEffect(() => {
        if (!slug) return;
        setNotFound(false);
        setTopic(null);
        setMessages([]);

        getDiscussionTopic(slug)
            .then(async (t) => {
                setTopic(t);
                const page = await getDiscussionMessages(t.id, 0, 50);
                setMessages([...page.items].reverse());
            })
            .catch(() => setNotFound(true));
    }, [slug]);

    useEffect(() => {
        if (!topic) return;

        const ws = new WebSocket(discussionWebsocketUrl(topic.id));
        wsRef.current = ws;
        setStatus("connecting")

        ws.onopen = () => setStatus("open");
        ws.onclose = (e) => setStatus(e.code === 4401 ? "unauthenticated" : "closed");
        ws.onerror = () => setStatus("closed");
        ws.onmessage = (event) => {
            const msg: DiscussionMessage = JSON.parse(event.data);
            setMessages((prev) => [...prev, msg]);
        };

        return () => ws.close();
    }, [topic]);

    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length]);

    function send() {
        const text = draft.trim();
        if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ content: text }));
        setDraft("")
    }

    if (notFound) {
        return (
            <main className="blog-page">
                <Seo title="Discussion not found | Shivanand Mishra" robots="noindex" />
                <p className="muted">That discussion couldn't be found.</p>
                <Link className="view-all" to="/discussions">
                    <ArrowLeft size={14} /> Back to discussions
                </Link>
            </main>
        );
    }
    return (
        <main className="blog-page discussion-page">
            {topic && (
                <Seo
                    title={`${topic.title} | Discussion | Shivanand Mishra`}
                    description={topic.description || `Live discussion: ${topic.title}`}
                    canonical={`https://xemishra.xyz/discussions/${topic.slug}`}
                />
            )}

            <Link className="back-link" to="/discussions">
                <ArrowLeft size={14} /> Back to discussions
            </Link>

            {!topic ? (
                <p className="muted">Loading...</p>
            ) : (
                <>

                    <section className="blog-hero">
                        <h1>{topic.title}</h1>
                        {topic.description && <p className="hero-copy">{topic.description}</p>}
                        <span className={`ws-status ws-${status}`}>
                            {status === "open" && "Live"}
                            {status === "connecting" && "Connecting..."}
                            {status === "closed" && "Disconnected"}
                            {status === "unauthenticated" && "Sign in to chat"}
                        </span>
                    </section>

                    <section className="discussion-thread">
                        {!messages.length && <p className="muted">No messages yet. Say something!</p>}
                        {messages.map((m) => (
                            <article className="discussion-message" key={m.id}>
                                <div className="entry-head">
                                    {m.avatar_url ? <img src={m.avatar_url} alt="" /> : <div className="avatar">{m.name[0]}</div>}
                                    <div>
                                        <b>{m.name}</b>
                                        <small>{new Date(m.created_at).toLocaleDateString()}</small>
                                    </div>
                                </div>
                                <Markdown content={m.content} compact />
                                <VoteButtons
                                    itemType="discussion"
                                    itemId={m.id}
                                    votes={m.votes}
                                    onVoted={(v) =>
                                        setMessages((prev) => prev.map((msg) => (msg.id === m.id ? { ...msg, votes: v } : msg)))
                                    }
                                />
                            </article>
                        ))}
                        <div ref={listEndRef} />
                    </section>

                    <section className="disussion-composer">
                        {!me ? (
                            <a className="github-button" href={`${API_URL}/api/auth/github`}>
                                <Github size={16} /> Sign in with GitHub to join the discussion
                            </a>
                        ) : (
                            <div className="composer">
                                <MarkdownEditor
                                    rows={3}
                                    value={draft}
                                    onChange={setDraft}
                                    placeholder="write a message..."
                                    maxLenght={2000}
                                    disabled={status !== "open"}
                                    compact
                                />
                                <div className="composer-actions">
                                    <small className="muted">Markdown supported</small>
                                    <button onClick={send} disabled={status !== "open" || !draft.trim()}>
                                        <Send size={14} /> Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    )
}
