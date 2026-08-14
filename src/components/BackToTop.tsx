import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > 400);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!visible) return null;

    return (
        <button
            className='back-to-top'
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label='Back to top'
            title='Back to top'
        >
            <ArrowUp size={16} />
            <span>Back to top</span>
        </button>
    );
}