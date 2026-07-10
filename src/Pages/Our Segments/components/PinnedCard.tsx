import { FileText } from "lucide-react";

interface Props {
  title: string;
  category: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  HR: "HR",
  FINANCE: "Finance",
  OPERATION: "Operations",
};

export default function PinnedCard({ title, category }: Props) {
  const label = CATEGORY_LABEL[category] ?? category;
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-cic-50 border border-cic-100 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-cic-700" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-1">
          {title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{label} · Document</p>
      </div>
      <span className="shrink-0 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
        DOC
      </span>
    </div>
  );
}
