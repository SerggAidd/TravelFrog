import React, { useEffect } from 'react'
import styled from '@emotion/styled'
import { useTravelStore, selectSavedTrips, selectActions, selectUser } from '../store/useTravelStore'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { formatCurrency } from '../utils/budget'

const Board = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Trip = styled.div`
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  align-items: center;
`

const Remove = styled.button`
  background: transparent;
  color: var(--danger);
  border: 1px solid rgba(255, 107, 107, 0.4);
  border-radius: 0.8rem;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
`

export const SavedTripsBoard = () => {
  const trips = useTravelStore(selectSavedTrips)
  const user = useTravelStore(selectUser)
  const { loadTrips, removeTrip } = useTravelStore(selectActions)

  useEffect(() => {
    if (user) {
      loadTrips()
    }
  }, [user, loadTrips])

  return (
    <Board>
      <div>
        <h3>Сохранённые маршруты</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Здесь хранятся ваши сохранённые маршруты для быстрого доступа.
        </p>
      </div>
      {!user && (
        <div style={{ color: 'var(--text-muted)' }}>
          Авторизуйтесь, чтобы сохранять подборки и получать к ним быстрый доступ.
        </div>
      )}
      {user && trips.length === 0 && (
        <div style={{ color: 'var(--text-muted)' }}>После сохранения карточки здесь появится сценарий.</div>
      )}
      {user &&
        trips
          .filter((trip) => trip?.cityMatch?.city)
          .map((trip) => (
            <Trip key={trip.id}>
              <div>
                <strong>{trip.cityMatch.city.name}</strong>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {format(new Date(trip.savedAt), 'dd MMM yyyy', { locale: ru })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Бюджет</div>
                <strong>{formatCurrency(trip.cityMatch.totalCost)}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Матч</div>
                <strong>{trip.cityMatch.matchScore}%</strong>
              </div>
              <Remove type="button" onClick={() => removeTrip(trip.id)}>
                Удалить
              </Remove>
            </Trip>
          ))}
    </Board>
  )
}

