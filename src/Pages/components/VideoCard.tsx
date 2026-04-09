interface Props {
  title: string;
  description: string;
  videoLink: string;
  onClick: () => void;
}

export default function VideoCard({
  title,
  description,
  videoLink,
  onClick,
}: Props) {
  const isYouTube =
    !videoLink.includes("facebook") && !videoLink.includes("fb");

  // Extract YouTube ID
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
          className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
        />
      ) : (
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
            videoLink,
          )}&show_text=false`}
          className="w-full h-full object-cover pointer-events-none"
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
        <p className="text-xs text-gray-200 mt-1 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
