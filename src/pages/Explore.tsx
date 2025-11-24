import React from 'react'
import styled from '@emotion/styled'
import { CityMatchCard } from '../components/CityMatchCard'
import { MapPanel } from '../components/MapPanel'
import { useTravelStore, selectResults } from '../store/useTravelStore'

const Layout = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`

const List = styled.div`
  display: grid;
  gap: 1rem;
`

export const Explore = () => {
  const matches = useTravelStore(selectResults)

  return (
    <Layout>
      <List>
        {matches.map((match) => (
          <CityMatchCard key={match.city.id} match={match} />
        ))}
      </List>
      <MapPanel matches={matches} />
    </Layout>
  )
}

