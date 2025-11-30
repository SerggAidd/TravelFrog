const axios = require('axios')
const https = require('https')
const crypto = require('crypto')

// Проверяем наличие переменных окружения при загрузке модуля
const checkEnvVars = () => {
  const clientId = process.env.GIGACHAT_CLIENT_ID
  const secret = process.env.GIGACHAT_SECRET || process.env.GIGACHAT_CLIENT_SECRET
  
  if (!clientId || !secret) {
    console.warn('[GigaChat] Переменные окружения не настроены. GigaChat будет недоступен.')
    console.warn('[GigaChat] Установите GIGACHAT_CLIENT_ID и GIGACHAT_SECRET в .env файле')
    return false
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[GigaChat] Переменные окружения загружены:', {
      clientId: clientId ? `${clientId.substring(0, 8)}...` : 'MISSING',
      secret: secret ? '***' : 'MISSING',
      scope: process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS',
      model: process.env.GIGACHAT_MODEL || 'GigaChat',
      tlsVerify: process.env.GIGACHAT_TLS_VERIFY || '0',
    })
  }
  
  return true
}

// Проверяем при загрузке модуля
const envVarsOk = checkEnvVars()

class GigachatService {
  static cachedToken = null
  static tokenExpiresAt = 0
  static OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
  static CHAT_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'
  static DEFAULT_SCOPE = 'GIGACHAT_API_PERS'
  static DEFAULT_MODEL = 'GigaChat'

  static getHttpsAgent() {
    const tlsVerifyFlag = process.env.GIGACHAT_TLS_VERIFY
    const rejectUnauthorized = tlsVerifyFlag === '1'
    return new https.Agent({ rejectUnauthorized })
  }

