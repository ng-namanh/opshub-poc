/**
 * components/TemplateEditor/TemplateEditorPane.tsx
 *
 * The Tiptap rich-text editor pane — renders as a white document card
 * with the formatting toolbar on top. {{variable}} chips are rendered
 * via the custom VariableNode extension.
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import type { Editor, JSONContent } from "@tiptap/react";
import { VariableNode } from "@/extensions/VariableNode";
import EditorToolbar from "./EditorToolbar";
import { useEffect } from "react";

/**
 * Walk the Tiptap JSON doc tree and collect every variableNode key.
 * Returns a Set so callers can easily check for new keys.
 */
function collectVariableKeys(node: JSONContent): Set<string> {
	const keys = new Set<string>();
	if (node.type === "variableNode" && node.attrs?.key) {
		keys.add(node.attrs.key as string);
	}
	for (const child of node.content ?? []) {
		for (const k of collectVariableKeys(child)) {
			keys.add(k);
		}
	}
	return keys;
}

interface TemplateEditorPaneProps {
	/** Initial HTML content (e.g. from mammoth) */
	initialHtml?: string;
	/** Called whenever editor content changes */
	onUpdate?: (html: string) => void;
	/** Exposes the editor instance upward so parent can call insertVariable */
	onEditorReady?: (editor: Editor) => void;
	/**
	 * Called with every unique variable key found in the doc.
	 * Parent uses this to auto-register newly typed {{variables}}.
	 */
	onVariableTyped?: (key: string) => void;
}

export default function TemplateEditorPane({
	initialHtml,
	onUpdate,
	onEditorReady,
	onVariableTyped,
}: TemplateEditorPaneProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				// Disable heading shortcut conflicts
				heading: { levels: [1, 2, 3] },
			}),
			Underline,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Placeholder.configure({
				placeholder:
					'Start typing your template here… or upload a .docx file above. Use {{variable_name}} syntax or click Insert from the sidebar to add variable tokens.',
				emptyEditorClass: "is-editor-empty",
			}),
			VariableNode,
		],
		content: initialHtml ?? "",
		onUpdate({ editor: ed }) {
			onUpdate?.(ed.getHTML());

			// Scan the document for variableNode atoms and report any new keys
			if (onVariableTyped) {
				const keys = collectVariableKeys(ed.getJSON());
				for (const key of keys) {
					onVariableTyped(key);
				}
			}
		},
		editorProps: {
			attributes: {
				class: "tiptap-editor-body",
				spellcheck: "true",
			},
		},
	});

	// Forward editor instance upward once ready
	useEffect(() => {
		if (editor) onEditorReady?.(editor);
	}, [editor, onEditorReady]);

	// Update content when prop changes (e.g. file uploaded)
	useEffect(() => {
		if (!editor || initialHtml === undefined) return;
		// Only update if content actually changed to avoid cursor jumps
		if (editor.getHTML() !== initialHtml) {
			editor.commands.setContent(initialHtml);
		}
	}, [editor, initialHtml]);

	return (
		<div className="flex flex-col rounded-xl overflow-hidden shadow-md border border-border bg-card">
			<EditorToolbar editor={editor} />

			{/* Editor surface — white document */}
			<div
				id="template-editor-surface"
				className="
          bg-white min-h-[60vh]
          px-14 py-12
          font-serif text-foreground text-[0.95rem] leading-7
          cursor-text
          [&_.tiptap-editor-body]:outline-none
          [&_.tiptap-editor-body]:min-h-[50vh]
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3
          [&_h1]:text-primary [&_h1]:uppercase [&_h1]:tracking-wide
          [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1
          [&_p]:my-2 [&_p]:leading-7
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
          [&_li]:my-0.5
          [&_strong]:font-bold
          [&_em]:italic
          [&_u]:underline
          [&_s]:line-through
          [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300
          [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
          [&_blockquote]:bg-neutral-50 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg
          [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
          [&_td]:border [&_td]:border-neutral-300 [&_td]:px-3 [&_td]:py-1.5
          [&_th]:border [&_th]:border-neutral-300 [&_th]:px-3 [&_th]:py-1.5
          [&_th]:bg-neutral-100
          [&_hr]:border-neutral-300 [&_hr]:my-6
        "
			>
				{/* Placeholder text */}
				<style>{`
          .tiptap-editor-body.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #a3a3a3;
            font-style: italic;
            font-family: system-ui, sans-serif;
            font-size: 0.875rem;
            pointer-events: none;
            height: 0;
            white-space: pre-line;
          }
          /* Variable chip styling inside the editor */
          .tiptap-editor-body .variable-chip {
            display: inline-flex;
            align-items: center;
            font-family: ui-monospace, monospace;
            font-size: 0.8em;
            font-weight: 600;
            padding: 1px 6px;
            border-radius: 4px;
            margin: 0 2px;
            background: var(--primary);
            color: var(--primary-foreground);
            border-bottom: 2px dashed var(--border);
            cursor: default;
            user-select: none;
            transition: opacity 0.15s;
          }
          .tiptap-editor-body .variable-chip.ProseMirror-selectednode {
            opacity: 0.8;
            outline: 2px solid var(--primary);
            border-radius: 4px;
          }
        `}</style>
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}
