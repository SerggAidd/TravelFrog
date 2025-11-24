import React from 'react'
import styled from '@emotion/styled'
import { SavedTripsBoard } from '../components/SavedTripsBoard'

const Wrapper = styled.div`
  display: grid;
  gap: 1.5rem;
`

export const Trips = () => (
  <Wrapper>
    <div>
      <h1>Сценарии</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Здесь хранятся все ваши сохранённые маршруты. Вы можете быстро вернуться к любому из них в любое время.
      </p>
    </div>
    <SavedTripsBoard />
  </Wrapper>
)

