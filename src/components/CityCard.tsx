import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import MiniPie from './MiniPie'
import { City, BudgetBreakdown } from '../types'

export default function CityCard({ city, budgetLeftPct, match }: { city: City; budgetLeftPct: number; match?: { culture: number; nature: number; party: number; weighted: number } }) {
  const fallbackBudget: BudgetBreakdown = city.mockBudget || {
    flights: 35,
    lodging: 30,
    food: 20,
    local: 10,
    buffer: 5,
  }

  const pie = [
    { name: 'Перелёты', value: fallbackBudget.flights },
    { name: 'Жильё', value: fallbackBudget.lodging },
    { name: 'Еда', value: fallbackBudget.food },
    { name: 'Местное', value: fallbackBudget.local },
    { name: 'Резерв', value: fallbackBudget.buffer },
  ]

  const budgetStatus = budgetLeftPct >= 100 ? 'success' : budgetLeftPct >= 80 ? 'warning' : 'danger'

  return (
    <div className="card city-card">
      <div className="city-card__header">
        <div className="city-card__info">
          <h3 className="city-card__name">{city.name}</h3>
          <span className="city-card__country">{city.country}</span>
        </div>
        <div className="city-card__chart">
          <MiniPie data={pie} />
        </div>
      </div>
      
      {match && (
        <div className="city-card__match">
          <div className="city-card__match-title">Соответствие вашим предпочтениям</div>
          <div className="chips" style={{ gap: 8 }}>
            <span className="chip">Культура: {Math.round(match.culture)}%</span>
            <span className="chip">Природа: {Math.round(match.nature)}%</span>
            <span className="chip">Ночная жизнь: {Math.round(match.party)}%</span>
            <span className="chip" style={{ fontWeight: 700 }}>Итог: {Math.round(match.weighted)}%</span>
          </div>
        </div>
      )}

      <div className="city-card__budget" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="city-card__budget-label">
          Бюджет покрыт: <span className={`budget-status budget-status--${budgetStatus}`}>
            {Math.round(budgetLeftPct)}%
          </span>
        </div>
        <ProgressBar value={budgetLeftPct} />
      </div>
      
      <div className="city-card__actions">
        <Link className="btn btn--outline" to={`/city/${city.id}`}>
          Подробнее
        </Link>
      </div>
    </div>
  );
}