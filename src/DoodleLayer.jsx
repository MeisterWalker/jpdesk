import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'

const doodleExtraStyles = `
  @keyframes catWalk {
    0%   { left: -100px; transform: scaleX(1); }
    45%  { left: calc(100% + 10px); transform: scaleX(1); }
    46%  { left: calc(100% + 10px); transform: scaleX(-1); }
    55%  { left: calc(100% + 10px); transform: scaleX(-1); }
    98%  { left: -100px; transform: scaleX(-1); }
    99%  { left: -100px; transform: scaleX(1); }
    100% { left: -100px; transform: scaleX(1); }
  }
  @keyframes watermarkPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.65; }
  }
`


/* ── Watermark + cat ── */
const WatermarkCat = () => {
  const [catAnimation, setCatAnimation] = useState(null)
  useEffect(() => {
    fetch('/cat2333s.json')
      .then(r => r.json())
      .then(setCatAnimation)
      .catch(() => setCatAnimation(null))
  }, [])

  return (
  <div style={{
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 10,
  }}>
    {/* Static cat — own layer on top of JPDesk text */}
    <div style={{
      position: 'absolute',
      top: '31%', left: '17.3%',
      transform: 'translate(-50%, -100%)',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      {catAnimation && (
        <Lottie
          animationData={catAnimation}
          loop={true}
          speed={2}
          style={{ width: 150, height: 120 }}
        />
      )}
    </div>

    {/* JPDesk watermark text */}
    <div style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 800,
      fontSize: 'clamp(52px, 9vw, 100px)',
      letterSpacing: '-0.02em',
      lineHeight: 1,
      animation: 'watermarkPulse 6s ease-in-out infinite',
    }}>
      <span style={{ color: 'rgba(240,244,255,0.22)' }}>JP</span><span style={{
        background: 'linear-gradient(90deg, rgba(99,102,241,0.55), rgba(139,92,246,0.55))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>Desk</span>
    </div>

    {/* Subtitle */}
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 500,
      fontSize: 'clamp(10px, 1.2vw, 14px)',
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: 'rgba(139,92,246,0.28)',
      marginTop: 8,
      animation: 'watermarkPulse 6s ease-in-out infinite 1s',
    }}>
      BPO Agent Toolkit
    </div>
  </div>
  )
}

const S = {
  purple:      'rgba(139,92,246,0.75)',
  purpleFill:  'rgba(139,92,246,0.20)',
  indigo:      'rgba(99,102,241,0.75)',
  indigoFill:  'rgba(99,102,241,0.18)',
  cyan:        'rgba(34,211,238,0.80)',
  cyanFill:    'rgba(34,211,238,0.18)',
  pink:        'rgba(236,72,153,0.75)',
  pinkFill:    'rgba(236,72,153,0.15)',
  yellow:      'rgba(251,191,36,0.85)',
  yellowFill:  'rgba(251,191,36,0.18)',
}

