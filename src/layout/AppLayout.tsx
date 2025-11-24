import React, { useMemo } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import styled from '@emotion/styled'
import { useTravelStore, selectUser, selectActions } from '../store/useTravelStore'

const Shell = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

const Sidebar = styled.aside`
  background: rgba(10, 11, 20, 0.8);
  border-right: 1px solid var(--border);
  padding: 2rem 1.5rem;
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: 960px) {
    position: static;
    height: auto;
  }
`

const Brand = styled(Link)`
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: flex;
  gap: 0.4rem;
  align-items: center;
  color: var(--text);
`

const Nav = styled.nav`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  a {
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
    transition: background 0.2s ease, color 0.2s ease;

    &.active {
      background: var(--accent-soft);
      color: var(--accent);
    }

    &:hover {
      color: var(--text);
    }
  }
`

const Content = styled.main`
  padding: 2rem clamp(1.5rem, 4vw, 3rem);
`

const UserCard = styled.div`
  margin-top: auto;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const PrimaryButton = styled.button`
  background: linear-gradient(120deg, var(--accent-strong), var(--accent));
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
`

const SecondaryButton = styled.button`
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  border-radius: 0.75rem;
  padding: 0.65rem 1rem;
  cursor: pointer;
`

const AuthLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const LinkButton = styled(Link)`
  text-align: center;
  border-radius: 0.85rem;
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  color: var(--text);
  font-weight: 600;
  background: ${({ to }) => (to === '/auth/login' ? 'var(--accent-soft)' : 'transparent')};
`

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/explore', label: 'Подбор' },
  { to: '/trips', label: 'Сценарии' },
  { to: '/intelligence', label: 'Интеллект' },
]

export const AppLayout = () => {
  const user = useTravelStore(selectUser)
  const { logout } = useTravelStore(selectActions)

  const welcomeNote = useMemo(() => {
    if (!user) return 'Гость · путешествия требуют входа'
    return `${user.name} · ${user.cohort}`
  }, [user])

  return (
    <Shell>
      <Sidebar>
        <Brand to="/">TravelForge</Brand>
        <Nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </Nav>
        <UserCard>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Профиль</div>
            <strong>{welcomeNote}</strong>
          </div>
          {user ? (
            <SecondaryButton onClick={() => logout()}>Выйти</SecondaryButton>
          ) : (
            <AuthLinks>
              <LinkButton to="/auth/login">Войти</LinkButton>
              <LinkButton to="/auth/register">Регистрация</LinkButton>
            </AuthLinks>
          )}
        </UserCard>
      </Sidebar>
      <Content>
        <Outlet />
      </Content>
    </Shell>
  )
}

