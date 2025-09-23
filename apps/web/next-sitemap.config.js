/** @type {import('next-sitemap').IConfig} */
export default {
    siteUrl: process.env.SITE_URL || 'https://ganzafrica.org',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    changefreq: 'daily',
    priority: 0.7,
    exclude: ['/server-sitemap.xml'],
    additionalPaths: async (config) => [
      await config.transform(config, '/en'),
      await config.transform(config, '/fr'),
    ],
    transform: async (config, path) => {
      // Custom transformation for localized paths
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      }
    },
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
        },
      ],
      additionalSitemaps: [
        'https://ganzafrica.org/sitemap.xml',
      ],
    },
  }