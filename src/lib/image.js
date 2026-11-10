/**
 * Serve product photos through Cloudinary's on-the-fly optimisation:
 * automatic format (WebP/AVIF), automatic quality and a sensible max width.
 * Non-Cloudinary URLs (local imports, data URLs) are returned unchanged.
 */
export const optimizeImage = (url, width = 800) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  // Don't double-transform URLs that already carry transformations.
  if (/\/upload\/[a-z]_[^/]*,/.test(url)) return url;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_limit,w_${Math.round(width)}/`,
  );
};

/** Neutral inline placeholder for products whose image fails to load. */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#eeece7"/><g fill="none" stroke="#b9bcb5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><rect x="120" y="135" width="160" height="130" rx="18"/><circle cx="200" cy="200" r="34"/><path d="M165 135l12-22h46l12 22"/></g></svg>`,
  );

export const handleImageError = (e) => {
  if (e.currentTarget.src !== PLACEHOLDER_IMAGE) {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  }
};
