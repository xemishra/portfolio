import { useEffect, useState } from "react";
import { getGithubActivity, type GithubActivity } from '../api'

export default function GithubHeatmap() {
    const [data, setData] = useState<GithubActivity | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        getGithubActivity()
            .then(setData)
            .catch(() => setError(true));
    }, []);

    if (error) {
        return (
            <div className="activity-card">
                <p className="muted">Couldn't load Github activity right now.</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="activity-card">
                <div className="heatmap skeleton">
                    {Array.from({ length: 371 }).map((_, i) => (
                        <span key={i} className="cell level-0" />
                    ))}
                </div>
            </div>
        )
    }

    const days = data.contributions;

    const firstDate = days.length ? new Date(days[0].date) : new Date();
    const leadingPad = firstDate.getDay();
    const cells = [...Array(leadingPad).fill(null), ...days];

    const totalContributions = Object.values(data.total || {}).reduce((a, b) => a + b, 0);

    return (
        <div className="activity-card">
            <div className="heatmap">
                {cells.map((day, i) =>
                    day ? (
                        <span
                            key={i}
                            className={`cell level-${Math.min(day.level, 4)}`}
                            title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                        />
                    ) : (
                        <span key={1} className="cell empty" />
                    )
                )}
            </div>
            <div className="activity-footer">
                <span>{totalContributions.toLocaleString()} contributions in the last year</span>
                <span>
                    less <i className="legend l0" /> <i className="legend l1" /> <i className="legend l2" /> {" "}
                    <i className="legend l3" /> <i className="legend l4" /> More
                </span>
            </div>
        </div>
    );
}
