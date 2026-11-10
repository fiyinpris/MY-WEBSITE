/** Format a number as Nigerian Naira, e.g. 25000 -> "₦25,000". */
export const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₦0";
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
};

/** Human friendly category label, e.g. "LED LIGHT" -> "LED Light". */
export const formatCategory = (category = "") => {
  if (!category) return "";
  const upperWords = new Set(["LED", "RGB", "USB"]);
  return category
    .toLowerCase()
    .split(" ")
    .map((w) =>
      upperWords.has(w.toUpperCase())
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");
};

/** Category label used in navigation (keeps the store's "Microphones" plural). */
export const categoryNavLabel = (category = "") =>
  category === "MICROPHONE" ? "Microphones" : formatCategory(category);

export const PRODUCT_CATEGORIES = [
  "RINGLIGHT",
  "LED LIGHT",
  "INFLUENCER LIGHT",
  "TRIPOD STAND",
  "MICROPHONE",
  "SOFTBOX",
  "ACCESSORIES",
  "BACKDROP",
];

/** Average rating + count of reviews that belong to a product (matched by name). */
export const getReviewStats = (reviews = [], productName = "") => {
  const name = productName?.toLowerCase();
  const list = reviews.filter((r) => r.productName?.toLowerCase() === name);
  if (!list.length) return { count: 0, average: 0 };
  const total = list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  return { count: list.length, average: total / list.length };
};
