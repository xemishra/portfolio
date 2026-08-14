import type { GuestbookEntry } from "../api";
import Markdown from "./Markdown";
import VoteButtons from "./VoteButtons";

export default function GuestbookEntryItem({
    entry,
    onVoted,
}: {
    entry: GuestbookEntry;
    onVoted?: (votes: GuestbookEntry["votes"]) => void;
}) {
    return (
        <article className="entry">
            <div className="entry-head">
                {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt="" />
                ) : (
                    <div className="avatar">{entry.name[0]}</div>
                )}
                <div>
                    <b>{entry.name}</b>
                    <small>{new Date(entry.created_at).toLocaleDateString()}</small>
                </div>
            </div>
            <Markdown content={entry.message} compact />
            <VoteButtons itemType="guestbook" itemId={entry.id} votes={entry.votes} onVoted={onVoted} />
        </article>
    )
}
