import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    adminMe,
    type Blog,
    clearAdminToken,
    createBlog,
    createDiscussionTopic,
    createGalleryItem,
    createProject,
    createValue,
    deleteBlog,
    deleteDiscussionTopic,
    deleteGalleryItem,
    deleteProject,
    deleteValue,
    type DiscussionTopic,
    type GalleryItem,
    getAdminBlogs,
    getDiscussionTopics,
    getGallery,
    getProjects,
    getValues,
    mediaUrl,
    type Project,
    updateBlog,
    updateProject,
    updateValue,
    uploadMedia,
    type ValueItem,
} from "../api";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import MarkdownEditor from "../components/MarkdownEditor";
import GalleryVideo from "../components/GalleryVideo";

type Tab = "blogs" | "projects" | "gallery" | "discussions" | "values";

const emptyBlog = { title: "", excerpt: "", content: "", tags: "", published: true, cover_image: "" };
const emptyProject = {
    name: "",
    description: "",
    technologies: "",
    github_url: "",
    live_url: "",
    featured: false,
};
const emptyDiscussion = { title: "", description: "" };

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [tab, setTab] = useState<Tab>("blogs");

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [galleryCaption, setGalleryCaption] = useState("");
    const [galleryFile, setGalleryFile] = useState<File | null>(null);
    const [galleryPreviewUrl, setGalleryPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const [discussions, setDiscussions] = useState<DiscussionTopic[]>([]);
    const [discussionForm, setDiscussionForm] = useState(emptyDiscussion);
    const [creatingDiscussion, setCreatingDiscussion] = useState(false);
    const [showDiscussionForm, setShowDiscussionForm] = useState(false);

    const [values, setValues] = useState<ValueItem[]>([]);
    const [valueDraft, setValueDraft] = useState("");
    const [editingValueId, setEditingValueId] = useState<string | null>(null);
    const [savingValue, setSavingValue] = useState(false);

    const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
    const [blogForm, setBlogForm] = useState(emptyBlog);
    const [savingBlog, setSavingBlog] = useState(false);

    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [projectForm, setProjectForm] = useState(emptyProject);
    const [savingProject, setSavingProject] = useState(false);

    useEffect(() => {
        adminMe().then((me) => {
            if (!me) {
                navigate("/admin/login");
                return;
            }
            setChecking(false);
            refreshBlogs();
            refreshProjects();
            refreshGallery();
            refreshDiscussions();
            refreshValues();
        });
    }, []);

    function refreshBlogs() {
        getAdminBlogs().then(setBlogs).catch(console.error);
    }

    function refreshProjects() {
        getProjects().then(setProjects).catch(console.error);
    }

    function refreshGallery() {
        getGallery(0, 100).then((page) => setGallery(page.items)).catch(console.error);
    }

    function selectGalleryFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError("");
        setGalleryFile(file);
        setGalleryPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(file);
        });
    }

    function cancelGalleryUpload() {
        if (galleryPreviewUrl) URL.revokeObjectURL(galleryPreviewUrl);
        setGalleryFile(null);
        setGalleryPreviewUrl(null);
        setGalleryCaption("")
        setUploadError("");
    }

    async function postGalleryItem() {
        if (!galleryFile) return;
        setUploading(true);
        setUploadError("");
        try {
            const { url, media_type } = await uploadMedia(galleryFile);
            const item = await createGalleryItem({ caption: galleryCaption.trim(), media_type, media_url: url });
            setGallery((prev) => [item, ...prev]);
            cancelGalleryUpload();
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Upload failed.");
        } finally {
            setUploading(false);
        }
    }

    async function removeGalleryItem(id: string) {
        if (!confirm("Delete this gallery item?")) return;
        await deleteGalleryItem(id);
        setGallery((prev) => prev.filter((g) => g.id !== id));
    }

    function refreshDiscussions() {
        getDiscussionTopics().then(setDiscussions).catch(console.error);
    }

    async function saveDiscussion() {
        if (!discussionForm.title.trim()) return;
        setCreatingDiscussion(true);
        try {
            const topic = await createDiscussionTopic({
                title: discussionForm.title.trim(),
                description: discussionForm.description.trim(),
            });
            setDiscussions((prev) => [topic, ...prev]);
            setDiscussionForm(emptyDiscussion);
            setShowDiscussionForm(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Unable to create discussion");
        } finally {
            setCreatingDiscussion(false);
        }
    }

    async function removeDiscussion(id: string) {
        if (!confirm("Delete this discussion and all its messages?")) return;
        await deleteDiscussionTopic(id);
        setDiscussions((prev) => prev.filter((d) => d.id !== id));
    }

    function refreshValues() {
        getValues(0, 100).then((page) => setValues(page.items)).catch(console.error);
    }

    function startEditValue(v?: ValueItem) {
        if (v) {
            setEditingValueId(v.id);
            setValueDraft(v.content);
        } else {
            setEditingValueId("new");
            setValueDraft("");
        }
    }

    async function saveValue() {
        if (!valueDraft.trim()) return;
        setSavingValue(true);
        try {
            if (editingValueId && editingValueId !== "new") {
                const updated = await updateValue(editingValueId, valueDraft.trim());
                setValues((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
            } else {
                const created = await createValue(valueDraft.trim());
                setValues((prev) => [created, ...prev]);
            }
            setEditingValueId(null);
            setValueDraft("");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Unable to save.");
        } finally {
            setSavingValue(false);
        }
    }

    async function removeValue(id: string) {
        if (!confirm("Delete this value post?")) return;
        await deleteValue(id);
        setValues((prev) => prev.filter((v) => v.id !== id));
    }

    function logout() {
        clearAdminToken();
        navigate("/admin/login");
    }

    function startEditBlog(b?: Blog) {
        if (b) {
            setEditingBlogId(b.id);
            setBlogForm({
                title: b.title,
                excerpt: b.excerpt,
                content: b.content,
                tags: b.tags.join(", "),
                published: b.published,
                cover_image: b.cover_image ?? "",
            })
        } else {
            setEditingBlogId("new");
            setBlogForm(emptyBlog);
        }
    }

    async function saveBlog() {
        setSavingBlog(true);
        const payload = {
            title: blogForm.title,
            excerpt: blogForm.excerpt,
            content: blogForm.content,
            tags: blogForm.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            published: blogForm.published,
            cover_image: blogForm.cover_image || null,
        };
        try {
            if (editingBlogId && editingBlogId !== "new") {
                await updateBlog(editingBlogId, payload);
            } else {
                await createBlog(payload);
            }
            setEditingBlogId(null);
            refreshBlogs();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Unable to save post");
        } finally {
            setSavingBlog(false);
        }
    }

    async function removeBlog(id: string) {
        if (!confirm("Delete this post?")) return;
        await deleteBlog(id);
        refreshBlogs();
    }

    function startEditProject(p?: Project) {
        if (p) {
            setEditingProjectId(p.id);
            setProjectForm({
                name: p.name,
                description: p.description,
                technologies: p.technologies.join(", "),
                github_url: p.github_url ?? "",
                live_url: p.live_url ?? "",
                featured: p.featured,
            });
        } else {
            setEditingProjectId("new");
            setProjectForm(emptyProject);
        }
    }

    async function saveProject() {
        setSavingProject(true);
        const payload = {
            name: projectForm.name,
            description: projectForm.description,
            technologies: projectForm.technologies
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            github_url: projectForm.github_url || null,
            live_url: projectForm.live_url || null,
            featured: projectForm.featured,
        };
        try {
            if (editingProjectId && editingProjectId !== "new") {
                await updateProject(editingProjectId, payload);
            } else {
                await createProject(payload);
            }
            setEditingProjectId(null);
            refreshProjects();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Unable to save project.");
        } finally {
            setSavingProject(false);
        }
    }

    async function removeProject(id: string) {
        if (!confirm("Delete this project?")) return;
        await deleteProject(id);
        refreshProjects();
    }

    if (checking) {
        return (
            <main className="admin-page">
                <p className="muted">Checking session...</p>
            </main>
        );
    }

    return (
        <main className="admin-page">
            <div className="admin-header">
                <h1>Admin panel</h1>
                <button className="ghost-button" onClick={logout}>
                    <LogOut size={14} /> Sign out
                </button>
            </div>

            <div className="admin-tabs">
                <button className={tab === "blogs" ? "active" : ""} onClick={() => setTab("blogs")}>
                    Blogs
                </button>
                <button className={tab === "projects" ? "active" : ""} onClick={() => setTab("projects")}>
                    Projects
                </button>
                <button className={tab === "gallery" ? "active" : ""} onClick={() => setTab("gallery")}>
                    Gallery
                </button>
                <button className={tab === "discussions" ? "active" : ""} onClick={() => setTab("discussions")}>
                    Discussions
                </button>
                <button className={tab === "values" ? "active" : ""} onClick={() => setTab("values")}>
                    Values
                </button>
            </div>

            {tab === "blogs" && (
                <section>
                    <div className="admin-section-head">
                        <h2>Blog posts</h2>
                        <button className="ghost-button" onClick={() => startEditBlog()}>
                            <Plus size={14} /> New post
                        </button>
                    </div>

                    {editingBlogId && (
                        <div className="admin-form">
                            <label>
                                Title
                                <input
                                    value={blogForm.title}
                                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                />
                            </label>
                            <label>
                                Excerpt
                                <textarea
                                    rows={2}
                                    value={blogForm.excerpt}
                                    onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                                />
                            </label>
                            <label>
                                Content (Markdown)
                                <MarkdownEditor
                                    rows={12}
                                    value={blogForm.content}
                                    onChange={(v) => setBlogForm({ ...blogForm, content: v })}
                                />
                            </label>
                            <label>
                                Tags (comma separated)
                                <input
                                    value={blogForm.tags}
                                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                                />
                            </label>
                            <label>
                                Cover image URL (optional)
                                <input
                                    value={blogForm.cover_image}
                                    onChange={(e) => setBlogForm({ ...blogForm, cover_image: e.target.value })}
                                />
                            </label>
                            <label className="checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={blogForm.published}
                                    onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                                />
                                Published
                            </label>
                            <div className="admin-form-actions">
                                <button onClick={saveBlog} disabled={savingBlog}>
                                    {savingBlog ? "Saving..." : "Save post"}
                                </button>
                                <button className="ghost-button" onClick={() => setEditingBlogId(null)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="admin-list">
                        {blogs.map((b) => (
                            <div className="admin-row" key={b.id}>
                                <div>
                                    <b>{b.title}</b>
                                    <small className="muted">
                                        {b.published ? "Published" : "Draft"} · {new Date(b.created_at).toLocaleDateString()}
                                    </small>
                                </div>
                                <div className="admin-row-actions">
                                    <button className="icon-button" onClick={() => startEditBlog(b)} aria-label="Edit">
                                        <Pencil size={14} />
                                    </button>
                                    <button className="icon-button" onClick={() => removeBlog(b.id)} aria-label="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!blogs.length && <p className="muted">No posts yet.</p>}
                    </div>
                </section>
            )}
            {tab === "projects" && (
                <section>
                    <div className="admin-section-head">
                        <h2>Projects</h2>
                        <button className="ghost-button" onClick={() => startEditProject()}>
                            <Plus size={14} /> New project
                        </button>
                    </div>

                    {editingProjectId && (
                        <div className="admin-form">
                            <label>
                                Name
                                <input
                                    value={projectForm.name}
                                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                />
                            </label>
                            <label>
                                Description
                                <textarea
                                    rows={4}
                                    value={projectForm.description}
                                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                                />
                            </label>
                            <label>
                                Technologies (comma separated)
                                <input
                                    value={projectForm.technologies}
                                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                                />
                            </label>
                            <label>
                                GitHub URL
                                <input
                                    value={projectForm.github_url}
                                    onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                                />
                            </label>
                            <label>
                                Live URL
                                <input
                                    value={projectForm.live_url}
                                    onChange={(e) => setProjectForm({ ...projectForm, live_url: e.target.value })}
                                />
                            </label>
                            <label className="checkbox-row">
                                <input
                                    type="checkbox"
                                    checked={projectForm.featured}
                                    onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                                />
                                Featured
                            </label>
                            <div className="admin-form-actions">
                                <button onClick={saveProject} disabled={savingProject}>
                                    {savingProject ? "Saving..." : "Save project"}
                                </button>
                                <button className="ghost-button" onClick={() => setEditingProjectId(null)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="admin-list">
                        {projects.map((p) => (
                            <div className="admin-row" key={p.id}>
                                <div>
                                    <b>{p.name}</b>
                                    <small className="muted">{p.featured ? "Featured" : "Standard"}</small>
                                </div>
                                <div className="admin-row-actions">
                                    <button className="icon-button" onClick={() => startEditProject(p)} aria-label="Edit">
                                        <Pencil size={14} />
                                    </button>
                                    <button className="icon-button" onClick={() => removeProject(p.id)} aria-label="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!projects.length && <p className="muted">No projects yet.</p>}
                    </div>
                </section>
            )}

            {tab === "gallery" && (
                <section>
                    <div className="admin-section-head">
                        <h2>Gallery</h2>
                    </div>

                    <div className="admin-form">
                        <label>
                            Upload photo or video
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                                onChange={selectGalleryFile}
                                disabled={uploading}
                            />
                        </label>

                        {galleryPreviewUrl && galleryFile && (
                            <div className="gallery-preview">
                                {galleryFile.type.startsWith("video/") ? (
                                    <video src={galleryPreviewUrl} controls preload="metadata" />
                                ) : (
                                    <img src={galleryPreviewUrl} alt="Preview" />
                                )}
                                <label>
                                    Caption (optional)
                                    <input
                                        value={galleryCaption}
                                        onChange={(e) => setGalleryCaption(e.target.value)}
                                        placeholder="A short caption for this photo or video"
                                        autoFocus
                                    />
                                </label>
                                <div className="admin-form-actions">
                                    <button onClick={postGalleryItem} disabled={uploading}>
                                        {uploading ? "Posting..." : "Post to gallery"}
                                    </button>
                                    <button className="ghost-button" onClick={cancelGalleryUpload} disabled={uploading}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        {uploadError && <p className="error">{uploadError}</p>}
                    </div>

                    <div className="gallery-admin-grid">
                        {gallery.map((g) => (
                            <div className="gallery-admin-item" key={g.id}>
                                {g.media_type === "image" ? (
                                    <img src={mediaUrl(g.media_url)} alt={g.caption || "Gallery photo"} />
                                ) : (
                                    <GalleryVideo src={mediaUrl(g.media_url)} />
                                )}
                                <div className="gallery-admin-meta">
                                    <span>{g.caption || <em className="muted">No caption</em>}</span>
                                    <button className="icon-button" onClick={() => removeGalleryItem(g.id)} aria-label="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!gallery.length && <p className="muted">No gallery items yet. Upload your first photo or video above.</p>}
                    </div>
                </section>
            )}

            {tab === "discussions" && (
                <section>
                    <div className="admin-section-head">
                        <h2>Discussions</h2>
                        <button className="ghost-button" onClick={() => setShowDiscussionForm((v) => !v)}>
                            <Plus size={14} /> New discussion
                        </button>
                    </div>

                    {showDiscussionForm && (
                        <div className="admin-form">
                            <label>
                                Title
                                <input
                                    value={discussionForm.title}
                                    onChange={(e) => setDiscussionForm({ ...discussionForm, title: e.target.value })}
                                    placeholder="e.g. Ask me anything"
                                    autoFocus
                                />
                            </label>
                            <label>
                                Description (optional)
                                <textarea
                                    rows={2}
                                    value={discussionForm.description}
                                    onChange={(e) => setDiscussionForm({ ...discussionForm, description: e.target.value })}
                                    placeholder="What's this thread about?"
                                />
                            </label>
                            <div className="admin-form-actions">
                                <button onClick={saveDiscussion} disabled={creatingDiscussion || !discussionForm.title.trim()}>
                                    {creatingDiscussion ? "Creating..." : "Create discussion"}
                                </button>
                                <button className="ghost-button" onClick={() => setShowDiscussionForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="admin-list">
                        {discussions.map((d) => (
                            <div className="admin-row" key={d.id}>
                                <div>
                                    <b>{d.title}</b>
                                    <small className="muted">
                                        {d.message_count} message{d.message_count === 1 ? "" : "s"}
                                    </small>
                                </div>
                                <div className="admin-row-actions">
                                    <button className="icon-button" onClick={() => removeDiscussion(d.id)} aria-label="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!discussions.length && <p className="muted">No discussions yet. Create one to get started.</p>}
                    </div>
                </section>
            )}

            {tab === "values" && (
                <section>
                    <div className="admin-section-head">
                        <h2>Values</h2>
                        <button className="ghost-button" onClick={() => startEditValue()}>
                            <Plus size={14} /> New value
                        </button>
                    </div>

                    {editingValueId && (
                        <div className="admin-form">
                            <label>
                                Text (Markdown supported)
                                <MarkdownEditor
                                    rows={5}
                                    value={valueDraft}
                                    onChange={setValueDraft}
                                    placeholder="Short thought or personal advice..."
                                    autoFocus
                                    compact
                                />
                            </label>
                            <div className="admin-form-actions">
                                <button onClick={saveValue} disabled={savingValue || !valueDraft.trim()}>
                                    {savingValue ? "Saving..." : "Post"}
                                </button>
                                <button className="ghost-button" onClick={() => setEditingValueId(null)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="admin-list">
                        {values.map((v) => (
                            <div className="admin-row" key={v.id}>
                                <div>
                                    <b>{v.content.slice(0, 80)}{v.content.length > 80 ? "..." : ""}</b>
                                    <small className="muted">{new Date(v.created_at).toLocaleDateString()}</small>
                                </div>
                                <div className="admin-row-actions">
                                    <button className="icon-button" onClick={() => startEditValue(v)} aria-label="Edit">
                                        <Pencil size={15} />
                                    </button>
                                    <button className="icon-button" onClick={() => removeValue(v.id)} aria-label="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!values.length && <p className="muted">No values posted yet.</p>}
                    </div>
                </section>
            )}
        </main>
    );
}