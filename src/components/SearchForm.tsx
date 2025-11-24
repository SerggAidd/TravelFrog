import React from 'react'
import styled from '@emotion/styled'
import { useTravelStore, selectSearchParams, selectActions } from '../store/useTravelStore'

const Card = styled.form`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: grid;
  gap: 1.25rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-muted);

  input,
  select {
    background: var(--bg-card-alt);
    border: 1px solid var(--border);
    border-radius: 0.9rem;
    padding: 0.75rem 0.9rem;
    color: var(--text);
  }
`

const RangeWrap = styled.div`
  background: var(--bg-card-alt);
  border-radius: 1.2rem;
  padding: 1rem;
`

const Submit = styled.button`
  margin-left: auto;
  background: linear-gradient(120deg, #7f5dff, #63b3ff);
  color: white;
  border: none;
  border-radius: 0.9rem;
  padding: 0.9rem 1.75rem;
  font-weight: 600;
  cursor: pointer;
`

export const SearchForm = () => {
  const params = useTravelStore(selectSearchParams)
  const { updateSearchParams, updatePreferences, fetchResults } = useTravelStore(selectActions)

  const update = (field: keyof typeof params, value: string | number) => {
    updateSearchParams({ [field]: value } as Partial<typeof params>)
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    fetchResults()
  }

  return (
    <Card onSubmit={onSubmit}>
      <Grid>
        <Label>
          Бюджет (USD)
          <input
            type="number"
            value={params.budget}
            min={500}
            step={100}
            onChange={(e) => update('budget', Number(e.target.value))}
          />
        </Label>
        <Label>
          Количество путешественников
          <input
            type="number"
            value={params.travelers}
            min={1}
            onChange={(e) => update('travelers', Number(e.target.value))}
          />
        </Label>
        <Label>
          Город вылета
          <input value={params.origin} onChange={(e) => update('origin', e.target.value)} />
        </Label>
        <Label>
          Дата начала
          <input type="date" value={params.startDate} onChange={(e) => update('startDate', e.target.value)} />
        </Label>
        <Label>
          Дата окончания
          <input type="date" value={params.endDate} onChange={(e) => update('endDate', e.target.value)} />
        </Label>
      </Grid>

      <RangeWrap>
        <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Важность факторов</div>
        <Grid>
          {[
            { key: 'culture', label: 'Культура' },
            { key: 'nature', label: 'Природа' },
            { key: 'nightlife', label: 'Ночная жизнь' },
          ].map((slider) => (
            <Label key={slider.key}>
              {slider.label}: {params.preferences[slider.key as keyof typeof params.preferences]}%
              <input
                type="range"
                min={0}
                max={100}
                value={params.preferences[slider.key as keyof typeof params.preferences]}
                onChange={(e) => updatePreferences({ [slider.key]: Number(e.target.value) })}
              />
            </Label>
          ))}
        </Grid>
      </RangeWrap>

      <Submit type="submit">Собрать маршрут</Submit>
    </Card>
  )
}

