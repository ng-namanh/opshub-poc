/**
 * lib/template.ts
 *
 * Utilities for the V2 Template Editor tab.
 * Handles {{variable_key}} token extraction and HTML rendering.
 */

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import mammoth from "mammoth";
import { HtmlToDocxService } from "@packback/html-to-docx";
import { Packer } from "docx";

// ── Types ────────────────────────────────────────────────────────────────────

export type VariableDataType = "Text" | "Number" | "Date";

export interface Variable {
	/** Mustache-style key used in the document: {{key}} */
	key: string;
	/** Human-readable label shown in the sidebar */
	label: string;
	dataType: VariableDataType;
}

// ── Regex ────────────────────────────────────────────────────────────────────

/** Matches {{variable_key}} tokens — allows letters, digits, underscore */
export const VARIABLE_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

// ── Extraction ───────────────────────────────────────────────────────────────

/**
 * Scan an HTML string and return every unique variable key
 * found inside {{...}} tokens, in order of first occurrence.
 */
export function extractVariableKeys(html: string): string[] {
	const seen = new Set<string>();
	const keys: string[] = [];
	let m: RegExpExecArray | null;
	const re = new RegExp(VARIABLE_REGEX.source, "g");
	// biome-ignore lint/suspicious/noAssignInExpressions: intentional regex loop
	while ((m = re.exec(html)) !== null) {
		if (!seen.has(m[1])) {
			seen.add(m[1]);
			keys.push(m[1]);
		}
	}
	return keys;
}

// ── Mammoth parsing ──────────────────────────────────────────────────────────

export interface TemplateParseResult {
	html: string;
	messages: Array<{ type: string; message: string }>;
}

/**
 * Convert a .docx ArrayBuffer to HTML, preserving {{variable}} tokens that
 * mammoth passes through as plain text.
 */
export async function parseTemplateDocx(
	buffer: ArrayBuffer,
): Promise<TemplateParseResult> {
	const result = await mammoth.convertToHtml(
		{ arrayBuffer: buffer },
		{
			styleMap: [
				"p[style-name='Heading 1'] => h1",
				"p[style-name='Heading 2'] => h2",
				"p[style-name='Heading 3'] => h3",
			],
		},
	);
	return {
		html: result.value,
		messages: result.messages as Array<{ type: string; message: string }>,
	};
}

// ── DOCX export ──────────────────────────────────────────────────────────────

// ── HTML → DOCX (Tiptap editor export) ──────────────────────────────────────

/**
 * Pre-process editor HTML before exporting:
 * - Converts <span data-variable="key">…</span> back to {{key}} text
 * - In "filled" mode substitutes actual values instead
 */
function preprocessEditorHtml(
	html: string,
	variableValues: Record<string, string>,
	mode: "template" | "filled",
): string {
	return html.replace(
		/<span[^>]*data-variable="([^"]+)"[^>]*>.*?<\/span>/g,
		(_match, key: string) => {
			if (mode === "filled") {
				return variableValues[key] ?? `{{${key}}}`;
			}
			return `{{${key}}}`;
		},
	);
}

/**
 * Export the Tiptap editor HTML as a .docx file.
 *
 * @param html           - Raw HTML from `editor.getHTML()`
 * @param variableValues - Current variable values
 * @param filename       - Download filename
 * @param mode           - "template" keeps {{tokens}}, "filled" substitutes values
 */
export async function exportEditorAsDocx(
	html: string,
	variableValues: Record<string, string>,
	filename = "template.docx",
	mode: "template" | "filled" = "template",
): Promise<void> {
	// Strip variable chips back to text tokens
	const processedHtml = preprocessEditorHtml(html, variableValues, mode);

	const docxDocument = await HtmlToDocxService.convertHtmlToDocument({
		htmlContent: processedHtml,
		documentSettings: {
			font_family: "times-new-roman",
			font_size: 12,
		},
	});

	const blob = await Packer.toBlob(docxDocument);
	saveAs(blob, filename);
}

/**
 * Replace {{variable_key}} tokens in the raw .docx XML with values from
 * `variableValues`, then trigger a browser download of the filled file.
 *
 * Uses docxtemplater with mustache-style tags `{{key}}`.
 */
export function exportTemplateDocx(
	buffer: ArrayBuffer,
	variableValues: Record<string, string>,
	filename = "filled-template.docx",
): void {
	const zip = new PizZip(buffer);
	const doc = new Docxtemplater(zip, {
		paragraphLoop: true,
		linebreaks: true,
		// docxtemplater default tags are already {{ }}, so no config needed
	});

	doc.render(variableValues);

	const blob = doc.getZip().generate({
		type: "blob",
		mimeType:
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	});

	saveAs(blob, filename);
}
