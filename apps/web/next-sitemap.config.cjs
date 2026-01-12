/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://ganzafrica.org',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/admin/*',
    '*/apply/*', // Exclude application forms
    '/server-sitemap.xml',
  ],
  additionalPaths: async (config) => {
    const result = []

    // Add localized paths manually since we have a custom locale structure
    const locales = ['en', 'fr']
    const paths = [
      '',
      '/about/our-story',
      '/about/team',
      '/about/who-we-are',
      '/contact',
      '/faqs',
      '/newsroom',
      '/opportunities',
      '/our-approach',
      '/programs/alumni',
      '/programs/fellowship',
      '/programs/fellowship/how-to-apply',
    ]

    // Add root paths
    paths.forEach(path => {
      result.push({
        loc: path === '' ? '/' : path,
        changefreq: 'weekly',
        priority: path === '' ? 1.0 : 0.8,
        lastmod: new Date().toISOString(),
      })
    })

    // Add localized paths
    locales.forEach(locale => {
      paths.forEach(path => {
        const localizedPath = `/${path}`
        result.push({
          loc: localizedPath,
          changefreq: 'weekly',
          priority: path === '' ? 0.9 : 0.7,
          lastmod: new Date().toISOString(),
          alternateRefs: [
            {
              href: `${config.siteUrl}/en${path}`,
              hreflang: 'en',
            },
            {
              href: `${config.siteUrl}/fr${path}`,
              hreflang: 'fr',
            },
            {
              href: `${config.siteUrl}${path === '' ? '/' : path}`,
              hreflang: 'x-default',
            },
          ],
        })
      })
    })

    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '*/apply/',
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://ganzafrica.org'}/server-sitemap.xml`,
    ],
  },
}