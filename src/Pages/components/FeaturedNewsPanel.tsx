// FeaturedNewsPanel.tsx
import { useNavigate } from "react-router-dom";
import { Flame, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

type NewsItem = {
  id: string;
  title: string;
  description: string;
  content?: string;
  image?: string;
  category?: string;
  isHot?: boolean;
  createdAt?: string;
};

interface Props {
  featured: NewsItem;
  sideItems: NewsItem[];
}

const VISIBLE = 3;

export default function FeaturedNewsPanel({ featured, sideItems }: Props) {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);

  const canScrollUp = startIndex > 0;
  const canScrollDown = startIndex + VISIBLE < sideItems.length;

  const visibleItems = sideItems.slice(startIndex, startIndex + VISIBLE);

  return (
    <div className="bg-[#0E4E96] rounded-xl p-8 text-white">
      <h2 className="text-lg font-bold mb-4">NEWS</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* LEFT: big image + title + desc below */}
        <div className="flex flex-col">
          <div className="w-full h-64 md:h-72 rounded-xl overflow-hidden mb-3 bg-slate-100 flex-shrink-0">
            {featured.image ? (
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <Flame className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            {featured.isHot && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                <Flame className="w-3 h-3" /> Hot
              </span>
            )}
            {featured.category && (
              <span className="text-[11px] text-slate-400 uppercase tracking-wide">
                {featured.category}
              </span>
            )}
          </div>

          <h3
            className="text-base font-bold leading-snug mt-3 mb-2 cursor-pointer hover:underline"
            onClick={() => navigate(`/news/${featured.id}`)}
          >
            {featured.title}
          </h3>

          <p className="text-sm font-bold text-blue-200 leading-relaxed line-clamp-2">
            {featured.description}
          </p>

          <p className="text-sm text-blue-200 leading-relaxed line-clamp-3 mt-1">
            {featured.content}
          </p>

          <button
            className="text-sm font-semibold text-white text-left mt-3 hover:underline"
            onClick={() => navigate(`/news/${featured.id}`)}
          >
            View Full News
          </button>
        </div>

        {/* RIGHT: 3 visible items + scroll buttons */}
        <div className="flex gap-2">
          {/* News list */}
          <div className="flex-1 flex flex-col divide-y divide-white/10">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 py-3 cursor-pointer group"
                onClick={() => navigate(`/news/${item.id}`)}
              >
                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-600">
                      <Flame className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {item.isHot && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 mb-1">
                      <Flame className="w-2.5 h-2.5" /> Hot
                    </span>
                  )}
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </p>
                  {item.category && (
                    <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wide">
                      {item.category}
                    </p>
                  )}
                  <p className="text-xs text-blue-200 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                  <span className="text-xs font-semibold text-white mt-1 block group-hover:underline">
                    View Full News
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll buttons — vertical, right side */}
          {sideItems.length > VISIBLE && (
            <div className="flex flex-col justify-center gap-2 pl-1">
              <button
                onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
                disabled={!canScrollUp}
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                  canScrollUp
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-white/10 text-white/20 cursor-not-allowed"
                }`}
                aria-label="Scroll up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              {/* Dot indicators */}
              <div className="flex flex-col items-center gap-1 py-1">
                {Array.from({
                  length: sideItems.length - VISIBLE + 1,
                }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStartIndex(i)}
                    className={`w-1.5 rounded-full transition-all ${
                      i === startIndex
                        ? "h-4 bg-white"
                        : "h-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setStartIndex((i) =>
                    Math.min(sideItems.length - VISIBLE, i + 1),
                  )
                }
                disabled={!canScrollDown}
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                  canScrollDown
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-white/10 text-white/20 cursor-not-allowed"
                }`}
                aria-label="Scroll down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
