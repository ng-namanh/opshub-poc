# ONLYOFFICE Evaluation & Alignment Analysis

> Evaluated: 2026-04-17  
> Context: Assessing ONLYOFFICE as a potential addition or replacement to the current `opshub-poc` DOCX Form Filler stack.

---

## What Is ONLYOFFICE?

ONLYOFFICE is an **open-source, privacy-first office suite** that provides document editing (DOCX, XLSX, PPTX, PDF), real-time collaboration, and project/team management. It is positioned as a full alternative to Microsoft 365 and Google Workspace, with a strong emphasis on **self-hosting and data sovereignty**.

**Product line:**
- **ONLYOFFICE Docs** — The embeddable document editing engine / Document Server API
- **ONLYOFFICE DocSpace** — The full collaboration workspace (rooms, file management, teams)

---

## Key Strengths

### 1. Best-in-Class MS Office Compatibility
Renders DOCX/XLSX/PPTX with near-perfect fidelity — consistently rated above LibreOffice and WPS. Complex formatting, macros, and tracked changes are preserved reliably.

### 2. Privacy & Self-Hosting
- Fully open-source (AGPL v3 license)
- Self-deployable via Docker / on-prem
- Zero dependency on any cloud provider
- Strong for GDPR/HIPAA compliance environments

### 3. Developer-Friendly Embedding API
The **Document Server API** is designed explicitly for embedding the editor into third-party web apps:
- Embed via JavaScript snippet
- Event hooks: `onDocumentReady`, `onSave`, custom callbacks
- Plugin system to extend editor functionality
- Pre-built integrations: Nextcloud, ownCloud, SharePoint, Confluence

### 4. Real-Time Collaboration
- **Fast mode** (live cursors, Google Docs-style) and **Strict mode** (locked sections)
- Comments, tracked changes, version history
- Granular permissions: View / Comment / Edit / Fill-only

### 5. AI Integration (2025+)
- Inline AI agent in Docs
- AI-powered spreadsheet analysis
- PDF OCR (text extraction from scanned documents)
- AI-generated macros

### 6. Cost Efficiency

| Tier | Price |
|---|---|
| Desktop (personal) | **Free** |
| DocSpace Cloud – Startup | **Free** (3 admins, 12 rooms, 2 GB) |
| DocSpace Cloud – Business | **$20/admin/month** (unlimited users & rooms, 250 GB/admin) |
| Self-Hosted Community | **Free** (open-source) |
| Self-Hosted Enterprise | Custom quote |

---

## Key Weaknesses

| Weakness | Detail |
|---|---|
| No built-in Mail/Calendar | Requires full ONLYOFFICE Workspace for those features |
| Mobile apps | Functional but less polished than Desktop/Web |
| Formatting import issues | Complex Google Docs or Pages files may render imperfectly |
| Admin complexity | Self-hosted setup requires DevOps experience (Docker, nginx, SSL) |
| Free tier support | Community forums only — no SLA without Enterprise plan |
| UI polish | Slightly dated compared to Notion or newer editors |

---

## Competitive Comparison

| Criteria | ONLYOFFICE | Google Workspace | Microsoft 365 |
|---|---|---|---|
| MS Office fidelity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Privacy / Self-Host | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| Collaboration UX | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Developer API | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Cost efficiency | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Ecosystem breadth | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| AI features | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Overall Rating: 8/10**

---

## Does ONLYOFFICE Align With opshub-poc?

**Conclusion: No — not for the current use case.**

### Architecture Mismatch

| Concern | Current Approach | ONLYOFFICE Approach |
|---|---|---|
| Parse DOCX → display | `mammoth` → HTML → React | Native render inside iframe-based editor |
| Replace placeholders with inputs | Regex + `html-react-parser` + `DynamicInput` | Not natively supported |
| Collect form data | Controlled React state + IndexedDB | No structured form-data concept |
| Export filled DOCX | `docxtemplater` + `{field_N}` tags | Exports the full edited document |
| Save state to Supabase | Custom JSONB via fetch | Not supported |

**The fundamental mismatch:** ONLYOFFICE is a **rich document editor** (Word-in-browser). This project is a **form-filling engine** that uses a DOCX as a template. These are different problems.

Adopting ONLYOFFICE would mean:
1. Discarding the custom placeholder → `<input>` substitution pipeline
2. Losing the structured `formData` state (`{ field_0: "value", ... }`)
3. Replacing ~170 lines of purpose-built logic with a heavyweight embedded editor (~8 MB+)

### Actual Gaps in the Current Approach

These are real limitations that ONLYOFFICE also does **not** solve:

1. **Split-run fragility** — `preprocessDocxBuffer` is brittle for heavily-styled Word docs where a single dot sequence is split across multiple `<w:r>` OOXML runs. Mitigation: enforce `{field_N}` tag authoring in templates upstream.
2. **Re-import filled docs** — Architecturally infeasible without the original metadata. Mitigation: store the `preprocessedBuffer` (base64) alongside `formData` in Supabase.
3. **Export round-trip** — Accept the one-way pipeline: `.docx template → fill → export filled.docx`.

### When ONLYOFFICE Would Make Sense (Future Scope)

Only if requirements shift to:
- Users **freely editing** full document content (not just filling blanks)
- Generating DOCX from scratch in-browser
- Full collaborative co-editing with tracked changes

### Recommendation

**Stick with the current stack** (`mammoth` + `html-react-parser` + `docxtemplater`). It is the correct architectural approach for a form-filler. Address the split-run and re-import limitations incrementally.
