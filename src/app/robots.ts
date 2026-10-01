import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* the admin panel is for editors, not crawlers */
      disallow: ['/admin'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  }
}
