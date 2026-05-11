import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kima2019.org'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/member/mypage',
          '/member/upgrade',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
