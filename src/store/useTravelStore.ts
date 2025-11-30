import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { differenceInDays, addDays, formatISO } from 'date-fns'
import { nanoid } from 'nanoid'

import type {
  AuthUser,
  BudgetBreakdown,
  CityMatch,
  CurrencyRates,
  FeatureFlag,
  FeatureFlagName,
  PreferenceWeights,
  SavedTrip,
  SearchParams,
  TravelBotHistoryItem,
} from '../types'
import { travelApi } from '../services/travelApi'

type LoadingState = 'idle' | 'pending' | 'success' | 'error'
type TravelBotMessage = TravelBotHistoryItem & { id: string; timestamp: string }

const TOKEN_KEY = 'travelforge.auth.token'
const USER_KEY = 'travelforge.auth.user'

const readPersistedAuth = (): { token?: string; user?: AuthUser } => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem(TOKEN_KEY) || undefined
  const raw = localStorage.getItem(USER_KEY)
  return {
    token,
    user: raw ? (JSON.parse(raw) as AuthUser) : undefined,
  }
}

const persistAuth = (token?: string, user?: AuthUser) => {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

const createMessage = (role: TravelBotMessage['role'], text: string): TravelBotMessage => ({
  id: nanoid(),
  role,
  text,
  timestamp: new Date().toISOString(),
})

type TravelStore = {
  searchParams: SearchParams
  results: CityMatch[]
  savedTrips: SavedTrip[]
  currencyRates: CurrencyRates
  travelBotThread: TravelBotMessage[]
  travelBotStatus: LoadingState
  user?: AuthUser
  token?: string
  loading: LoadingState
  error?: string
  features: FeatureFlag[]
  actions: {
    updateSearchParams: (payload: Partial<SearchParams>) => void
    updatePreferences: (prefs: Partial<PreferenceWeights>) => void
    fetchResults: () => Promise<void>
    loadTrips: () => Promise<void>
    saveTrip: (match: CityMatch, note?: string) => Promise<void>
    removeTrip: (id: string) => Promise<void>
    loadRates: () => Promise<void>
    bootstrapTravelBot: () => Promise<void>
    sendTravelBotMessage: (text: string, cityId?: string) => Promise<void>
    resetTravelBot: () => void
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
    toggleFeature: (flag: FeatureFlagName, enabled: boolean) => void
  }
}

const today = formatISO(new Date(), { representation: 'date' })
const fiveDaysLater = formatISO(addDays(new Date(), 5), { representation: 'date' })

const defaultSearch: SearchParams = {
  budget: 1500,
  origin: 'Москва',
  startDate: today,
  endDate: fiveDaysLater,
  travelers: 2,
  preferences: {
    culture: 60,
    nature: 40,
    nightlife: 35,
  },
}

const defaultFeatures: FeatureFlag[] = [
  {
    name: 'insights',
    enabled: true,
    description: 'Включает дашборд конкурентного анализа',
    owner: 'analytics@travelforge',
  },
  {
    name: 'travelBot',
    enabled: true,
    description: 'AI TravelBot для мгновенных советов',
    owner: 'labs@travelforge',
  },
  {
    name: 'currency',
    enabled: true,
    description: 'Виджет конвертации валют',
    owner: 'finance@travelforge',
  },
  {
    name: 'partnerLinks',
    enabled: true,
    description: 'Глубокие ссылки Travelpayouts',
    owner: 'bizdev@travelforge',
  },
]

const withDevtools = devtools<TravelStore>

const initialAuth = readPersistedAuth()

export const useTravelStore = create(
  withDevtools(
    (set, get): TravelStore => ({
      searchParams: defaultSearch,
      results: [],
      savedTrips: [],
      currencyRates: {},
      travelBotThread: [],
      travelBotStatus: 'idle',
      loading: 'idle',
      features: defaultFeatures,
      ...initialAuth,
      actions: {
        updateSearchParams: (payload) =>
          set((state) => ({
            searchParams: { ...state.searchParams, ...payload },
          })),

        updatePreferences: (prefs) => {
          set((state) => ({
            searchParams: {
              ...state.searchParams,
              preferences: { ...state.searchParams.preferences, ...prefs },
            },
          }))
          // Уведомляем TravelBot об изменении приоритетов
          const thread = get().travelBotThread
          if (thread.length > 0) {
            get().actions.sendTravelBotMessage('Я изменил приоритеты')
          }
        },

        fetchResults: async () => {
          set({ loading: 'pending', error: undefined })
          try {
            const matches = await travelApi.searchCities(get().searchParams)
            set({ results: matches, loading: 'success' })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Ошибка загрузки направлений',
              loading: 'error',
            })
          }
        },

        loadTrips: async () => {
          const token = get().token
          if (!token) {
            set({ error: 'Сохранённые сценарии доступны после входа' })
            return
          }
          try {
            const trips = await travelApi.getTrips(token)
            set({ savedTrips: trips, error: undefined })
          } catch (error) {
            console.error('Failed to load trips', error)
            set({ error: 'Не удалось загрузить сценарии' })
          }
        },

        saveTrip: async (match, note) => {
          const token = get().token
          if (!token) {
            set({ error: 'Авторизуйтесь, чтобы сохранять маршруты' })
            return
          }
          const params = get().searchParams
          const payload: Omit<SavedTrip, 'id' | 'savedAt'> = {
            cityMatch: match,
            params,
            note,
            savedAt: '',
          }
          try {
            const saved = await travelApi.saveTrip(payload, token)
            set((state) => ({
              savedTrips: [saved, ...state.savedTrips],
              error: undefined,
            }))
          } catch (error) {
            console.warn('Stub save trip fallback', error)
            const fallback: SavedTrip = {
              ...payload,
              id: nanoid(),
              savedAt: new Date().toISOString(),
            }
            set((state) => ({
              savedTrips: [fallback, ...state.savedTrips],
            }))
          }
        },

        removeTrip: async (id) => {
          const token = get().token
          if (!token) {
            set({ error: 'Сначала выполните вход' })
            return
          }
          try {
            await travelApi.deleteTrip(id, token)
          } catch (error) {
            console.warn('Stub delete fallback', error)
          } finally {
            set((state) => ({
              savedTrips: state.savedTrips.filter((trip) => trip.id !== id),
            }))
          }
        },

        loadRates: async () => {
          try {
            const rates = await travelApi.getCurrencyRates()
            set({ currencyRates: rates })
          } catch (error) {
            console.error('Cannot load rates', error)
          }
        },

        bootstrapTravelBot: async () => {
          // Предотвращаем повторную инициализацию, если бот уже был инициализирован
          const currentThread = get().travelBotThread
          if (currentThread.length > 0) return
          set({ travelBotStatus: 'pending' })
          try {
            const topMatches = get().results.slice(0, 3)
            const response = await travelApi.initTravelBot({
              topMatches,
              preferences: get().searchParams.preferences,
            })
            set((state) => ({
              travelBotThread: [
                ...state.travelBotThread,
                createMessage('assistant', response.answer),
                ...(response.followUp ? [createMessage('assistant', response.followUp)] : []),
              ],
              travelBotStatus: 'success',
            }))
          } catch (error) {
            console.error('Travel bot init error', error)
            set({ travelBotStatus: 'error' })
          }
        },

        sendTravelBotMessage: async (text, cityId) => {
          const trimmed = text.trim()
          if (!trimmed) return
          const userMessage = createMessage('user', trimmed)
          set((state) => ({
            travelBotThread: [...state.travelBotThread, userMessage],
            travelBotStatus: 'pending',
          }))
          try {
            const history: TravelBotHistoryItem[] = get().travelBotThread.map(({ role, text }) => ({ role, text }))
            const topMatches = get().results.slice(0, 3)
            const response = await travelApi.askTravelBot({
              prompt: trimmed,
              cityId,
              budget: get().searchParams.budget,
              preferences: get().searchParams.preferences,
              history,
              topMatches,
            })
            set((state) => ({
              travelBotThread: [
                ...state.travelBotThread,
                createMessage('assistant', response.answer),
                ...(response.followUp ? [createMessage('assistant', response.followUp)] : []),
              ],
              travelBotStatus: 'success',
            }))
          } catch (error) {
            console.error('Travel bot error', error)
            set({ travelBotStatus: 'error' })
          }
        },

        resetTravelBot: () =>
          set({
            travelBotThread: [],
            travelBotStatus: 'idle',
          }),

        login: async (email, password) => {
          const { token, user } = await travelApi.login(email, password)
          persistAuth(token, user)
          set({ token, user, error: undefined })
        },

        register: async (name, email, password) => {
          const { token, user } = await travelApi.register(name, email, password)
          persistAuth(token, user)
          set({ token, user, error: undefined })
        },

        logout: () => {
          persistAuth(undefined, undefined)
          set({ token: undefined, user: undefined, savedTrips: [] })
        },

        toggleFeature: (flag, enabled) =>
          set((state) => ({
            features: state.features.map((feature) =>
              feature.name === flag ? { ...feature, enabled } : feature,
            ),
          })),
      },
    }),
    { name: 'travelforge-store' },
  ),
)

export const selectSearchParams = (state: TravelStore) => state.searchParams
export const selectResults = (state: TravelStore) => state.results
export const selectSavedTrips = (state: TravelStore) => state.savedTrips
export const selectCurrencyRates = (state: TravelStore) => state.currencyRates
export const selectLoading = (state: TravelStore) => state.loading
export const selectTravelBotThread = (state: TravelStore) => state.travelBotThread
export const selectTravelBotStatus = (state: TravelStore) => state.travelBotStatus
export const selectFeatures = (state: TravelStore) => state.features
export const selectUser = (state: TravelStore) => state.user
export const selectActions = (state: TravelStore) => state.actions

export const travelDuration = (params: SearchParams) =>
  Math.max(1, differenceInDays(new Date(params.endDate), new Date(params.startDate)))

export const normalizeBreakdown = (breakdown: BudgetBreakdown) => {
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  return Object.fromEntries(
    Object.entries(breakdown).map(([key, value]) => [key, Number(((value / total) * 100).toFixed(2))]),
  ) as BudgetBreakdown
}

