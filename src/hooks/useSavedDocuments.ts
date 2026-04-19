import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface SavedDocument {
  id: string
  status: string
  created_at: string
  form_data: Record<string, string>
  template_id: string
  document_templates: {
    filename: string
    s3_key: string
  }
}

export function useSavedDocuments() {
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('filled_documents')
        .select(`
          id,
          status,
          created_at,
          form_data,
          template_id,
          document_templates (
            filename,
            s3_key
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setDocuments((data as unknown as SavedDocument[]) ?? [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return { documents, isLoading, error, refetch: fetchDocuments }
}
