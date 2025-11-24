export type BudgetBreakdown = {
  flights: number
  lodging: number
  food: number
  experiences: number
  buffer: number
}

export type PreferenceWeights = {
  culture: number
  nature: number
  nightlife: number
}

export type SearchParams = {
  budget: number
  startDate: string
  endDate: string
  origin: string
  travelers: number
  preferences: PreferenceWeights
}

export type City = {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  tagline: string
  image: string
  partnerDeepLink: string
  avgDailyCost: number
  baseBreakdown: BudgetBreakdown
  focus: PreferenceWeights
  highlights: string[]
}

export type CityMatch = {
  city: City
  matchScore: number
  totalCost: number
  budgetDelta: number
  adjustedBreakdown: BudgetBreakdown
}

export type SavedTrip = {
  id: string
  cityMatch: CityMatch
  params: SearchParams
  savedAt: string
  note?: string
}

export type CurrencyRates = Record<string, number>

export type TravelBotHistoryItem = {
  role: 'assistant' | 'user'
  text: string
}

export type TravelBotRequest = {
  prompt: string
  cityId?: string
  budget?: number
  preferences?: PreferenceWeights
  history?: TravelBotHistoryItem[]
}

export type TravelBotResponse = {
  answer: string
  sources: string[]
  followUp?: string
}

export type AuthUser = {
  id: string
  name: string
  email: string
  cohort: string
}

export type FeatureFlagName =
  | 'insights'
  | 'travelBot'
  | 'currency'
  | 'partnerLinks'

export type FeatureFlag = {
  name: FeatureFlagName
  enabled: boolean
  description: string
  owner: string
}

