import { marked } from "marked";
import DomPurify from 'dompurify'
import { useMemo } from "react";

const ALERT_LEBELS: Record<string, string> = {
    NOTE: "Note",
    TIP: "Tip",
    IMPORTANT: "Important",
    WARNING: "Warning",
    CAUTION: "Caution",
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function buildRenderer() {
    const renderer = new marked.Renderer();

    renderer.code = function ({ text, lang }) {
        const language = (lang || "").trim().split(/\s+/)[0] || "text";
        const escaped = escapeHtml(text.replace(/\n$/, ""));
        return `<pre class="code-block" data-lang="${escapeHtml(language)}"><code>${escaped}</code></pre>\n`;
    };

    renderer.codespan = function ({ text }) {
        return `<code>${escapeHtml(text)}</code>`;
    };

    renderer.blockquote = function (token) {
        const body = this.parser.parse(token.tokens);
        const match = body.match(/^<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
        if (!match) {
            return `<blockquote>\n${body}</blockquote\n`;
        }
        const type = match[1].toUpperCase();
        const label = ALERT_LEBELS[type];
        const rest = body.slice(match[0].length).replace(/<\/p>\s*$/, "");
        return `<div class="md-alert md-alert-${type.toLocaleLowerCase()}"><p class="md-alert-title">${label}</p><p>${rest}</p></div>\n`;
    };

    renderer.link = function ({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const isExternal = /^https?:\/\//i.test(href);
        const attrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : "";
        const titleAttr = title ? `title="${title}"` : "";
        return `<a href="${href}"${titleAttr}${attrs}>${text}</a>`;
    };

    renderer.image = function ({ href, title, text }) {
        const titleAttr = title ? `title="${title}"` : "";
        return `<img src="${href}" alt="${text}"${titleAttr} loading"lazy" />`;
    };

    return renderer;
}

export default function Markdown({ content, compact = false }: { content: string; compact?: boolean }) {
    const html = useMemo(() => {
        const renderer = buildRenderer();
        const raw = marked.parse(content, { async: false, gfm: true, renderer }) as string;
        return DomPurify.sanitize(raw, { ADD_ATTR: ["target"] });
    }, [content]);

    return (
        <div
            className={content ? "markdown markdown-compact" : "markdown"}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
