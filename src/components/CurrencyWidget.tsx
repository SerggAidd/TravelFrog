import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { useTravelStore, selectCurrencyRates, selectActions } from '../store/useTravelStore'

const Card = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  input,
  select {
    flex: 1;
    background: var(--bg-card-alt);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 0.5rem 0.75rem;
    color: var(--text);
  }
`

const Button = styled.button`
  margin-left: auto;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  color: var(--text-muted);
  padding: 0.35rem 0.75rem;
  cursor: pointer;
`

export const CurrencyWidget = () => {
  const rates = useTravelStore(selectCurrencyRates)
  const { loadRates } = useTravelStore(selectActions)
  const [base, setBase] = useState('USD')
  const [target, setTarget] = useState('EUR')
  const [amount, setAmount] = useState(100)

  useEffect(() => {
    if (!Object.keys(rates).length) {
      loadRates()
    }
  }, [rates, loadRates])

  const convert = () => {
    const baseRate = rates[base] || 1
    const targetRate = rates[target] || 1
    return Number(((amount / baseRate) * targetRate).toFixed(2))
  }

  const currencies = Object.keys(rates).length ? Object.keys(rates) : ['USD', 'EUR']

  return (
    <Card>
      <div>
        <h3>Конвертер валют</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Узнайте актуальный курс валют для планирования бюджета поездки.
        </p>
      </div>
      <Row>
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <select value={base} onChange={(e) => setBase(e.target.value)}>
          {currencies.map((cur) => (
            <option key={cur}>{cur}</option>
          ))}
        </select>
      </Row>
      <Row>
        <input value={convert()} readOnly />
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          {currencies.map((cur) => (
            <option key={cur}>{cur}</option>
          ))}
        </select>
      </Row>
      <Button type="button" onClick={() => loadRates()}>
        Обновить курсы
      </Button>
    </Card>
  )
}

