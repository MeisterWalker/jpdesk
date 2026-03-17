import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    if (data && !data.seeded) await seedUserData(userId)
  }

  const seedUserData = async (userId) => {
    // Find admin profile
    const { data: adminProfile } = await supabase
      .from('profiles').select('id').eq('role', 'admin').limit(1).single()
    if (!adminProfile) return

    // Copy notes from admin
    const { data: adminNotes } = await supabase
      .from('notes').select('*').eq('user_id', adminProfile.id)
    if (adminNotes?.length) {
      const copies = adminNotes.map(({ id, user_id, ...rest }) => ({
        ...rest, user_id: userId, created_at: new Date().toISOString()
      }))
      await supabase.from('notes').insert(copies)
    }

    // Copy scripts from admin
    const { data: adminScripts } = await supabase
      .from('canned_responses').select('*').eq('user_id', adminProfile.id)
    if (adminScripts?.length) {
      const copies = adminScripts.map(({ id, user_id, ...rest }) => ({
        ...rest, user_id: userId, created_at: new Date().toISOString()
      }))
      await supabase.from('canned_responses').insert(copies)
    }

    // Mark as seeded so it never runs again
    await supabase.from('profiles').update({ seeded: true }).eq('id', userId)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (usernameOrEmail, password) => {
    let email = usernameOrEmail
    // If input doesn't look like an email, look up username in profiles
    if (!usernameOrEmail.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', usernameOrEmail.trim())
        .single()
      console.log('username lookup:', usernameOrEmail.trim(), 'profile:', profile, 'error:', profileError)
      if (!profile) return { message: 'Username not found.' }
      // get email from auth.users via RPC
      const { data: authUser } = await supabase.rpc('get_email_by_profile_id', { profile_id: profile.id })
      console.log('authUser:', authUser)
      if (!authUser) return { message: 'Username not found.' }
      email = authUser
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
