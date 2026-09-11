// Image source resolution helpers.
// Template images can be: a local path ("/template-images/..."), a full URL
// ("https://..."), or a data URI. Legacy templates also carry plain keywords
// (e.g. "african salon braids") which used to resolve via source.unsplash.com —
// that service has been retired, so keywords must never be sent to an <img> tag.
// They render a styled placeholder instead (see components/ImagePlaceholder.tsx).

export function isUsableImageSrc(src?: string | null): boolean {
  if (!src) return false;
  return src.startsWith('http') || src.startsWith('data:') || src.startsWith('/');
}

export function isKeywordImage(src?: string | null): boolean {
  return !!src && !isUsableImageSrc(src);
}
