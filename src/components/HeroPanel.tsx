import React from 'react'
import styled from '@emotion/styled'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useTravelStore, selectSearchParams, selectResults } from '../store/useTravelStore'
import { formatCurrency } from '../utils/budget'

const Wrapper = styled.section`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(14, 165, 233, 0.25));
  border-radius: 1.5rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  gap: 1.25rem;

  @media (min-width: 960px) {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`

const Chip = styled.span`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
`

export const HeroPanel = () => {
  const params = useTravelStore(selectSearchParams)
  const results = useTravelStore(selectResults)

  const summary = [
    `${params.travelers} путешественник(ов)`,
    `${format(new Date(params.startDate), 'dd MMM', { locale: ru })} — ${format(
      new Date(params.endDate),
      'dd MMM',
      { locale: ru },
    )}`,
    `${params.origin} · точка старта`,
  ]

  const best = results[0]

  return (
    <Wrapper>
      <div>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>TravelForge • учебный MVP</p>
        <h1 style={{ margin: '0.4rem 0 0.5rem', fontSize: '2.5rem' }}>Личный фордж бюджетных путешествий</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 620 }}>
          Подбираем идеальные направления на основе вашего бюджета и предпочтений. Умный алгоритм анализирует тысячи вариантов и предлагает лучшие маршруты.
        </p>
        <Chips>
          {summary.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </Chips>
      </div>
      {best && (
        <div
          style={{
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            minWidth: 260,
          }}
        >
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Топ рекомендация сейчас</div>
          <h3 style={{ margin: '0.4rem 0 0.2rem' }}>{best.city.name}</h3>
          <div style={{ color: 'var(--text-muted)' }}>{best.city.country}</div>
          <div style={{ marginTop: '1rem', fontWeight: 600 }}>
            Общее {formatCurrency(best.totalCost)}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Бюджет: {formatCurrency(params.budget)}</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Совпадение: {best.matchScore}%</div>
          <button
            onClick={() => {
              alert(`Заглушка: форма покупки билета в ${best.city.name}\n\nВ реальном приложении здесь будет форма бронирования.`)
            }}
            style={{
              display: 'inline-flex',
              marginTop: '1rem',
              padding: '0.6rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            Забронировать билет
          </button>
        </div>
      )}
    </Wrapper>
  )
}
