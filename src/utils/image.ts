/** Builds a sized Unsplash image URL from a stable photo id. */
export function img(id: string, width = 1200): string {
  return `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`;
}

export const FALLBACK_IMAGE = "/placeholder.svg";
