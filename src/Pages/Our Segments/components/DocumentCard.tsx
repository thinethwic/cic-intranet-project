interface Props {
  title: string;
  category: string;
  type: "PDF" | "XLSX" | "DOCS";
  fileUrl: string;
}

export default function DocumentCard({
  title,
  category,
  type,
  fileUrl,
}: Props) {
  const colors = {
    PDF: "bg-red-100 text-red-700",
    XLSX: "bg-green-100 text-green-700",
    DOCS: "bg-yellow-100 text-yellow-700",
  };

  const iconColors = {
    PDF: "bg-red-50 text-red-600",
    XLSX: "bg-green-50 text-green-600",
    DOCS: "bg-yellow-50 text-yellow-600",
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = title; // suggested filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={handleDownload}
      className="flex flex-col gap-3 border rounded-xl p-4 bg-white hover:shadow-md hover:border-blue-200 transition cursor-pointer group"
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${iconColors[type]}`}
      >
        {type}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold group-hover:text-blue-900 transition">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{category}</p>
      </div>

      {/* Badge + download icon */}
      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${colors[type]}`}
        >
          {type}
        </span>
        <svg
          className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
          />
        </svg>
      </div>
    </div>
  );
}
