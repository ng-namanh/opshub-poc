# OpsHub Proof of Concept (POC)

OpsHub is an advanced document automation and management platform built with React, TypeScript, Vite, and Supabase. 

This Proof of Concept (POC) bridges the gap between rigid, offline `.docx` workflows and dynamic, cloud-first internal tooling. It provides two distinct pathways to achieve seamless document automation.

## What this POC solves

Operation teams often rely on boilerplate `.docx` templates (e.g. NDAs, vendor agreements, bidding contracts) where users must manually locate `.......` placeholders and type in their data. This is error-prone, hard to track, and difficult to manage version control securely.

The OpsHub POC solves this through two iterative modules:

### 1. Form Filler (V1)
A reverse-engineering approach to legacy document workflows.
* **The Flow:** Users upload an existing legacy `.docx` file filled with line placeholders (e.g., `Name: ........`).
* **The Solution:** The system parses the binary `.docx` file into rendering HTML via `mammoth`, intelligently detects contiguous line placehoder sequences using Regex, and dynamically injects strictly controlled React `<input>` fields directly into the document view.
* **Result:** It provides a hybrid interactive document layout. The user type data into the web UI which safely handles two-way data-binding. The final state is reconstructed back into a formatted `.docx` file through `docxtemplater` mapping and exported, ensuring legacy systems can still consume the files.

### 2. Template Editor (V2)
A unified, cloud-native rich-text platform to completely eliminate legacy external editors.
* **The Flow:** Users draft documents directly inside the web interface using an advanced rich-text Tiptap editor.
* **The Solution:** Instead of dots, users declare absolute Variable tokens (`{{customer_name}}`) along with their expected DataType (Text, Number, Date). These variables are rendered as smart interactive chips within the editor surface itself.
* **Result:** Templates are saved immutably to **Supabase** via relational Postgres schemas (`document_templates` mapped uniquely to `template_variables`). These variables dynamically build structured sidebars, drastically simplifying future template-filler workflows. 

---

## Technical Architecture & Stack

- **Frontend Core:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS v4 featuring a sleek, bespoke Intercom-inspired Light Theme (Warm creams, Off-Black text, Fin Orange accents).
- **UI Architecture:** Built entirely upon `@shadcn` composition philosophies (`Button`, `Input`, `Badge`, `ScrollArea`) for robust un-styled component access.
- **Rich Text Editor:** `Tiptap` combined with custom Node Extensions (for defining interactive `{{variable}}` schemas).
- **Offline/Caching:** Client-side local persistence leveraging standard `IndexedDB` schemas to enable instant, optimistic UI switching unblocked by network requests.
- **Backend & Auth:** Supabase and PostgreSQL.
- **Document Processing:**  
  - `mammoth.js`: Translating binary `.docx` -> semantic `HTML`.  
  - `docxtemplater`: Re-injecting JSON state -> binary `.docx`.  
  - `pizzip`: Binary archive zipping standard for internal OOXML mapping.

---

## Database Schemas (Supabase Postgres)

The application models templates in a highly structured structure ensuring atomicity.

```sql
create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  filename text,
  html_content text,
  status text check (status in ('Draft', 'Published', 'Archived')) default 'Draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.template_variables (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.document_templates on delete cascade not null,
  key text not null,
  label text not null,
  data_type text not null, -- 'Text', 'Number', 'Date'
  created_at timestamp with time zone default now()
);
```

## Running the Project

```bash
# Install dependencies
bun install

# Start the dev server
bun dev
```