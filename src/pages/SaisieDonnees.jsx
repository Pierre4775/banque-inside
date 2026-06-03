import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const creditVide = { mensualite: '', duree: '', capital: '' }

export default function SaisieDonnees() {
  const [revenus, setRevenus] = useState({ salaire: '', fonciers: '', autres: '' })
  const [depenses, setDepenses] = useState({ logement: '', alimentation: '', transports: '', loisirs: '', sante: '', autres: '' })
  const [creditsImmo, setCreditsImmo] = useState([{ ...creditVide }])
  const [creditsAutre, setCreditsAutre] = useState([{ ...creditVide }])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const totalDepenses = Math.round(Object.values(depenses).reduce((a, b) => a + (parseFloat(b) || 0), 0))
  const totalRevenus = Math.round(Object.values(revenus).reduce((a, b) => a + (parseFloat(b) || 0), 0))
  const totalMensualites = Math.round(
    [...creditsImmo, ...creditsAutre].reduce((a, c) => a + (parseFloat(c.mensualite) || 0), 0)
  )
  const epargne = totalRevenus - totalDepenses - totalMensualites

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profils_financiers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) {
        const d = data[0]
        setRevenus({ salaire: d.salaire || '', fonciers: d.revenus_fonciers || '', autres: d.autres_revenus || '' })
        setDepenses({ logement: d.logement || '', alimentation: d.alimentation || '', transports: d.transports || '', loisirs: d.loisirs || '', sante: d.sante || '', autres: d.autres_depenses || '' })
        if (d.credits_immo) setCreditsImmo(d.credits_immo)
        if (d.credits_autre) setCreditsAutre(d.credits_autre)
      }
    }
    charger()
  }, [])

  const sauvegarder = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profils_financiers').upsert([{
      user_id: user.id,
      salaire: parseFloat(revenus.salaire) || 0,
      revenus_fonciers: parseFloat(revenus.fonciers) || 0,
      autres_revenus: parseFloat(revenus.autres) || 0,
      logement: parseFloat(depenses.logement) || 0,
      alimentation: parseFloat(depenses.alimentation) || 0,
      transports: parseFloat(depenses.transports) || 0,
      loisirs: parseFloat(depenses.loisirs) || 0,
      sante: parseFloat(depenses.sante) || 0,
      autres_depenses: parseFloat(depenses.autres) || 0,
      credits_immo: creditsImmo,
      credits_autre: creditsAutre,
    }], { onConflict: 'user_id' })
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Donnees sauvegardees !')
    setLoading(false)
  }

  const updateCredit = (liste, setListe, index, champ, valeur) => {
    const copie = [...liste]
    copie[index] = { ...copie[index], [champ]: valeur }
    setListe(copie)
  }

  const ajouterCredit = (liste, setListe) => setListe([...liste, { ...creditVide }])

  const supprimerCredit = (liste, setListe, index) => {
    if (liste.length === 1) return
    setListe(liste.filter((_, i) => i !== index))
  }

  const inputStyle = { width:'100%', border:'1px solid #d1d5db', borderRadius:'8px', padding:'10px 12px', fontSize:'14px', boxSizing:'border-box' }
  const labelStyle = { fontSize:'12px', color:'#6b7280', display:'block', marginBottom:'4px' }
  const cardStyle = { background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'16px' }
  const titleStyle = { fontWeight:'600', color:'#374151', marginBottom:'16px', paddingBottom:'8px', borderBottom:'1px solid #e5e7eb', fontSize:'15px' }

  const renderCredits = (liste, setListe, couleur, emoji, label) => (
    <div style={{marginBottom:'16px'}}>
      <div style={{fontWeight:'600', color: couleur, fontSize:'13px', marginBottom:'10px'}}>{emoji} {label}</div>
      {liste.map((c, i) => (
        <div key={i} style={{background:'#f9fafb', borderRadius:'10px', padding:'12px', marginBottom:'10px', border:'1px solid #e5e7eb'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
            <span style={{fontSize:'13px', fontWeight:'500', color:'#374151'}}>{label} {liste.length > 1 ? `#${i+1}` : ''}</span>
            {liste.length > 1 && (
              <button onClick={() => supprimerCredit(liste, setListe, i)} style={{background:'#fee2e2', color:'#b91c1c', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'12px', cursor:'pointer'}}>
                Supprimer
              </button>
            )}
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <div>
              <label style={labelStyle}>Mensualite (EUR)</label>
              <input type="number" style={inputStyle} placeholder="ex: 800" value={c.mensualite} onChange={e => updateCredit(liste, setListe, i, 'mensualite', e.target.value)}/>
            </div>
            <div>
              <label style={labelStyle}>Duree restante (mois)</label>
              <input type="number" style={inputStyle} placeholder="ex: 240" value={c.duree} onChange={e => updateCredit(liste, setListe, i, 'duree', e.target.value)}/>
            </div>
            <div>
              <label style={labelStyle}>Capital restant du (EUR)</label>
              <input type="number" style={inputStyle} placeholder="ex: 150000" value={c.capital} onChange={e => updateCredit(liste, setListe, i, 'capital', e.target.value)}/>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => ajouterCredit(liste, setListe)} style={{width:'100%', background:'white', color: couleur, border:`1px dashed ${couleur}`, borderRadius:'8px', padding:'10px', fontSize:'13px', cursor:'pointer', fontWeight:'500'}}>
        + Ajouter un {label.toLowerCase()}
      </button>
    </div>
  )

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
            <label style={labelStyle}>Revenus fonciers</label>
            <input type="number" style={inputStyle} placeholder="ex: 500" value={revenus.fonciers} onChange={e => setRevenus({...revenus, fonciers: e.target.value})}/>
          </div>
          <div>
            <label style={labelStyle}>Autres revenus</label>
            <input type="number" style={inputStyle} placeholder="ex: 200" value={revenus.autres} onChange={e => setRevenus({...revenus, autres: e.target.value})}/>
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
        {renderCredits(creditsImmo, setCreditsImmo, '#2563eb', '🏠', 'Credit immobilier')}
        <div style={{borderTop:'1px solid #e5e7eb', paddingTop:'16px'}}>
          {renderCredits(creditsAutre, setCreditsAutre, '#7c3aed', '💳', 'Autre credit')}
        </div>
        <div style={{background:'#f5f3ff', borderRadius:'8px', padding:'12px', marginTop:'8px'}}>
          <div style={{fontSize:'12px', color:'#7c3aed'}}>Total mensualites credits</div>
          <div style={{fontSize:'24px', fontWeight:'bold', color:'#6d28d9'}}>{totalMensualites.toLocaleString()} EUR</div>
        </div>
      </div>

      <div style={{background: epargne >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius:'12px', padding:'16px', marginBottom:'16px'}}>
        <div style={{fontSize:'12px', color: epargne >= 0 ? '#16a34a' : '#dc2626'}}>Epargne disponible</div>
        <div style={{fontSize:'32px', fontWeight:'bold', color: epargne >= 0 ? '#15803d' : '#b91c1c'}}>{epargne.toLocaleString()} EUR</div>
        {totalRevenus > 0 && (
          <div style={{fontSize:'14px', color:'#6b7280', marginTop:'4px'}}>Taux epargne : {Math.round((epargne/totalRevenus)*100)}%</div>
        )}
      </div>

      <button onClick={sauvegarder} disabled={loading} style={{width:'100%', background:'#2563eb', color:'white', padding:'14px', borderRadius:'12px', border:'none', fontSize:'16px', fontWeight:'500', cursor:'pointer', opacity: loading ? 0.7 : 1}}>
        {loading ? 'Sauvegarde...' : 'Sauvegarder et calculer mon score'}
      </button>
    </div>
  )
}