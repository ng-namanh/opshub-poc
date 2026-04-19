import { DownloadSimple, CloudArrowUp, CheckCircle, Warning } from '@phosphor-icons/react'

interface ExportBarProps {
  fieldCount: number
  filledCount: number
  isExporting: boolean
  isSaving: boolean
  saveSuccess: boolean
  errorMsg: string | null
  onExport: () => void
  onSave: () => void
  onReset: () => void
  disabled: boolean
}

export default function ExportBar({
  fieldCount,
  filledCount,
  isExporting,
  isSaving,
  saveSuccess,
  errorMsg,
  onExport,
  onSave,
  onReset,
  disabled,
}: ExportBarProps) {
  const progress = fieldCount > 0 ? Math.round((filledCount / fieldCount) * 100) : 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-6 py-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {filledCount} / {fieldCount} fields ({progress}%)
        </span>
      </div>

      {/* Feedback */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <Warning size={14} weight="fill" />
          {errorMsg}
        </div>
      )}
      {saveSuccess && (
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle size={14} weight="fill" />
          Saved to Supabase successfully
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end flex-wrap">
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="
            inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
            text-xs font-medium font-mono
            border border-border text-muted-foreground bg-transparent
            hover:bg-muted hover:text-foreground
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors active:translate-y-px
          "
        >
          Reset
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={disabled || isSaving}
          aria-busy={isSaving}
          className="
            inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
            text-xs font-medium font-mono
            border border-border bg-card text-foreground
            hover:bg-muted
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors active:translate-y-px
          "
        >
          <CloudArrowUp size={15} weight="bold" />
          {isSaving ? 'Saving…' : 'Save to Cloud'}
        </button>

        <button
          type="button"
          onClick={onExport}
          disabled={disabled || isExporting}
          aria-busy={isExporting}
          className="
            inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
            text-xs font-medium font-mono
            bg-primary text-primary-foreground
            hover:bg-primary/90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors active:translate-y-px
          "
        >
          <DownloadSimple size={15} weight="bold" />
          {isExporting ? 'Exporting…' : 'Export .docx'}
        </button>
      </div>
    </div>
  )
}
