import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Share2,
  Bookmark,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { newsList } from "@/Mock-data"; // ✅ single import

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Search in single list — no merging needed
  const news = newsList.find((n) => n.id === Number(id));

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <Tag className="w-7 h-7 opacity-40" />
        </div>
        <p className="text-lg font-medium">Article not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  // Related articles — same category, exclude current
  const related = newsList
    .filter((n) => n.id !== news.id && n.category === news.category)
    .slice(0, 3);

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

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-200">
          {news.author && (
            <span className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-semibold">
                {news.author.charAt(0)}
              </div>
              {news.author}
            </span>
          )}
          {news.date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {fmtDate(news.date)}
            </span>
          )}
          {news.readTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {news.readTime}
            </span>
          )}
        </div>

        {/* Hero image */}
        {news.image && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img
              src={news.image}
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
                      src={item.image}
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
                    {item.date && (
                      <p className="text-xs text-slate-400 mt-1.5">
                        {fmtDate(item.date)}
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
