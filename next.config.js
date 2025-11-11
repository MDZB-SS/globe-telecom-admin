/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
  // Configuration headers (CSP désactivée en développement pour éviter les erreurs réseau)
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      // Pas de CSP en développement pour éviter les problèmes de fetch
      return [];
    }
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
