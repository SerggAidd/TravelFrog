const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()
const buildDir = path.join(root, 'build')
const distDir = path.join(root, 'dist')

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

const copyFile = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
}

const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name)
    const dest = path.join(to, entry.name)
    if (entry.isDirectory()) {
      copyDir(src, dest)
    } else if (entry.isFile()) {
      copyFile(src, dest)
    }
  }
}

const build = () => {
  run('react-scripts build')

  fs.rmSync(distDir, { recursive: true, force: true })
  fs.mkdirSync(distDir, { recursive: true })

  const manifestPath = path.join(buildDir, 'asset-manifest.json')
  if (!fs.existsSync(manifestPath)) {
    throw new Error('asset-manifest.json not found')
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  const mainJs = manifest.files?.['main.js']
  if (!mainJs) {
    throw new Error('main.js not found in manifest')
  }

  const mainJsPath = path.join(buildDir, mainJs.replace(/^\//, ''))
  copyFile(mainJsPath, path.join(distDir, 'index.js'))

  const licensePath = `${mainJsPath}.LICENSE.txt`
  if (fs.existsSync(licensePath)) {
    copyFile(licensePath, path.join(distDir, 'index.js.LICENSE.txt'))
  }

  if (manifest.files?.['index.html']) {
    const htmlPath = path.join(buildDir, manifest.files['index.html'].replace(/^\//, ''))
    copyFile(htmlPath, path.join(distDir, 'index.html'))
  }

  copyDir(path.join(buildDir, 'static'), path.join(distDir, 'static'))
  copyDir(path.join(root, 'remote-assets'), path.join(distDir, 'remote-assets'))
  copyDir(path.join(root, 'scripts'), path.join(distDir, 'scripts'))
  copyDir(path.join(root, 'stubs'), path.join(distDir, 'stubs'))

  console.log('✅ dist folder ready for Jenkins copy')
}

try {
  build()
} catch (error) {
  console.error('❌ build:prod failed')
  console.error(error)
  process.exit(1)
}

