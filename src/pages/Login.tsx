import React, { useState } from 'react'
import styled from '@emotion/styled'
import { Link, useNavigate } from 'react-router-dom'
import { useTravelStore, selectActions, selectUser } from '../store/useTravelStore'

const Card = styled.form`
  max-width: 460px;
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
  background: linear-gradient(120deg, #7f5dff, #63b3ff);
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

export const Login = () => {
  const navigate = useNavigate()
  const user = useTravelStore(selectUser)
  const { login } = useTravelStore(selectActions)
  const [email, setEmail] = useState('demo@travelforge.io')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError(undefined)
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h1>Вход в TravelForge</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 520 }}>
        Используй демо-аккаунт или свои данные, чтобы сохранять сценарии, управлять TravelBot и видеть аналитику партнёрок.
      </p>
      {user && (
        <p style={{ color: 'var(--success)' }}>
          Вы уже вошли как {user.name}. При желании можно выйти в панели сбоку и войти под другим аккаунтом.
        </p>
      )}
      <Card onSubmit={onSubmit}>
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
          {loading ? 'Входим…' : 'Войти'}
        </Submit>
        <Helper>
          Нет аккаунта? <Link to="/auth/register">Создайте его за минуту</Link>
        </Helper>
      </Card>
    </section>
  )
}


