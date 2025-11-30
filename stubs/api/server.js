#!/usr/bin/env node

// Standalone Express server для production
// Запуск: node stubs/api/server.js

// Загружаем переменные окружения из .env файла
const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')

// Ищем .env файл: сначала в текущей директории (production), потом в корне проекта (dev)
const localEnvPath = path.resolve(__dirname, '.env')
const rootEnvPath = path.resolve(__dirname, '../../.env')

let envPath = null
if (fs.existsSync(localEnvPath)) {
  envPath = localEnvPath
  console.log('📄 Загружаем .env из:', localEnvPath)
} else if (fs.existsSync(rootEnvPath)) {
  envPath = rootEnvPath
  console.log('📄 Загружаем .env из:', rootEnvPath)
} else {
  console.warn('⚠️  .env файл не найден. Используются переменные окружения системы.')
}

if (envPath) {
  dotenv.config({ path: envPath })
}

const express = require('express')
const cors = require('cors')
const router = require('./index')

const app = express()
const PORT = process.env.API_PORT || 3000
const HOST = process.env.API_HOST || '0.0.0.0'

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// API routes
app.use('/api', router)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  })
})

// Запуск сервера
app.listen(PORT, HOST, () => {
  console.log(`🚀 TravelForge API Server запущен на http://${HOST}:${PORT}`)
  console.log(`📝 Health check: http://${HOST}:${PORT}/health`)
  console.log(`🔌 API endpoints: http://${HOST}:${PORT}/api/*`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  
  // Проверка переменных окружения GigaChat
  if (process.env.GIGACHAT_CLIENT_ID && process.env.GIGACHAT_SECRET) {
    console.log(`✅ GigaChat credentials настроены`)
  } else {
    console.log(`⚠️  GigaChat credentials не настроены (GIGACHAT_CLIENT_ID/GIGACHAT_SECRET)`)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  process.exit(0)
})

