/**
 * components/TabBar.tsx
 *
 * Simple two-tab pill switcher for the App shell.
 */

import { FileDashedIcon, PencilSimpleLineIcon } from "@phosphor-icons/react";

export type AppTab = "filler" | "editor";

interface TabBarProps {
	activeTab: AppTab;
	onChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string; icon: React.ReactNode }[] = [
	{
		id: "filler",
		label: "Form Filler",
		icon: <FileDashedIcon size={15} weight="duotone" />,
	},
	{
		id: "editor",
		label: "Template Editor",
		icon: <PencilSimpleLineIcon size={15} weight="duotone" />,
	},
];

export default function TabBar({ activeTab, onChange }: TabBarProps) {
	return (
		<nav
			className="flex items-center gap-1 bg-muted border border-border rounded-xl p-1"
			aria-label="App tabs"
		>
			{TABS.map((tab) => {
				const isActive = tab.id === activeTab;
				return (
					<button
						key={tab.id}
						type="button"
						id={`tab-${tab.id}`}
						role="tab"
						aria-selected={isActive}
						onClick={() => onChange(tab.id)}
						className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
              transition-all duration-150 outline-none
              focus-visible:ring-2 focus-visible:ring-ring
              ${
								isActive
									? "bg-primary text-primary-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground hover:bg-background/50"
							}
            `}
					>
						{tab.icon}
						{tab.label}
					</button>
				);
			})}
		</nav>
	);
}
