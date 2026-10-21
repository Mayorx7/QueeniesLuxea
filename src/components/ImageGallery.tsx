import { useEffect, useState } from "react";
import SmartImage from "./SmartImage";
import { imageForDisplay } from "../utils/image";

interface ImageGalleryProps {
  images: string[];
  productName: string;
  /** Optionally focus one of the existing gallery images (for example, after a color selection). */
  initialImage?: string;
}

export default function ImageGallery({ images, productName, initialImage }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const MIN_SWIPE_DISTANCE = 50;

  useEffect(() => {
    const imageIndex = initialImage ? images.indexOf(initialImage) : -1;
    if (imageIndex >= 0) setActiveIndex(imageIndex);
  }, [images, initialImage]);

  const goNext = () => setActiveIndex((i) => Math.min(i + 1, images.length - 1));
  const goPrev = () => setActiveIndex((i) => Math.max(i - 1, 0));

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (Math.abs(distance) < MIN_SWIPE_DISTANCE) return;
    if (distance > 0) goNext();
    else goPrev();
  };

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="flex shrink-0 gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1} of ${productName}`}
              aria-current={activeIndex === i}
              className={`h-20 w-16 shrink-0 overflow-hidden border transition-colors ${
                activeIndex === i ? "border-espresso" : "border-line"
              }`}
            >
              <SmartImage src={imageForDisplay(src, 160)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image — swipeable on mobile */}
      <div
        className="relative aspect-[4/5] w-full flex-1 overflow-hidden bg-cream"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <SmartImage
          src={images[activeIndex]}
          alt={`${productName}, view ${activeIndex + 1}`}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />

        {/* Swipe dot indicators — mobile only */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-4 bg-ivory" : "w-1.5 bg-ivory/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Prev/Next buttons — mobile only */}
        {images.length > 1 && activeIndex > 0 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/80 text-ink shadow text-xl leading-none sm:hidden"
          >
            ‹
          </button>
        )}
        {images.length > 1 && activeIndex < images.length - 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/80 text-ink shadow text-xl leading-none sm:hidden"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

