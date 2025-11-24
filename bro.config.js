import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
const cleanName = pkg.name.replace(/^@[-\w]+\//, '')
const baseUrl = '/static'
const version = pkg.version

export default {
  apiPath: 'stubs/api',
  config: {
    baseUrl,
    brand: 'TravelForge',
    environment: 'dev',
  },
  navigations: {
    dashboard: '/',
    explore: '/explore',
    trips: '/trips',
    intelligence: '/intelligence',
  },
  apps: {
    '/': {
      name: cleanName,
      version,
    },
  },
  features: {
    travelBot: true,
    insights: true,
    currency: true,
  },
  webpackConfig: {
    output: {
      publicPath: `${baseUrl}/${cleanName}/${version}/`,
    },
  },
}

