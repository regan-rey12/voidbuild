import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
      },
      {
        userAgent: 'Googlebot-Favicon',
        allow: ['/favicon.ico', '/favicon.png', '/logo.png', '/logo.svg', '/apple-touch-icon.png'],
      },
    ],
    sitemap: 'https://voidbuild.com/sitemap.xml',
  };
}
