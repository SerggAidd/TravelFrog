import React, { useMemo } from 'react'
import styled from '@emotion/styled'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'
import type { CityMatch } from '../types'

const Card = styled.section`
  background: var(--bg-card);
  border-radius: 1.25rem;
  border: 1px solid var(--border);
  padding: 0;
  overflow: hidden;
`

type Props = {
  matches: CityMatch[]
}

export const MapPanel = ({ matches }: Props) => {
  const center = useMemo<[number, number]>(() => {
    if (!matches.length) return [48.5, 18]
    const lat = matches.reduce((sum, item) => sum + item.city.lat, 0) / matches.length
    const lng = matches.reduce((sum, item) => sum + item.city.lng, 0) / matches.length
    return [lat, lng]
  }, [matches])

  return (
    <Card>
      <MapContainer style={{ height: 360 }} center={center} zoom={4} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {matches.map((match) => (
          <Marker key={match.city.id} position={[match.city.lat, match.city.lng]}>
            <Popup>
              <strong>{match.city.name}</strong>
              <div style={{ fontSize: '0.85rem' }}>Матч {match.matchScore}%</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  )
}

