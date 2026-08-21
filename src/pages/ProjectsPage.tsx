import { useEffect, useState } from "react";
import { getProjects, type Project } from "../api";
import Seo from "../components/Seo";
import { ExternalLink, Github } from "lucide-react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProjects()
            .then(setProjects)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="blog-page">
            <Seo
                title="Projects | Shivanand Mishra"
                description="All the projects Shivanand Mishra is building | systems, networking, and open-source software."
                canonical="https://xemishra.xyz/projects"
                keywords={["software projects", "open source projects", "systems programming", "networking", "Shivanand Mishra"]}
                og={{
                    type: "website",
                    title: "Projects | Shivanand Mishra",
                    description: "All the projects Shivanand Mishra is building | systems, networking, and open-source software.",
                    url: "https://xemishra.xyz/projects",
                }}
                jsonLd={
                    projects.length
                        ? {
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            itemListElement: projects.map((p, i) => ({
                                "@type": "ListItem",
                                position: i + 1,
                                name: p.name,
                                url: p.live_url || p.github_url || "https://xemishra.xyz/projects",
                            })),
                        }
                        : undefined
                }
            />

            <section className="blog-hero">
                <h1>Projects</h1>
                <p className="hero-copy">Everything I'm building, in one place.</p>
            </section>

            <section>
                {loading && <p className="muted">Loading...</p>}
                {!loading && !projects.length && <p className="muted">No projects yet.</p>}
                <div className="projects">
                    {projects.map((p) => (
                        <article className="project" key={p.id}>
                            <div className="project-top">
                                <h3>{p.name}</h3>
                                {p.featured && <span className="featured">featured</span>}
                            </div>
                            <p>{p.description}</p>
                            <div className="tags">
                                {p.technologies.map((t) => (
                                    <span key={t}>{t}</span>
                                ))}
                            </div>
                            <div className="project-links">
                                {p.github_url && (
                                    <a href={p.github_url} target="_blank" rel="noreferrer">
                                        source <Github size={13} />
                                    </a>
                                )}
                                {p.live_url && (
                                    <a href={p.live_url} target="_blank" rel="noreferrer">
                                        live <ExternalLink size={13} />
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}
