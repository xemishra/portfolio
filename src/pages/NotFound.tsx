import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
    return (
        <main className="blog-page">
            <Seo title="Page not found | Shivanand Mishra" robots="noindex" />
            <section className="blog-hero">
                <h1>404</h1>
                <p className="hero-copy">That page doesn't exist.</p>
            </section>
            <Link className="view-all" to="/">
                <ArrowLeft size={14} /> Back home
            </Link>
        </main>
    );
}
