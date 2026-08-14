import { Link, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Nav() {
    const [menu, setMenu] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!menu) return;

        function handleOutside(e: MouseEvent | TouchEvent) {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setMenu(false);
            }
        }

        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);
        return () => {
            document.addEventListener('mousedown', handleOutside);
            document.addEventListener('touchstart', handleOutside);
        };
    }, [menu]);

    return (
        <header className="nav" ref={navRef}>
            <Link className="brand" to="/">
                xemishra
            </Link>
            <button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Menu">
                {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
            <nav className={menu ? "navlinks open" : "navlinks"}>
                <Link to="/projects" onClick={() => setMenu(false)}>
                    projects
                </Link>
                <Link to="/#activity" onClick={() => setMenu(false)}>
                    activity
                </Link>
                <Link to="/gallery" onClick={() => setMenu(false)}>
                    gallery
                </Link>
                <Link to="/blog" onClick={() => setMenu(false)}>
                    blog
                </Link>
                <Link to="/values" onClick={() => setMenu(false)}>
                    values
                </Link>
                <Link to="/discussion" onClick={() => setMenu(false)}>
                    discussion
                </Link>
                <Link to="/contributions" onClick={() => setMenu(false)}>
                    contributions
                </Link>
                <Link to="/guestbook" onClick={() => setMenu(false)}>
                    guestbook
                </Link>

            </nav>
        </header>
    );

}