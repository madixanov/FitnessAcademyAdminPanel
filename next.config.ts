import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost", "www.telsot.uz", "telsot.uz"], // сюда добавляй все домены, откуда будут изображения
  },
};

export default nextConfig;
