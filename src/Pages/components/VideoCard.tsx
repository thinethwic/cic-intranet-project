interface Props {
  title: string;
  description: string;
  videoLink: string;
  onClick: () => void;
}

import { useEffect } from "react";

interface VideoModalProps {
  activeVideo: string;
  videos: string[];
  onClose: () => void;
  onNavigate: (link: string) => void;
  getEmbedUrl: (link: string) => string;
}

export function VideoModal({
  activeVideo,
  videos,
  onClose,
  onNavigate,
  getEmbedUrl,
}: VideoModalProps) {
  const currentIndex = videos.indexOf(activeVideo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const next = videos[currentIndex + 1];
        if (next) onNavigate(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prev = videos[currentIndex - 1];
        if (prev) onNavigate(prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, videos, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4"
      onClick={onClose} // click backdrop to close
    >
      {/* Prev arrow */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(videos[currentIndex - 1]);
          }}
          className="absolute left-3 sm:left-6 text-white text-3xl p-2 hover:text-gray-300 transition"
          aria-label="Previous video"
        >
          ‹
        </button>
      )}

      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()} // prevent backdrop close on iframe click
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition"
          aria-label="Close"
        >
          ✕
        </button>
        <iframe
          src={getEmbedUrl(activeVideo)}
          className="w-full aspect-video rounded-lg"
          allowFullScreen
        />
      </div>

      {/* Next arrow */}
      {currentIndex < videos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(videos[currentIndex + 1]);
          }}
          className="absolute right-3 sm:right-6 text-white text-3xl p-2 hover:text-gray-300 transition"
          aria-label="Next video"
        >
          ›
        </button>
      )}
    </div>
  );
}

export default function VideoCard({
  title,
  description,
  videoLink,
  onClick,
}: Props) {
  // ✅ Guard — if no videoLink, render nothing
  if (!videoLink) return null;

  const isYouTube =
    !videoLink.includes("facebook") && !videoLink.includes("fb");

  const getYouTubeId = (url: string) => {
    if (!url.includes("http")) return url;
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : url;
  };

  const youtubeId = getYouTubeId(videoLink);

  return (
    <div
      onClick={onClick}
      className="relative min-w-100 h-75 rounded-xl overflow-hidden cursor-pointer group transition-all duration-300"
    >
      {/* 🎬 VIDEO PREVIEW */}
      {isYouTube ? (
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt={title} // ✅ add alt
          className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
        />
      ) : (
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoLink)}&show_text=false`}
          className="w-full h-full object-cover pointer-events-none"
          title={title} // ✅ add title
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/60 transition" />

      {/* ▶ Play */}
      <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-black text-xl shadow-lg">
          ▶
        </div>
      </div>

      {/* Details */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-full group-hover:translate-y-0 transition duration-300">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-gray-200 mt-1 -clamp-2">{description}</p>
      </div>
    </div>
  );
}
