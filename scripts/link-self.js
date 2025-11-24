import { mkdirSync, symlinkSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const nodeModules = resolve(projectRoot, 'node_modules')
const cleanName = 'travelforge-app'
const target = resolve(nodeModules, cleanName)

try {
  mkdirSync(nodeModules, { recursive: true })
  if (!existsSync(target)) {
    const type = process.platform === 'win32' ? 'junction' : 'dir'
    symlinkSync(projectRoot, target, type)
    console.log(`[postinstall] linked ${cleanName} -> ${projectRoot}`)
  }
} catch (error) {
  console.warn('[postinstall] failed to link cleanName:', error.message)
}

