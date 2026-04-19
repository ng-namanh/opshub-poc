import mammoth from 'mammoth'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'

// Matches 5+ consecutive dots anywhere in a string
const DOT_PLACEHOLDER_REGEX = /\.{5,}/g

// Matches dot-only content across OOXML w:t tags within the SAME w:r run
// Used during XML pre-processing to find split dot sequences in raw XML
const XML_DOT_REGEX = /\.{5,}/g

interface MammothMessage {
  type: 'warning' | 'error'
  message: string
  [key: string]: unknown
}

export interface ParseResult {
  html: string
  messages: MammothMessage[]
}

/**
 * Parse a .docx ArrayBuffer into semantic HTML using mammoth.js.
 *
 * mammoth consolidates split OOXML runs into clean text nodes, so the
 * split-run problem does NOT affect the display layer. Dot sequences like
 * "....." appear as a contiguous string in the HTML output regardless of
 * how many w:r elements they were spread across in the original XML.
 */
export async function parseDocx(buffer: ArrayBuffer): Promise<ParseResult> {
  const result = await mammoth.convertToHtml(
    { arrayBuffer: buffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        "p[style-name='Heading 3'] => h3",
      ],
    }
  )
  return { html: result.value, messages: result.messages as unknown as MammothMessage[] }
}

/**
 * Count how many placeholder fields exist in an HTML string.
 */
export function countFields(html: string): number {
  return (html.match(DOT_PLACEHOLDER_REGEX) ?? []).length
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-processing: convert dot sequences → {field_N} docxtemplater tags
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PROBLEM 1 SOLUTION — Pre-process the DOCX XML to replace raw dot sequences
 * with docxtemplater-compatible {field_N} tags.
 *
 * Strategy:
 *  1. Unzip the .docx with PizZip
 *  2. Read word/document.xml as a plain string
 *  3. For each <w:p> block, consolidate all <w:t> text content, detect dot
 *     sequences, then rebuild the paragraph with {field_N} tags injected
 *     into a single clean <w:r> where each sequence was found.
 *  4. Re-zip and return the modified ArrayBuffer.
 *
 * Limitation: This approach handles the common case where dots appear within
 * a manageable number of runs. Extremely fragmented split-runs (e.g. dots
 * interrupted by spellcheck proofErr nodes holding partial sequences) may not
 * consolidate perfectly. For production use, use pre-authored {field_N} tags
 * or the commercial docxtemplater meta-module.
 *
 * @returns The pre-processed ArrayBuffer (safe to pass to exportDocx).
 */
export function preprocessDocxBuffer(buffer: ArrayBuffer): ArrayBuffer {
  const zip = new PizZip(buffer)
  const docFile = zip.file('word/document.xml')
  if (!docFile) throw new Error('word/document.xml not found in archive')

  let xml = docFile.asText()

  // Step 1: Consolidate all <w:t> text within each <w:r> into a single value.
  // This merges fragments like <w:t>...</w:t><w:t>..</w:t> within one run.
  xml = xml.replace(
    /<w:r\b([^>]*)>([\s\S]*?)<\/w:r>/g,
    (_match, attrs: string, inner: string) => {
      // Collect all text from w:t nodes inside this run
      const texts: string[] = []
      const tRegex = /<w:t(?:[^>]*)>([\s\S]*?)<\/w:t>/g
      let tMatch: RegExpExecArray | null
      // biome-ignore lint/suspicious/noAssignInExpressions: intentional
      while ((tMatch = tRegex.exec(inner)) !== null) {
        texts.push(tMatch[1])
      }
      const combined = texts.join('')
      // Remove existing w:t nodes and inject a single consolidated one
      const innerWithoutT = inner.replace(/<w:t(?:[^>]*)>[\s\S]*?<\/w:t>/g, '')
      const space = combined.startsWith(' ') || combined.endsWith(' ')
        ? ' xml:space="preserve"'
        : ''
      return `<w:r${attrs}>${innerWithoutT}<w:t${space}>${combined}</w:t></w:r>`
    }
  )

  // Step 2: Within each paragraph (<w:p>), concatenate all run texts, find
  // dot sequences, and replace them with {field_N} tags inside a new run.
  let fieldIndex = 0

  xml = xml.replace(/<w:p\b([\s\S]*?)<\/w:p>/g, (paraMatch) => {
    // Check if this paragraph even contains dots
    if (!XML_DOT_REGEX.test(paraMatch)) {
      XML_DOT_REGEX.lastIndex = 0
      return paraMatch
    }
    XML_DOT_REGEX.lastIndex = 0

    // Replace each dot sequence in the full paragraph XML with a new single-run tag
    return paraMatch.replace(
      // Match a <w:r> that contains a <w:t> with only dots
      /<w:r\b[^>]*>[\s\S]*?<w:t(?:[^>]*)>(\.{5,})<\/w:t>[\s\S]*?<\/w:r>/g,
      (_runMatch, _dots: string) => {
        const tag = `{field_${fieldIndex++}}`
        // Minimal clean run with the docxtemplater tag
        return `<w:r><w:t xml:space="preserve">${tag}</w:t></w:r>`
      }
    )
  })

  zip.file('word/document.xml', xml)
  return zip.generate({ type: 'arraybuffer' }) as ArrayBuffer
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inject formData into a pre-processed .docx buffer (one with {field_N} tags)
 * via docxtemplater and trigger a browser download.
 *
 * IMPORTANT: Pass the buffer returned by preprocessDocxBuffer(), NOT the
 * original uploaded buffer. The original has raw dots; docxtemplater needs tags.
 */
export function exportDocx(
  preprocessedBuffer: ArrayBuffer,
  formData: Record<string, string>,
  filename = 'filled-document.docx'
): void {
  const zip = new PizZip(preprocessedBuffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.render(formData)

  const blob = doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  saveAs(blob, filename)
}

export { DOT_PLACEHOLDER_REGEX }
