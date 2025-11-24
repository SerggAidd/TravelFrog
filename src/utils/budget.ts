import type { BudgetBreakdown, City, CityMatch, PreferenceWeights, SearchParams } from '../types'
import { travelDuration } from '../store/useTravelStore'

export const weighPreferences = (prefs: PreferenceWeights) => {
  const total = Math.max(1, prefs.culture + prefs.nature + prefs.nightlife)
  return {
    culture: prefs.culture / total,
    nature: prefs.nature / total,
    nightlife: prefs.nightlife / total,
  }
}

export const getMatchScore = (city: City, prefs: PreferenceWeights) => {
  const weighted = weighPreferences(prefs)
  return Math.round(
    city.focus.culture * weighted.culture +
      city.focus.nature * weighted.nature +
      city.focus.nightlife * weighted.nightlife,
  )
}

export const adjustBreakdown = (base: BudgetBreakdown, score: number): BudgetBreakdown => {
  const sensitivity = score / 100
  return {
    flights: Math.max(15, Math.round(base.flights * (1 + 0.05 * sensitivity))),
    lodging: Math.max(20, Math.round(base.lodging * (1 + 0.02 * sensitivity))),
    food: Math.max(15, Math.round(base.food * (1 - 0.05 * sensitivity))),
    experiences: Math.max(10, Math.round(base.experiences * (1 + 0.07 * sensitivity))),
    buffer: Math.max(5, Math.round(base.buffer * (1 - 0.03 * sensitivity))),
  }
}

export const buildCityMatch = (city: City, params: SearchParams): CityMatch => {
  const days = travelDuration(params)
  const totalCost = days * city.avgDailyCost * params.travelers
  const matchScore = getMatchScore(city, params.preferences)
  const adjustedBreakdown = adjustBreakdown(city.baseBreakdown, matchScore)
  const budgetDelta = params.budget - totalCost
  return {
    city,
    matchScore,
    totalCost,
    budgetDelta,
    adjustedBreakdown,
  }
}

export const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)

