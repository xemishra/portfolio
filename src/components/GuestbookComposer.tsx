import { useState } from "react";
import { addGuestbook, API_URL, GuestbookEntry } from "../api";
import { Github } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";

export default function GuestbookComposer({
    me,
    onPosted,
}: {
    me: any;
    onPosted: (entry: GuestbookEntry) => void
}) {
    const [message, setMessage] = useState("");
    const [posting, setPosting] = useState(false);

    async function submit() {
        if (!message.trim()) return;
        setPosting(true);
        try {
            const created = await addGuestbook(message.trim());
            onPosted(created);
            setMessage("");
        } catch (e) {
            alert(e instanceof Error ? e.message : "Unable to post.");
        } finally {
            setPosting(false);
        }
    }

    return (
        <div className="guestbox">
            <p>Have something to say? Sign in with GitHub and leave a message.</p>
            {!me ? (
                <a className="github-button" href={`${API_URL}/api/auth/github`}>
                    <Github size={16} /> Sign in with GitHub
                </a>
            ) : (
                <div className="composer">
                    <div className="signed">
                        <img src={me.avatar_url} alt="" /> {me.name || me.login}
                    </div>
                    <MarkdownEditor
                        rows={4}
                        value={message}
                        onChange={setMessage}
                        placeholder="Leave a message..."
                        maxLenght={800}
                        compact
                    />
                    <div className="composer-actions">
                        <small className="muted">Markdown supported</small>
                        <button onClick={submit} disabled={posting}>
                            {posting ? "Posting..." : "Post message"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
