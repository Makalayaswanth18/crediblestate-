import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/agent/', '/admin/', '/auth/', '/api/'],
      },
    ],
    sitemap: 'https://crediblestate.com/sitemap.xml',
  }
}
