import { countFields, exportDocx, parseDocx, preprocessDocxBuffer } from '@/lib/docx'
import { useIndexedDBState } from '@/lib/indexed-db'
import { supabase } from '@/lib/supabase'
import { useCallback, useRef, useState } from 'react'
import type { SavedDocument } from './useSavedDocuments'

const IDB_KEY = 'docx-form-state'

export interface DocxFormState {
  html: string
  fieldCount: number
  filename: string
  formData: Record<string, string>
  isSaving: boolean
  isExporting: boolean
  isLoading: boolean
  saveSuccess: boolean
  errorMsg: string | null
}

export interface DocxFormActions {
  handleFile: (file: File) => Promise<void>
  handleLoad: (doc: SavedDocument) => Promise<void>
  handleChange: (fieldId: string, value: string) => void
  handleExport: () => void
  handleSave: () => Promise<void>
  handleReset: () => void
}

export function useDocxForm(): DocxFormState & DocxFormActions {
  // Original buffer → fed to mammoth for display (preserves all XML)
  const templateBufferRef = useRef<ArrayBuffer | null>(null)
  // Pre-processed buffer → fed to docxtemplater for export ({field_N} tags)
  const preprocessedBufferRef = useRef<ArrayBuffer | null>(null)
  const fileRef = useRef<File | null>(null)

  const [html, setHtml] = useState('')
  const [fieldCount, setFieldCount] = useState(0)
  const [filename, setFilename] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [formData, setFormData, clearFormData] = useIndexedDBState<Record<string, string>>(
    IDB_KEY,
    {}
  )

  // ── Local file upload ─────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setErrorMsg(null)
    setSaveSuccess(false)
    fileRef.current = file
    setFilename(file.name)

    const buffer = await file.arrayBuffer()
    templateBufferRef.current = buffer
    // Pre-process separately so mammoth always sees the original XML
    preprocessedBufferRef.current = preprocessDocxBuffer(buffer)

    const { html: parsed, messages } = await parseDocx(buffer)

    if (messages.some((m) => m.type === 'error')) {
      setErrorMsg('Some content could not be converted. Check console for details.')
      console.warn('mammoth messages:', messages)
    }

    setHtml(parsed)
    setFieldCount(countFields(parsed))
    clearFormData()
  }, [clearFormData])

  // ── Rehydration from Supabase ─────────────────────────────────────────────
  const handleLoad = useCallback(async (doc: SavedDocument) => {
    setIsLoading(true)
    setErrorMsg(null)
    setSaveSuccess(false)

    try {
      const { s3_key, filename: templateFilename } = doc.document_templates

      // 1. Get a signed URL for the template binary in Storage
      const { data: urlData, error: urlError } = await supabase.storage
        .from('docx-templates')
        .createSignedUrl(s3_key, 60)  // 60 seconds TTL

      if (urlError || !urlData?.signedUrl) throw urlError ?? new Error('Could not get signed URL')

      // 2. Download the template ArrayBuffer
      const response = await fetch(urlData.signedUrl)
      if (!response.ok) throw new Error(`Failed to download template: ${response.statusText}`)
      const buffer = await response.arrayBuffer()
      templateBufferRef.current = buffer
      fileRef.current = null  // no local File object for cloud-loaded docs

      // 2. Pre-process the downloaded buffer for export, then run mammoth for display
      preprocessedBufferRef.current = preprocessDocxBuffer(buffer)
      const { html: parsed, messages } = await parseDocx(buffer)
      if (messages.some((m) => m.type === 'error')) {
        console.warn('mammoth messages:', messages)
      }

      setHtml(parsed)
      setFieldCount(countFields(parsed))
      setFilename(templateFilename)

      // 4. Hydrate formData from the stored JSONB — this is the bidirectional bind
      setFormData(doc.form_data ?? {})
    } catch (err) {
      setErrorMsg(`Load failed: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }, [setFormData])

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = useCallback((fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }, [setFormData])

  // ── Local .docx export ────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    // Use the pre-processed buffer so docxtemplater finds {field_N} tags
    if (!preprocessedBufferRef.current) return
    setIsExporting(true)
    try {
      exportDocx(preprocessedBufferRef.current!, formData, filename)
    } catch (err) {
      setErrorMsg(`Export failed: ${(err as Error).message}`)
    } finally {
      setIsExporting(false)
    }
  }, [formData, filename])

  // ── Save to Supabase ──────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!fileRef.current) return
    setIsSaving(true)
    setSaveSuccess(false)
    setErrorMsg(null)

    try {
      const storagePath = `templates/${Date.now()}-${fileRef.current.name}`
      const { error: uploadError } = await supabase.storage
        .from('docx-templates')
        .upload(storagePath, fileRef.current)

      if (uploadError) throw uploadError

      const { data: templateRow, error: templateError } = await supabase
        .from('document_templates')
        .insert({ filename: fileRef.current.name, s3_key: storagePath })
        .select()
        .single()

      if (templateError) throw templateError

      const { error: filledError } = await supabase
        .from('filled_documents')
        .insert({ template_id: templateRow.id, form_data: formData, status: 'Draft' })

      if (filledError) throw filledError

      setSaveSuccess(true)
    } catch (err) {
      setErrorMsg(`Save failed: ${(err as Error).message}`)
    } finally {
      setIsSaving(false)
    }
  }, [formData])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    clearFormData()
    setHtml('')
    setFieldCount(0)
    setFilename('')
    templateBufferRef.current = null
    preprocessedBufferRef.current = null
    fileRef.current = null
    setSaveSuccess(false)
    setErrorMsg(null)
  }, [clearFormData])

  return {
    html,
    fieldCount,
    filename,
    formData,
    isSaving,
    isExporting,
    isLoading,
    saveSuccess,
    errorMsg,
    handleFile,
    handleLoad,
    handleChange,
    handleExport,
    handleSave,
    handleReset,
  }
}
