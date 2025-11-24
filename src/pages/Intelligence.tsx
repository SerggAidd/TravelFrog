import React from 'react'
import styled from '@emotion/styled'
import { InsightsGrid } from '../components/InsightsGrid'
import { useTravelStore, selectFeatures, selectActions } from '../store/useTravelStore'

const Section = styled.section`
  display: grid;
  gap: 1.5rem;
`

const Flags = styled.div`
  display: grid;
  gap: 0.75rem;
`

const FlagCard = styled.div`
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  background: var(--bg-card);
`

const Toggle = styled.input`
  transform: scale(1.2);
`

export const Intelligence = () => {
  const features = useTravelStore(selectFeatures)
  const { toggleFeature } = useTravelStore(selectActions)

  return (
    <Section>
      <div>
        <h1>Интеллект TravelForge</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Карта гипотез, позиций конкурентов и контроль экспериментов через feature flags.
        </p>
      </div>
      <InsightsGrid />
      <div>
        <h3>Фича-флаги</h3>
        <Flags>
          {features.map((feature) => (
            <FlagCard key={feature.name}>
              <div>
                <strong>{feature.name}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{feature.description}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Ответственный: {feature.owner}</div>
              </div>
              <Toggle
                type="checkbox"
                checked={feature.enabled}
                onChange={(e) => toggleFeature(feature.name, e.target.checked)}
              />
            </FlagCard>
          ))}
        </Flags>
      </div>
    </Section>
  )
}

