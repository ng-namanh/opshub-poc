/**
 * hooks/useTemplateDocuments.ts
 *
 * Fetches all saved templates with their variables from Supabase.
 * Used by the TemplateDocumentsList sidebar.
 */

import { supabase } from "@/lib/supabase";
import type { Variable } from "@/lib/template";
import { useCallback, useEffect, useState } from "react";

export interface TemplateDocument {
	id: string;
	title: string;
	filename: string | null;
	content_html: string;
	created_at: string;
	updated_at: string;
	template_variables: Variable[];
}

interface UseTemplateDocumentsReturn {
	documents: TemplateDocument[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useTemplateDocuments(): UseTemplateDocumentsReturn {
	const [documents, setDocuments] = useState<TemplateDocument[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetch = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const { data, error: fetchError } = await supabase
				.from("templates")
				.select(
					`
          id, title, filename, content_html, created_at, updated_at,
          template_variables ( id, key, label, data_type )
        `,
				)
				.order("updated_at", { ascending: false });

			if (fetchError) throw fetchError;

			const normalized: TemplateDocument[] = (data ?? []).map((row) => ({
				id: row.id,
				title: row.title,
				filename: row.filename,
				content_html: row.content_html,
				created_at: row.created_at,
				updated_at: row.updated_at,
				template_variables: (row.template_variables ?? []).map(
					(v: { key: string; label: string; data_type: string }) => ({
						key: v.key,
						label: v.label,
						dataType: v.data_type as Variable["dataType"],
					}),
				),
			}));
			setDocuments(normalized);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetch();
	}, [fetch]);

	return { documents, isLoading, error, refetch: fetch };
}
