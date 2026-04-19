import { useRef } from 'react'
import parse, { type HTMLReactParserOptions } from 'html-react-parser'
import type { DOMNode, Text } from 'html-react-parser'
import DynamicInput from './DynamicInput'
import { DOT_PLACEHOLDER_REGEX } from '@/lib/docx'

interface DocxViewerProps {
  html: string
  formData: Record<string, string>
  onFieldChange: (fieldId: string, value: string) => void
}

/**
 * Renders the mammoth-converted HTML, replacing every dot-placeholder
 * (5+ consecutive dots) with a controlled <DynamicInput />.
 */
export default function DocxViewer({ html, formData, onFieldChange }: DocxViewerProps) {
  const fieldCounterRef = useRef(0)

  if (!html) return null

  // Reset counter before each parse pass so IDs are stable across re-renders
  fieldCounterRef.current = 0

  const options: HTMLReactParserOptions = {
    replace(domNode: DOMNode) {
      if (domNode.type !== 'text') return

      const textNode = domNode as unknown as Text
      const text = textNode.data ?? ''

      if (!DOT_PLACEHOLDER_REGEX.test(text)) return

      // Reset lastIndex (regex is global)
      DOT_PLACEHOLDER_REGEX.lastIndex = 0

      const parts: React.ReactNode[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      // biome-ignore lint/suspicious/noAssignInExpressions: intentional regex loop
      while ((match = DOT_PLACEHOLDER_REGEX.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index))
        }

        const fieldId = `field_${fieldCounterRef.current++}`
        parts.push(
          <DynamicInput
            key={fieldId}
            id={fieldId}
            value={formData[fieldId] ?? ''}
            onChange={onFieldChange}
          />
        )

        lastIndex = match.index + match[0].length
      }

      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
      }

      return <>{parts}</>
    },
  }

  return (
    <div className="
      bg-card text-foreground rounded-xl border border-border
      px-12 py-10 leading-relaxed
      font-serif text-[0.95rem] shadow-sm
      [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-primary
      [&_h2]:text-xl  [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2
      [&_h3]:text-lg  [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1
      [&_p]:my-2
      [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
      [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1
      [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1 [&_th]:bg-muted
    ">
      {parse(html, options)}
    </div>
  )
}
