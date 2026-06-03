import { useState } from 'react'
import { supabase } from '../supabase'

export default function SaisieDonnees() {
  const [revenus, setRevenus] = useState({ salaire: '', autres: '' })
  const [depenses, setDepenses] = useState({ logement: '', alimentation: '', transports: '', loisirs: '', sante: '', autres: '' })
  const [credits, setCredits] = useState({ mensualite: '', duree: '' })
  const [message, setMessage] = useState('')

  const totalDepenses = Object.values(depenses).reduce((a, b) => a + (parseFloat(b) || 0), 0)
  const totalRevenus = Object.values(revenus).reduce((a, b) => a + (parseFloat(b) || 0), 0)
  const epargne = totalRevenus - totalDepenses

  const sauvegarder = async () => {
    const { error } = await supabase.from('profils_financiers').insert([{
      salaire: parseFloat(revenus.salaire) || 0,
      autres_revenus: parseFloat(revenus.autres) || 0,
      logement: parseFloat(depenses.logement) || 0,
      alimentation: parseFloat(depenses.alimentation) || 0,
      transports: parseFloat(depenses.transports) || 0,
      loisirs: parseFloat(depenses.loisirs) || 0,
      sante: parseFloat(depenses.sante) || 0,
      autres_depenses: parseFloat(depenses.autres) || 0,
      mensualite_credit: parseFloat(credits.mensualite) || 0,
    }])
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Donnees sauvegardees !')
  }

  const inputStyle = { width:'100%', border:'1px solid #d1d5db', borderRadius:'8px', padding:'10px 12px', fontSize:'14px', boxSizing:'border-box' }
  const labelStyle = { fontSize:'12px', color:'#6b7280', display:'block', marginBottom:'4px' }
  const cardStyle = { background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'16px' }
  const titleStyle = { fontWeight:'600', color:'#374151', marginBottom:'16px', paddingBottom:'8px', borderBottom:'1px solid #e5e7eb', fontSize:'15px' }

  return (
    <div style={{padding:'16px', maxWidth:'600px', margin:'0 auto'}}>
      <h2 style={{fontSize:'20px', fontWeight:'bold', color:'#1f2937', marginBottom:'16px'}}>Saisie des donnees</h2>

      {message && (
        <div style={{padding:'12px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px', fontWeight:'500', background: message.includes('Erreur') ? '#fee2e2' : '#dcfce7', color: message.includes('Erreur') ? '#b91c1c' : '#15803d'}}>
          {message}
        </div>
      )}

      <div style={cardStyle}>
        <div style={titleStyle}>Revenus mensuels</div>
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div>
            <label style={labelStyle}>Salaire net</label>
            <input type="number" style={inputStyle} placeholder="ex: 3000" value={revenus.salaire} onChange={e => setRevenus({...revenus, salaire: e.target.value})}/>
          </div>
          <div>
            <label style={labelStyle}>Autres revenus</label>
            <input type="number" style={inputStyle} placeholder="ex: 500" value={revenus.autres} onChange={e => setRevenus({...revenus, autres: e.target.value})}/>
          </div>
          <div style={{background:'#eff6ff', borderRadius:'8px', padding:'12px'}}>
            <div style={{fontSize:'12px', color:'#2563eb'}}>Total revenus</div>
            <div style={{fontSize:'24px', fontWeight:'bold', color:'#1d4ed8'}}>{totalRevenus.toLocaleString()} EUR</div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>Depenses mensuelles</div>
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {[
            {key:'logement', label:'Logement', placeholder:'1050'},
            {key:'alimentation', label:'Alimentation', placeholder:'600'},
            {key:'transports', label:'Transports', placeholder:'450'},
            {key:'loisirs', label:'Loisirs', placeholder:'300'},
            {key:'sante', label:'Sante', placeholder:'300'},
            {key:'autres', label:'Autres', placeholder:'300'},
          ].map(item => (
            <div key={item.key}>
              <label style={labelStyle}>{item.label}</label>
              <input type="number" style={inputStyle} placeholder={item.placeholder} value={depenses[item.key]} onChange={e => setDepenses({...depenses, [item.key]: e.target.value})}/>
            </div>
          ))}
          <div style={{background:'#fef2f2', borderRadius:'8px', padding:'12px'}}>
            <div style={{fontSize:'12px', color:'#dc2626'}}>Total depenses</div>
            <div style={{fontSize:'24px', fontWeight:'bold', color:'#b91c1c'}}>{totalDepenses.toLocaleString()} EUR</div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>Credits en cours</div>
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div>
            <label style={labelStyle}>Mensualite totale</label>
            <input type="number" style={inputStyle} placeholder="ex: 800" value={credits.mensualite} onChange={e => setCredits({...credits, mensualite: e.target.value})}/>
          </div>
          <div>
            <label style={labelStyle}>Duree restante (mois)</label>
            <input type="number" style={inputStyle} placeholder="ex: 120" value={credits.duree} onChange={e => setCredits({...credits, duree: e.target.value})}/>
          </div>
        </div>
      </div>

      <div style={{background: epargne >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius:'12px', padding:'16px', marginBottom:'16px'}}>
        <div style={{fontSize:'12px', color: epargne >= 0 ? '#16a34a' : '#dc2626'}}>Epargne disponible</div>
        <div style={{fontSize:'32px', fontWeight:'bold', color: epargne >= 0 ? '#15803d' : '#b91c1c'}}>{epargne.toLocaleString()} EUR</div>
        {totalRevenus > 0 && (
          <div style={{fontSize:'14px', color:'#6b7280', marginTop:'4px'}}>Taux epargne : {Math.round((epargne/totalRevenus)*100)}%</div>
        )}
      </div>

      <button onClick={sauvegarder} style={{width:'100%', background:'#2563eb', color:'white', padding:'14px', borderRadius:'12px', border:'none', fontSize:'16px', fontWeight:'500', cursor:'pointer'}}>
        Sauvegarder et calculer mon score
      </button>
    </div>
  )
}