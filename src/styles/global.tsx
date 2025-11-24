import React from 'react'
import { Global, css } from '@emotion/react'

export const GlobalStyles = () => (
  <Global
    styles={css`
      :root {
        --bg: #05050b;
        --bg-card: #0f101a;
        --bg-card-alt: #151625;
        --accent: #8e8fff;
        --accent-strong: #6a6bff;
        --accent-soft: rgba(142, 143, 255, 0.1);
        --text: #f7f7fb;
        --text-muted: #adb5d3;
        --success: #3ad29f;
        --danger: #ff6b6b;
        --warning: #ffd166;
        --border: rgba(255, 255, 255, 0.08);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: radial-gradient(circle at top, rgba(110, 80, 255, 0.25), transparent 45%),
          var(--bg);
        color: var(--text);
        min-height: 100vh;
      }

      a {
        color: var(--accent);
        text-decoration: none;
      }

      input,
      select,
      textarea,
      button {
        font-family: inherit;
      }

      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 6px;
      }
    `}
  />
)

