import React from 'react'
import styled from '@emotion/styled'

const Grid = styled.section`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`

const Card = styled.article`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.3rem;
`

const insights = [
  {
    title: 'Популярные направления',
    body: 'Самые востребованные направления этого сезона. Мы анализируем тысячи запросов, чтобы предложить лучшие варианты.',
    metric: 'Топ-10',
  },
  {
    title: 'Сезонные тренды',
    body: 'Актуальная информация о популярных направлениях в зависимости от времени года и предпочтений путешественников.',
    metric: 'Обновляется еженедельно',
  },
  {
    title: 'Бюджетные варианты',
    body: 'Специально подобранные направления, которые позволяют максимально эффективно использовать ваш бюджет.',
    metric: '100+ вариантов',
  },
]

export const InsightsGrid = () => (
  <Grid>
    {insights.map((insight) => (
      <Card key={insight.title}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Инсайт</div>
        <h3>{insight.title}</h3>
        <p style={{ color: 'var(--text-muted)' }}>{insight.body}</p>
        <div style={{ fontWeight: 600 }}>{insight.metric}</div>
      </Card>
    ))}
  </Grid>
)

