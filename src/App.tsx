import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import CityDetail from './pages/CityDetail'
import SavedTrips from './pages/SavedTrips'
import Login from './pages/Login'
import Register from './pages/Register'
import ProfileMenu from './components/ProfileMenu'
import MobileMenu from './components/MobileMenu'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'active' : undefined

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="app">
      <header className="app__header">
        <div className="container header__inner">
          <h1 className="logo">TravelFrog</h1>
          <nav className="nav nav--desktop">
            <NavLink to="/" end className={navLinkClass}>
              Главная
            </NavLink>
            <NavLink to="/results" className={navLinkClass}>
              Результаты
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/saved" className={navLinkClass}>
                Мои поездки
              </NavLink>
            )}
            <ProfileMenu />
          </nav>
          <div className="nav--mobile">
            <MobileMenu />
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/city/:id" element={<CityDetail />} />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedTrips />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <p>TravelFrog © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return <AppContent />
}