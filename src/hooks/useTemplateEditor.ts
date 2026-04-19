/**
 * hooks/useTemplateEditor.ts
 *
 * State machine for the V2 Template Editor tab.
 * Manages variables, values, editor content, and persistence.
 *
 * Persistence model:
 *  - templates          (id, title, content_html, filename, created_at, updated_at)
 *  - template_variables (id, template_id FK, key, label, data_type)
 */

import {
	type Variable,
	type VariableDataType,
	extractVariableKeys,
	exportEditorAsDocx,
	parseTemplateDocx,
} from "@/lib/template";
import { supabase } from "@/lib/supabase";
import { useCallback, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { TemplateDocument } from "./useTemplateDocuments";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TemplateEditorState {
	html: string;
	title: string;
	filename: string;
	currentTemplateId: string | null;
	variables: Variable[];
	variableValues: Record<string, string>;
	searchQuery: string;
	isSaving: boolean;
	isExporting: boolean;
	isLoading: boolean;
	saveSuccess: boolean;
	errorMsg: string | null;
	newKey: string;
	newLabel: string;
	newDataType: VariableDataType;
}

export interface TemplateEditorActions {
	handleFile: (file: File) => Promise<void>;
	handleLoad: (doc: TemplateDocument) => void;
	handleReset: () => void;
	setTitle: (title: string) => void;
	setEditorInstance: (editor: Editor) => void;
	insertVariableAtCursor: (key: string) => void;
	handleVariableTyped: (key: string) => void;
	// Variable CRUD
	addVariable: () => void;
	updateVariable: (key: string, patch: Partial<Omit<Variable, "key">>) => void;
	deleteVariable: (key: string) => void;
	updateValue: (key: string, value: string) => void;
	// Form
	setNewKey: (v: string) => void;
	setNewLabel: (v: string) => void;
	setNewDataType: (v: VariableDataType) => void;
	// Search
	setSearchQuery: (q: string) => void;
	// Persistence
	handleSave: () => Promise<void>;
	handleSaveAs: () => Promise<void>;
	handleExport: (mode?: "template" | "filled") => Promise<void>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTemplateEditor(): TemplateEditorState & TemplateEditorActions {
	const editorRef = useRef<Editor | null>(null);

	const [html, setHtml] = useState("");
	const [title, setTitle] = useState("Untitled Template");
	const [filename, setFilename] = useState("");
	const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
	const [variables, setVariables] = useState<Variable[]>([]);
	const [variableValues, setVariableValues] = useState<Record<string, string>>({});
	const [searchQuery, setSearchQuery] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [newKey, setNewKey] = useState("");
	const [newLabel, setNewLabel] = useState("");
	const [newDataType, setNewDataType] = useState<VariableDataType>("Text");

	// ── Editor instance ───────────────────────────────────────────────────────

	const setEditorInstance = useCallback((editor: Editor) => {
		editorRef.current = editor;
	}, []);

	const insertVariableAtCursor = useCallback((key: string) => {
		editorRef.current?.chain().focus().insertVariable(key).run();
	}, []);

	const handleVariableTyped = useCallback((key: string) => {
		setVariables((prev) => {
			if (prev.some((v) => v.key === key)) return prev;
			return [
				...prev,
				{
					key,
					label: key
						.split("_")
						.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
						.join(" "),
					dataType: "Text" as VariableDataType,
				},
			];
		});
	}, []);

	// ── File upload ───────────────────────────────────────────────────────────

	const handleFile = useCallback(async (file: File) => {
		setErrorMsg(null);
		setSaveSuccess(false);
		setIsLoading(true);
		setFilename(file.name);
		// New file → new document (lose current template link)
		setCurrentTemplateId(null);
		setTitle(file.name.replace(/\.docx$/i, ""));

		try {
			const buffer = await file.arrayBuffer();
			const { html: parsed, messages } = await parseTemplateDocx(buffer);
			if (messages.some((m) => m.type === "error")) {
				console.warn("mammoth messages:", messages);
			}
			setHtml(parsed);

			// Auto-discover {{variable}} tokens in the uploaded doc
			const foundKeys = extractVariableKeys(parsed);
			setVariables((prev) => {
				const existingKeys = new Set(prev.map((v) => v.key));
				const discovered: Variable[] = foundKeys
					.filter((k) => !existingKeys.has(k))
					.map((k) => ({
						key: k,
						label: k
							.split("_")
							.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
							.join(" "),
						dataType: "Text" as VariableDataType,
					}));
				return [...prev, ...discovered];
			});
		} catch (err) {
			setErrorMsg(`Parse failed: ${(err as Error).message}`);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// ── Load saved template ───────────────────────────────────────────────────

	const handleLoad = useCallback((doc: TemplateDocument) => {
		setCurrentTemplateId(doc.id);
		setTitle(doc.title);
		setFilename(doc.filename ?? "");
		setHtml(doc.content_html);
		setVariables(doc.template_variables);
		setVariableValues({});
		setSaveSuccess(false);
		setErrorMsg(null);
		// Editor content synced via the initialHtml prop effect in TemplateEditorPane
	}, []);

	// ── Variable CRUD ─────────────────────────────────────────────────────────

	const addVariable = useCallback(() => {
		const key = newKey.trim().toLowerCase().replace(/\s+/g, "_");
		if (!key) return;
		if (variables.some((v) => v.key === key)) {
			setErrorMsg(`Variable "{{${key}}}" already exists.`);
			return;
		}
		setVariables((prev) => [
			...prev,
			{ key, label: newLabel.trim() || key, dataType: newDataType },
		]);
		setNewKey("");
		setNewLabel("");
		setNewDataType("Text");
		setErrorMsg(null);
	}, [newKey, newLabel, newDataType, variables]);

	const updateVariable = useCallback(
		(key: string, patch: Partial<Omit<Variable, "key">>) => {
			setVariables((prev) =>
				prev.map((v) => (v.key === key ? { ...v, ...patch } : v)),
			);
		},
		[],
	);

	const deleteVariable = useCallback((key: string) => {
		setVariables((prev) => prev.filter((v) => v.key !== key));
		setVariableValues((prev) => {
			const next = { ...prev };
			delete next[key];
			return next;
		});
	}, []);

	const updateValue = useCallback((key: string, value: string) => {
		setVariableValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	// ── Save to Supabase ──────────────────────────────────────────────────────

	/**
	 * Upsert the template document and sync its variables.
	 * - If `currentTemplateId` is set → UPDATE the existing row
	 * - Otherwise → INSERT a new row and store the returned id
	 */
	const persistTemplate = useCallback(
		async (asNew = false): Promise<void> => {
			setIsSaving(true);
			setSaveSuccess(false);
			setErrorMsg(null);

			try {
				const contentHtml = editorRef.current?.getHTML() ?? html;
				const existingId = asNew ? null : currentTemplateId;

				let templateId: string;

				if (existingId) {
					// UPDATE
					const { error } = await supabase
						.from("templates")
						.update({ title, content_html: contentHtml, filename: filename || null })
						.eq("id", existingId);
					if (error) throw error;
					templateId = existingId;
				} else {
					// INSERT
					const { data, error } = await supabase
						.from("templates")
						.insert({ title, content_html: contentHtml, filename: filename || null })
						.select("id")
						.single();
					if (error) throw error;
					templateId = data.id;
					setCurrentTemplateId(templateId);
				}

				// Sync variables: delete all existing then re-insert
				const { error: delError } = await supabase
					.from("template_variables")
					.delete()
					.eq("template_id", templateId);
				if (delError) throw delError;

				if (variables.length > 0) {
					const { error: insError } = await supabase
						.from("template_variables")
						.insert(
							variables.map((v) => ({
								template_id: templateId,
								key: v.key,
								label: v.label,
								data_type: v.dataType,
							})),
						);
					if (insError) throw insError;
				}

				setSaveSuccess(true);
			} catch (err) {
				setErrorMsg(`Save failed: ${(err as Error).message}`);
			} finally {
				setIsSaving(false);
			}
		},
		[html, title, filename, currentTemplateId, variables],
	);

	const handleSave = useCallback(() => persistTemplate(false), [persistTemplate]);
	const handleSaveAs = useCallback(() => persistTemplate(true), [persistTemplate]);

	// ── Export ────────────────────────────────────────────────────────────────

	const handleExport = useCallback(
		async (mode: "template" | "filled" = "template") => {
			const currentHtml = editorRef.current?.getHTML() ?? html;
			if (!currentHtml) return;
			setIsExporting(true);
			try {
				await exportEditorAsDocx(
					currentHtml,
					variableValues,
					filename || `${title}.docx`,
					mode,
				);
			} catch (err) {
				setErrorMsg(`Export failed: ${(err as Error).message}`);
			} finally {
				setIsExporting(false);
			}
		},
		[html, variableValues, filename, title],
	);

	// ── Reset ─────────────────────────────────────────────────────────────────

	const handleReset = useCallback(() => {
		editorRef.current?.commands.clearContent();
		setHtml("");
		setTitle("Untitled Template");
		setFilename("");
		setCurrentTemplateId(null);
		setVariables([]);
		setVariableValues({});
		setSearchQuery("");
		setSaveSuccess(false);
		setErrorMsg(null);
		setNewKey("");
		setNewLabel("");
		setNewDataType("Text");
	}, []);

	return {
		html,
		title,
		filename,
		currentTemplateId,
		variables,
		variableValues,
		searchQuery,
		isSaving,
		isExporting,
		isLoading,
		saveSuccess,
		errorMsg,
		newKey,
		newLabel,
		newDataType,
		handleFile,
		handleLoad,
		handleReset,
		setTitle,
		setEditorInstance,
		insertVariableAtCursor,
		handleVariableTyped,
		addVariable,
		updateVariable,
		deleteVariable,
		updateValue,
		setNewKey,
		setNewLabel,
		setNewDataType,
		setSearchQuery,
		handleSave,
		handleSaveAs,
		handleExport,
	};
}
