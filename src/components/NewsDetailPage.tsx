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
import { newsList, HotnewsList } from "@/Mock-data";

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Search in both news lists
  const allNews = [...newsList, ...HotnewsList];
  const news = allNews.find((n) => n.id === Number(id));

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
            Back to News
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
        {/* Category + meta */}
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
              {news.date}
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
        <div className="rounded-2xl overflow-hidden mb-8">
          <img
            src={news.image}
            alt={news.title}
            className="w-full object-cover max-h-[460px]"
          />
        </div>

        {/* Description (lead paragraph) */}
        <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
          {news.description}
        </p>

        {/* Full content body */}
        {news.content ? (
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
            {news.content.split("\n\n").map((para, i) => (
              <p key={i} className="text-base leading-7">
                {para}
              </p>
            ))}
          </div>
        ) : (
          // Fallback if no content field — repeats description as placeholder
          <div className="space-y-4 text-slate-700">
            <p className="text-base leading-7">{news.description}</p>
            <p className="text-base leading-7 text-slate-400 italic">
              Full article content coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
