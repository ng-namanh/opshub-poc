/**
 * components/TemplateEditor/TemplateDocumentsList.tsx
 *
 * Left sidebar: list of saved template documents.
 * Click a row to load that template into the editor.
 */

import type { TemplateDocument } from "@/hooks/useTemplateDocuments";
import {
	FileDocIcon,
	ArrowClockwiseIcon,
	BracketsCurlyIcon,
	ClockIcon,
	PlusIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface TemplateDocumentsListProps {
	documents: TemplateDocument[];
	isLoading: boolean;
	error: string | null;
	activeId?: string;
	onSelect: (doc: TemplateDocument) => void;
	onRefresh: () => void;
	onNew: () => void;
}

function timeAgo(iso: string): string {
	const diff = (Date.now() - new Date(iso).getTime()) / 1000;
	if (diff < 60) return "just now";
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export default function TemplateDocumentsList({
	documents,
	isLoading,
	error,
	activeId,
	onSelect,
	onRefresh,
	onNew,
}: TemplateDocumentsListProps) {
	return (
		<aside className="flex flex-col w-64 shrink-0 border-r border-border bg-card overflow-hidden">
			{/* Header */}
			<div className="flex flex-col gap-2 px-3 pt-4 pb-3 border-b border-border">
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
						Saved Templates
					</span>
					<button
						type="button"
						onClick={onRefresh}
						title="Refresh"
						className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
					>
						<ArrowClockwiseIcon size={12} weight="bold" />
					</button>
				</div>
				<Button 
					variant="outline" 
					size="sm" 
					onClick={onNew} 
					className="w-full justify-start text-xs rounded border-border hover:bg-muted shadow-none h-8"
				>
					<PlusIcon data-icon="inline-start" />
					New Template
				</Button>
			</div>

			{/* Body */}
			<div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1">
				{isLoading && (
					<p className="text-xs text-muted-foreground text-center py-8">Loading…</p>
				)}

				{error && (
					<p className="text-xs text-destructive text-center py-4 px-2">{error}</p>
				)}

				{!isLoading && !error && documents.length === 0 && (
					<p className="text-xs text-muted-foreground text-center py-8 px-2 italic">
						No saved templates yet.
					</p>
				)}

				{documents.map((doc) => {
					const isActive = doc.id === activeId;
					return (
						<button
							key={doc.id}
							type="button"
							onClick={() => onSelect(doc)}
							className={`
                w-full text-left flex flex-col gap-1.5 px-2.5 py-2.5 rounded-lg
                transition-colors outline-none
                focus-visible:ring-1 focus-visible:ring-border
                ${
									isActive
										? "bg-muted border border-border shadow-sm"
										: "border border-transparent hover:bg-muted/50"
								}
              `}
						>
							{/* Icon + title */}
							<div className="flex items-start gap-2">
								<FileDocIcon
									size={14}
									weight={isActive ? "fill" : "duotone"}
									className={`shrink-0 mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
								/>
								<span
									className={`text-xs font-semibold leading-tight line-clamp-2 ${isActive ? "text-foreground" : "text-foreground/80"}`}
								>
									{doc.title}
								</span>
							</div>

							{/* Meta */}
							<div className="flex items-center gap-2 pl-5">
								<span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
									<BracketsCurlyIcon size={10} weight="bold" />
									{doc.template_variables.length}
								</span>
								<span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
									<ClockIcon size={10} weight="bold" />
									{timeAgo(doc.updated_at)}
								</span>
							</div>
						</button>
					);
				})}
			</div>
		</aside>
	);
}
