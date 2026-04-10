interface Props {
  name: string;
  description: string;
}

const colorMap = [
  { bg: "bg-slate-100", avatar: "bg-slate-500" },
  { bg: "bg-blue-50", avatar: "bg-blue-400" },
  { bg: "bg-gray-100", avatar: "bg-gray-400" },
  { bg: "bg-stone-100", avatar: "bg-stone-400" },
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
        <div
          className={`w-16 h-16 rounded-full ${color.avatar} flex items-center justify-center text-white text-lg font-medium tracking-wide`}
        >
          {name.substring(0, 2).toUpperCase()}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-xs mt-0.5 text-gray-500">{description}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
