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
  // Проверяем Content-Type перед парсингом JSON
  const contentType = res.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    // Если получили HTML вместо JSON, значит API недоступен (вероятно, production без backend)
    const text = await res.text()
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error('API недоступен. Stub API работает только в dev режиме. В production нужен отдельный backend сервер.')
    }
    throw new Error(`Ожидался JSON, получен ${contentType}. Ответ: ${text.substring(0, 100)}`)
  }
  
  const payload: ApiEnvelope<T> = JSON.parse(await res.text())
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

