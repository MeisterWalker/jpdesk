import React, { useMemo } from 'react'
import { MOTIVATIONAL_QUOTES } from '../utils/quotes'

export default function LevelUpModal({ level, onAcknowledge }) {
  const quote = useMemo(() => {
    // Pick a random quote based on the level as a seed (optional) or just random
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  }, [level])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000003,
      background: 'rgba(13, 15, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.5s ease',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1E293B, #0F172A)',
        borderRadius: 32, padding: '40px', width: '400px',
        border: '1px solid var(--accent-border)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px var(--accent-soft)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        animation: 'levelUpSpring 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Decorative Glow */}
        <div style={{
          position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, background: 'var(--accent)', filter: 'blur(80px)',
          opacity: 0.4, borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div style={{ fontSize: 72, marginBottom: 20, animation: 'bounce 2s infinite' }}>⭐</div>
        
        <h1 style={{ 
          fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 32, 
          color: '#fff', marginBottom: 8, letterSpacing: '-0.03em',
          textShadow: '0 0 20px var(--accent)'
        }}>
          LEVEL UP!
        </h1>
        
        <div style={{ 
          fontSize: 14, fontFamily: 'JetBrains Mono', color: 'var(--accent)', 
          fontWeight: 800, marginBottom: 32, textTransform: 'uppercase',
          letterSpacing: '0.2em'
        }}>
          You are now Rank {level}
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '24px', 
          marginBottom: 40, border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative'
        }}>
          <div style={{ 
            fontSize: 24, position: 'absolute', top: -12, left: 16, 
            opacity: 0.2, fontFamily: 'serif' 
          }}>"</div>
          <p style={{ 
            fontSize: 15, color: '#fff', fontStyle: 'italic', 
            lineHeight: 1.6, marginBottom: 12, fontWeight: 500 
          }}>
            {quote.text}
          </p>
          <div style={{ 
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, 
            textTransform: 'uppercase', letterSpacing: '0.1em' 
          }}>
            — {quote.author}
          </div>
        </div>

        <button 
          onClick={onAcknowledge}
          style={{ 
            width: '100%', padding: '16px', borderRadius: 16, 
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            border: 'none', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 900,
            fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 30px rgba(99,102,241,0.5)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          CONTINUE TO EXCELLENCE
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes levelUpSpring { 
          from { transform: translateY(60px) scale(0.85); opacity: 0; } 
          to { transform: translateY(0) scale(1); opacity: 1; } 
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
