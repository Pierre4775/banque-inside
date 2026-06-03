import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage('Erreur : ' + error.message)
      else setMessage('Compte cree ! Verifiez votre email pour confirmer.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('Erreur : ' + error.message)
      else onLogin()
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
      <div style={{background:'white', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{textAlign:'center', marginBottom:'24px'}}>
          <div style={{fontSize:'22px', fontWeight:'bold', color:'#1f2937'}}>BANQUE INSIDE</div>
          <div style={{fontSize:'13px', color:'#6b7280', marginTop:'4px'}}>Analyse financiere personnelle</div>
        </div>

        <div style={{fontSize:'18px', fontWeight:'600', color:'#1f2937', marginBottom:'20px', textAlign:'center'}}>
          {isSignup ? 'Creer un compte' : 'Se connecter'}
        </div>

        {message && (
          <div style={{padding:'12px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px', background: message.includes('Erreur') ? '#fee2e2' : '#dcfce7', color: message.includes('Erreur') ? '#b91c1c' : '#15803d'}}>
            {message}
          </div>
        )}

        <div style={{marginBottom:'12px'}}>
          <label style={{fontSize:'13px', color:'#6b7280', display:'block', marginBottom:'4px'}}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ton@email.com"
            style={{width:'100%', border:'1px solid #d1d5db', borderRadius:'8px', padding:'10px 12px', fontSize:'14px', boxSizing:'border-box'}}
          />
        </div>

        <div style={{marginBottom:'20px'}}>
          <label style={{fontSize:'13px', color:'#6b7280', display:'block', marginBottom:'4px'}}>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{width:'100%', border:'1px solid #d1d5db', borderRadius:'8px', padding:'10px 12px', fontSize:'14px', boxSizing:'border-box'}}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{width:'100%', background:'#2563eb', color:'white', padding:'12px', borderRadius:'8px', border:'none', fontSize:'15px', fontWeight:'500', cursor:'pointer', opacity: loading ? 0.7 : 1}}
        >
          {loading ? 'Chargement...' : isSignup ? 'Creer mon compte' : 'Se connecter'}
        </button>

        <div style={{textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#6b7280'}}>
          {isSignup ? 'Deja un compte ?' : 'Pas encore de compte ?'}
          <button onClick={() => setIsSignup(!isSignup)} style={{background:'none', border:'none', color:'#2563eb', cursor:'pointer', fontWeight:'500', marginLeft:'4px'}}>
            {isSignup ? 'Se connecter' : 'Creer un compte'}
          </button>
        </div>
      </div>
    </div>
  )
}