import { useRef, useCallback } from "react";
import type { DragEvent } from "react";
import { ImagePlus, X, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface AttachedImage {
  id: string;
  dataUrl: string;
  name: string;
  size: number; // bytes
}

interface Props {
  value: string;
  onChange: (text: string) => void;
  attachments: AttachedImage[];
  onAttach: (img: AttachedImage) => void;
  onDetach: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const fmtBytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1048576).toFixed(1)} MB`;

const fileToAttachment = (file: File): Promise<AttachedImage> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Only images are supported"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        id: uid(),
        dataUrl: reader.result as string,
        name: file.name,
        size: file.size,
      });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// ── component ─────────────────────────────────────────────────────────────────

export function RichDescriptionEditor({
  value,
  onChange,
  attachments,
  onAttach,
  onDetach,
  placeholder = "Describe the issue, impact, and any details the support team should know...",
  disabled = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Process image files ───────────────────────────────────────────────────

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      for (const f of list) {
        try {
          const img = await fileToAttachment(f);
          onAttach(img);
        } catch {
          // skip unsupported files
        }
      }
    },
    [onAttach],
  );

  // ── Paste handler (clipboard screenshots) ────────────────────────────────

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter((i) => i.type.startsWith("image/"));
      if (imageItems.length === 0) return; // let normal text paste proceed
      e.preventDefault();
      const files = imageItems
        .map((i) => i.getAsFile())
        .filter(Boolean) as File[];
      processFiles(files);
    },
    [processFiles],
  );

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden focus-within:ring-2 focus-within:ring-blue-200 transition-shadow"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-7 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          title="Attach screenshot"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Screenshot
        </Button>

        <span className="ml-auto text-[10px] text-slate-400 hidden sm:block">
          <Paperclip className="inline h-3 w-3 mr-1 opacity-60" />
          Paste or drag image here
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {/* Textarea */}
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        disabled={disabled}
        className="h-32 resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
      />

      {/* Attachment thumbnails */}
      {attachments.length > 0 && (
        <div className="border-t border-slate-200 bg-white px-3 py-2">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Attachments ({attachments.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {attachments.map((img) => (
              <div
                key={img.id}
                className="group relative flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2 hover:border-blue-200 transition-colors"
              >
                {/* Thumbnail */}
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Meta */}
                <div className="min-w-0">
                  <p className="max-w-[120px] truncate text-xs font-medium text-slate-700">
                    {img.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {fmtBytes(img.size)}
                  </p>
                </div>
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => onDetach(img.id)}
                  className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 hover:text-red-500"
                  title="Remove attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
