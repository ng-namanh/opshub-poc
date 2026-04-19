import DocxUploader from "@/components/DocxUploader";
import DocxViewer from "@/components/DocxViewer";
import ExportBar from "@/components/ExportBar";
import SavedDocumentsList from "@/components/SavedDocumentsList";
import TabBar, { type AppTab } from "@/components/TabBar";
import TemplateEditor from "@/components/TemplateEditor";
import { useDocxForm } from "@/hooks/useDocxForm";
import {
  type SavedDocument,
  useSavedDocuments,
} from "@/hooks/useSavedDocuments";
import { FileDocIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("filler");

  // ── V1 Form Filler state ──────────────────────────────────────────────────
  const {
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
  } = useDocxForm();

  const {
    documents,
    isLoading: listLoading,
    error: listError,
    refetch,
  } = useSavedDocuments();

  const [activeDocId, setActiveDocId] = useState<string | undefined>();

  const filledCount = Object.values(formData).filter(
    (v) => v.trim() !== "",
  ).length;

  const handleSelectDoc = async (doc: SavedDocument) => {
    setActiveDocId(doc.id);
    await handleLoad(doc);
  };

  const handleSaveAndRefresh = async () => {
    await handleSave();
    refetch();
  };

  return (
    <div className="min-h-svh flex flex-col bg-background text-foreground font-sans">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="px-8 py-4 border-b border-border flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 text-primary font-semibold text-lg shrink-0">
          <FileDocIcon size={26} weight="duotone" />
          <span>OpsHub</span>
        </div>

        {/* Tab switcher */}
        <TabBar activeTab={activeTab} onChange={setActiveTab} />

        {/* Right spacer — keeps tabs centered-ish */}
        <div className="w-32 shrink-0" />
      </header>

      {/* ── V1 Form Filler ───────────────────────────────────────── */}
      {activeTab === "filler" && (
        <div className="flex flex-1 gap-6 px-8 py-8 max-w-7xl w-full mx-auto">
          {/* Left: saved documents sidebar */}
          <SavedDocumentsList
            documents={documents}
            isLoading={listLoading}
            error={listError}
            activeId={activeDocId}
            onSelect={handleSelectDoc}
            onRefresh={refetch}
          />

          {/* Divider */}
          <div className="w-px bg-border shrink-0" />

          {/* Right: editor area */}
          <main className="flex-1 flex flex-col gap-5 min-w-0">
            <DocxUploader onFile={handleFile} filename={filename} />

            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground text-sm">
                <SpinnerIcon size={20} className="animate-spin" />
                Loading document from cloud…
              </div>
            )}

            {html && !isLoading && (
              <>
                <DocxViewer
                  html={html}
                  formData={formData}
                  onFieldChange={handleChange}
                />

                <ExportBar
                  fieldCount={fieldCount}
                  filledCount={filledCount}
                  isExporting={isExporting}
                  isSaving={isSaving}
                  saveSuccess={saveSuccess}
                  errorMsg={errorMsg}
                  onExport={handleExport}
                  onSave={handleSaveAndRefresh}
                  onReset={() => {
                    handleReset();
                    setActiveDocId(undefined);
                  }}
                  disabled={!html}
                />
              </>
            )}
          </main>
        </div>
      )}

      {/* ── V2 Template Editor ───────────────────────────────────── */}
      {activeTab === "editor" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <TemplateEditor />
        </div>
      )}
    </div>
  );
}
