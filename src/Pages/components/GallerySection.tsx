import { useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

interface GalleryImage {
  key: string;
  description: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export default function GallerySection({ images }: GalleryProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const [main, second, third, ...rest] = images;

  const openSlider = (index: number) => {
    setCurrent(index);
    setOpen(true);
  };

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  const visibleRest = rest.slice(0, 3);
  const hiddenCount = rest.length - visibleRest.length;

  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      <h2 className="text-4xl font-bold text-blue-900 mb-6">Gallery</h2>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {main && (
          <div
            onClick={() => openSlider(0)}
            className="md:col-span-2 h-75 md:h-100 rounded-2xl overflow-hidden group cursor-pointer"
          >
            <img
              src={main.key}
              alt={main.description || "Gallery main"}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="grid grid-rows-2 gap-4">
          {[second, third].map(
            (img, i) =>
              img && (
                <div
                  key={i}
                  onClick={() => openSlider(i + 1)}
                  className="h-35 md:h-47.5 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <img
                    src={img.key}
                    alt={img.description || `Gallery ${i + 2}`}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ),
          )}
        </div>
      </div>

      {visibleRest.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {visibleRest.map((img, i) => {
            const isLast = i === visibleRest.length - 1;
            const actualIndex = i + 3;

            return (
              <div
                key={i}
                onClick={() => openSlider(actualIndex)}
                className="relative h-44 rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={img.key}
                  alt={img.description || `Gallery extra ${i}`}
                  className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${
                    isLast && hiddenCount > 0 ? "brightness-50" : ""
                  }`}
                />
                {isLast && hiddenCount > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-1 pointer-events-none">
                    <span className="text-3xl font-bold">+{hiddenCount}</span>
                    <span className="text-sm font-medium tracking-wide opacity-80">
                      More Photos
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Slideshow Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>

          <div className="flex flex-col items-center gap-3">
            <img
              src={images[current].key}
              alt={images[current].description || "Slide"}
              className="max-h-[80vh] max-w-[85%] rounded-xl object-contain"
            />
            {/* Description shown below image in modal */}
            {images[current].description && (
              <p className="text-white/70 text-sm text-center max-w-lg px-4">
                {images[current].description}
              </p>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {current + 1} / {images.length}
          </div>

          <button
            onClick={prev}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button
            onClick={next}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      )}
    </section>
  );
}
