import { useEffect } from "react";

type MetaTag = { name?: string; property?: string; content: string };

export type SeoProps = {
    title: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    robots?: string;
    og?: { type?: string; title?: string; description?: string; url?: string; image?: string };
    twitterCard?: string;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    extraMeta?: MetaTag[];
};

const SITE_NAME = "Shivanand Mishra";
const DEFAULT_OG_IMAGE = "https://xemishra.xyz/assets/og-default.png";

const MANAGED_ATTR = "data-seo-managed";

function upsertMeta(selector: string, attrs: Record<string, string>) {
    let el = document.head.querySelector<HTMLMetaElement>(selector);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(MANAGED_ATTR, "true");
        document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string) {
    let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][${MANAGED_ATTR}]`);
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        el.setAttribute(MANAGED_ATTR, "true");
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}


export default function Seo(props: SeoProps) {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = props.title;

        if (props.description) {
            upsertMeta('meta[name="description"][data-seo-managed]', {
                name: "description",
                content: props.description
            });
        }
        if (props.keywords && props.keywords.length) {
            upsertMeta('meta[name="keywords"][data-seo-managed]', {
                name: "keywords",
                content: props.keywords.join(", "),
            });
        }
        upsertMeta('meta[name="robots"][data-seo-managed]', {
            name: "robots",
            content: props.robots ?? "index, follow",
        });
        if (props.canonical) {
            upsertLink("canonical", props.canonical);
        }
        const ogImage = props.og?.image ?? DEFAULT_OG_IMAGE;
        {
            const { type, title, description, url } = props.og ?? {};
            upsertMeta('meta[property="og:site_name"][data-seo-managed]', {
                property: "og:site_name",
                content: SITE_NAME,
            });
            if (type) upsertMeta('meta[property="og:type"][data-seo-managed]', { property: "og:type", content: type });
            upsertMeta('meta[property="og:title"][data-seo-managed]', {
                property: "og:title",
                content: title ?? props.title,
            });
            if (description ?? props.description)
                upsertMeta('meta[property="og:description"][data-seo-managed]', {
                    property: "og:description",
                    content: description ?? props.description!,
                });
            if (url) upsertMeta('meta[property="og:url"][data-seo-managed]', { property: "og:url", content: url });
            upsertMeta('meta[property="og:image"][data-seo-managed]', { property: "og:image", content: ogImage });
            upsertMeta('meta[property="og:image:alt"][data-seo-managed]', {
                property: "og:image:alt",
                content: title ?? props.title,
            })
        }
        upsertMeta('meta[name="twitter:card"][data-seo-managed]', {
            name: "twitter:card",
            content: props.twitterCard ?? (props.og?.image ? "summary_large_image" : "summary"),
        });
        upsertMeta('meta[name="twitter:title"][data-seo-managed]', {
            name: "twitter:title",
            content: props.og?.title ?? props.title,
        });
        if (props.og?.description ?? props.description)
            upsertMeta('meta[name="twitter:description"][data-seo-managed]', {
                name: "twitter:description",
                content: props.og?.description ?? props.description!,
            });
        upsertMeta('meta[name="twitter:image"][data-seo-managed]', { name: "twitter:image", content: ogImage });

        (props.extraMeta ?? []).forEach((m, i) => {
            const key = m.name ? `name="${m.name}"` : `property="${m.property}"`;
            upsertMeta(`meta[${key}][data-seo-extra="${i}"]`, {
                ...(m.name ? { name: m.name } : { property: m.property! }),
                content: m.content,
                "data-seo-extra": String(i),
            });
        });

        let ldScripts: HTMLScriptElement[] = [];
        if (props.jsonLd) {
            const entries = Array.isArray(props.jsonLd) ? props.jsonLd : [props.jsonLd];
            ldScripts = entries.map((entry) => {
                const el = document.createElement("script");
                el.type = "application/ld+json";
                el.setAttribute(MANAGED_ATTR, "true");
                el.textContent = JSON.stringify(entry);
                document.head.appendChild(el);
                return el;
            });
        }

        return () => {
            document.title = prevTitle;
            document.head.querySelectorAll(`[${MANAGED_ATTR}]`).forEach((el) => el.remove());
            ldScripts.forEach((el) => el.remove());
        };
        
    }, [JSON.stringify(props)]);

    return null;
}