import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import styled from '@emotion/styled'
import type { BudgetBreakdown } from '../types'
import { normalizeBreakdown } from '../store/useTravelStore'

const Card = styled.div`
  background: var(--bg-card);
  border-radius: 1.25rem;
  border: 1px solid var(--border);
  padding: 1rem 1.5rem;
`

const COLORS = ['#8e8fff', '#6e6ee8', '#5fb0ff', '#3ad29f', '#ffd166']

type Props = {
  breakdown: BudgetBreakdown
}

export const BudgetChart = ({ breakdown }: Props) => {
  const normalized = normalizeBreakdown(breakdown)
  const data = Object.entries(normalized).map(([name, value]) => ({ name, value }))

  return (
    <Card>
      <h3>Динамика бюджета</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(5,5,11,0.9)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.5rem' }}>
        {data.map((item, index) => (
          <div
            key={item.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: COLORS[index % COLORS.length],
              }}
            />
            {item.name}: {item.value}%
          </div>
        ))}
      </div>
    </Card>
  )
}

