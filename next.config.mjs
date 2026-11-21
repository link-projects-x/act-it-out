const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
