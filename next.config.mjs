/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage CDN — replace <project-ref> with your actual project ref
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // mapbox-gl ships with non-standard JS that needs to be transpiled
  transpilePackages: ["mapbox-gl"],
};

export default nextConfig;
