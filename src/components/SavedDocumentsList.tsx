import type { SavedDocument } from '@/hooks/useSavedDocuments'
import { ArrowClockwise, FileDoc } from '@phosphor-icons/react'

interface SavedDocumentsListProps {
  documents: SavedDocument[]
  isLoading: boolean
  error: string | null
  activeId?: string
  onSelect: (doc: SavedDocument) => void
  onRefresh: () => void
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function fieldSummary(formData: Record<string, string>) {
  const total = Object.keys(formData).length
  const filled = Object.values(formData).filter((v) => v.trim() !== '').length
  return { total, filled }
}

export default function SavedDocumentsList({
  documents,
  isLoading,
  error,
  activeId,
  onSelect,
  onRefresh,
}: SavedDocumentsListProps) {
  return (
    <aside className="flex flex-col gap-3 w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Saved Documents
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="
            p-1.5 rounded-md text-muted-foreground
            hover:text-foreground hover:bg-muted
            disabled:opacity-40 transition-colors
          "
          aria-label="Refresh list"
        >
          <ArrowClockwise
            size={14}
            weight="bold"
            className={isLoading ? 'animate-spin' : ''}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 px-1">{error}</p>
      )}

      {/* Loading skeleton */}
      {isLoading && documents.length === 0 && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && documents.length === 0 && !error && (
        <p className="text-xs text-muted-foreground px-1 py-4 text-center">
          No saved documents yet.
          <br />Save a filled form to see it here.
        </p>
      )}

      {/* Document list */}
      <ul className="flex flex-col gap-2">
        {documents.map((doc) => {
          const { total, filled } = fieldSummary(doc.form_data)
          const isActive = doc.id === activeId
          const pct = total > 0 ? Math.round((filled / total) * 100) : 0

          return (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => onSelect(doc)}
                className={`
                  w-full text-left rounded-lg px-3.5 py-3
                  border transition-colors duration-100
                  focus-visible:outline outline-primary outline-offset-2
                  ${isActive
                    ? 'border-border bg-muted shadow-sm text-foreground'
                    : 'border-border bg-card shadow-sm text-foreground/80 hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                {/* Filename */}
                <div className="flex items-start gap-2">
                  <FileDoc
                    size={16}
                    weight={isActive ? "fill" : "duotone"}
                    className={`mt-0.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                  <span className="text-xs font-medium truncate leading-snug">
                    {doc.document_templates.filename}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {filled}/{total}
                  </span>
                </div>

                {/* Meta */}
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded text-xs font-medium ${doc.status === 'Draft'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                    {doc.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground/80">
                    {formatDate(doc.created_at)}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
