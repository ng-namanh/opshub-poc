/**
 * components/TemplateEditor/TemplateDocumentViewer.tsx
 *
 * Renders the mammoth HTML while highlighting {{variable_key}} tokens as
 * styled crimson chips, matching the template-editor.png mockup.
 *
 * Variables that have a value assigned show a subtle tooltip indicating the
 * resolved value.
 */

import parse, { type HTMLReactParserOptions } from "html-react-parser";
import type { DOMNode, Text } from "html-react-parser";
import { VARIABLE_REGEX, type Variable } from "@/lib/template";

interface TemplateDocumentViewerProps {
	html: string;
	variables: Variable[];
	variableValues: Record<string, string>;
}

function VariableChip({
	varKey,
	value,
}: { varKey: string; value: string | undefined }) {
	return (
		<span
			title={value ? `Value: ${value}` : undefined}
			className={`
        inline-flex items-center gap-0.5
        font-mono text-[0.8em] font-semibold
        px-1.5 py-0.5 rounded mx-0.5
        border-b-2
        transition-all
        ${
					value
						? "bg-[#f5e8e8] text-[#8B1A1A] border-[#c07070]"
						: "bg-[#fdf0f0] text-[#A02020] border-[#d08080] border-dashed"
				}
      `}
		>
			{`{{${varKey}}}`}
		</span>
	);
}

export default function TemplateDocumentViewer({
	html,
	variables: _variables,
	variableValues,
}: TemplateDocumentViewerProps) {
	if (!html) return null;

	const options: HTMLReactParserOptions = {
		replace(domNode: DOMNode) {
			if (domNode.type !== "text") return;

			const textNode = domNode as unknown as Text;
			const text = textNode.data ?? "";

			// Check if text contains any {{...}} token
			const re = new RegExp(VARIABLE_REGEX.source, "g");
			if (!re.test(text)) return;

			// Reset and split
			re.lastIndex = 0;
			const parts: React.ReactNode[] = [];
			let lastIndex = 0;
			let match: RegExpExecArray | null;

			// biome-ignore lint/suspicious/noAssignInExpressions: intentional regex loop
			while ((match = re.exec(text)) !== null) {
				if (match.index > lastIndex) {
					parts.push(text.slice(lastIndex, match.index));
				}

				const varKey = match[1];
				const value = variableValues[varKey];
				parts.push(
					<VariableChip key={`${varKey}-${match.index}`} varKey={varKey} value={value} />,
				);

				lastIndex = match.index + match[0].length;
			}

			if (lastIndex < text.length) {
				parts.push(text.slice(lastIndex));
			}

			return <>{parts}</>;
		},
	};

	return (
		<div
			id="template-document-viewer"
			className="
        bg-white text-neutral-900
        rounded-xl px-14 py-12
        leading-relaxed font-serif text-[0.95rem]
        shadow-[0_4px_40px_rgba(0,0,0,0.35)]
        min-h-[60vh]
        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-[#8B1A1A] [&_h1]:uppercase [&_h1]:tracking-wide
        [&_h2]:text-xl  [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2
        [&_h3]:text-lg  [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1
        [&_p]:my-3 [&_p]:leading-7
        [&_strong]:font-bold
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
        [&_td]:border [&_td]:border-neutral-300 [&_td]:px-3 [&_td]:py-1.5
        [&_th]:border [&_th]:border-neutral-300 [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-neutral-100
        [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:bg-neutral-50 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg
        [&_hr]:border-neutral-300 [&_hr]:my-6
      "
		>
			{parse(html, options)}
		</div>
	);
}