const doodles = [
  // ── Headset — top left ──
  {
    top: '6%', left: '3%',
    animation: 'floatUp 7s ease-in-out infinite',
    svg: `<svg width="80" height="68" viewBox="0 0 80 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 44 Q10 14 40 14 Q70 14 70 44" stroke="${S.purple}" stroke-width="4" stroke-linecap="round"/>
      <rect x="3" y="42" width="14" height="20" rx="7" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="2.5"/>
      <rect x="63" y="42" width="14" height="20" rx="7" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="2.5"/>
      <path d="M70 52 Q79 52 79 59 L79 63" stroke="${S.purple}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="79" cy="65" r="3.5" fill="${S.purple}"/>
    </svg>`
  },

  // ── Phone handset — upper left area ──
  {
    top: '28%', left: '10%',
    animation: 'floatSway 8s ease-in-out infinite 1s',
    svg: `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 8 Q10 3 15 3 L20 3 Q23 3 24 7 L26 15 Q27 18 24 20 L20 23 Q25 32 30 37 L33 33 Q35 30 39 31 L47 33 Q50 34 50 38 L50 43 Q50 48 45 48 L40 48 Q10 46 6 14 Z" fill="${S.cyanFill}" stroke="${S.cyan}" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>`
  },

  // ── Coffee cup — bottom left ──
  {
    bottom: '9%', left: '3%',
    animation: 'bob 6s ease-in-out infinite',
    svg: `<svg width="76" height="84" viewBox="0 0 76 84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 26 Q21 13 15 6" stroke="${S.indigo}" stroke-width="3" stroke-linecap="round"/>
      <path d="M30 26 Q35 12 29 5" stroke="${S.indigo}" stroke-width="3" stroke-linecap="round"/>
      <path d="M44 26 Q49 14 43 7" stroke="${S.purple}" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="5" y="28" width="56" height="46" rx="11" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="3"/>
      <path d="M61 38 Q76 38 76 51 Q76 64 61 64" stroke="${S.indigo}" stroke-width="3" stroke-linecap="round"/>
      <rect x="5" y="74" width="56" height="8" rx="4" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="2"/>
    </svg>`
  },

  // ── Monitor — top right ──
  {
    top: '5%', right: '4%',
    animation: 'floatUp 10s ease-in-out infinite 2s',
    svg: `<svg width="88" height="76" viewBox="0 0 88 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="84" height="54" rx="9" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="2.5"/>
      <rect x="8" y="8" width="72" height="42" rx="5" fill="rgba(99,102,241,0.08)" stroke="${S.indigo}" stroke-width="1.5"/>
      <line x1="14" y1="20" x2="44" y2="20" stroke="${S.purple}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="14" y1="28" x2="38" y2="28" stroke="${S.purple}" stroke-width="2" stroke-linecap="round"/>
      <line x1="14" y1="36" x2="42" y2="36" stroke="${S.purple}" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="62" cy="28" r="11" fill="${S.cyanFill}" stroke="${S.cyan}" stroke-width="2"/>
      <path d="M57 28 L61 32 L68 23" stroke="${S.cyan}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="36" y="56" width="16" height="9" rx="3" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="1.8"/>
      <rect x="26" y="65" width="36" height="6" rx="3" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="1.8"/>
    </svg>`
  },

  // ── Clock — mid right ──
  {
    top: '30%', right: '3%',
    animation: 'floatUp 9s ease-in-out infinite 1s',
    svg: `<svg width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="31" cy="31" r="27" fill="${S.cyanFill}" stroke="${S.cyan}" stroke-width="3"/>
      <circle cx="31" cy="31" r="20" fill="none" stroke="${S.cyan}" stroke-width="1" stroke-dasharray="3 4"/>
      <line x1="31" y1="31" x2="31" y2="11" stroke="${S.cyan}" stroke-width="3" stroke-linecap="round"/>
      <line x1="31" y1="31" x2="45" y2="31" stroke="${S.cyan}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="31" cy="31" r="4" fill="${S.cyan}"/>
      <circle cx="31" cy="5"  r="2.5" fill="${S.cyan}"/>
      <circle cx="31" cy="57" r="2.5" fill="${S.cyan}"/>
      <circle cx="5"  cy="31" r="2.5" fill="${S.cyan}"/>
      <circle cx="57" cy="31" r="2.5" fill="${S.cyan}"/>
    </svg>`
  },

  // ── Notepad — mid left ──
  {
    top: '36%', left: '1.5%',
    animation: 'floatSway 10s ease-in-out infinite 3s',
    svg: `<svg width="54" height="68" viewBox="0 0 54 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="50" height="56" rx="8" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="2.5"/>
      <rect x="14" y="2" width="10" height="16" rx="5" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="2"/>
      <rect x="30" y="2" width="10" height="16" rx="5" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="2"/>
      <line x1="10" y1="26" x2="44" y2="26" stroke="${S.purple}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="10" y1="35" x2="44" y2="35" stroke="${S.purple}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="10" y1="44" x2="34" y2="44" stroke="${S.purple}" stroke-width="2" stroke-linecap="round"/>
      <line x1="10" y1="53" x2="38" y2="53" stroke="${S.purple}" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },

  // ── Chat bubble large — top mid ──
  {
    top: '10%', right: '22%',
    animation: 'floatSway 7s ease-in-out infinite 0.5s',
    svg: `<svg width="72" height="60" viewBox="0 0 72 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="68" height="44" rx="16" fill="${S.pinkFill}" stroke="${S.pink}" stroke-width="2.5"/>
      <path d="M14 46 L9 58 L26 48" fill="${S.pinkFill}" stroke="${S.pink}" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="22" cy="24" r="4.5" fill="${S.pink}"/>
      <circle cx="36" cy="24" r="4.5" fill="${S.pink}"/>
      <circle cx="50" cy="24" r="4.5" fill="${S.pink}"/>
    </svg>`
  },

  // ── Chat bubble small — bottom mid right ──
  {
    bottom: '22%', right: '15%',
    animation: 'floatUp 8s ease-in-out infinite 3s',
    svg: `<svg width="56" height="46" viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="52" height="32" rx="12" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="2.2"/>
      <path d="M42 34 L47 44 L32 36" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="2.2" stroke-linejoin="round"/>
      <line x1="11" y1="14" x2="32" y2="14" stroke="${S.indigo}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="11" y1="22" x2="24" y2="22" stroke="${S.indigo}" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },

  // ── Keyboard — bottom center ──
  {
    bottom: '6%', left: '30%',
    animation: 'bob 9s ease-in-out infinite 2s',
    svg: `<svg width="108" height="56" viewBox="0 0 108 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="104" height="52" rx="10" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="2.5"/>
      ${[0,1,2,3,4,5,6,7,8].map(i => `<rect x="${8+i*11}" y="10" width="9" height="9" rx="3" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="1.8"/>`).join('')}
      ${[0,1,2,3,4,5,6,7].map(i => `<rect x="${14+i*11}" y="23" width="9" height="9" rx="3" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="1.8"/>`).join('')}
      <rect x="30" y="36" width="48" height="9" rx="4" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="1.8"/>
    </svg>`
  },

  // ── Star rating — mid right ──
  {
    bottom: '30%', right: '4%',
    animation: 'floatSway 7s ease-in-out infinite 1.5s',
    svg: `<svg width="98" height="28" viewBox="0 0 98 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${[0,1,2,3].map(i => `<path d="M${9+i*20} 2 L${11.5+i*20} 8.5 L${18+i*20} 8.5 L${13+i*20} 12.5 L${15+i*20} 19 L${9+i*20} 15 L${3+i*20} 19 L${5+i*20} 12.5 L${0+i*20} 8.5 L${6.5+i*20} 8.5 Z" fill="${S.yellowFill}" stroke="${S.yellow}" stroke-width="1.5" stroke-linejoin="round"/>`).join('')}
      <path d="M89 2 L91.5 8.5 L98 8.5 L93 12.5 L95 19 L89 15 L83 19 L85 12.5 L80 8.5 L86.5 8.5 Z" fill="rgba(251,191,36,0.10)" stroke="${S.yellow}" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`
  },

  // ── WiFi — top center ──
  {
    top: '6%', left: '52%',
    animation: 'twinkle 5s ease-in-out infinite 1s',
    svg: `<svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 15 Q25 0 48 15" stroke="${S.cyan}" stroke-width="3" stroke-linecap="round"/>
      <path d="M8 23 Q25 11 42 23" stroke="${S.cyan}" stroke-width="3" stroke-linecap="round"/>
      <path d="M15 31 Q25 23 35 31" stroke="${S.cyan}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="25" cy="37" r="4" fill="${S.cyan}"/>
    </svg>`
  },

  // ── Envelope — mid top left ──
  {
    top: '14%', left: '18%',
    animation: 'floatUp 8s ease-in-out infinite 2s',
    svg: `<svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="44" rx="9" fill="${S.pinkFill}" stroke="${S.pink}" stroke-width="2.5"/>
      <path d="M2 8 L32 28 L62 8" stroke="${S.pink}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="2"  y1="46" x2="22" y2="30" stroke="${S.pink}" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="62" y1="46" x2="42" y2="30" stroke="${S.pink}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  },

  // ── Checklist — lower left ──
  {
    bottom: '28%', left: '2%',
    animation: 'floatSway 11s ease-in-out infinite 4s',
    svg: `<svg width="60" height="72" viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="56" height="68" rx="10" fill="${S.cyanFill}" stroke="${S.cyan}" stroke-width="2.5"/>
      <circle cx="15" cy="18" r="6" fill="${S.cyanFill}" stroke="${S.cyan}" stroke-width="2"/>
      <path d="M11 18 L14 22 L19 14" stroke="${S.cyan}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="26" y1="18" x2="50" y2="18" stroke="${S.cyan}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="15" cy="36" r="6" fill="${S.cyanFill}" stroke="${S.cyan}" stroke-width="2"/>
      <path d="M11 36 L14 40 L19 32" stroke="${S.cyan}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="26" y1="36" x2="50" y2="36" stroke="${S.cyan}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="15" cy="54" r="6" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="2"/>
      <line x1="26" y1="54" x2="46" y2="54" stroke="${S.purple}" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },

  // ── Ticket / card — bottom right ──
  {
    bottom: '10%', right: '3%',
    animation: 'floatUp 11s ease-in-out infinite 4s',
    svg: `<svg width="80" height="56" viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="76" height="52" rx="13" fill="${S.indigoFill}" stroke="${S.indigo}" stroke-width="2.2"/>
      <line x1="2" y1="22" x2="78" y2="22" stroke="${S.indigo}" stroke-width="1.5"/>
      <circle cx="16" cy="12" r="6" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="2"/>
      <line x1="27" y1="10" x2="54" y2="10" stroke="${S.indigo}" stroke-width="2" stroke-linecap="round"/>
      <line x1="27" y1="16" x2="44" y2="16" stroke="${S.indigo}" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="10" y="30" width="28" height="6" rx="3" fill="${S.purpleFill}" stroke="${S.purple}" stroke-width="1.5"/>
      <rect x="44" y="30" width="24" height="6" rx="3" fill="${S.cyanFill}" stroke="${S.cyan}" stroke-width="1.5"/>
      <line x1="10" y1="44" x2="70" y2="44" stroke="${S.indigo}" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="5 5"/>
    </svg>`
  },
]

const emojis = [
  { top: '46%',  right: '2%',   size: 24, char: '♡', color: 'rgba(236,72,153,0.70)', anim: 'floatSway 8s ease-in-out infinite' },
  { top: '60%',  right: '5.5%', size: 16, char: '♡', color: 'rgba(236,72,153,0.55)', anim: 'floatSway 6s ease-in-out infinite 2s' },
  { top: '3%',   left: '38%',   size: 16, char: '✦', color: 'rgba(251,191,36,0.75)', anim: 'twinkle 4s ease-in-out infinite 1.5s' },
  { top: '32%',  right: '11%',  size: 12, char: '✦', color: 'rgba(99,102,241,0.70)', anim: 'twinkle 5s ease-in-out infinite 0.5s' },
  { bottom: '14%', left: '18%', size: 20, char: '✨', color: 'rgba(251,191,36,0.65)', anim: 'twinkle 4.5s ease-in-out infinite 2s' },
  { bottom: '4%',  right: '26%',size: 14, char: '✨', color: 'rgba(251,191,36,0.60)', anim: 'twinkle 3.8s ease-in-out infinite 3s' },
  { top: '72%',  left: '9%',    size: 12, char: '✦', color: 'rgba(236,72,153,0.65)', anim: 'twinkle 6s ease-in-out infinite 1s' },
  { top: '24%',  left: '6%',    size: 13, char: '★', color: 'rgba(251,191,36,0.65)', anim: 'twinkle 5s ease-in-out infinite 2.5s' },
  { bottom: '20%', right: '9%', size: 11, char: '★', color: 'rgba(251,191,36,0.60)', anim: 'twinkle 4s ease-in-out infinite 1s' },
  { top: '52%',  left: '5%',    size: 16, char: '📞', color: 'rgba(99,102,241,0.55)', anim: 'twinkle 7s ease-in-out infinite 2s' },
  { top: '8%',   right: '30%',  size: 14, char: '💬', color: 'rgba(236,72,153,0.50)', anim: 'twinkle 5s ease-in-out infinite 0.8s' },
  { top: '42%',  right: '18%',  size: 14, char: '📋', color: 'rgba(139,92,246,0.55)', anim: 'twinkle 6s ease-in-out infinite 3s' },
]

const dots = Array.from({ length: 30 }).map((_, i) => ({
  top:  `${6 + (i % 6) * 16}%`,
  left: `${6 + Math.floor(i / 6) * 22}%`,
}))

export default function DoodleLayer() {
  return (
    <div id="doodle-layer">
      <style>{doodleExtraStyles}</style>
      <WatermarkCat />
      {doodles.map((d, i) => (
        <div key={i} className="doodle" style={{
          position: 'absolute',
          top: d.top, left: d.left, bottom: d.bottom, right: d.right,
          animation: d.animation,
        }} dangerouslySetInnerHTML={{ __html: d.svg }} />
      ))}

      {emojis.map((e, i) => (
        <div key={`e${i}`} className="doodle" style={{
          position: 'absolute',
          top: e.top, left: e.left, bottom: e.bottom, right: e.right,
          fontSize: e.size, color: e.color,
          animation: e.anim, lineHeight: 1,
        }}>{e.char}</div>
      ))}

      {dots.map((d, i) => (
        <div key={`dot${i}`} style={{
          position: 'absolute', top: d.top, left: d.left,
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(99,102,241,0.28)',
          pointerEvents: 'none',
        }} />
      ))}

      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 44 }}
        viewBox="0 0 1440 44" preserveAspectRatio="none">
        <path d="M0 30 Q180 12 360 30 Q540 48 720 30 Q900 12 1080 30 Q1260 48 1440 30"
          fill="none" stroke="rgba(139,92,246,0.30)" strokeWidth="2.5"/>
        <path d="M0 38 Q180 20 360 38 Q540 56 720 38 Q900 20 1080 38 Q1260 56 1440 38"
          fill="none" stroke="rgba(99,102,241,0.18)" strokeWidth="2"/>
      </svg>
    </div>
  )
}
