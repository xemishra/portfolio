import { ExternalLink, GitMerge, GitPullRequest, GitPullRequestClosed } from "lucide-react";
import { getGithubPRs, type PullRequest, type PullRequestResponse } from "../api";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";

type Filter = "all" | "open" | "merged" | "closed";

const STATE_ICON: Record<PullRequest["state"], typeof GitPullRequest> = {
    open: GitPullRequest,
    merged: GitMerge,
    closed: GitPullRequestClosed
};

export default function ContributionsPage() {
    const [data, setData] = useState<PullRequestResponse | null>(null);
    const [error, setError] = useState(false);
    const [filter, setFilter] = useState<Filter>("all");
    const [org, setOrg] = useState<string | null>(null);
    const [searchParams] = useSearchParams();


    useEffect(() => {
        getGithubPRs()
            .then(setData)
            .catch(() => setError(true));
    }, []);

    useEffect(() => {
        const requested = searchParams.get("org");
        if (requested) setOrg(requested);
    }, [searchParams]);

    const organizations = useMemo(() => {
        if (!data) return [];
        const counts = new Map<string, number>();
        for (const pr of data.all) {
            const orgName = pr.repo.split("/")[0];
            counts.set(orgName, (counts.get(orgName) ?? 0) + 1);
        }
        return [...counts.entries()].sort((a, b) => b[1]);
    }, [data]);

    const byState = data ? data[filter] : [];
    const list = org ? byState.filter((pr) => pr.repo.split("/")[0] === org) : byState;

    return (
        <main className="blog-page">
            <Seo
                title="Contributions | Shivanand Mishra"
                description="Open source pull requests from Shivanand Mishra, grouped by organization | open, merged, and closed."
                canonical="https://xemishra.xyz/contributions"
                keywords={["open source contributions", "GitHub pull requests", "Shivanand Mishra", ...organizations.map(([n]) => n)]}
                og={{
                    type: "website",
                    title: "Contributions | Shivanand Mishra",
                    description: "Open source pull requests from Shivanand Mishra, grouped by organization | open, merged, and closed.",
                    url: "https://xemishra.xyz/contributions",
                }}
            />

            <section className="blog-hero">
                <h1>Contributions</h1>
                <p className="hero-copy">Pull requests across open-source projects.</p>

                {data && organizations.length > 0 && (
                    <>
                        <p className="pr-group-label">Organizations I've contributed to</p>
                        <div className="org-list">
                            <button
                                className={org === null ? "org-card active" : "org-card"}
                                onClick={() => setOrg(null)}
                            >
                                <span className="org-avatar org-avatar-all" aria-hidden="true">
                                    ALL
                                </span>
                                <span className="org-card-body">
                                    <span className="org-name">All organizations</span>
                                    <span className="org-count">{data.all.length} PRs</span>
                                </span>
                            </button>
                            {organizations.map(([name, count]) => (
                                <button
                                    key={name}
                                    className={org === name ? "org-card active" : "org-card"}
                                    onClick={() => setOrg(name)}
                                >
                                    <img
                                        className="org-avatar"
                                        src={`https://github.com/${name}.png?size=80`}
                                        alt={`${name} logo`}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                    <span className="org-card-body">
                                        <span className="org-name">{name}</span>
                                        <span className="org-count">
                                            {count} PR {count === 1 ? "" : "s"}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>

                    </>
                )}

                {data && (
                    <>
                        <p className="pr-group-label">State</p>
                        <div className="pr-tabs">
                            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
                                All ({data.all.length})
                            </button>
                            <button className={filter === "open" ? "active" : ""} onClick={() => setFilter("open")}>
                                Open ({data.counts.open})
                            </button>
                            <button className={filter === "merged" ? "active" : ""} onClick={() => setFilter("merged")}>
                                Merged ({data.counts.merged})
                            </button>
                            <button className={filter === "closed" ? "active" : ""} onClick={() => setFilter("closed")}>
                                Closed ({data.counts.closed})
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section>
                {error && <p className="muted">Couldn't load pull requests right now.</p>}
                {!data && !error && <p className="muted">Loading...</p>}
                {data && org && <p className="pr-group-label">PRs in {org}</p>}
                {data && !list.length && <p className="muted">Nothing here yet.</p>}
                <div className="pr-list">
                    {list.map((pr) => (
                        <PrRow pr={pr} key={`${pr.repo}-${pr.number}`} />
                    ))}
                </div>
            </section>
        </main>
    );
}

export function PrRow({ pr }: { pr: PullRequest }) {
    const Icon = STATE_ICON[pr.state];
    return (
        <a className="pr-row" href={pr.url} target="_blank" rel="noreferrer">
            <Icon size={16} className={`pr-icon pr-${pr.state}`} />
            <div className="pr-row-body">
                <div className="pr-row-top">
                    <span className="pr-repo">{pr.repo}</span>
                    <span className="pr-number">#{pr.number}</span>
                </div>
                <p>{pr.title}</p>
                <small className="muted">
                    {pr.state === "merged" ? "Merged" : pr.state === "closed" ? "Closed" : "Opened"}{" "}
                    {new Date(pr.closed_at ?? pr.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: "short",
                        day: "numeric",
                    })}
                </small>
            </div>
            <ExternalLink size={14} className="tile-arrow" />
        </a>
    )
}