  static async getAccessToken() {
    // Проверяем переменные окружения
    if (!envVarsOk) {
      throw new Error('GIGACHAT_CLIENT_ID or GIGACHAT_SECRET is not configured. Check .env file.')
    }
    
    const now = Date.now()
    if (this.cachedToken && this.tokenExpiresAt > now + 60_000) {
      return this.cachedToken
    }

    const clientId = process.env.GIGACHAT_CLIENT_ID
    const clientSecret = process.env.GIGACHAT_SECRET || process.env.GIGACHAT_CLIENT_SECRET
    const scope = process.env.GIGACHAT_SCOPE || this.DEFAULT_SCOPE

    if (!clientId || !clientSecret) {
      throw new Error('GIGACHAT_CLIENT_ID or GIGACHAT_SECRET is not configured')
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    try {
      const response = await axios.post(
        this.OAUTH_URL,
        `scope=${encodeURIComponent(scope)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            RqUID: crypto.randomUUID(),
            Authorization: `Basic ${auth}`,
          },
          httpsAgent: this.getHttpsAgent(),
          timeout: Number(process.env.GIGACHAT_TIMEOUT || 60) * 1000,
        },
      )

      const { access_token, expires_in } = response.data
      this.cachedToken = access_token
      this.tokenExpiresAt = now + Math.max(0, (expires_in - 60)) * 1000
      return access_token
    } catch (err) {
      const status = err?.response?.status
      const statusText = err?.response?.statusText
      const data = err?.response?.data
      
      if (status === 401 || status === 403) {
        const msg = 'GigaChat OAuth unauthorized: check GIGACHAT_CLIENT_ID/GIGACHAT_SECRET and SCOPE'
        console.error(msg, { status, statusText, data })
        const e = new Error(msg)
        e.status = status
        throw e
      } else if (status === 502 || status === 503 || status === 504) {
        const msg = `GigaChat API недоступен (${status} ${statusText || ''}). Проверьте сетевое соединение или попробуйте позже.`
        console.error(msg, { status, statusText, data, url: this.OAUTH_URL })
        const e = new Error(msg)
        e.status = status
        throw e
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
        const msg = `Не удалось подключиться к GigaChat API: ${err.code}. Проверьте сетевое соединение.`
        console.error(msg, { code: err.code, message: err.message, url: this.OAUTH_URL })
        const e = new Error(msg)
        e.code = err.code
        throw e
      } else if (err.message && err.message.includes('certificate')) {
        const msg = 'Ошибка TLS сертификата. Попробуйте установить GIGACHAT_TLS_VERIFY=0'
        console.error(msg, err.message)
        const e = new Error(msg)
        throw e
      }
      
      // Логируем другие ошибки для отладки
      console.error('GigaChat OAuth error:', {
        status,
        statusText,
        message: err.message,
        code: err.code,
        data,
        url: this.OAUTH_URL,
      })
      throw err
    }
  }

  static async askQuestion(request) {
    try {
      const token = await this.getAccessToken()
      
      if (!token) {
        throw new Error('Не удалось получить токен доступа GigaChat')
      }

      const cityPart = request.city?.name
        ? `Маршрут: ${request.origin || 'город вылета не указан'} → ${request.city.name}${request.city.country ? `, ${request.city.country}` : ''}.`
        : request.country
          ? `Направление: ${request.country}.`
          : 'Локация не указана.'

      const budgetPart = request.budgetBreakdown
        ? `Распределение бюджета (%): ${this.formatBudgetBreakdown(request.budgetBreakdown)}. Общий бюджет: ${request.budget || 'не указан'}.`
        : `Распределение бюджета не указано. Общий бюджет: ${request.budget || 'не указан'}.`

      const prefsPart = request.preferences
        ? `Предпочтения (0-100): Культура ${request.preferences.culture || 50}, Природа ${request.preferences.nature || 50}, Ночная жизнь ${request.preferences.nightlife || 50}.`
        : 'Предпочтения не указаны.'

      const datesPart = request.startDate && request.endDate
        ? `Даты поездки: ${request.startDate} — ${request.endDate}.`
        : ''

      const flightsBudget = request.budget && request.budgetBreakdown?.flights
        ? Math.round((request.budget * request.budgetBreakdown.flights) / 100)
        : undefined

      const pricingHint = flightsBudget
        ? `Ориентируйся на бюджет на перелёты ≈ ${flightsBudget} USD. Указывай цены ориентировочно в USD с допуском ±20% от ${flightsBudget} USD.`
        : `Если уместно, указывай ориентировочные цены в USD.`

      const changePart = request.changeEvent
        ? `Изменение пользователя: ${this.labelByKey(request.changeEvent.key)}: ${request.changeEvent.oldValue}% → ${request.changeEvent.newValue}%. Дай уместные, конкретные советы.`
        : ''

      const systemPrompt = `Ты — внимательный и вежливый туристический ассистент. Отталкивайся от входных параметров бюджета и локации.

${cityPart}

${budgetPart}

${prefsPart}

${datesPart}

${pricingHint}

${changePart}

Правила ответа:

- Предлагай кратко 3–6 конкретных рекомендаций с названиями мест, районами или ссылками-ориентирами (без реальных URL).

- Если доля категории уменьшилась, предложи способы экономии и альтернативы.

- Если доля категории выросла, предложи, куда потратить увеличенный бюджет с пользой.

- Учитывай местные особенности и сезонность, избегай общих фраз.

- ВСЕГДА указывай реальные даты поездки (строго так: ${request.startDate || 'YYYY-MM-DD'} — ${request.endDate || 'YYYY-MM-DD'}) и явный маршрут (${request.origin || 'не указан'} → ${request.city?.name || 'не указан'}). НЕ используй формулировки вроде «указанные даты».`

      // Формируем историю сообщений
      const messages = [{ role: 'system', content: systemPrompt }]
      
      // Добавляем историю, если есть
      if (request.history && Array.isArray(request.history)) {
        request.history.forEach((msg) => {
          if (msg.role && msg.text) {
            messages.push({ role: msg.role, content: msg.text })
          }
        })
      }
      
      // Добавляем текущий вопрос
      messages.push({ role: 'user', content: request.question })
      
      const resp = await axios.post(
        this.CHAT_URL,
        {
          model: process.env.GIGACHAT_MODEL || this.DEFAULT_MODEL,
          messages: messages,
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          httpsAgent: this.getHttpsAgent(),
          timeout: Number(process.env.GIGACHAT_TIMEOUT || 60) * 1000,
        },
      )

      const answer = resp.data?.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ от AI.'
      return { answer }
    } catch (error) {
      const status = error?.response?.status || error?.status
      const statusText = error?.response?.statusText
      const data = error?.response?.data
      
      if (status === 401 || status === 403) {
        console.error('GIGACHAT API unauthorized. Verify access token and scope.', {
          status,
          statusText,
          data,
        })
      } else if (status === 502 || status === 503 || status === 504) {
        console.error(`GIGACHAT API недоступен (${status} ${statusText || ''})`, {
          status,
          statusText,
          data,
          url: this.CHAT_URL,
        })
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        console.error(`Не удалось подключиться к GIGACHAT API: ${error.code}`, {
          code: error.code,
          message: error.message,
          url: this.CHAT_URL,
        })
      } else {
        console.error('GIGACHAT API error:', {
          status,
          statusText,
          message: error.message,
          code: error.code,
          data,
          url: this.CHAT_URL,
        })
      }
      throw error
    }
  }

  static labelByKey(key) {
    switch (key) {
      case 'flights':
        return 'Перелёты'
      case 'lodging':
        return 'Жильё'
      case 'food':
        return 'Еда'
      case 'local':
      case 'experiences':
        return 'Местное'
      case 'buffer':
        return 'Резерв'
      default:
        return key
    }
  }
  
  static formatBudgetBreakdown(breakdown) {
    if (!breakdown) return ''
    const localOrExperiences = breakdown.local || breakdown.experiences || 0
    return `Перелёты ${breakdown.flights || 0}%, Жильё ${breakdown.lodging || 0}%, Еда ${breakdown.food || 0}%, Местное ${localOrExperiences}%, Резерв ${breakdown.buffer || 0}%`
  }
}

module.exports = GigachatService

