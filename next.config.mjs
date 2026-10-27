/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // В C:\Users\PC лежит чужой package-lock.json — явно указываем корень проекта
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
