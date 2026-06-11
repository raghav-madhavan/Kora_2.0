/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kora/api", "@kora/db", "@kora/compliance"],
  serverExternalPackages: ["@prisma/client", "@trpc/server"],
};

export default nextConfig;
