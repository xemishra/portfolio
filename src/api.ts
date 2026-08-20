export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type VoteItemType = "blog" | "guestbook" | "gallery" | "discussion" | "value";

export type VoteSummary = {
    upvotes: number;
    downvotes: number;
    my_vote: 1 | -1 | null;
};

export type Project = {
    id: string;
    name: string;
    slug: string;
    description: string;
    technologies: string[];
    github_url?: string | null;
    live_url?: string | null;
    featured: boolean;
    created_at: string;
};

export type BlogListItem = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image?: string | null
    tags: string[];
    published: boolean;
    created_at: string;
    votes: VoteSummary;
};

export type Blog = BlogListItem & {
    content: string;
    updated_at: string;
};

export type BlogPage = {
    items: BlogListItem[];
    total: number;
};

export type GuestbookEntry = {
    id: string;
    github_login: string;
    name: string;
    avatar_url?: string | null;
    message: string;
    created_at: string;
    votes: VoteSummary;
}

export type GuestbookPage = {
    items: GuestbookEntry[];
    total: number;
};

export type GalleryMediaType = "image" | "video";

export type GalleryItem = {
    id: string;
    caption: string;
    media_type: GalleryMediaType;
    media_url: string;
    created_at: string;
    votes: VoteSummary;
};

export type GalleryPage = {
    items: GalleryItem[];
    total: number;
};

export type DiscussionTopic = {
    id: string;
    title: string;
    slug: string;
    description: string;
    created_at: string;
    message_count: number;
};

export type DiscussionMessage = {
    id: string;
    topic_id: string;
    github_login: string;
    name: string;
    avatar_url: string | null;
    content: string;
    created_at: string;
    votes: VoteSummary;
};

export type DiscussionMessagePage = {
    items: DiscussionMessage[];
    total: number;
};

export type ValueItem = {
    id: string;
    content: string;
    created_at: string;
    votes: VoteSummary;
};

export type ValuePage = {
    items: ValueItem[];
    total: number;
};

export type PullRequest = {
    number: number;
    title: string;
    repo: string;
    url: string;
    state: "open" | "merged" | "closed";
    created_at: string;
    closed_at: string | null;
};

export type PullRequestResponse = {
    all: PullRequest[];
    open: PullRequest[];
    merged: PullRequest[];
    closed: PullRequest[];
    counts: { open: number; merged: number; closed: number };
};

export type GithubActivity = {
    total: Record<string, number>;
    contributions: { date: string; count: number; level: number }[];
}

const TOKEN_KEY = "admin_token";

export function getAdminToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let detail = "Request failed";
        try {
            detail = (await res.json()).detail ?? detail;
        } catch {
            // ignore
        }
        throw new Error(detail)
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

export async function getProjects(limit?: number): Promise<Project[]> {
    const params = limit ? `?limit=${limit}` : "";
    return handle(await fetch(`${API_URL}/api/projects${params}`));
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
    return handle(
        await fetch(`${API_URL}/api/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(payload),
        })
    );
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
    return handle(
        await fetch(`${API_URL}/api/projects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify(payload),
        })
    );
}

export async function deleteProject(id: string): Promise<void> {
    return handle(
        await fetch(`${API_URL}/api/projects/${id}`, { method: "DELETE", headers: authHeaders() })
    );
}

export async function getLatestBlogs(limit = 4): Promise<BlogListItem[]> {
    return handle(await fetch(`${API_URL}/api/blogs/latest?limit=${limit}`, { credentials: "include" }));
}

export async function getBlogs(q = "", skip = 0, limit = 20): Promise<BlogPage> {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (q) params.set("q", q);
    return handle(await fetch(`${API_URL}/api/blogs?${params.toString()}`, { credentials: "include" }));
}

export async function getBlog(slug: string): Promise<Blog> {
    return handle(await fetch(`${API_URL}/api/blogs/${slug}`, { credentials: "include" }));
}

export async function getAdminBlogs(): Promise<Blog[]> {
    return handle(await fetch(`${API_URL}/api/admin/blogs`, { headers: authHeaders() }));
}

export async function createBlog(payload: Partial<Blog>): Promise<Blog> {
    return handle(
        await fetch(`${API_URL}/api/blogs`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(payload),
        })
    );
}

