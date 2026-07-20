// components/AnnouncementItem.tsx
import { useState } from "react";
import { Eye, Loader2, Bell } from "lucide-react";
import { markAnnouncementAsRead } from "@/lib/api/announcementApi";
import { resolveFileUrl } from "@/lib/api/fileUtils";

interface Props {
  id: number;
  title: string;
  category: string;
  segment: string;
  isRead: boolean;
  image?: string;
  onMarkedRead?: (id: number) => void; // optional callback to notify parent
}

export default function AnnouncementItem({
  id,
  title,
  category,
  isRead: initialRead,
  image,
  onMarkedRead,
}: Props) {
  const [isRead, setIsRead] = useState(initialRead);
  const [loading, setLoading] = useState(false);

  const handleMarkAsRead = async () => {
    if (isRead || loading) return;
    try {
      setLoading(true);
      await markAnnouncementAsRead(id);
      setIsRead(true);
      onMarkedRead?.(id);
    } catch (err) {
      console.error("Failed to mark announcement as read", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex gap-4 items-start border rounded-xl p-4 bg-white transition-opacity ${isRead ? "opacity-60" : ""}`}
    >
      <span
        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${isRead ? "bg-gray-300" : "bg-blue-500"}`}
      />
      {image ? (
        <img
          src={resolveFileUrl(image)}
          alt={title}
          className="w-14 h-12 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-cic-800" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-sm ${isRead ? "text-gray-400" : "text-gray-900"}`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          <span className="bg-blue-50 text-blue-800 text-xs px-2 py-0.5 rounded">
            {category}
          </span>
        </p>
      </div>
      <button
        onClick={handleMarkAsRead}
        title={isRead ? "Already read" : "Mark as read"}
        className={`mt-0.5 p-1.5 rounded-lg transition-colors ${
          isRead
            ? "text-gray-300 cursor-default"
            : "text-blue-500 hover:bg-blue-50 cursor-pointer"
        }`}
        disabled={isRead || loading}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Eye size={16} />
        )}
      </button>
    </div>
  );
}
