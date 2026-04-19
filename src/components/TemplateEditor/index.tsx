/**
 * components/TemplateEditor/index.tsx
 *
 * V2 Template Editor — 3-column layout:
 *   [Saved Templates list] | [Tiptap editor + title] | [Variables sidebar]
 */

import DocxUploader from "@/components/DocxUploader";
import { useTemplateDocuments } from "@/hooks/useTemplateDocuments";
import { useTemplateEditor } from "@/hooks/useTemplateEditor";
import { SpinnerIcon } from "@phosphor-icons/react";
import TemplateDocumentsList from "./TemplateDocumentsList";
import TemplateEditorPane from "./TemplateEditorPane";
import VariablesSidebar from "./VariablesSidebar";

export default function TemplateEditor() {
	const {
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
		deleteVariable,
		updateValue,
		setNewKey,
		setNewLabel,
		setNewDataType,
		setSearchQuery,
		handleSave,
		handleSaveAs,
		handleExport,
	} = useTemplateEditor();

	const {
		documents,
		isLoading: listLoading,
		error: listError,
		refetch,
	} = useTemplateDocuments();

	const handleSelectDoc = (doc: (typeof documents)[0]) => {
		handleLoad(doc);
		// Note: the TemplateEditorPane useEffect will update editor content
		// when the `html` prop changes
	};

	const handleSaveAndRefresh = async () => {
		await handleSave();
		refetch();
	};

	const handleSaveAsAndRefresh = async () => {
		await handleSaveAs();
		refetch();
	};

	return (
		<div className="flex flex-1 min-h-0 overflow-hidden w-full bg-background text-foreground">
			{/* ── Saved Templates sidebar ──────────────────────────────── */}
			<TemplateDocumentsList
				documents={documents}
				isLoading={listLoading}
				error={listError}
				activeId={currentTemplateId ?? undefined}
				onSelect={handleSelectDoc}
				onRefresh={refetch}
				onNew={handleReset}
			/>

			{/* ── Editor area ─────────────────────────────────────────── */}
			<main
				className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto px-6 py-5"
				id="template-editor-main"
			>
				{/* Editable title */}
				<input
					id="template-title-input"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Untitled Template"
					className="
            w-full bg-transparent border-none outline-none
            text-xl font-bold text-foreground
            placeholder:text-muted-foreground
            focus:text-foreground
          "
				/>

				{/* Upload zone */}
				<DocxUploader onFile={handleFile} filename={filename} />

				{/* Loading state */}
				{isLoading && (
					<div className="flex items-center justify-center gap-3 py-10 text-neutral-500 text-sm">
						<SpinnerIcon size={22} className="animate-spin" />
						Parsing document…
					</div>
				)}

				{/* Tiptap editor — always mounted so editor instance is available */}
				<div className={isLoading ? "hidden" : "block"}>
					<TemplateEditorPane
						initialHtml={html || undefined}
						onEditorReady={setEditorInstance}
						onVariableTyped={handleVariableTyped}
					/>
				</div>
			</main>

			{/* ── Variables sidebar ────────────────────────────────────── */}
			<VariablesSidebar
				variables={variables}
				variableValues={variableValues}
				searchQuery={searchQuery}
				newKey={newKey}
				newLabel={newLabel}
				newDataType={newDataType}
				isSaving={isSaving}
				isExporting={isExporting}
				saveSuccess={saveSuccess}
				errorMsg={errorMsg}
				hasDocument={true}
				onKeyChange={setNewKey}
				onLabelChange={setNewLabel}
				onDataTypeChange={setNewDataType}
				onAddVariable={addVariable}
				onSearchChange={setSearchQuery}
				onValueChange={updateValue}
				onDeleteVariable={deleteVariable}
				onInsertVariable={insertVariableAtCursor}
				onSave={handleSaveAndRefresh}
				onSaveAs={handleSaveAsAndRefresh}
				onExport={() => handleExport("template")}
			/>
		</div>
	);
}
