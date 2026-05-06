import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Share2, Bookmark, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNewsById, useNews } from "@/hooks/useNews";
import NotFoundPage from "./shared/NotFoundPage";

const BASE_IMAGE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ── Helpers ───────────────────────────────────────────
const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const getReadTime = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();

  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

// ─────────────────────────────────────────────────────
export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { news, loading, error } = useNewsById(Number(id));
  const { news: allNews } = useNews();

  const related = news
    ? allNews
        .filter((n) => n.id !== news.id && n.category === news.category)
        .slice(0, 3)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
        <p className="text-sm font-medium text-slate-400">Loading article...</p>
      </div>
    );
  }

  if (error) {
    return <NotFoundPage />;
  }

  if (!news) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top nav bar ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to news
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-800"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-800"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {news.category && (
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium hover:bg-blue-50">
              {news.category}
            </Badge>
          )}
          {news.isHot && (
            <Badge className="bg-red-50 text-red-700 border border-red-200 text-xs font-medium hover:bg-red-50">
              Hot
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
          {news.title}
        </h1>

        {/* Meta row — date + time ago both derived from createdAt */}
        {news.createdAt && (
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {fmtDate(news.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {getReadTime(news.createdAt)}
            </span>
          </div>
        )}

        {/* Hero image */}
        {news.image && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img
              src={`${BASE_IMAGE_URL}${news.image}`}
              alt={news.title}
              className="w-full object-cover max-h-[460px]"
            />
          </div>
        )}

        {/* Lead paragraph */}
        <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
          {news.description}
        </p>

        {/* Full content */}
        {news.content ? (
          <div className="space-y-4">
            {news.content.split("\n\n").map((para, i) => (
              <p key={i} className="text-base text-slate-700 leading-7">
                {para}
              </p>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-base text-slate-700 leading-7">
              {news.description}
            </p>
            <p className="text-base text-slate-400 italic leading-7">
              Full article content coming soon.
            </p>
          </div>
        )}

        {/* ── Related articles ─────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">
              Related articles
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/news/${item.id}`)}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                  {item.image && (
                    <img
                      src={`${BASE_IMAGE_URL}${item.image}`}
                      alt={item.title}
                      className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="p-3">
                    {item.category && (
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1.5 inline-block">
                        {item.category}
                      </span>
                    )}
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                      {item.title}
                    </p>
                    {/* ✅ time ago on related cards */}
                    {item.createdAt && (
                      <p className="text-xs text-slate-400 mt-1.5">
                        {getReadTime(item.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
