import React, { useMemo } from 'react'
import { MOTIVATIONAL_QUOTES } from '../utils/quotes'

export default function CommandCenter({ onStart, user, paydayDaysLeft }) {
  const quote = useMemo(() => {
    // Generate a unique quote for each day of the year
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000004,
      background: 'rgba(5, 8, 15, 0.95)',
      backdropFilter: 'blur(32px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 1s ease',
    }}>
      <div style={{
        maxWidth: 600, width: '90%', textAlign: 'left',
        animation: 'ccSlideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <div style={{ 
          fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--accent)', 
          fontWeight: 800, letterSpacing: '0.3em', marginBottom: 12 
        }}>
          MORNING BRIEFING · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        
        <h1 style={{ 
          fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 52, 
          color: '#fff', marginBottom: 40, letterSpacing: '-0.04em', lineHeight: 1
        }}>
          Rise and Shine,<br />
          <span style={{ color: 'var(--accent)' }}>{user?.username || 'John Paul'}</span>.
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 60 }}>
           <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 8 }}>PAYDAY PROGRESS</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{paydayDaysLeft} Days</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>Next: Semi-monthly Cycle</div>
           </div>
           <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 8 }}>TODAY'S FOCUS</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Excellence</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>Consistency is Key</div>
           </div>
        </div>

        <div style={{ marginBottom: 60, position: 'relative' }}>
          <div style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 800, marginBottom: 16 }}>QUOTE OF THE DAY</div>
          <p style={{ 
            fontSize: 22, color: '#fff', fontStyle: 'italic', 
            lineHeight: 1.4, marginBottom: 16, fontWeight: 500,
            fontFamily: 'serif'
          }}>
            "{quote.text}"
          </p>
          <div style={{ 
            fontSize: 12, color: 'var(--text-muted)', fontWeight: 800, 
            textTransform: 'uppercase', letterSpacing: '0.1em' 
          }}>
            — {quote.author}
          </div>
        </div>

        <button 
          onClick={onStart}
          style={{ 
            padding: '18px 48px', borderRadius: 100, 
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            border: 'none', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 900,
            fontSize: 16, cursor: 'pointer', boxShadow: '0 15px 40px rgba(99,102,241,0.4)',
            transition: 'all 0.4s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Begin Productivity Session
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ccSlideUp { 
          from { transform: translateY(40px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
      `}</style>
    </div>
  )
}
