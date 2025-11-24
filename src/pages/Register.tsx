import React, { useState } from 'react'
import styled from '@emotion/styled'
import { Link, useNavigate } from 'react-router-dom'
import { useTravelStore, selectActions } from '../store/useTravelStore'

const Card = styled.form`
  max-width: 520px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 1.25rem;
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--text-muted);

  input {
    background: var(--bg-card-alt);
    border: 1px solid var(--border);
    border-radius: 0.85rem;
    padding: 0.75rem 1rem;
    color: var(--text);
  }
`

const Submit = styled.button`
  margin-top: 0.5rem;
  background: linear-gradient(120deg, #ffd166, #ff8a5b);
  border: none;
  border-radius: 0.9rem;
  padding: 0.85rem 1.25rem;
  color: #05050b;
  font-weight: 600;
  cursor: pointer;
`

const Helper = styled.div`
  font-size: 0.85rem;
  color: var(--text-muted);
  a {
    color: var(--accent);
  }
`

export const Register = () => {
  const navigate = useNavigate()
  const { register } = useTravelStore(selectActions)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError(undefined)
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрироваться')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1>Регистрация</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 520 }}>
        Создайте аккаунт TravelForge, чтобы сохранять маршруты, отслеживать аналитику и делиться сценариями с командой.
      </p>
      <Card onSubmit={onSubmit}>
        <Field>
          Имя
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field>
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
        <Submit type="submit" disabled={loading}>
          {loading ? 'Создаём…' : 'Создать аккаунт'}
        </Submit>
        <Helper>
          Уже есть логин? <Link to="/auth/login">Перейдите к авторизации</Link>
        </Helper>
      </Card>
    </section>
  )
}


