import { Card, CardContent } from "@/components/ui/card";

interface Props {
  image: string;
  title: string;
  date: string; // e.g. "Aug 25, 2026"
  time?: string; // e.g. "6:00 PM"
  location?: string;
}

export default function EventCard({
  image,
  title,
  date,
  time,
  location,
}: Props) {
  return (
    <Card className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* Image Section */}
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="h-44 w-full object-cover group-hover:scale-105 transition duration-300"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-semibold shadow">
          {date}
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-2">
        {/* Time & Location */}
        <div className="text-xs text-gray-500 space-y-1">
          {time && <p>⏰ {time}</p>}
          {location && <p>📍 {location}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
