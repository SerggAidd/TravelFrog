const express = require('express')
const { randomUUID } = require('crypto')
const fs = require('fs')
const path = require('path')
const cities = require('../data/cities.json')
const currencyRates = require('../data/currencies.json')

const router = express.Router()

const DATA_DIR = path.resolve(__dirname, '../data')
const USERS_PATH = path.join(DATA_DIR, 'users.json')

const seedUsers = [
  { id: 'founder', name: 'Travel Lead', email: 'demo@travelforge.io', password: 'demo123', cohort: 'MVP Cohort' },
]

const readUsers = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(USERS_PATH)) {
      fs.writeFileSync(USERS_PATH, JSON.stringify(seedUsers, null, 2))
    }
    return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'))
  } catch (error) {
    console.error('Cannot read users file:', error)
    return [...seedUsers]
  }
}

const writeUsers = (list) => {
  fs.writeFileSync(USERS_PATH, JSON.stringify(list, null, 2))
}

let users = readUsers()

const sessions = new Map()
let savedTrips = []

const success = (data) => ({ success: true, data })
const failure = (message) => ({ success: false, error: message })

const getTokenPayload = (req, res) => {
  const auth = req.headers.authorization
  if (!auth) {
    res.status(401).json(failure('Нужна авторизация'))
    return null
  }
  const token = auth.replace('Bearer ', '')
  const userId = sessions.get(token)
  if (!userId) {
    res.status(401).json(failure('Сессия не найдена'))
    return null
  }
  return { token, userId }
}

const weigh = (prefs) => {
  const total = Math.max(1, prefs.culture + prefs.nature + prefs.nightlife)
  return {
    culture: prefs.culture / total,
    nature: prefs.nature / total,
    nightlife: prefs.nightlife / total,
  }
}

const travelDuration = (params) => {
  const start = new Date(params.startDate)
  const end = new Date(params.endDate)
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
}

const buildMatch = (city, params) => {
  const weight = weigh(params.preferences)
  const score = Math.round(
    city.focus.culture * weight.culture + city.focus.nature * weight.nature + city.focus.nightlife * weight.nightlife,
  )
  const days = travelDuration(params)
  const totalCost = days * city.avgDailyCost * params.travelers
  const budgetDelta = params.budget - totalCost
  return {
    city,
    matchScore: score,
    totalCost,
    budgetDelta,
    adjustedBreakdown: city.baseBreakdown,
  }
}

router.get('/cities', (_req, res) => {
  res.json(success(cities))
})

router.get('/cities/:id', (req, res) => {
  const city = cities.find((c) => c.id === req.params.id)
  if (!city) return res.status(404).json(failure('City not found'))
  res.json(success(city))
})

router.post('/cities/search', (req, res) => {
  const params = req.body
  const matches = cities.map((city) => buildMatch(city, params)).sort((a, b) => b.matchScore - a.matchScore)
  res.json(success(matches))
})

router.get('/trips', (req, res) => {
  const session = getTokenPayload(req, res)
  if (!session) return
  const trips = savedTrips.filter((trip) => trip.userId === session.userId)
  res.json(success(trips))
})

router.post('/trips', (req, res) => {
  const session = getTokenPayload(req, res)
  if (!session) return
  const trip = { ...req.body, id: randomUUID(), savedAt: new Date().toISOString(), userId: session.userId }
  savedTrips = [trip, ...savedTrips]
  res.json(success(trip))
})

router.delete('/trips/:id', (req, res) => {
  const session = getTokenPayload(req, res)
  if (!session) return
  savedTrips = savedTrips.filter((trip) => trip.id !== req.params.id || trip.userId !== session.userId)
  res.json(success(true))
})

router.get('/currencies/rates', (_req, res) => {
  res.json(success(currencyRates))
})

router.post('/currencies/convert', (req, res) => {
  const { amount, from, to } = req.body
  const base = currencyRates[from] || 1
  const target = currencyRates[to] || 1
  const converted = Number(((amount / base) * target).toFixed(2))
  res.json(success({ amount, from, to, result: converted }))
})

router.post('/travelbot/init', (req, res) => {
  const { topMatches = [], preferences } = req.body
  if (!topMatches || topMatches.length === 0) {
    return res.json(success({ answer: 'Привет! Я TravelBot. Укажите параметры поиска, и я подберу идеальное направление для вас.', followUp: null }))
  }
  const top = topMatches[0]
  const city = top.city
  const dominantPref = preferences
    ? Object.entries(preferences)
        .sort(([, a], [, b]) => b - a)
        [0][0]
    : null
  const prefNames = { culture: 'культура', nature: 'природа', nightlife: 'ночная жизнь' }
  const prefText = dominantPref ? prefNames[dominantPref] || dominantPref : 'ваши интересы'
  const answer = `Привет! Я TravelBot. Посмотрел на ${prefText} и подобрал для вас идеальное направление — ${city.name}, ${city.country}. Это место отлично подходит под ваши предпочтения (совпадение ${top.matchScore}%). Хотите узнать больше о ${city.name}?`
  const followUp = `Могу рассказать про историю, традиции, кухню или достопримечательности ${city.name}. Что вас интересует?`
  res.json(success({ answer, followUp, sources: ['travelforge://init'] }))
})

