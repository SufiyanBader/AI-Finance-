/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental: {
    serverActions: {
<<<<<<< HEAD
      bodySizeLimit: "5mb",
=======
      bodySizeLimit: "5mb", // Allow receipt image uploads up to 5 MB
>>>>>>> 450cce07a4a23b4718c7daca89a313c3f874b184
    },
  },
};

export default nextConfig;
