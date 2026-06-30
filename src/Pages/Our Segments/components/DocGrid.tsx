import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import DocumentCard from "./DocumentCard";

const DOCS_PER_PAGE = 6;

interface Doc {
  id: number;
  title: string;
  category: string;
  type: "PDF" | "XLSX" | "DOCS";
  fileUrl: string;
  allowDownload: boolean;
  allowView: boolean;
}

interface DocGridProps {
  documents: Doc[];
  onView: (id: number) => void;
  onDownload: (id: number, title: string) => void;
}

export default function DocGrid({
  documents,
  onView,
  onDownload,
}: DocGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(documents.length / DOCS_PER_PAGE);

  // Reset to page 1 whenever the document list changes (filter / search)
  useEffect(() => {
    setCurrentPage(1);
  }, [documents]);

  const paginated = documents.slice(
    (currentPage - 1) * DOCS_PER_PAGE,
    currentPage * DOCS_PER_PAGE,
  );

  if (documents.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center gap-3">
        <FileText className="w-10 h-10 text-slate-200" />
        <p className="text-sm text-slate-400">No documents found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {paginated.map((doc) => (
          <DocumentCard
            key={doc.id}
            title={doc.title}
            category={doc.category}
            type={doc.type}
            fileUrl={doc.fileUrl}
            allowDownload={doc.allowDownload}
            allowView={doc.allowView}
            onView={() => onView(doc.id)}
            onDownload={() => onDownload(doc.id, doc.title)}
          />
        ))}
      </div>

      {/* Pagination — only shown when there is more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          {/* Info */}
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {(currentPage - 1) * DOCS_PER_PAGE + 1}–
              {Math.min(currentPage * DOCS_PER_PAGE, documents.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">
              {documents.length}
            </span>
          </p>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-all ${
                  currentPage === page
                    ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
