import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nyra-ai.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/features', '/pricing', '/docs'],
        disallow: ['/chat-ui', '/api/', '/share/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
