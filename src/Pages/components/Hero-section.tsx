import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Wheat, Pill, Bird, Syringe } from "lucide-react";

import slide1 from "../../assets/slide1.png";
import slide2 from "../../assets/slide2.png";
import slide3 from "../../assets/slide3.png";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

const slides: Slide[] = [
  {
    title: "Welcome to CIC Feeds Group",
    subtitle: "Sri Lanka's Leading Livestock Solutions Provider",
    image: slide1,
  },
  {
    title: "Quality You Can Trust",
    subtitle: "Delivering excellence in animal nutrition since 1964",
    image: slide2,
  },
  {
    title: "Innovation in Agriculture",
    subtitle: "Empowering farmers with cutting-edge solutions",
    image: slide3,
  },
];

const categories = [
  { label: "CIC Feeds", icon: Wheat },
  { label: "CIC Vetcare", icon: Pill },
  { label: "CIC Poultry", icon: Bird },
  { label: "Asia Vet", icon: Syringe },
];
const AUTO_SLIDE_INTERVAL = 8000;

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[420px] md:h-[520px] overflow-hidden">
      {/* Background */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === currentSlide ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>
      ))}

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center h-full px-6">
        {/* Title */}
        <h1
          key={currentSlide}
          className="text-3xl md:text-5xl font-semibold text-white mb-4 animate-fade-in"
        >
          {slides[currentSlide].title}
        </h1>
        {/* Subtitle */}
        <p
          key={`sub-${currentSlide}`}
          className="text-gray-300 text-base md:text-lg mb-10 animate-fade-in"
        >
          {slides[currentSlide].subtitle}
        </p>
        {/* 🔥 Professional Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
          {categories.map(({ label, icon: Icon }, i) => (
            <Card
              key={i}
              className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer group"
            >
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="mb-3 p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all group-hover:scale-110">
                  <Icon className="w-6 h-6 stroke-[1.5] text-white" />
                </div>
                <p className="text-sm font-medium tracking-wide">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <Button
        size="icon"
        variant="secondary"
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur hover:bg-white/40"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <Button
        size="icon"
        variant="secondary"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur hover:bg-white/40"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all rounded-full ${
              i === currentSlide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </section>
  );
}
