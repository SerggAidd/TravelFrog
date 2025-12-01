const express = require('express')
const cors = require('cors')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
require('dotenv').config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())

const dataDir = path.join(__dirname, '..', 'data')
const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'))
const writeJson = (file, data) =>
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2))

let cities = readJson('cities.json')
let currencies = readJson('currencies.json')
let users = readJson('users.json')
let trips = []
const tokens = new Map()

const ok = (res, data) => res.json({ success: true, data })
const fail = (res, error, status = 400) =>
  res.status(status).json({ success: false, error })

const sanitizeUser = ({ password, ...rest }) => rest

const requireAuth = (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.replace('Bearer ', '')
  const user = tokens.get(token)
  if (!user) {
    fail(res, 'Unauthorized', 401)
    return null
  }
  return user
}

app.get('/api/health', (_, res) => ok(res, { status: 'ok' }))
app.get('/api/cities', (_, res) => ok(res, cities))

app.get('/api/cities/:id', (req, res) => {
  const city = cities.find((c) => c.id === req.params.id)
  if (!city) return fail(res, 'City not found', 404)
  return ok(res, city)
})

const applyScores = (city, prefs) => {
  const weights = {
    culture: Number(prefs.prefCulture) || 0,
    nature: Number(prefs.prefNature) || 0,
    party: Number(prefs.prefParty) || 0,
  }
  const scores = city.scores || {}
  return (
    weights.culture * (scores.culture || 0) +
    weights.nature * (scores.nature || 0) +
    weights.party * (scores.party || 0)
  )
}

app.get('/api/cities/search', (req, res) => {
  const budget = Number(req.query.budget) || Infinity
  const prefs = req.query
  const result = cities
    .filter((city) => city.avgDailyCost <= budget)
    .sort((a, b) => applyScores(b, prefs) - applyScores(a, prefs))
  ok(res, result)
})

app.get('/api/trips', (_, res) => ok(res, trips))

app.get('/api/trips/:id', (req, res) => {
  const trip = trips.find((t) => t.id === req.params.id)
  if (!trip) return fail(res, 'Trip not found', 404)
  ok(res, trip)
})

app.post('/api/trips', (req, res) => {
  const trip = {
    ...req.body,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  }
  trips.push(trip)
  ok(res, trip)
})

app.delete('/api/trips/:id', (req, res) => {
  const size = trips.length
  trips = trips.filter((t) => t.id !== req.params.id)
  if (size === trips.length) return fail(res, 'Trip not found', 404)
  ok(res, { id: req.params.id })
})

app.get('/api/currencies/rates', (_, res) => ok(res, currencies))

app.get('/api/currencies/convert', (req, res) => {
  const amount = Number(req.query.amount)
  const from = req.query.from
  const to = req.query.to

  if (!amount || !currencies[from] || !currencies[to]) {
    return fail(res, 'Invalid conversion')
  }

  const usd = amount / currencies[from]
  const converted = usd * currencies[to]
  ok(res, {
    amount,
    from,
    to,
    result: Number(converted.toFixed(2)),
  })
})

const { askGigachat } = require('./gigachat')

app.post('/api/travelbot/ask', async (req, res) => {
  const answer = await askGigachat(req.body.question || '')
  ok(res, { answer })
})

app.post('/api/travelbot/rebalance', (req, res) => {
  const current = req.body.current || req.body.budgetBreakdown
  if (!current) return fail(res, 'Invalid payload')

  const total = req.body.budget || Object.values(current).reduce((acc, v) => acc + v, 0)
  const keys = ['flights', 'lodging', 'food', 'local', 'buffer']
  const even = Number((total / keys.length).toFixed(2))
  const breakdown = Object.fromEntries(
    keys.map((key) => [key, current[key] !== undefined ? current[key] : even]),
  )

  ok(res, {
    breakdown,
    note: 'Бюджет перераспределён пропорционально вашим пожеланиям.',
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = users.find((u) => u.email === email)
  if (!user || user.password !== password) {
    return fail(res, 'Неверный логин или пароль', 401)
  }

  const token = crypto.randomUUID()
  tokens.set(token, sanitizeUser(user))
  res.json({ success: true, token, user: sanitizeUser(user) })
})

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body
  if (users.some((u) => u.email === email)) {
    return fail(res, 'Пользователь уже существует', 409)
  }

  const newUser = { id: crypto.randomUUID(), email, password, name }
  users.push(newUser)
  writeJson('users.json', users)

  const token = crypto.randomUUID()
  tokens.set(token, sanitizeUser(newUser))
  res.json({ success: true, token, user: sanitizeUser(newUser) })
})

app.get('/api/auth/profile', (req, res) => {
  const user = requireAuth(req, res)
  if (!user) return
  ok(res, user)
})

app.listen(PORT, () => {
  console.log(`Stub API listening on http://localhost:${PORT}`)
})