export async function updateBlog(id: string, payload: Partial<Blog>): Promise<Blog> {
    return handle(
        await fetch(`${API_URL}/api/blogs/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(payload),
        })
    );
}

export async function deleteBlog(id: string): Promise<void> {
    return handle(
        await fetch(`${API_URL}/api/blogs/${id}`, { method: "DELETE", headers: authHeaders() })
    );
}

export async function getGallery(skip = 0, limit = 20): Promise<GalleryPage> {
    return handle(
        await fetch(`${API_URL}/api/gallery?skip=${skip}&limit=${limit}`, { credentials: "include" })
    )
}

export async function createGalleryItem(payload: {
    caption: string;
    media_type: GalleryMediaType;
    media_url: string;
}): Promise<GalleryItem> {
    return handle(
        await fetch(`${API_URL}/api/gallery`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(payload),
        })
    );
}

export async function deleteGalleryItem(id: string): Promise<void> {
    return handle(
        await fetch(`${API_URL}/api/gallery/${id}`, { method: "DELETE", headers: authHeaders() })
    );
}

export async function uploadMedia(file: File): Promise<{ url: string; media_type: GalleryMediaType }> {
    const form = new FormData();
    form.append('file', file);
    return handle(
        await fetch(`${API_URL}/api/uploads`, {
            method: "POST",
            headers: authHeaders(),
            body: form,
        })
    );
}

export function mediaUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`
}


export async function getGuestbook(skip = 0, limit = 20): Promise<GuestbookPage> {
    return handle(
        await fetch(`${API_URL}/api/guestbook?skip=${skip}&limit=${limit}`, { credentials: "include" })
    );
}

export async function getMe() {
    const res = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
}

export async function addGuestbook(message: string): Promise<GuestbookEntry> {
    return handle(
        await fetch(`${API_URL}/api/guestbook`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "appliction/json" },
            body: JSON.stringify({ message }),
        })
    );
}

export async function castVote(
    itemType: VoteItemType,
    itemId: string,
    direction: 1 | -1
): Promise<VoteSummary> {
    return handle(
        await fetch(`${API_URL}/api/votes`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_type: itemType, item_id: itemId, direction }),
        })
    );
}

export async function getDiscussionTopics(limit?: number): Promise<DiscussionTopic[]> {
    const params = limit ? `?limit=${limit}` : "";
    return handle(await fetch(`${API_URL}/api/discussions${params}`));
}

export async function getDiscussionTopic(slug: string): Promise<DiscussionTopic> {
    return handle(await fetch(`${API_URL}/api/discussions/${slug}`));
}

export async function createDiscussionTopic(payload: {
    title: string;
    description: string;
}): Promise<DiscussionTopic> {
    return handle(
        await fetch(`${API_URL}/api/discussions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(payload),
        })
    );
}

export async function deleteDiscussionTopic(id: string): Promise<void> {
    return handle(
        await fetch(`${API_URL}/api/discussions/${id}`, { method: "DELETE", headers: authHeaders() })
    );
}

export async function getDiscussionMessages(
    topicId: string,
    skip = 0,
    limit = 30
): Promise<DiscussionMessagePage> {
    return handle(
        await fetch(`${API_URL}/api/discussions/${topicId}/messages?skip=${skip}&limit=${limit}`)
    );
}

export function discussionWebsocketUrl(topicId: string): string {
    const wsProtocol = API_URL.startsWith("https") ? "wss" : "ws";
    const host = API_URL.replace(/^https?:\/\//, "");
    return `${wsProtocol}://${host}/api/discussions/ws/${topicId}`;
}

export async function getGithubActivity(): Promise<GithubActivity> {
    return handle(await fetch(`${API_URL}/api/github-activity`));
}

export async function getValues(skip = 0, limit = 20): Promise<ValuePage> {
    return handle(
        await fetch(`${API_URL}/api/values?skip=${skip}&limit=${limit}`, { credentials: "include" })
    );
}

export async function getLatestValues(limit = 3): Promise<ValueItem[]> {
    return handle(await fetch(`${API_URL}/api/values/latest?limit=${limit}`, { credentials: "include" }));
}

export async function createValue(content: string): Promise<ValueItem> {
    return handle(
        await fetch(`${API_URL}/api/values`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ content }),
        })
    )
}

export async function updateValue(id: string, content: string): Promise<ValueItem> {
    return handle(
        await fetch(`${API_URL}/api/values/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ content })
        })
    )
}

export async function deleteValue(id: string): Promise<void> {
    return handle(await fetch(`${API_URL}/api/values/${id}`, { method: "DELETE", headers: authHeaders() }))
}

export async function getGithubPRs(): Promise<PullRequestResponse> {
    return handle(await fetch(`${API_URL}/api/github-prs`));
}

export async function adminLogin(username: string, password: string): Promise<string> {
    const data = await handle<{ access_token: string }>(
        await fetch(`${API_URL}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
    );
    setAdminToken(data.access_token)
    return data.access_token;
}

export async function adminMe(): Promise<{ username: string } | null> {
    const token = getAdminToken();
    if (!token) return null;
    try {
        return await handle(await fetch(`${API_URL}/api/admin/me`, { headers: authHeaders() }));
    } catch {
        return null
    }
}
