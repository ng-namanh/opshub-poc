import { FileText, Upload } from "@phosphor-icons/react";
import { useCallback, useRef, useState } from "react";

interface DocxUploaderProps {
  onFile: (file: File) => void;
  filename?: string;
}

export default function DocxUploader({ onFile, filename }: DocxUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (!file.name.endsWith(".docx")) {
        alert("Please upload a .docx file.");
        return;
      }
      onFile(file);
    },
    [onFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: <explanation>
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload .docx file"
      className={`
        flex items-center justify-center
        rounded-xl border-2 border-dashed
        px-8 py-10 cursor-pointer
        transition-colors duration-150 outline-none
        ${isDragging
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary hover:bg-muted"
        }
        focus-visible:border-primary
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={handleInputChange}
      />

      {filename ? (
        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
          <FileText size={28} weight="duotone" className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {filename}
          </span>
          <span className="text-xs text-muted-foreground/80">
            Click or drop to replace
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
          <Upload size={36} weight="duotone" className="text-primary" />
          <p className="text-sm m-0">
            Drop a <strong className="text-foreground">.docx</strong> file here
          </p>
          <p className="text-xs text-muted-foreground/80 m-0">or click to browse</p>
        </div>
      )}
    </div>
  );
}
