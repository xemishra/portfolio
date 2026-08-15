import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api";
import { LogIn } from "lucide-react";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await adminLogin(username, password);
            navigate("/admin");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="admin-page">
            <form className="admin-login" onSubmit={submit}>
                <h1>Admin login</h1>
                <p className="muted">Sign in to manage blog posts and projects.</p>
                <label>
                    Username
                    <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    <LogIn size={15} /> {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </main>
    );
}
