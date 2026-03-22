import React from 'react'

const BadgeIcon = ({ children, gradient = 'linear-gradient(135deg, var(--accent), var(--accent-2))', size = 24, iconSize = 14 }) => (
  <div style={{ 
    width: size, height: size, borderRadius: size * 0.25, 
    background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px var(--accent-soft)', flexShrink: 0 
  }}>
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
      {children}
    </svg>
  </div>
)

export const NotesIcon = (props) => (
  <BadgeIcon {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </BadgeIcon>
)

export const ScriptsIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #8B5CF6, #D946EF)">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="14" y2="13" />
  </BadgeIcon>
)

export const InfoIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #3B82F6, #2DD4BF)">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </BadgeIcon>
)

export const BreaksIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F59E0B, #EF4444)">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
    <line x1="12" y1="2" x2="12" y2="4" />
  </BadgeIcon>
)

export const AdminIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #10B981, #059669)">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </BadgeIcon>
)

export const CalcIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #6366F1, #4F46E5)">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </BadgeIcon>
)

export const CalIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #EC4899, #8B5CF6)">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </BadgeIcon>
)

export const RouteIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #8B5CF6, #3B82F6)">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </BadgeIcon>
)

export const PhoneticIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F97316, #FB923C)">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </BadgeIcon>
)

export const ThemeIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #6366F1, #EC4899)">
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.39 2.3-1.01.57-.59 1.1-1.38 2.8-1.38 1.6 0 2.9 1.1 4.7 1.1 1.1 0 2.2-.49 2.1-2.1-.2-4.1-2.4-7.6-6-9.3-1.6-1-3.6-1.3-5-1.3Z" />
  </BadgeIcon>
)

export function UserIcon(props) {
  return (
    <BadgeIcon {...props} gradId="userGrad">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21H4V20Z" fill="currentColor" />
    </BadgeIcon>
  )
}

export function SyncIcon(props) {
  return (
    <BadgeIcon {...props} gradId="syncGrad">
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604L21 8M21 8V3M21 8H16" 
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </BadgeIcon>
  )
}

export const DictIcon = (props) => (
  <BadgeIcon {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </BadgeIcon>
)

export const DeskIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #1E293B, #334155)">
    <path d="M4 18h16" />
    <path d="M7 18V7h10v11" />
    <path d="M6 18c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2" />
  </BadgeIcon>
)

// ── Theme Revamp Icons ───────────────────────────────────────────────────────
export const BuildingIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #334155, #0F172A)">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
  </BadgeIcon>
)

export const HatIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #1E293B, #020617)">
    <path d="M4 18h16" strokeWidth="3" />
    <path d="M7 18V5h10v13" fill="rgba(255,255,255,0.05)" />
    <rect x="7" y="14" width="10" height="2" fill="var(--accent)" strokeWidth="0" />
  </BadgeIcon>
)

export const RocketIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F43F5E, #FB7185)">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 0-2.72 8.25-6.05 10a22 22 0 0 1-3.95 3z" />
    <path d="M10 10l-2-2M14 14l-2-2" />
  </BadgeIcon>
)

export const CatIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F59E0B, #D97706)">
    <path d="M12 5c.67 0 1.35.09 2 .26V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3.74c1.21.81 2 2.18 2 3.76 0 2.49-2.01 4.5-4.5 4.5s-4.5-2.01-4.5-4.5c0-1.58.79-2.95 2-3.76V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.26c.65-.17 1.33-.26 2-.26z" opacity="0.1" />
    <path d="M15 6s1 0 1-1V2.5l-3 2M9 6s-1 0-1-1V2.5l3 2" />
    <path d="M12 18c-5 0-10-3-10-8 0-4 3-7 6-7 1 0 2 0 3 .5 1-.5 2-.5 3-.5 3 0 6 3 6 7 0 5-5 8-10 8z" />
    <circle cx="9" cy="10" r="1" />
    <circle cx="15" cy="10" r="1" />
    <path d="M11 13h2" />
  </BadgeIcon>
)

export const RainbowIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #3B82F6, #EC4899)">
    <path d="M4 20a8 8 0 0 1 16 0" />
    <path d="M7 20a5 5 0 0 1 10 0" opacity="0.6" />
    <path d="M10 20a2 2 0 0 1 4 0" opacity="0.3" />
  </BadgeIcon>
)

export const BlossomIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F472B6, #FB7185)">
    <path d="M12 12s-3-5-3-8 1-4 3-4 3 1 3 4-3 8-3 8z" />
    <path d="M12 12s5-3 8-3 4 1 4 3-1 3-4 3-8-3-8-3z" />
    <path d="M12 12s3 5 3 8-1 4-3 4-3-1-3-4 3-8 3-8z" />
    <path d="M12 12s-5 3-8 3-4-1-4-3 1-3 4-3 8 3 8 3z" />
    <circle cx="12" cy="12" r="2" fill="var(--accent)" />
  </BadgeIcon>
)

