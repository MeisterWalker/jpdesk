import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true); setError('')
    const err = await signIn(email, password)
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20
    }}>
      <div className="card animate-spring" style={{ width: '100%', maxWidth: 320, padding: 24, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 26 }}>
          🎩
        </div>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
          JP<span style={{ background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Desk</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 22 }}>
          Sign in to your workspace
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, textAlign: 'left' }}>Email</label>
          <input type="email" placeholder="you@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ fontSize: 13 }} autoFocus />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, textAlign: 'left' }}>Password</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ fontSize: 13 }} />
        </div>

        {error && (
          <div style={{ marginBottom: 12, padding: '7px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, fontSize: 12, color: '#EF4444', fontFamily: 'JetBrains Mono' }}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} className="btn btn-brand"
          style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{ marginTop: 16, fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)' }}>
          BY JOHN PAUL LACARON
        </div>
      </div>
    </div>
  )
}
