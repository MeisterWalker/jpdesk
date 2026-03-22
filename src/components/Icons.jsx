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
