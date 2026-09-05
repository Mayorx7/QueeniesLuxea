import { useState } from "react";
import SmartImage from "./SmartImage";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

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
              <SmartImage src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="aspect-[4/5] w-full flex-1 overflow-hidden bg-cream">
        <SmartImage
          src={images[activeIndex]}
          alt={`${productName}, view ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
