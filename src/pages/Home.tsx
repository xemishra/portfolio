import { useEffect, useMemo, useState } from "react";
import {
    BlogListItem,
    DiscussionTopic,
    GalleryItem,
    getDiscussionTopics,
    getGallery,
    getGithubPRs,
    getGuestbook,
    getLatestBlogs,
    getLatestValues,
    getMe,
    getProjects,
    GuestbookEntry,
    mediaUrl,
    Project,
    PullRequest,
    ValueItem
} from "../api";
import { useLocation, Link } from "react-router-dom";
import { ArrowUpRight, Building2, ExternalLink, Github, Linkedin, MapPin, MessageSquare, Twitter } from "lucide-react";
import Seo from "../components/Seo";
import Avatar from "../components/Avatar";
import SectionTitle from "../components/SectionTitle";
import GithubHeatmap from "../components/GithubHeatmap";
import { PrRow } from "./ContributionsPage";
import GuestbookComposer from "../components/GuestbookComposer";
import GuestbookEntryItem from "../components/GuestbookEntryItem";
import Lightbox from "../components/Lightbox";
import { ValueCard } from "./ValuesPage";

const socials = {
    github: "https://github.com/xemishra",
    linkedin: "https://linkedin.com/in/xemishra",
    x: "https://x.com/xemishra",
};

const GUESTBOOK_PREVIEW = 6;
const PROJECTS_PREVIEW = 4;
const VALUES_PREVIEW = 3;
const DISCUSSION_PREVIEW = 3;
const PRS_PREVIEW = 3;
const ORGS_PREVIEWS = 4;
const GALLERY_PREVIEW = 5;

