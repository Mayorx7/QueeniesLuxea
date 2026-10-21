import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { FALLBACK_IMAGE } from "../utils/image";

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function SmartImage({ src, alt, className, ...rest }: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  // A gallery keeps one image element mounted while its src changes. Keep the
  // fallback state in sync with that new source so thumbnail clicks update it.
  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE) setCurrentSrc(FALLBACK_IMAGE);
      }}
      {...rest}
    />
  );
}
