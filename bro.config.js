import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
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
    plugins: [
      // Автоматически копируем backend файлы в dist при сборке
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CopyBackendFiles', () => {
            const distPath = path.resolve(__dirname, 'dist')
            const backendDirs = [
              { from: 'stubs/api', to: 'stubs/api' },
              { from: 'stubs/data', to: 'stubs/data' },
              { from: 'scripts/setup-backend.sh', to: 'scripts/setup-backend.sh' },
              { from: 'scripts/backend.service', to: 'scripts/backend.service' },
            ]

            // Создаем директории
            backendDirs.forEach(({ to }) => {
              const targetDir = path.resolve(distPath, path.dirname(to))
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true })
              }
            })

            // Копируем файлы
            backendDirs.forEach(({ from, to }) => {
              const sourcePath = path.resolve(__dirname, from)
              const targetPath = path.resolve(distPath, to)

              try {
                if (fs.statSync(sourcePath).isDirectory()) {
                  // Копируем директорию
                  copyDir(sourcePath, targetPath)
                } else {
                  // Копируем файл
                  if (fs.existsSync(sourcePath)) {
                    const targetDir = path.dirname(targetPath)
                    if (!fs.existsSync(targetDir)) {
                      fs.mkdirSync(targetDir, { recursive: true })
                    }
                    fs.copyFileSync(sourcePath, targetPath)
                    // Делаем скрипт исполняемым
                    if (to.includes('setup-backend.sh')) {
                      fs.chmodSync(targetPath, 0o755)
                    }
                  }
                }
              } catch (err) {
                // Игнорируем ошибки для опциональных файлов
                if (!to.includes('backend.service') && !to.includes('.env')) {
                  console.warn(`⚠️  Не удалось скопировать ${from}:`, err.message)
                }
              }
            })

            // Копируем .env если существует
            const envPath = path.resolve(__dirname, '.env')
            const envTarget = path.resolve(distPath, '.env')
            if (fs.existsSync(envPath)) {
              fs.copyFileSync(envPath, envTarget)
            }

            console.log('✅ Backend файлы скопированы в dist/')
          })
        },
      },
    ],
  },
}

// Вспомогательная функция для копирования директории
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

