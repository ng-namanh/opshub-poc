/**
 * components/TemplateEditor/AddVariableForm.tsx
 *
 * Inline form: KEY + LABEL + DATA TYPE select + Add button.
 * Matches the "CREATE NEW VARIABLE" section of variable-management-sidebar.png.
 */

import type { VariableDataType } from "@/lib/template";
import { PlusCircleIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddVariableFormProps {
	keyValue: string;
	labelValue: string;
	dataType: VariableDataType;
	onKeyChange: (v: string) => void;
	onLabelChange: (v: string) => void;
	onDataTypeChange: (v: VariableDataType) => void;
	onAdd: () => void;
}

const DATA_TYPES: VariableDataType[] = ["Text", "Number", "Date"];

export default function AddVariableForm({
	keyValue,
	labelValue,
	dataType,
	onKeyChange,
	onLabelChange,
	onDataTypeChange,
	onAdd,
}: AddVariableFormProps) {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") onAdd();
	};

	// Sanitise key input: lowercase, underscores only
	const handleRawKey = (v: string) => {
		onKeyChange(v.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
	};

	return (
		<div className="flex flex-col gap-4 pb-4 border-b border-border">
			<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
				Create New Variable
			</p>

			{/* KEY */}
			<div className="flex flex-col gap-1.5">
				<label
					htmlFor="var-key"
					className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
				>
					Key
				</label>
				<Input
					id="var-key"
					type="text"
					placeholder="{{variable_name}}"
					value={keyValue ? `{{${keyValue}}}` : ""}
					onChange={(e) => {
						// Strip surrounding {{ }} if user typed them, or just accept raw
						const raw = e.target.value.replace(/^\{\{|\}\}$/g, "");
						handleRawKey(raw);
					}}
					onKeyDown={handleKeyDown}
					className="font-mono text-xs bg-background border-border"
				/>
			</div>

			{/* LABEL */}
			<div className="flex flex-col gap-1.5">
				<label
					htmlFor="var-label"
					className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
				>
					Description
				</label>
				<Input
					id="var-label"
					type="text"
					placeholder="e.g. Bidder Full Name"
					value={labelValue}
					onChange={(e) => onLabelChange(e.target.value)}
					onKeyDown={handleKeyDown}
					className="text-xs bg-background border-border h-8"
				/>
			</div>

			{/* DATA TYPE */}
			<div className="flex flex-col gap-1.5">
				<label
					htmlFor="var-type"
					className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
				>
					Data Type
				</label>
				<select
					id="var-type"
					value={dataType}
					onChange={(e) => onDataTypeChange(e.target.value as VariableDataType)}
					className="h-8 w-full rounded-md border border-border bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors cursor-pointer"
				>
					{DATA_TYPES.map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>
			</div>

			{/* Add button */}
			<Button
				id="add-variable-btn"
				onClick={onAdd}
				disabled={!keyValue.trim()}
				className="w-full mt-2"
			>
				<PlusCircleIcon size={14} weight="fill" data-icon="inline-start" />
				Add Variable
			</Button>
		</div>
	);
}
