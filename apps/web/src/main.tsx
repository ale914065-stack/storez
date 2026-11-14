import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// Global resilient image error handler: ensures 0 broken images anywhere in the app
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (e: Event) => {
      const target = e.target as HTMLImageElement | null
      if (target && target.tagName === 'IMG' && !target.dataset.fallbackApplied) {
        target.dataset.fallbackApplied = 'true'
        const label = (target.alt || 'STOREZ PRO TECH').slice(0, 26)
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#1e1b4b"/>
            </linearGradient>
          </defs>
          <rect width="400" height="300" rx="20" fill="url(#bg)"/>
          <circle cx="200" cy="125" r="52" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="2"/>
          <text x="200" y="136" font-family="Inter,sans-serif" font-size="34" text-anchor="middle" fill="#60a5fa">⚡</text>
          <text x="200" y="215" font-family="Inter,sans-serif" font-weight="700" font-size="16" text-anchor="middle" fill="#f8fafc">${label.replace(/[<>&"']/g, '')}</text>
          <text x="200" y="242" font-family="Inter,sans-serif" font-size="12" text-anchor="middle" fill="#38bdf8">STOREZ PRO OFFICIAL</text>
        </svg>`
        target.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
      }
    },
    true
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
