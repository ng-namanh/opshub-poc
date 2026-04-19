/**
 * extensions/VariableNode.ts
 *
 * Custom Tiptap inline atom node for {{variable_key}} tokens.
 *
 * Features:
 * - `atom: true`   — non-editable; cursor skips over it as a unit
 * - `inline: true` — lives inside paragraph text runs
 * - InputRule: typing {{key}} and completing the `}}` auto-converts to a chip
 * - Serialises to <span data-variable="key">{{key}}</span> in HTML
 * - Parses back from that same span on load
 */

import { InputRule, mergeAttributes, Node } from "@tiptap/core";

export interface VariableNodeAttrs {
	key: string;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		variableNode: {
			/** Insert a {{variable}} chip at the current cursor position */
			insertVariable: (key: string) => ReturnType;
		};
	}
}

/**
 * Matches {{variable_key}} when the closing }} is typed.
 * Capture group 1 = the key inside the braces.
 */
const VARIABLE_INPUT_RULE = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}$/;

export const VariableNode = Node.create({
	name: "variableNode",

	group: "inline",
	inline: true,
	atom: true,
	selectable: true,
	draggable: false,

	addAttributes() {
		return {
			key: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-variable"),
				renderHTML: (attrs) => ({ "data-variable": attrs.key }),
			},
		};
	},

	parseHTML() {
		return [{ tag: "span[data-variable]" }];
	},

	renderHTML({ HTMLAttributes }) {
		const key = HTMLAttributes["data-variable"] ?? "";
		return [
			"span",
			mergeAttributes(HTMLAttributes, {
				class: "variable-chip",
				contenteditable: "false",
			}),
			`{{${key}}}`,
		];
	},

	addCommands() {
		return {
			insertVariable:
				(key: string) =>
				({ chain }) => {
					return chain()
						.insertContent({ type: this.name, attrs: { key } })
						.run();
				},
		};
	},

	/**
	 * Auto-convert {{key}} raw text → VariableNode chip while typing.
	 *
	 * We use a raw InputRule (not nodeInputRule) because nodeInputRule with a
	 * capture group only replaces the captured text, leaving the surrounding
	 * {{ and }} as plain text — causing double-brace rendering.
	 * Here we explicitly delete the full matched range before inserting.
	 */
	addInputRules() {
		return [
			new InputRule({
				find: VARIABLE_INPUT_RULE,
				handler: ({ state, range, match }) => {
					const key = match[1];
					if (!key) return null;
					state.tr.replaceWith(range.from, range.to, this.type.create({ key }));
				},
			}),
		];
	},
});
