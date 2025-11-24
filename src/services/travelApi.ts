import type {
  AuthUser,
  City,
  CityMatch,
  CurrencyRates,
  SavedTrip,
  SearchParams,
  TravelBotRequest,
  TravelBotResponse,
} from '../types'

const API_ROOT = '/api'

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: string
}

const handleResponse = async <T>(res: Response): Promise<T> => {
  const payload: ApiEnvelope<T> = await res.json()
  if (!res.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || 'API error')
  }
  return payload.data
}

const authHeaders = (token?: string) => (token ? { Authorization: `Bearer ${token}` } : {})

const request = async <T>(endpoint: string, init?: RequestInit) => {
  const res = await fetch(`${API_ROOT}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  return handleResponse<T>(res)
}

export const travelApi = {
  getCities: () => request<City[]>('/cities'),
  getCity: (id: string) => request<City>(`/cities/${id}`),
  searchCities: (params: SearchParams) =>
    request<CityMatch[]>('/cities/search', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  getTrips: (token?: string) =>
    request<SavedTrip[]>('/trips', {
      headers: authHeaders(token),
    }),
  saveTrip: (trip: Omit<SavedTrip, 'id' | 'savedAt'>, token?: string) =>
    request<SavedTrip>('/trips', {
      method: 'POST',
      body: JSON.stringify(trip),
      headers: authHeaders(token),
    }),
  deleteTrip: (id: string, token?: string) =>
    request<void>(`/trips/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),
  getCurrencyRates: () => request<CurrencyRates>('/currencies/rates'),
  convertCurrency: (amount: number, from: string, to: string) =>
    request(`/currencies/convert`, {
      method: 'POST',
      body: JSON.stringify({ amount, from, to }),
    }),
  initTravelBot: (payload: { topMatches: CityMatch[]; preferences?: any }) =>
    request<TravelBotResponse>('/travelbot/init', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  askTravelBot: (payload: TravelBotRequest) =>
    request<TravelBotResponse>('/travelbot/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getInsights: () => request('/insights'),
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  getProfile: (token: string) =>
    request<AuthUser>('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

export type TravelApi = typeof travelApi

