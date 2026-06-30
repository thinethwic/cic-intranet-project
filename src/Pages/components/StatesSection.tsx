import { useMembers } from "@/hooks/useMembers";
import { useEffect, useRef, useState } from "react";

/* ✅ Counter Component */
function Counter({ end, start }: { end: number; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const duration = 1200;
    const step = end / (duration / 16);

    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, start]);

  return <>{count}</>;
}

/* ✅ Skeleton Card */
function StatSkeleton() {
  return (
    <div className="rounded-xl p-6  shadow-sm text-center space-y-3 animate-pulse">
      <div className="h-14 w-24 bg-gray-200 rounded-lg mx-auto" />
      <div className="h-4 w-32 bg-gray-100 rounded mx-auto" />
    </div>
  );
}

/* ✅ Stats Section */
export default function StatsSection() {
  const { members, loading, error } = useMembers();
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const topManagement = members.filter((m) => m.role === "TOP_MANAGEMENT");

  const stats = [
    { value: topManagement.length, suffix: "+", label: "Top Management" },
    { value: members.length, suffix: "+", label: "Employees" },
    { value: 4, suffix: "+", label: "Companies" },
  ];

  // Counter trigger — fires when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Card entrance animation — per-card observer
  useEffect(() => {
    if (loading || stats.length === 0) return;

    setVisibleCards(new Array(stats.length).fill(false));

    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleCards((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 150);
            observer.disconnect();
          }
        },
        { threshold: 0.1 },
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [loading]);

  return (
    <section
      ref={sectionRef}
      className="bg-[#0E4E96] max-w-full mx-auto px-6 py-10"
    >
      {error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 px-6 py-8 text-center">
          <p className="text-sm font-medium text-red-500">
            Failed to load statistics.
          </p>
          <p className="text-xs text-red-400 mt-1">Please refresh the page.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loading
            ? [...Array(3)].map((_, i) => <StatSkeleton key={i} />)
            : stats.map((item, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  style={{
                    opacity: visibleCards[i] ? 1 : 0,
                    transform: visibleCards[i]
                      ? "translateY(0)"
                      : "translateY(28px)",
                    transition: "opacity 0.6s ease, transform 0.6s ease",
                  }}
                  className="rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <h3 className="text-7xl font-bold text-white">
                    <Counter end={item.value} start={isVisible} />
                    {item.suffix}
                  </h3>
                  <p className="text-white text-xl mt-2">{item.label}</p>
                </div>
              ))}
        </div>
      )}
    </section>
  );
}
