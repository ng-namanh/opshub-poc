/**
 * components/TemplateEditor/VariableCard.tsx
 *
 * Individual variable row card in the sidebar list.
 *
 * The {{key}} chip is itself a prominent button — clicking it inserts the
 * variable at the current editor cursor. The value input and delete button
 * sit below.
 */

import type { Variable, VariableDataType } from "@/lib/template";
import { TrashIcon, ArrowBendDownRightIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

interface VariableCardProps {
	variable: Variable;
	value: string;
	onValueChange: (key: string, value: string) => void;
	onDelete: (key: string) => void;
	onInsert?: (key: string) => void;
}

const TYPE_BADGE: Record<
	VariableDataType,
	{ label: string; className: string }
> = {
	Text: {
		label: "Text",
		className: "bg-indigo-100 text-indigo-700 border border-indigo-200",
	},
	Number: {
		label: "Number",
		className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
	},
	Date: {
		label: "Date",
		className: "bg-amber-100 text-amber-700 border border-amber-200",
	},
};

const INPUT_TYPE: Record<VariableDataType, string> = {
	Text: "text",
	Number: "number",
	Date: "date",
};

export default function VariableCard({
	variable,
	value,
	onValueChange,
	onDelete,
	onInsert,
}: VariableCardProps) {
	const badge = TYPE_BADGE[variable.dataType];

	return (
		<li className="group flex flex-col gap-2 p-3 rounded-lg bg-card border border-border shadow-sm hover:border-muted-foreground/30 transition-colors">

			{/* ── Top row: label + type badge + delete ─────────────── */}
			<div className="flex items-center gap-2">
				<span className="flex-1 text-[10px] text-muted-foreground truncate">
					{variable.label}
				</span>
				<span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.className}`}>
					{badge.label}
				</span>
				<button
					type="button"
					onClick={() => onDelete(variable.key)}
					aria-label={`Delete variable ${variable.key}`}
					className="
            shrink-0 p-1 rounded
            text-muted-foreground hover:text-destructive hover:bg-destructive/10
            opacity-0 group-hover:opacity-100
            transition-all
          "
				>
					<TrashIcon size={11} weight="bold" />
				</button>
			</div>

			{/* ── Insert chip button ────────────────────────────────── */}
			{onInsert ? (
				<button
					type="button"
					id={`insert-var-${variable.key}`}
					onClick={() => onInsert(variable.key)}
					title="Click to insert at cursor in the editor"
					className="
            w-full flex items-center gap-2
            px-2.5 py-2 rounded-md
            bg-muted border border-border
            hover:bg-muted/80 hover:border-primary/50
            active:scale-[0.98]
            transition-all cursor-pointer text-left
            group/chip
          "
				>
					<span className="flex-1 font-mono text-xs font-bold text-primary truncate">
						{`{{${variable.key}}}`}
					</span>
					<span className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground group-hover/chip:text-primary transition-colors">
						<ArrowBendDownRightIcon size={11} weight="bold" />
						Insert
					</span>
				</button>
			) : (
				<span className="font-mono text-xs font-bold text-primary px-2">
					{`{{${variable.key}}}`}
				</span>
			)}

			{/* ── Value input ───────────────────────────────────────── */}
			<Input
				id={`var-value-${variable.key}`}
				type={INPUT_TYPE[variable.dataType]}
				placeholder={`${variable.dataType} preview…`}
				value={value}
				onChange={(e) => onValueChange(variable.key, e.target.value)}
				className="h-8 text-xs font-mono bg-background border-border"
			/>
		</li>
	);
}
