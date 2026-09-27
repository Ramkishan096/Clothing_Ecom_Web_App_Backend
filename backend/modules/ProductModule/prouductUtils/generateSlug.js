export const generateSlug = (name) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const unique = Math.random().toString(36).slice(2, 8);

  return `${slug}-${unique}`;
};