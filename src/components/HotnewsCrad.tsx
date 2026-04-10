import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HotNewsCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
  date?: string;
  category?: string;
  onClick?: () => void;
}

export default function HotNewsCard({
  id,
  title,
  description,
  image,
  date,
  category,
  onClick,
}: HotNewsCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/news/${id}`);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition group cursor-pointer">
      <div className="overflow-hidden" onClick={handleClick}>
        <img
          src={image}
          alt={title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <CardContent className="p-4">
        {category && (
          <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2 inline-block">
            {category}
          </span>
        )}

        <h3 className="font-semibold text-blue-900 text-sm mb-2 line-clamp-2">
          {title}
        </h3>

        {date && <p className="text-xs text-slate-400 mb-2">{date}</p>}

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{description}</p>

        <Button
          onClick={handleClick}
          className="w-full bg-blue-900 hover:bg-blue-950 text-white"
        >
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
}
