import { useState } from 'react'
import { supabase } from '../supabase'

const COLORS = {
  navy: '#0f2744',
  navyLight: '#163459',
  blue: '#1a56db',
  bluePale: '#eff6ff',
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray400: '#94a3b8',
  gray600: '#475569',
  green: '#059669',
  greenLight: '#d1fae5',
  red: '#dc2626',
  redLight: '#fee2e2',
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusEmail, setFocusEmail] = useState(false)
  const [focusPassword, setFocusPassword] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage('Erreur : ' + error.message)
      else setMessage('Compte créé ! Vérifiez votre email pour confirmer.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('Erreur : ' + error.message)
      else onLogin()
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.gray50,
      display: 'flex',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* PANNEAU GAUCHE — Branding */}
      <div style={{
        width: '45%',
        background: COLORS.navy,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)',
          top: '-100px', right: '-100px',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)',
          bottom: '-80px', left: '-80px',
        }} />

        {/* Logo */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'white', letterSpacing: '0.06em' }}>
            BANQUE INSIDE
          </div>
          <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '4px', letterSpacing: '0.1em' }}>
            ANALYSE FINANCIÈRE PERSONNELLE
          </div>
        </div>

        {/* Tagline */}
        <div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'white', lineHeight: '1.3', marginBottom: '20px' }}>
            Pilotez votre patrimoine avec précision
          </div>
          <div style={{ fontSize: '15px', color: COLORS.gray400, lineHeight: '1.7' }}>
            Analysez vos revenus, optimisez vos dépenses et construisez votre avenir financier en toute clarté.
          </div>
        </div>

        {/* Features */}
        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: '◎', text: 'Score financier personnalisé' },
            { icon: '◈', text: 'Suivi du patrimoine net' },
            { icon: '⟁', text: 'Simulations et projections' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', color: 'white', flexShrink: 0
              }}>{f.icon}</div>
              <span style={{ fontSize: '14px', color: COLORS.gray400 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PANNEAU DROIT — Formulaire */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Titre */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.navy, margin: '0 0 8px' }}>
              {isSignup ? 'Créer un compte' : 'Bon retour'}
            </h1>
            <p style={{ fontSize: '14px', color: COLORS.gray400, margin: 0 }}>
              {isSignup
                ? 'Commencez à piloter vos finances dès aujourd\'hui'
                : 'Connectez-vous à votre espace financier'}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
              fontSize: '13px', fontWeight: '500',
              background: message.includes('Erreur') ? COLORS.redLight : COLORS.greenLight,
              color: message.includes('Erreur') ? COLORS.red : COLORS.green,
              border: `1px solid ${message.includes('Erreur') ? '#fca5a5' : '#6ee7b7'}`,
            }}>
              {message}
            </div>
          )}

          {/* Champ Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: COLORS.gray600, display: 'block', marginBottom: '6px' }}>
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
              onKeyDown={handleKeyDown}
              placeholder="votre@email.com"
              style={{
                width: '100%', boxSizing: 'border-box',
                border: `1.5px solid ${focusEmail ? COLORS.blue : COLORS.gray200}`,
                borderRadius: '10px', padding: '12px 14px',
                fontSize: '14px', color: COLORS.navy,
                outline: 'none', background: COLORS.white,
                transition: 'border-color 0.2s ease',
                boxShadow: focusEmail ? `0 0 0 3px ${COLORS.bluePale}` : 'none',
              }}
            />
          </div>

          {/* Champ Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: COLORS.gray600, display: 'block', marginBottom: '6px' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusPassword(true)}
              onBlur={() => setFocusPassword(false)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••••"
              style={{
                width: '100%', boxSizing: 'border-box',
                border: `1.5px solid ${focusPassword ? COLORS.blue : COLORS.gray200}`,
                borderRadius: '10px', padding: '12px 14px',
                fontSize: '14px', color: COLORS.navy,
                outline: 'none', background: COLORS.white,
                transition: 'border-color 0.2s ease',
                boxShadow: focusPassword ? `0 0 0 3px ${COLORS.bluePale}` : 'none',
              }}
            />
          </div>

          {/* Bouton Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? COLORS.gray400 : COLORS.navy,
              color: 'white',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'Connexion...' : isSignup ? 'Créer mon compte' : 'Se connecter'}
          </button>

          {/* Toggle signup/login */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: COLORS.gray400 }}>
            {isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
            <button
              onClick={() => { setIsSignup(!isSignup); setMessage('') }}
              style={{
                background: 'none', border: 'none',
                color: COLORS.blue, cursor: 'pointer',
                fontWeight: '600', marginLeft: '6px',
                fontSize: '13px',
              }}
            >
              {isSignup ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>

          {/* Mention légale */}
          <div style={{ marginTop: '40px', padding: '16px', background: COLORS.gray100, borderRadius: '10px', fontSize: '11px', color: COLORS.gray400, lineHeight: '1.6', textAlign: 'center' }}>
            Les informations fournies sont purement indicatives et ne constituent pas un conseil financier. Consultez un professionnel agréé avant toute décision.
          </div>
        </div>
      </div>
    </div>
  )
}