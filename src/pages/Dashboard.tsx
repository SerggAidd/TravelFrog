import React, { useEffect } from 'react'
import styled from '@emotion/styled'
import { HeroPanel } from '../components/HeroPanel'
import { SearchForm } from '../components/SearchForm'
import { BudgetChart } from '../components/BudgetChart'
import { TravelBotPanel } from '../components/TravelBotPanel'
import { CurrencyWidget } from '../components/CurrencyWidget'
import { MapPanel } from '../components/MapPanel'
import { CityMatchCard } from '../components/CityMatchCard'
import { useTravelStore, selectResults, selectActions, selectLoading } from '../store/useTravelStore'

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
`

const HalfGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
`

const ResultsGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
`

export const Dashboard = () => {
  const matches = useTravelStore(selectResults)
  const { fetchResults } = useTravelStore(selectActions)
  const loading = useTravelStore(selectLoading)

  useEffect(() => {
    if (loading === 'idle') {
      fetchResults()
    }
  }, [loading, fetchResults])

  const topBreakdown = matches[0]?.adjustedBreakdown

  return (
    <Grid>
      <HeroPanel />
      <SearchForm />
      {matches.length > 0 && (
        <>
          <div>
            <h2>Подходящие направления</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Мы подобрали для вас {matches.length} {matches.length === 1 ? 'направление' : 'направлений'} на основе ваших предпочтений
            </p>
          </div>
          <ResultsGrid>
            {matches.map((match) => (
              <CityMatchCard key={match.city.id} match={match} />
            ))}
          </ResultsGrid>
        </>
      )}
      <HalfGrid>
        {topBreakdown && <BudgetChart breakdown={topBreakdown} />}
        <MapPanel matches={matches.slice(0, 5)} />
      </HalfGrid>
      <HalfGrid>
        <TravelBotPanel />
        <CurrencyWidget />
      </HalfGrid>
    </Grid>
  )
}

