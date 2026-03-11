import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/quan-tri', '/api/admin', '/dang-nhap', '/dang-ky', '/quen-mat-khau'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
