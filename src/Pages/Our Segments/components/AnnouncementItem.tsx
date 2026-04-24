// components/AnnouncementItem.tsx
import { useState } from "react";
import { Eye } from "lucide-react";

interface Props {
  id: number;
  title: string;
  category: string;
  segment: string;
  isRead: boolean;
}

export default function AnnouncementItem({
  title,
  category,
  isRead: initialRead,
}: Props) {
  const [isRead, setIsRead] = useState(initialRead);

  return (
    <div
      className={`flex gap-4 items-start border rounded-xl p-4 bg-white transition-opacity ${isRead ? "opacity-60" : ""}`}
    >
      <span
        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${isRead ? "bg-gray-300" : "bg-blue-500"}`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-sm ${isRead ? "text-gray-400" : "text-gray-900"}`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {} ·{" "}
          <span className="bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded">
            {category}
          </span>
        </p>
      </div>
      <button
        onClick={() => setIsRead(true)}
        title="Mark as read"
        className={`mt-0.5 p-1.5 rounded-lg transition-colors ${
          isRead
            ? "text-gray-300 cursor-default"
            : "text-blue-500 hover:bg-blue-50 cursor-pointer"
        }`}
        disabled={isRead}
      >
        <Eye size={16} />
      </button>
    </div>
  );
}
