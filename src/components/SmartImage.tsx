import { useState, type ImgHTMLAttributes } from "react";
import { FALLBACK_IMAGE } from "../utils/image";

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function SmartImage({ src, alt, className, ...rest }: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE) setCurrentSrc(FALLBACK_IMAGE);
      }}
      {...rest}
    />
  );
}
