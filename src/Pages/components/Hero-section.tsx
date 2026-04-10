import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Wheat, Pill, Bird, Syringe } from "lucide-react";
import { Link } from "react-router-dom";

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
  { label: "CIC Feeds", icon: Wheat, Link: "/our-segments/cic-feeds" },
  { label: "CIC Vetcare", icon: Pill, Link: "/our-segments/cic-vetcare" },
  { label: "CIC Poultry", icon: Bird, Link: "/our-segments/cic-poulry" },
  { label: "Asia Vet", icon: Syringe, Link: "/our-segments/asia-vet" },
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
    <section className="relative w-full min-h-[480px] md:min-h-[600px] overflow-hidden flex flex-col">
      {/* Background slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === currentSlide ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Left gradient overlay — desktop only */}
      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10" />

      {/* Content — padded to clear the nav buttons */}
      <div className="relative z-20 flex flex-col items-center justify-between h-full min-h-[480px] md:min-h-[600px] px-14 md:px-16 pt-10 pb-10 md:pt-0 md:pb-0 md:justify-center text-center gap-6">
        {/* Text block */}
        <div className="flex flex-col items-center gap-2 mt-auto md:mt-0">
          <h1
            key={currentSlide}
            className="text-2xl sm:text-3xl md:text-5xl font-semibold text-white animate-fade-in leading-tight px-2"
          >
            {slides[currentSlide].title}
          </h1>
          <p
            key={`sub-${currentSlide}`}
            className="text-gray-300 text-sm sm:text-base md:text-lg animate-fade-in px-4"
          >
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xs sm:max-w-none sm:max-w-2xl mb-auto md:mb-0">
          {categories.map(({ label, icon: Icon, Link: link }, i) => (
            <Card
              key={i}
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer group"
            >
              <Link to={link}>
                <CardContent className="flex flex-col items-center justify-center py-4 md:py-6 px-2">
                  <div className="mb-2 p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all group-hover:scale-110">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5] text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium tracking-wide text-center leading-tight">
                    {label}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Prev button */}
      <Button
        size="icon"
        variant="secondary"
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur hover:bg-white/40 w-8 h-8 md:w-10 md:h-10"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      {/* Next button */}
      <Button
        size="icon"
        variant="secondary"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur hover:bg-white/40 w-8 h-8 md:w-10 md:h-10"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all rounded-full ${
              i === currentSlide ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"
            }`}
          />
        ))}
      </div>

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
