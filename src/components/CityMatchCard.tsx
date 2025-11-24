import React from 'react'
import styled from '@emotion/styled'
import { formatCurrency } from '../utils/budget'
import type { CityMatch } from '../types'
import { useTravelStore, selectActions, selectUser } from '../store/useTravelStore'

const Card = styled.article`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const Tag = styled.span<{ tone?: 'success' | 'danger' }>`
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: ${({ tone }) =>
    tone === 'success'
      ? 'rgba(58,210,159,0.1)'
      : tone === 'danger'
        ? 'rgba(255,107,107,0.1)'
        : 'rgba(255,255,255,0.08)'};
  color: ${({ tone }) =>
    tone === 'success' ? '#3ad29f' : tone === 'danger' ? '#ff6b6b' : 'var(--text-muted)'};
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const ButtonRow = styled.div`
  margin-top: auto;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const Primary = styled.button`
  flex: 1;
  min-width: 140px;
  background: var(--accent);
  border: none;
  border-radius: 0.9rem;
  padding: 0.75rem 1rem;
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Ghost = styled.button`
  flex: 1;
  min-width: 140px;
  border: 1px solid var(--border);
  background: transparent;
  border-radius: 0.9rem;
  padding: 0.75rem 1rem;
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
`

type Props = {
  match: CityMatch
}

export const CityMatchCard = ({ match }: Props) => {
  const user = useTravelStore(selectUser)
  const { saveTrip } = useTravelStore(selectActions)
  const isAffordable = match.budgetDelta >= 0

  return (
    <Card>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <strong>{match.city.name}</strong>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{match.city.country}</div>
        </div>
        <Tag tone={isAffordable ? 'success' : 'danger'}>
          {isAffordable ? `+${formatCurrency(match.budgetDelta)}` : formatCurrency(match.budgetDelta)}
        </Tag>
        <Tag>Матч {match.matchScore}%</Tag>
      </div>

      <p style={{ margin: 0, color: 'var(--text-muted)' }}>{match.city.tagline}</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Общий бюджет</div>
          <strong>{formatCurrency(match.totalCost)}</strong>
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Опыт</div>
          <strong>{match.city.highlights.slice(0, 2).join(' · ')}</strong>
        </div>
      </div>

      <ButtonRow>
        <Primary onClick={() => user && saveTrip(match, 'Добавлено из карточки')} disabled={!user}>
          {user ? 'Сохранить маршрут' : 'Войдите, чтобы сохранить'}
        </Primary>
        <Ghost
          onClick={() => {
            alert(`Заглушка: форма покупки билета в ${match.city.name}\n\nВ реальном приложении здесь будет форма бронирования с интеграцией партнёрских сервисов.`)
          }}
        >
          Забронировать билет
        </Ghost>
      </ButtonRow>
    </Card>
  )
}

