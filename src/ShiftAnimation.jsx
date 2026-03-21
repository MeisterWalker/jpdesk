import React from 'react'

const styles = `
  @keyframes rainDrop {
    0%   { transform: translateY(-20px) translateX(0); opacity: 0; }
    30%  { opacity: 0.6; }
    80%  { opacity: 0.6; }
    100% { transform: translateY(100px) translateX(5px); opacity: 0; }
  }
  @keyframes driftLeaf {
    0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
    20%  { opacity: 0.7; }
    100% { transform: translate(60px, 40px) rotate(180deg); opacity: 0; }
  }
  @keyframes floatBubble {
    0%   { transform: translateY(20px) scale(0.8); opacity: 0; }
    20%  { opacity: 0.4; }
    100% { transform: translateY(-60px) scale(1.2); opacity: 0; }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%      { opacity: 1; transform: scale(1.2); }
  }
  @keyframes floatHeart {
    0%   { transform: translate(0, 0) scale(1); opacity: 0; }
    20%  { opacity: 0.6; }
    100% { transform: translate(-20px, -40px) scale(1.3); opacity: 0; }
  }
`

export default function ShiftAnimation({ type }) {
  if (type === 'none') return null

  const items = Array.from({ length: 8 })

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, opacity: 0.4 }}>
      <style>{styles}</style>
      
      {type === 'rain' && items.map((_, i) => (
        <div key={i} style={{
          position: 'absolute', width: 1, height: 10, background: '#fff',
          left: `${Math.random() * 100}%`, top: `${Math.random() * -20}%`,
          animation: `rainDrop ${1 + Math.random()}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`
        }} />
      ))}

      {type === 'leaves' && items.map((_, i) => (
        <div key={i} style={{
          position: 'absolute', fontSize: 10,
          left: `${Math.random() * 80}%`, top: `${Math.random() * -10}%`,
          animation: `driftLeaf ${3 + Math.random() * 2}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`
        }}>🍃</div>
      ))}

      {type === 'bubbles' && items.map((_, i) => (
        <div key={i} style={{
          position: 'absolute', width: 6, height: 6, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.4)',
          left: `${Math.random() * 100}%`, bottom: `${Math.random() * -10}%`,
          animation: `floatBubble ${2 + Math.random() * 2}s ease-out infinite`,
          animationDelay: `${Math.random() * 3}s`
        }} />
      ))}

      {type === 'stars' && items.map((_, i) => (
        <div key={i} style={{
          position: 'absolute', width: 2, height: 2, background: '#fff', borderRadius: '50%',
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          boxShadow: '0 0 4px #fff',
          animation: `twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`
        }} />
      ))}

      {type === 'hearts' && items.map((_, i) => (
        <div key={i} style={{
          position: 'absolute', fontSize: 8,
          left: `${50 + Math.random() * 40}%`, bottom: `${Math.random() * 20}%`,
          animation: `floatHeart ${2.5 + Math.random() * 1.5}s ease-out infinite`,
          animationDelay: `${Math.random() * 3}s`
        }}>💖</div>
      ))}
    </div>
  )
}
