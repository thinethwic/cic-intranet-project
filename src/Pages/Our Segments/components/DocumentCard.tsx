interface Props {
  title: string;
  category: string;
  type: "PDF" | "XLSX" | "DOCS";
  fileUrl: string;
  // FIX 4: added missing access-control props
  allowDownload: boolean;
  allowView: boolean;
}

export default function DocumentCard({
  title,
  category,
  type,
  fileUrl,
  allowDownload,
  allowView,
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

  // FIX 5: respect allowDownload and allowView flags
  const handleClick = () => {
    if (allowDownload) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (allowView) {
      window.open(fileUrl, "_blank");
    }
    // if neither, do nothing — card is effectively locked
  };

  const isClickable = allowDownload || allowView;

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`flex flex-col gap-3 border rounded-xl p-4 bg-white transition group
        ${
          isClickable
            ? "hover:shadow-md hover:border-blue-200 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
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

      {/* Badge + action icon */}
      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${colors[type]}`}
        >
          {type}
        </span>

        {/* FIX 5: show the right icon based on what action is available */}
        {allowDownload ? (
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
        ) : allowView ? (
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10M9 9l3-3 3 3M9 15l3 3 3-3"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
