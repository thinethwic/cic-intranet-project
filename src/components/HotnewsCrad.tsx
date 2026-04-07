import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HotNewsCardProps {
  title: string;
  description: string;
  image: string;
  onClick?: () => void;
}

export default function HotNewsCard({
  title,
  description,
  image,
  onClick,
}: HotNewsCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition group">
      {/* Image */}
      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-blue-900 text-sm mb-2 line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{description}</p>

        <Button
          onClick={onClick}
          className="w-full bg-blue-900 hover:bg-blue-950 text-white"
        >
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
}