router.post('/travelbot/ask', (req, res) => {
  const { prompt, cityId, history = [], budget, preferences, topMatches = [] } = req.body
  const city = cityId ? cities.find((c) => c.id === cityId) : topMatches?.[0]?.city || cities[Math.floor(Math.random() * cities.length)]
  if (!city) {
    return res.json(success({ answer: 'Не могу найти информацию об этом городе. Попробуйте выбрать другое направление.', followUp: null }))
  }
  
  const userMessages = history.filter((msg) => msg.role === 'user').map((msg) => msg.text)
  const lastUserMessage = prompt || userMessages[userMessages.length - 1] || ''
  
  // Определяем тип вопроса
  const lowerPrompt = lastUserMessage.toLowerCase()
  const isHistoryQuestion = /истори|прошл|когда|основан|создан/.test(lowerPrompt)
  const isFoodQuestion = /еда|кухн|блюд|традиционн|ресторан|кафе/.test(lowerPrompt)
  const isCultureQuestion = /культур|традици|обыча|праздник|фестиваль/.test(lowerPrompt)
  const isAttractionQuestion = /достопримечатель|что посмотреть|место|музей|памятник/.test(lowerPrompt)
  const isPreferenceChange = /изменил|поменял|сменил|приоритет/.test(lowerPrompt)
  
  let answer = ''
  let followUp = ''
  
  if (isPreferenceChange && preferences) {
    const dominantPref = Object.entries(preferences).sort(([, a], [, b]) => b - a)[0]
    const prefNames = { culture: 'культура', nature: 'природа', nightlife: 'ночная жизнь' }
    const prefText = prefNames[dominantPref[0]] || dominantPref[0]
    const newTop = topMatches?.[0]
    if (newTop) {
      answer = `Вижу, что вы изменили приоритеты! Теперь вам больше подходит ${newTop.city.name}, ${newTop.city.country} (совпадение ${newTop.matchScore}%).`
      followUp = `Хотите узнать про традиции или кухню ${newTop.city.name}?`
    } else {
      answer = `Понял, вы изменили приоритеты. Теперь важнее всего ${prefText}. Давайте подберём новое направление!`
      followUp = 'Нажмите "Собрать маршрут", чтобы увидеть обновлённые рекомендации.'
    }
  } else if (isHistoryQuestion) {
    answer = `${city.name} — древний город с богатой историей. Основан в глубокой древности, пережил множество эпох и культурных влияний. Исторический центр сохранил уникальную архитектуру разных периодов.`
    followUp = `Хотите узнать про традиции или достопримечательности ${city.name}?`
  } else if (isFoodQuestion) {
    answer = `Кухня ${city.name} славится своими традиционными блюдами. Местная гастрономия сочетает в себе древние рецепты и современные интерпретации. Обязательно попробуйте местные специалитеты в традиционных ресторанах.`
    followUp = `Интересует история или культура ${city.name}?`
  } else if (isCultureQuestion) {
    answer = `Культура ${city.name} очень самобытна. Здесь сохранились древние традиции, проводятся фестивали и праздники. Местные жители бережно хранят наследие предков.`
    followUp = `Хотите узнать про достопримечательности или кухню ${city.name}?`
  } else if (isAttractionQuestion) {
    answer = `В ${city.name} множество интересных мест: исторический центр, музеи, парки и природные достопримечательности. Каждое место имеет свою уникальную историю.`
    followUp = `Интересует история или традиции ${city.name}?`
  } else if (lastUserMessage) {
    // Общий ответ на любой другой вопрос
    answer = `Отличный вопрос про ${city.name}! Это направление действительно заслуживает внимания. ${city.tagline || 'Здесь есть что посмотреть и чем заняться.'}`
    followUp = `Могу рассказать подробнее про историю, кухню, культуру или достопримечательности ${city.name}. Что вас интересует?`
  } else {
    answer = `Готов помочь с информацией о ${city.name}! Что именно вас интересует?`
    followUp = 'Могу рассказать про историю, традиции, кухню или достопримечательности.'
  }
  
  res.json(success({ answer, followUp, sources: ['travelforge://context'] }))
})

router.get('/insights', (_req, res) => {
  res.json(
    success({
      insights: [
        { title: 'ROI', value: '78%', trend: '+12% за квартал' },
        { title: 'CTR партнерки', value: '1.2%', trend: '+0.3 п.п.' },
      ],
    }),
  )
})

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) return res.status(401).json(failure('Неверные данные'))
  const token = randomUUID()
  sessions.set(token, user.id)
  res.json(success({ token, user }))
})

router.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body
  const existing = users.find((u) => u.email === email)
  if (existing) return res.status(400).json(failure('Email уже существует'))
  const user = { id: randomUUID(), name, email, password, cohort: 'Beta waitlist' }
  users.push(user)
  writeUsers(users)
  const token = randomUUID()
  sessions.set(token, user.id)
  res.json(success({ token, user }))
})

router.get('/auth/profile', (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json(failure('Нет токена'))
  const token = auth.replace('Bearer ', '')
  const userId = sessions.get(token)
  const user = users.find((u) => u.id === userId)
  if (!user) return res.status(401).json(failure('Сессия не найдена'))
  res.json(success(user))
})

module.exports = router

