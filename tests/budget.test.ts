import { describe, expect, it } from 'vitest'
import { buildCityMatch, getMatchScore } from '../src/utils/budget'

const city = {
  id: 'test',
  name: 'Test city',
  country: 'Nowhere',
  tagline: '',
  image: '',
  partnerDeepLink: '#',
  lat: 0,
  lng: 0,
  avgDailyCost: 100,
  baseBreakdown: {
    flights: 30,
    lodging: 30,
    food: 20,
    experiences: 15,
    buffer: 5,
  },
  focus: {
    culture: 80,
    nature: 50,
    nightlife: 20,
  },
  highlights: [],
}

const params = {
  budget: 1200,
  startDate: '2024-01-01',
  endDate: '2024-01-06',
  origin: 'Москва',
  travelers: 2,
  preferences: { culture: 70, nature: 20, nightlife: 10 },
}

describe('budget utils', () => {
  it('calculates match score respecting weights', () => {
    const score = getMatchScore(city, params.preferences)
    expect(score).toBeGreaterThan(60)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('builds city match with travel duration and delta', () => {
    const match = buildCityMatch(city, params)
    expect(match.totalCost).toBe(1000)
    expect(match.budgetDelta).toBe(200)
    expect(match.adjustedBreakdown.flights).toBeGreaterThan(0)
  })
})