export const WaveIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #06B6D4, #3B82F6)">
    <path d="M2 12s3-4 6-4 6 4 9 4 5-4 5-4" strokeWidth="3" />
    <path d="M2 17s3-4 6-4 6 4 9 4 5-4 5-4" strokeWidth="2.5" opacity="0.6" />
    <path d="M2 7s3-4 6-4 6 4 9 4 5-4 5-4" strokeWidth="2" opacity="0.4" />
  </BadgeIcon>
)

export const FireIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F59E0B, #EF4444)">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3s-1-2.5-1-4c0 3-1.5 5.5-1.5 8.5a2.5 2.5 0 0 0 2.5 2.5z" />
    <path d="M15.18 19.34c-1.83.6-3.83.66-5.46.21-1.39-.38-2.61-1.07-3.56-1.97A9.45 9.45 0 0 1 4 12c0-1.3.18-2.55.51-3.73.34-1.2.9-2.3 1.63-3.23a10.61 10.61 0 0 1 5.4-3.56c1.32-.35 2.76-.44 4.14-.23a10.42 10.42 0 0 1 4.09 1.45c1.07.69 1.95 1.57 2.64 2.64a10.44 10.44 0 0 1 1.45 4.09 10.4 10.4 0 0 1-.23 4.14 10.63 10.63 0 0 1-3.56 5.4 9.4 9.4 0 0 1-5.32 2.37z" opacity="0.1" />
    <path d="M12 22s5-4.5 5-9c0-3.3-2-5-3.5-7-1.5 2-4.5 4.5-4.5 8.5 0 4.5 3 7.5 3 7.5z" />
  </BadgeIcon>
)

export const LaptopIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #475569, #1E293B)">
    <rect x="4" y="5" width="16" height="11" rx="1" />
    <path d="M2 19h20v1H2z" />
    <path d="M5 19l1-3h12l1 3" />
  </BadgeIcon>
)

export const CoffeeIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #78350F, #451A03)">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <path d="M6 1v3M10 1v3M14 1v3" strokeWidth="2" strokeDasharray="2 2" />
  </BadgeIcon>
)

// ── Grammar Tool Icons ────────────────────────────────────────────────────────
export const NounIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F87171, #EF4444)">
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" opacity="0.1" />
    <path d="M12 19c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7z" />
    <path d="M12 5V2" />
    <path d="M12 5c2 0 3-1 3-3" />
  </BadgeIcon>
)

export const VerbIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #60A5FA, #3B82F6)">
    <path d="M13 4h1" />
    <path d="M18 4l-4 4 3 3" />
    <path d="M4 20l7-7" />
    <path d="M17 11l-4 4" />
    <circle cx="12" cy="5" r="3" />
    <path d="M10 8l4 4-2 8" />
    <path d="M8 12l2-4 4 3 4-2" />
  </BadgeIcon>
)

export const AdjectiveIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #FBBF24, #F59E0B)">
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.39 2.3-1.01.57-.59 1.1-1.38 2.8-1.38 1.6 0 2.9 1.1 4.7 1.1 1.1 0 2.2-.49 2.1-2.1-.2-4.1-2.4-7.6-6-9.3-1.6-1-3.6-1.3-5-1.3Z" />
    <circle cx="6" cy="10" r="1.5" fill="#fff" />
    <circle cx="10" cy="7" r="1.5" fill="#fff" />
    <circle cx="14" cy="11" r="1.5" fill="#fff" />
  </BadgeIcon>
)

export const AdverbIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #FCD34D, #F59E0B)">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </BadgeIcon>
)

export const PastTenseIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #94A3B8, #475569)">
    <path d="M5 12h14" />
    <path d="M12 5l-7 7 7 7" />
    <circle cx="12" cy="12" r="10" opacity="0.2" />
  </BadgeIcon>
)

export const GerundIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #34D399, #10B981)">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.57L21 8" />
    <polyline points="16 8 21 8 21 3" />
  </BadgeIcon>
)

export const PrepositionIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F87171, #EF4444)">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </BadgeIcon>
)

export const ConjunctionIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #6366F1, #8B5CF6)">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </BadgeIcon>
)

export const FutureTenseIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #A78BFA, #8B5CF6)">
    <circle cx="12" cy="12" r="10" opacity="0.2" />
    <polyline points="12 6 12 12 16 12" />
    <path d="M14 2L18 6L14 10" />
    <line x1="2" y1="6" x2="18" y2="6" />
  </BadgeIcon>
)

export const DoubleNegativeIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #EF4444, #B91C1C)">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" strokeWidth="4" />
    <path d="M8 8h8" strokeWidth="2" opacity="0.4" transform="translate(0,-3)" />
  </BadgeIcon>
)

export const StudyIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #10B981, #34D399)">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </BadgeIcon>
)

export const FlashcardIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #6366F1, #A78BFA)">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M7 15h.01M17 15h.01" />
  </BadgeIcon>
)

export const QuizIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #F59E0B, #FCD34D)">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </BadgeIcon>
)

export const MatchIcon = (props) => (
  <BadgeIcon {...props} gradient="linear-gradient(135deg, #EC4899, #F472B6)">
    <path d="M16 3h5v5" />
    <path d="M8 21H3v-5" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
    <polyline points="15 21 21 21 21 15" />
    <polyline points="9 3 3 3 3 9" />
  </BadgeIcon>
)
