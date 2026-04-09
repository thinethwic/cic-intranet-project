import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  description: string;
}

const colorMap = [
  {
    bg: "bg-blue-100",
    avatar: "bg-blue-500",
    name: "text-blue-900",
    role: "text-blue-700",
  },
  {
    bg: "bg-teal-100",
    avatar: "bg-teal-600",
    name: "text-teal-900",
    role: "text-teal-700",
  },
  {
    bg: "bg-orange-100",
    avatar: "bg-orange-600",
    name: "text-orange-900",
    role: "text-orange-700",
  },
  {
    bg: "bg-pink-100",
    avatar: "bg-pink-500",
    name: "text-pink-900",
    role: "text-pink-700",
  },
];

let colorIndex = 0;

export default function WelcomeCard({ name, description }: Props) {
  const color = colorMap[colorIndex++ % colorMap.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Colored Header */}
      <div
        className={`${color.bg} flex flex-col items-center gap-3 pt-7 pb-5 px-4`}
      >
        {/* Avatar */}
        <div
          className={`w-16 h-16 rounded-full ${color.avatar} flex items-center justify-center text-white text-lg font-medium tracking-wide`}
        >
          {name.substring(0, 2).toUpperCase()}
        </div>

        {/* Name & Role */}
        <div className="text-center">
          <p className={`text-sm font-medium ${color.name}`}>{name}</p>
          <p className={`text-xs mt-0.5 ${color.role}`}>{description}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-xs text-gray-500 text-center leading-relaxed mb-4">
          {description}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs font-medium"
        >
          See Profile →
        </Button>
      </div>
    </div>
  );
}
