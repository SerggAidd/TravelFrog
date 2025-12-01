import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
)

const cleanName = pkg.name.replace(/^@[-\w]+\//, '')
const baseUrl = '/apps'
const brand = 'TravelFrog'
const environment = process.env.VERSION || 'main'

export default {
  apiPath: 'stubs/api',
  config: {
    baseUrl,
    brand,
    environment,
  },
  apps: {
    '/': {
      name: cleanName,
      version: pkg.version,
    },
  },
  features: {
    travelBot: true,
    insights: true,
    currency: true,
  },
}