export default function Home() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [blogs, setBlogs] = useState<BlogListItem[]>([]);
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [guestbookTotal, setGuestbookTotal] = useState(0);
    const [me, setMe] = useState<any>(null);
    const [values, setValues] = useState<ValueItem[]>([]);
    const [discussions, setDiscussions] = useState<DiscussionTopic[]>([]);
    const [prs, setPrs] = useState<PullRequest[]>([]);
    const [orgs, setOrgs] = useState<string[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([])
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const location = useLocation();

    const galleryImages = useMemo(() => gallery.filter((i) => i.media_type === "image"), [gallery]);
    const lightboxImages = useMemo(
        () =>
            galleryImages.map((i) => ({ src: mediaUrl(i.media_url), alt: i.caption || "Gallery photo", caption: i.caption })),
        [galleryImages]
    );

    useEffect(() => {
        Promise.all([
            getProjects(PROJECTS_PREVIEW),
            getGuestbook(0, GUESTBOOK_PREVIEW),
            getMe(),
            getLatestBlogs(4),
            getLatestValues(VALUES_PREVIEW),
            getDiscussionTopics(DISCUSSION_PREVIEW),
            getGithubPRs().catch(() => null),
            getGallery(0, GALLERY_PREVIEW).catch(() => null),
        ])
            .then(([p, g, u, b, v, d, prData, galleryPage]) => {
                setProjects(p);
                setEntries(g.items);
                setGuestbookTotal(g.total);
                setMe(u);
                setBlogs(b);
                setValues(v);
                setDiscussions(d);
                if (galleryPage) setGallery(galleryPage.items);
                if (prData) {
                    setPrs(prData.all.slice(0, PRS_PREVIEW));
                    const seen = new Set<string>();
                    const latestOrgs: string[] = [];
                    for (const pr of prData.all) {
                        const orgName = pr.repo.split("/")[0];
                        if (!seen.has(orgName)) {
                            seen.add(orgName);
                            latestOrgs.push(orgName);
                            if (latestOrgs.length >= ORGS_PREVIEWS) break;
                        }
                    }
                    setOrgs(latestOrgs);
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!location.hash) return;
        const id = location.hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
            const timer = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
            return () => clearTimeout(timer);
        }
    }, [location.hash])

    function handlePosted(entry: GuestbookEntry) {
        setEntries((prev) => [entry, ...prev].slice(0, GUESTBOOK_PREVIEW));
        setGuestbookTotal((t) => t + 1);
    }

    console.log("BLOGS STATE:", blogs);

    return (
        <main id="top">
            <Seo
                title="Shivanand Mishra | Software Engineer &amp; Systems Developer"
                description="Shivanand Mishra builds software, explores systems and networking, and writes about engineering. Explore projects, blog posts and GitHub activity."
                canonical="https://xemishra.xyz/"
                keywords={[
                    "Shivanand Mishra",
                    "software engineer",
                    "systems programming",
                    "networking",
                    "open source",
                    "backend developer",
                    "portfolio",
                ]}
                og={{
                    type: "website",
                    title: "Shivanand Mishra | Software Engineer &amp; Systems Developer",
                    description: "Projects, blog posts and GitHub activity from Shivanand Mishra | software engineer focused on systems and open source.",
                    url: "https://xemishra.xyz/",
                    image: "https://xemishra.xyz/assets/profile.jpg",
                }}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "Person",
                    name: "Shivanand Mishra",
                    url: "https://xemishra.xyz/",
                    sameAs: [socials.github, socials.linkedin],
                    jobTitle: "Software Engineer",
                }}
            />

            <section className="hero">
                <Avatar name="Shivanand Mishra" />
                <h1>Shivanand Mishra</h1>
                <div className="hero-meta">
                    <span className="hero-location">
                        <MapPin size={13} /> India
                    </span>
                    <a className="hero-location hero-org" href="https://github.com/thidow" target="_blank" rel="noreferrer">
                        <Building2 size={13} /> @thidow
                    </a>
                </div>
                <p className="hero-copy">
                    I build software, explore systems, and learn by building things from the ground up.
                    Currently focused on software engineering, systems and networking, AI, and open-source development,
                    with a particular interest in understanding how things work beneath the surface.
                </p>
                <div className="hero-links">
                    <a href={socials.github} target="_blank" rel="noreferrer">
                        <Github size={15} /> GitHub
                    </a>
                    <a href={socials.linkedin} target="_blank" rel="noreferrer">
                        <Linkedin size={15} /> LinkedIn
                    </a>
                    <a href={socials.x} target="_blank" rel="noreferrer">
                        <Twitter size={15} /> Twitter
                    </a>
                </div>
            </section>

            <section className="activity" id="activity">
                <SectionTitle title="Activity" meta="building in public" />
                <GithubHeatmap />
            </section>

            <section className="latest-blogs" id="latest-blogs">
                <SectionTitle title="Latest Blogs" meta="from the blog" />
                <div className="blog-tiles">
                    {blogs.map((b) => (
                        <Link className="blog-tile" to={`/blog/${b.slug}`} key={b.id}>
                            <div className="blog-tile-top">
                                <h3>{b.title}</h3>
                                <ArrowUpRight size={15} className="tile-arrow" />
                            </div>
                            <p>{b.excerpt}</p>
                            <div className="tags">
                                {b.tags.slice(0, 3).map((t) => (
                                    <span key={t}>{t}</span>
                                ))}
                            </div>
                        </Link>
                    ))}
                    {!blogs.length && <p className="muted">No blog posts yet.</p>}
                </div>
                <Link className="view-all" to="/blog">
                    View all posts <ArrowUpRight size={14} />
                </Link>
            </section>

            <section id="projects">
                <SectionTitle title="Projects" meta="things I'm building" />
                <div className="projects">
                    {projects.map((P) => (
                        <article className="project" key={P.id}>
                            <div className="project-top">
                                <h3>{P.name}</h3>
                                {P.featured && <span className="featured">featured</span>}
                            </div>
                            <p>{P.description}</p>
                            <div className="tags">
                                {P.technologies.map((t) => (
                                    <span key={t}>{t}</span>
                                ))}
                            </div>
                            <div className="project-links">
                                {P.github_url && (
                                    <a href={P.github_url} target="_blank" rel="noreferrer">
                                        source <Github size={13} />
                                    </a>
                                )}
                                {P.live_url && (
                                    <a href={P.live_url} target="_blank" rel="noreferrer">
                                        live <ExternalLink size={13} />
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
                <Link className="view-all" to="/projects">
                    See all projects <ArrowUpRight size={14} />
                </Link>
            </section>

            <section className="contribution-preview" id="contribution-preview">
                <SectionTitle title="Contributions" meta="recent pull requests" />
                {orgs.length > 0 && (
                    <div className="org-list">
                        {orgs.map((name) => (
                            <Link key={name} className="org-card" to={`/contributions?org=${encodeURIComponent(name)}`}>
                                <img
                                    className="org-avatar"
                                    src={`https://github.com/${name}.png?size=64`}
                                    alt={`${name} logo`}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                />
                                <span className="org-card-body">
                                    <span className="org-name">{name}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
                <div className="pr-list">
                    {prs.map((pr) => (
                        <PrRow pr={pr} key={`${pr.repo}-${pr.number}`} />
                    ))}
                    {!prs.length && <p className="muted">No pull requests to show yet.</p>}
                </div>
                <Link className="view-all" to="/contributions">
                    View all contributions <ArrowUpRight size={14} />
                </Link>
            </section>

            <section className="discussions-preview" id="discussions-preview">
                <SectionTitle title="Discussions" meta="live threads" />
                <div className="blog-list">
                    {discussions.map((d) => (
                        <Link className="blog-row" to={`/discussions/${d.slug}`} key={d.id}>
                            <div className="blog-row-link">
                                <div>
                                    <h3>{d.title}</h3>
                                    {d.description && <p>{d.description}</p>}
                                    <small className="muted">
                                        <MessageSquare size={12} className="inline-icon" />
                                        {d.message_count} message{d.message_count === 1 ? "" : "s"}
                                    </small>
                                </div>
                                <ArrowUpRight size={18} className="tile-arrow" />
                            </div>
                        </Link>
                    ))}
                    {!discussions.length && <p className="muted">No discussions yet.</p>}
                </div>
                <Link className="view-all" to="/discussions">
                    View all discussions <ArrowUpRight size={14} />
                </Link>
            </section>

            <section className="values-preview" id="values-preview">
                <SectionTitle title="Values" meta="short thoughts" />
                <div className="values-list">
                    {values.map((v) => (
                        <ValueCard value={v} key={v.id} />
                    ))}
                    {!values.length && <p className="muted">Nothing here yet.</p>}
                </div>
                <Link className="view-all" to="/values">
                    View all values <ArrowUpRight size={14} />
                </Link>

            </section>

            <section className="about">
                <SectionTitle title="What I care about" meta="engineering principles" />
                <div className="principles">
                    <div>
                        <b>Understand the machine.</b>
                        <span>Networking, operating systems, memory, protocols, and the foundations beneath the abstractions.</span>
                    </div>
                    <div>
                        <b>Build real systems.</b>
                        <span>Projects that solve real problems, expose hard engineering challenges, and demand an understanding of the details.</span>
                    </div>
                    <div>
                        <b>Open the work.</b>
                        <span>Documenting what I learn, sharing what I build, and contributing useful software to the open-source community.</span>
                    </div>
                </div>
            </section>

            <section className="gallery-preview" id="gallery-preview">
                <SectionTitle title="Gallery" meta="photos & videos" />
                <div className="gallery-grid">
                    {gallery.map((item) => (
                        <figure className="gallery-item" key={item.id}>
                            {item.media_type === "image" ? (
                                <button
                                    type="button"
                                    className="gallery-image-button"
                                    onClick={() => setLightboxIndex(galleryImages.findIndex((i) => i.id === item.id))}
                                    aria-label={`Open ${item.caption || "gallery photo"} in full screen`}
                                >
                                    <img src={mediaUrl(item.media_url)} alt={item.caption || "Gallery photo"} loading="lazy" />
                                </button>
                            ) : (
                                <video src={mediaUrl(item.media_url)} preload="metadata" muted />
                            )}
                            {item.caption && (
                                <figcaption>
                                    <p>{item.caption}</p>
                                </figcaption>
                            )}
                        </figure>
                    ))}
                    {!gallery.length && <p className="muted">Nothing here yet.</p>}
                </div>
                <Link className="view-all" to="/gallery">
                    See full gallery <ArrowUpRight size={14} />
                </Link>
            </section>

            <section id="guestbook" className="guestbook">
                <SectionTitle title="Guestbook" meta="leave a note" />
                <GuestbookComposer me={me} onPosted={handlePosted} />
                <div className="entries">
                    {entries.map((e) => (
                        <GuestbookEntryItem entry={e} key={e.id} />
                    ))}
                    {!entries.length && <p className="muted">No messages yet. Be the first.</p>}
                </div>
                {guestbookTotal > entries.length && (
                    <Link className="view-all" to="/guestbook">
                        Read all {guestbookTotal} messages <ArrowUpRight size={14} />
                    </Link>
                )}
            </section>

            {lightboxIndex !== null && (
                <Lightbox
                    images={lightboxImages}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onIndexChange={setLightboxIndex}
                />
            )}
        </main>
    );
}
