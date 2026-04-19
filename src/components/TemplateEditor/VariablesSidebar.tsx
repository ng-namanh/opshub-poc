/**
 * components/TemplateEditor/VariablesSidebar.tsx
 *
 * Right-hand panel: Create Variable form + searchable variable list + footer actions.
 * Matches variable-management-sidebar.png.
 */

import type { Variable, VariableDataType } from "@/lib/template";
import {
	BracketsCurlyIcon,
	MagnifyingGlassIcon,
	CloudArrowUpIcon,
	DownloadSimpleIcon,
	CheckCircleIcon,
	WarningIcon,
	SpinnerIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddVariableForm from "./AddVariableForm";
import VariableCard from "./VariableCard";

interface VariablesSidebarProps {
	variables: Variable[];
	variableValues: Record<string, string>;
	searchQuery: string;
	newKey: string;
	newLabel: string;
	newDataType: VariableDataType;
	isSaving: boolean;
	isExporting: boolean;
	saveSuccess: boolean;
	errorMsg: string | null;
	hasDocument: boolean;
	onKeyChange: (v: string) => void;
	onLabelChange: (v: string) => void;
	onDataTypeChange: (v: VariableDataType) => void;
	onAddVariable: () => void;
	onSearchChange: (q: string) => void;
	onValueChange: (key: string, value: string) => void;
	onDeleteVariable: (key: string) => void;
	onInsertVariable: (key: string) => void;
	onSave: () => void;
	onSaveAs: () => void;
	onExport: () => void;
}

export default function VariablesSidebar({
	variables,
	variableValues,
	searchQuery,
	newKey,
	newLabel,
	newDataType,
	isSaving,
	isExporting,
	saveSuccess,
	errorMsg,
	hasDocument,
	onKeyChange,
	onLabelChange,
	onDataTypeChange,
	onAddVariable,
	onSearchChange,
	onValueChange,
	onDeleteVariable,
	onInsertVariable,
	onSave,
	onSaveAs,
	onExport,
}: VariablesSidebarProps) {
	const filtered = searchQuery
		? variables.filter(
				(v) =>
					v.key.includes(searchQuery.toLowerCase()) ||
					v.label.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: variables;

	return (
		<aside
			className="
        flex flex-col w-80 shrink-0 h-full
        bg-card border-l border-border
        overflow-hidden
      "
		>
			{/* ── Header ─────────────────────────────────────────────── */}
			<div className="px-4 pt-5 pb-3 border-b border-border flex items-center gap-2">
				<BracketsCurlyIcon size={18} weight="bold" className="text-primary" />
				<span className="text-sm font-bold text-foreground">Variables</span>
			</div>

			{/* ── Scrollable body ─────────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">
				{/* Create form */}
				<AddVariableForm
					keyValue={newKey}
					labelValue={newLabel}
					dataType={newDataType}
					onKeyChange={onKeyChange}
					onLabelChange={onLabelChange}
					onDataTypeChange={onDataTypeChange}
					onAdd={onAddVariable}
				/>

				{/* Search */}
				<div className="relative">
					<MagnifyingGlassIcon
						size={13}
						weight="bold"
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
					/>
					<Input
						id="variable-search"
						type="search"
						placeholder="Search variables..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-8 bg-transparent border-border"
					/>
				</div>

				{/* Available Variables */}
				{variables.length > 0 && (
					<>
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
								Available Variables
							</p>
							<p className="text-[10px] text-muted-foreground italic">
								Click a <span className="font-mono text-primary font-bold not-italic">{"{{key}}"}</span> button to insert it at the editor cursor.
							</p>
						</div>

						<ul className="flex flex-col gap-2">
							{filtered.length > 0 ? (
								filtered.map((v) => (
									<VariableCard
										key={v.key}
										variable={v}
										value={variableValues[v.key] ?? ""}
										onValueChange={onValueChange}
										onDelete={onDeleteVariable}
										onInsert={onInsertVariable}
									/>
								))
							) : (
								<p className="text-xs text-muted-foreground text-center py-4">
									No variables match &ldquo;{searchQuery}&rdquo;
								</p>
							)}
						</ul>
					</>
				)}

				{variables.length === 0 && (
					<p className="text-xs text-muted-foreground text-center py-6">
						No variables yet.
						<br />
						Add one above to get started.
					</p>
				)}

				{/* Feedback */}
				{errorMsg && (
					<div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
						<WarningIcon size={13} weight="fill" className="mt-0.5 shrink-0" />
						{errorMsg}
					</div>
				)}
				{saveSuccess && (
					<div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-2">
						<CheckCircleIcon
							size={13}
							weight="fill"
							className="mt-0.5 shrink-0"
						/>
						Template saved successfully
					</div>
				)}
			</div>

			{/* ── Footer ──────────────────────────────────────────────── */}
			<div className="px-4 py-4 border-t border-border flex flex-col gap-2">
				<Button
					variant="outline"
					onClick={onExport}
					disabled={!hasDocument || isExporting}
					className="w-full"
				>
					{isExporting ? (
						<SpinnerIcon size={13} className="animate-spin" data-icon="inline-start" />
					) : (
						<DownloadSimpleIcon size={13} weight="bold" data-icon="inline-start" />
					)}
					{isExporting ? "Exporting…" : "Export .docx"}
				</Button>

				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={onSaveAs}
						disabled={!hasDocument || isSaving}
						className="flex-1"
					>
						Save As
					</Button>
					<Button
						onClick={onSave}
						disabled={!hasDocument || isSaving}
						className="flex-1"
					>
						{isSaving ? (
							<SpinnerIcon size={13} className="animate-spin" data-icon="inline-start" />
						) : (
							<CloudArrowUpIcon size={13} weight="bold" data-icon="inline-start" />
						)}
						{isSaving ? "Saving…" : "Save"}
					</Button>
				</div>
			</div>
		</aside>
	);
}
