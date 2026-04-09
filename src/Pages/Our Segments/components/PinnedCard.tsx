interface Props {
  title: string;
  category: string;
}

export default function PinnedCard({ title, category }: Props) {
  return (
    <div className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white hover:shadow-sm transition">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
        <p className="text-sm font-medium">{title}</p>
      </div>

      <span className="text-xs text-gray-400">{category}</span>
    </div>
  );
}
