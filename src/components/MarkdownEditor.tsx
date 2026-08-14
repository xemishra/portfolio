import { useState } from "react";
import Markdown from "./Markdown";

type MarkdownEditorProps = {
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    placeholder?: string;
    autoFocus?: boolean;
    compact?: boolean;
    maxLenght?: number;
    disabled?: boolean;
};

export default function MarkdownEditor({
    value,
    onChange,
    rows = 12,
    placeholder,
    autoFocus,
    compact = false,
    maxLenght,
    disabled,
}: MarkdownEditorProps) {
    const [mode, setMode] = useState<"write" | "preview">("write");
    return (
        <div className="md-editor">
            <div className="md-editor-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "write"}
                    className={mode === "write" ? "active" : ""}
                    onClick={() => setMode("write")}
                >
                    Write
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "preview"}
                    className={mode === "preview" ? "active" : ""}
                    onClick={() => setMode("preview")}
                >
                    Preview
                </button>
            </div>

            {
                mode === "write" ? (
                    <textarea
                        rows={rows}
                        className="mono"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        maxLength={maxLenght}
                        disabled={disabled}
                    />
                ) : (
                    <div className="md-editor-preview" style={{ minHeight: `${rows * 1.6}em` }}>
                        {value.trim() ? (
                            <Markdown content={value} compact={compact} />
                        ) : (
                            <p className="muted">Nothing to preview yet, write some Markdown first.</p>
                        )}
                    </div>
                )}
        </div>
    );
}

