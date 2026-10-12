import React, { useEffect, useRef, useState } from 'react';

function exec(command, value = null) {
    if (typeof document === 'undefined') return;
    document.execCommand(command, false, value);
}

function ToolbarButton({ active = false, onMouseDown, children, title }) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={onMouseDown}
            className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                active
                    ? 'border-sky-300 bg-sky-50 text-sky-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
        >
            {children}
        </button>
    );
}

export default function SummernoteEditor({
    value = '',
    onChange,
    placeholder = 'Write content here...',
    height = 420,
}) {
    const editorRef = useRef(null);
    const isFocusedRef = useRef(false);
    const [htmlMode, setHtmlMode] = useState(false);
    const [sourceValue, setSourceValue] = useState(value || '');

    useEffect(() => {
        setSourceValue(value || '');
    }, [value]);

    useEffect(() => {
        if (!htmlMode && editorRef.current && !isFocusedRef.current) {
            editorRef.current.innerHTML = value || '';
        }
    }, [htmlMode, value]);

    const syncChange = () => {
        if (!editorRef.current) return;
        const next = editorRef.current.innerHTML;
        onChange?.(next);
    };

    const handleFormat = (command, commandValue = null) => {
        exec(command, commandValue);
        editorRef.current?.focus();
        syncChange();
    };

    const handleLink = () => {
        const url = window.prompt('Enter link URL');
        if (!url) return;
        handleFormat('createLink', url);
    };

    const toggleHtmlMode = () => {
        if (htmlMode) {
            const nextHtml = sourceValue;
            onChange?.(nextHtml);
            setHtmlMode(false);
            requestAnimationFrame(() => {
                if (editorRef.current) {
                    editorRef.current.innerHTML = nextHtml;
                }
            });
            return;
        }

        setSourceValue(editorRef.current?.innerHTML || '');
        setHtmlMode(true);
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
                <ToolbarButton title="Bold" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }}>
                    B
                </ToolbarButton>
                <ToolbarButton title="Underline" onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }}>
                    U
                </ToolbarButton>
                <ToolbarButton title="Italic" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }}>
                    I
                </ToolbarButton>
                <ToolbarButton title="Bullet List" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }}>
                    • List
                </ToolbarButton>
                <ToolbarButton title="Numbered List" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }}>
                    1.
                </ToolbarButton>
                <ToolbarButton title="Link" onMouseDown={(e) => { e.preventDefault(); handleLink(); }}>
                    Link
                </ToolbarButton>
                <ToolbarButton title="Code View" onMouseDown={(e) => { e.preventDefault(); toggleHtmlMode(); }}>
                    {'</>'}
                </ToolbarButton>
            </div>

            {!htmlMode ? (
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onFocus={() => { isFocusedRef.current = true; }}
                    onBlur={() => { isFocusedRef.current = false; syncChange(); }}
                    onInput={syncChange}
                    data-placeholder={placeholder}
                    className="min-h-[420px] w-full rounded-b-xl px-4 py-4 text-sm outline-none"
                    style={{ minHeight: `${height}px` }}
                />
            ) : (
                <textarea
                    value={sourceValue}
                    onChange={(e) => setSourceValue(e.target.value)}
                    className="min-h-[420px] w-full rounded-b-xl px-4 py-4 font-mono text-sm outline-none"
                    style={{ minHeight: `${height}px` }}
                    placeholder={placeholder}
                />
            )}

            <style>{`
                [contenteditable="true"]:empty:before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                }
                [contenteditable="true"] p {
                    margin: 0 0 1rem;
                }
                [contenteditable="true"] h1,
                [contenteditable="true"] h2,
                [contenteditable="true"] h3,
                [contenteditable="true"] h4 {
                    margin: 1.25rem 0 0.75rem;
                }
            `}</style>
        </div>
    );
}
