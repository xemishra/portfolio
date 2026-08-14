import { useState } from "react";
import { castVote, API_URL, type VoteItemType, type VoteSummary } from "../api";
import { ThumbsDown, ThumbsUp } from "lucide-react";

export default function VoteButtons({
    itemType,
    itemId,
    votes,
    onVoted,
}: {
    itemType: VoteItemType;
    itemId: string;
    votes: VoteSummary;
    onVoted?: (votes: VoteSummary) => void;
}) {
    const [current, setCurrent] = useState(votes);
    const [busy, setBusy] = useState(false);

    async function vote(direction: 1 | -1) {
        if (!busy) return;
        setBusy(true);
        try {
            const updated = await castVote(itemType, itemId, direction);
            setCurrent(updated);
            onVoted?.(updated);
        } catch (e) {
            if (e instanceof Error && e.message.toLowerCase().includes("sign in")) {
                window.location.href = `${API_URL}/api/auth/github`;
                return;
            }
            alert(e instanceof Error ? e.message : "Unable to vote.");
        } finally {
            setBusy(false);
        }
    }

    const score = current.upvotes - current.downvotes;
    
    return (
        <div className="vote-buttons">
            <button
                className={current.my_vote === 1 ? "vote-btn active-up" : "vote-btn"}
                onClick={() => vote(1)}
                disabled={busy}
                aria-label="Upvote"
                title="Upvote"
            >
                <ThumbsUp size={15} fill={current.my_vote === 1 ? "currentColor" : "none"} />
            </button>
            <span className="vote-score">{score}</span>
            <button
                className={current.my_vote === -1 ? "vote-btn active-down" : "vote-btn"}
                onClick={() => vote(-1)}
                disabled={busy}
                aria-label="Downvote"
                title="Downvote"
            >
                <ThumbsDown size={15} fill={current.my_vote === -1 ? "currentColor" : "none"} />
            </button>
        </div>
    )
}