import React, { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import {
  useTravelStore,
  selectTravelBotThread,
  selectTravelBotStatus,
  selectActions,
} from '../store/useTravelStore'

const Panel = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 360px;
`

const Scroll = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding-right: 0.25rem;
`

const Bubble = styled.div<{ role: 'assistant' | 'user' }>`
  align-self: ${({ role }) => (role === 'assistant' ? 'flex-start' : 'flex-end')};
  max-width: 85%;
  background: ${({ role }) => (role === 'assistant' ? 'rgba(255,255,255,0.05)' : 'var(--accent)')};
  color: ${({ role }) => (role === 'assistant' ? 'var(--text)' : '#0b0b16')};
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border-top-left-radius: ${({ role }) => (role === 'assistant' ? '0.3rem' : '1rem')};
  border-top-right-radius: ${({ role }) => (role === 'assistant' ? '1rem' : '0.3rem')};
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  font-size: 0.95rem;
  line-height: 1.4;
`

const Meta = styled.div`
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.35rem;
`

const InputRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`

const Input = styled.textarea`
  flex: 1;
  background: var(--bg-card-alt);
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  padding: 0.75rem 1rem;
  color: var(--text);
  resize: none;
  min-height: 64px;
`

const Button = styled.button`
  background: var(--accent);
  color: #0b0b16;
  border: none;
  border-radius: 0.9rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const TravelBotPanel = () => {
  const [draft, setDraft] = useState('')
  const thread = useTravelStore(selectTravelBotThread)
  const status = useTravelStore(selectTravelBotStatus)
  const { bootstrapTravelBot, sendTravelBotMessage } = useTravelStore(selectActions)
  const hasBootstrapped = useRef(false)

  useEffect(() => {
    // Предотвращаем двойной вызов в StrictMode (эффекты выполняются дважды в dev режиме)
    if (!hasBootstrapped.current) {
      hasBootstrapped.current = true
      bootstrapTravelBot()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Пустой массив - выполняется только при монтировании

  const onSend = () => {
    sendTravelBotMessage(draft)
    setDraft('')
  }

  return (
    <Panel>
      <div>
        <h3>TravelBot</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Ассистент TravelForge сам начинает диалог и держит в голове контекст вашего бюджета и предпочтений.
        </p>
      </div>
      <Scroll>
        {thread.length === 0 && status === 'pending' && (
          <Meta>TravelBot подключается к данным…</Meta>
        )}
        {thread.map((message) => (
          <div key={message.id}>
            <Bubble role={message.role}>{message.text}</Bubble>
            <Meta>
              {new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </Meta>
          </div>
        ))}
      </Scroll>
      <InputRow>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Например: подскажи тихий город с бюджетом до $1500"
        />
        <Button type="button" onClick={onSend} disabled={status === 'pending' || !draft.trim()}>
          Отправить
        </Button>
      </InputRow>
    </Panel>
  )
}

