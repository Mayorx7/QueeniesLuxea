/** Builds a sized Unsplash image URL from a stable photo id. */
export function img(id: string, width = 1200): string {
  return `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`;
}

/** Request a smaller Unsplash rendition where available; leave uploaded images untouched. */
export function imageForDisplay(source: string, width: number): string {
  try {
    const url = new URL(source);
    if (url.hostname !== "images.unsplash.com") return source;
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", "80");
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  } catch {
    return source;
  }
}

export const FALLBACK_IMAGE = "/placeholder.svg";
