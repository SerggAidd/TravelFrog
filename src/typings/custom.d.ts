declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module 'leaflet-defaulticon-compatibility'
declare module 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'

declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
  hot?: {
    accept: (path: string, callback: () => void) => void
  }
}
