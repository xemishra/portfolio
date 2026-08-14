import { useCallback, useEffect, useRef, useState } from 'react'

type Page<T> = { items: T[]; total: number };

export function useInfiniteList<T>(
    fetchPage: (skip: number, limit: number) => Promise<Page<T>>,
    pageSize: 20,
    deps: unknown[] = []
) {
    const [items, setItems] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const loadPage = useCallback(
        async (skip: number, replace: boolean) => {
            const setBusy = replace ? setLoading : setLoadingMore;
            setBusy(true);
            try {
                const page = await fetchPage(skip, pageSize);
                setItems((prev) => (replace ? page.items : [...prev, ...page.items]));
                setTotal(page.total);
            } finally {
                setBusy(false);
            }
        },
        [pageSize, ...deps]
    );

    useEffect(() => {
        loadPage(0, true)

    }, deps);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !loading && !loadingMore && items.length < total) {
                    loadPage(items.length, false);
                }
            },
            { rootMargin: "300px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [items.length, total, loading, loadingMore, loadPage]);

    const hasMore = items.length < total

    return { items, total, loading, loadingMore, hasMore, sentinelRef };
}
