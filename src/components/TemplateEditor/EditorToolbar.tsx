/**
 * components/TemplateEditor/EditorToolbar.tsx
 *
 * Rich-text formatting toolbar for the Tiptap editor.
 * Provides: Bold, Italic, Underline, H1-H3, Lists, Align, Undo/Redo.
 */

import type { Editor } from "@tiptap/react";
import {
	TextBolderIcon,
	TextItalicIcon,
	TextUnderlineIcon,
	TextStrikethroughIcon,
	TextHOneIcon,
	TextHTwoIcon,
	TextHThreeIcon,
	ListBulletsIcon,
	ListNumbersIcon,
	TextAlignLeftIcon,
	TextAlignCenterIcon,
	TextAlignRightIcon,
	ArrowCounterClockwiseIcon,
	ArrowClockwiseIcon,
} from "@phosphor-icons/react";

interface ToolbarButtonProps {
	onClick: () => void;
	isActive?: boolean;
	disabled?: boolean;
	title: string;
	children: React.ReactNode;
}

function ToolbarButton({
	onClick,
	isActive,
	disabled,
	title,
	children,
}: ToolbarButtonProps) {
	return (
		<button
			type="button"
			title={title}
			onClick={onClick}
			disabled={disabled}
			className={`
        flex items-center justify-center w-7 h-7 rounded-md
        text-xs transition-all duration-100 outline-none
        focus-visible:ring-1 focus-visible:ring-ring
        disabled:opacity-30 disabled:cursor-not-allowed
        ${
					isActive
						? "bg-muted text-foreground"
						: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
				}
      `}
		>
			{children}
		</button>
	);
}

function Divider() {
	return <div className="w-px h-5 bg-border mx-0.5" />;
}

interface EditorToolbarProps {
	editor: Editor | null;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
	if (!editor) return null;

	return (
		<div
			className="
        flex items-center gap-0.5 flex-wrap
        px-3 py-2
        bg-card border-b border-border
        rounded-t-xl
      "
		>
			{/* History */}
			<ToolbarButton
				title="Undo"
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
			>
				<ArrowCounterClockwiseIcon size={13} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Redo"
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
			>
				<ArrowClockwiseIcon size={13} weight="bold" />
			</ToolbarButton>

			<Divider />

			{/* Headings */}
			<ToolbarButton
				title="Heading 1"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 1 }).run()
				}
				isActive={editor.isActive("heading", { level: 1 })}
			>
				<TextHOneIcon size={15} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Heading 2"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 2 }).run()
				}
				isActive={editor.isActive("heading", { level: 2 })}
			>
				<TextHTwoIcon size={15} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Heading 3"
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 3 }).run()
				}
				isActive={editor.isActive("heading", { level: 3 })}
			>
				<TextHThreeIcon size={15} weight="bold" />
			</ToolbarButton>

			<Divider />

			{/* Marks */}
			<ToolbarButton
				title="Bold"
				onClick={() => editor.chain().focus().toggleBold().run()}
				isActive={editor.isActive("bold")}
			>
				<TextBolderIcon size={13} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Italic"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				isActive={editor.isActive("italic")}
			>
				<TextItalicIcon size={13} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Underline"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				isActive={editor.isActive("underline")}
			>
				<TextUnderlineIcon size={13} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Strikethrough"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				isActive={editor.isActive("strike")}
			>
				<TextStrikethroughIcon size={13} weight="bold" />
			</ToolbarButton>

			<Divider />

			{/* Lists */}
			<ToolbarButton
				title="Bullet list"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				isActive={editor.isActive("bulletList")}
			>
				<ListBulletsIcon size={13} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Ordered list"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				isActive={editor.isActive("orderedList")}
			>
				<ListNumbersIcon size={13} weight="bold" />
			</ToolbarButton>

			<Divider />

			{/* Alignment */}
			<ToolbarButton
				title="Align left"
				onClick={() => editor.chain().focus().setTextAlign("left").run()}
				isActive={editor.isActive({ textAlign: "left" })}
			>
				<TextAlignLeftIcon size={13} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Align center"
				onClick={() => editor.chain().focus().setTextAlign("center").run()}
				isActive={editor.isActive({ textAlign: "center" })}
			>
				<TextAlignCenterIcon size={13} weight="bold" />
			</ToolbarButton>
			<ToolbarButton
				title="Align right"
				onClick={() => editor.chain().focus().setTextAlign("right").run()}
				isActive={editor.isActive({ textAlign: "right" })}
			>
				<TextAlignRightIcon size={13} weight="bold" />
			</ToolbarButton>
		</div>
	);
}
