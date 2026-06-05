import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const creditVide = { mensualite: '', duree: '', capital: '', commun: false }
const revenusVide = { salaire: '', fonciers: '', autres: '' }
const depensesVide = { logement: '', alimentation: '', transports: '', loisirs: '', sante: '', autres: '' }

const inputStyle = { width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' }
const labelStyle = { fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }
const cardStyle = { background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }
const titleStyle = { fontWeight: '600', color: '#374151', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', fontSize: '15px' }

function BlocRevenus({ revenus, setRevenus, label, couleur, estConjoint2, onDiviser }) {
  return (
    <div style={cardStyle}>
      <div style={{ ...titleStyle, color: couleur }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Salaire net</label>
          <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 3000" value={revenus.salaire} onChange={e => setRevenus(prev => ({ ...prev, salaire: e.target.value }))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Revenus fonciers</label>
            {estConjoint2 && (
              <button onClick={onDiviser} style={{ fontSize: '11px', color: '#7c3aed', background: '#f5f3ff', border: '1px solid #7c3aed', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer' }}>
                Diviser en 2 (commun)
              </button>
            )}
          </div>
          <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 500" value={revenus.fonciers} onChange={e => setRevenus(prev => ({ ...prev, fonciers: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Autres revenus</label>
          <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 200" value={revenus.autres} onChange={e => setRevenus(prev => ({ ...prev, autres: e.target.value }))} />
        </div>
        <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '12px', color: '#2563eb' }}>Total revenus</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>
            {Math.round(Object.values(revenus).reduce((a, b) => a + (parseFloat(b) || 0), 0)).toLocaleString()} EUR
          </div>
        </div>
      </div>
    </div>
  )
}

function BlocDepenses({ depenses, setDepenses, label, couleur }) {
  return (
    <div style={cardStyle}>
      <div style={{ ...titleStyle, color: couleur }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { key: 'logement', label: 'Logement', placeholder: '1050' },
          { key: 'alimentation', label: 'Alimentation', placeholder: '600' },
          { key: 'transports', label: 'Transports', placeholder: '450' },
          { key: 'loisirs', label: 'Loisirs', placeholder: '300' },
          { key: 'sante', label: 'Sante', placeholder: '300' },
          { key: 'autres', label: 'Autres', placeholder: '300' },
        ].map(item => (
          <div key={item.key}>
            <label style={labelStyle}>{item.label}</label>
            <input type="text" inputMode="numeric" style={inputStyle} placeholder={item.placeholder} value={depenses[item.key]} onChange={e => setDepenses(prev => ({ ...prev, [item.key]: e.target.value }))} />
          </div>
        ))}
        <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '12px', color: '#dc2626' }}>Total depenses</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b91c1c' }}>
            {Math.round(Object.values(depenses).reduce((a, b) => a + (parseFloat(b) || 0), 0)).toLocaleString()} EUR
          </div>
        </div>
      </div>
    </div>
  )
}

function BlocCredits({ liste, setListe, couleur, emoji, label, situation }) {
  const updateCredit = (index, champ, valeur) => {
    setListe(prev => {
      const copie = [...prev]
      copie[index] = { ...copie[index], [champ]: valeur }
      return copie
    })
  }

  const toggleCommun = (index) => {
    setListe(prev => {
      const copie = [...prev]
      copie[index] = { ...copie[index], commun: !copie[index].commun }
      return copie
    })
  }

  const ajouter = () => setListe(prev => [...prev, { ...creditVide }])
  const supprimer = (index) => {
    if (liste.length === 1) return
    setListe(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontWeight: '600', color: couleur, fontSize: '13px', marginBottom: '10px' }}>{emoji} {label}</div>
      {liste.map((c, i) => (
        <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>{label} {liste.length > 1 ? `#${i + 1}` : ''}</span>
            {liste.length > 1 && (
              <button onClick={() => supprimer(i)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
                Supprimer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Mensualite (EUR)</label>
              <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 800" value={c.mensualite} onChange={e => updateCredit(i, 'mensualite', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Duree restante (mois)</label>
              <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 240" value={c.duree} onChange={e => updateCredit(i, 'duree', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Capital restant du (EUR)</label>
              <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 150000" value={c.capital} onChange={e => updateCredit(i, 'capital', e.target.value)} />
            </div>
            {situation === 'foyer' && (
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={c.commun || false} onChange={() => toggleCommun(i)} />
                Credit commun aux deux conjoints
              </label>
            )}
          </div>
        </div>
      ))}
      <button onClick={ajouter} style={{ width: '100%', background: 'white', color: couleur, border: `1px dashed ${couleur}`, borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
        + Ajouter un {label.toLowerCase()}
      </button>
    </div>
  )
}

export default function SaisieDonnees() {
  const [situation, setSituation] = useState('seul')
  const [personnesCharge, setPersonnesCharge] = useState('0')
  const [revenus1, setRevenus1] = useState({ ...revenusVide })
  const [revenus2, setRevenus2] = useState({ ...revenusVide })
  const [depenses1, setDepenses1] = useState({ ...depensesVide })
  const [depenses2, setDepenses2] = useState({ ...depensesVide })
  const [creditsImmo, setCreditsImmo] = useState([{ ...creditVide }])
  const [creditsAutre, setCreditsAutre] = useState([{ ...creditVide }])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const totalRevenus1 = Math.round(Object.values(revenus1).reduce((a, b) => a + (parseFloat(b) || 0), 0))
  const totalRevenus2 = Math.round(Object.values(revenus2).reduce((a, b) => a + (parseFloat(b) || 0), 0))
  const totalDepenses1 = Math.round(Object.values(depenses1).reduce((a, b) => a + (parseFloat(b) || 0), 0))
  const totalDepenses2 = Math.round(Object.values(depenses2).reduce((a, b) => a + (parseFloat(b) || 0), 0))
  const totalMensualites = Math.round([...creditsImmo, ...creditsAutre].reduce((a, c) => a + (parseFloat(c.mensualite) || 0), 0))
  const totalRevenus = situation === 'foyer' ? totalRevenus1 + totalRevenus2 : totalRevenus1
  const totalDepenses = situation === 'foyer' ? totalDepenses1 + totalDepenses2 : totalDepenses1
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
        if (d.situation) setSituation(d.situation)
        if (d.personnes_charge) setPersonnesCharge(d.personnes_charge)
        setRevenus1({ salaire: String(d.salaire || ''), fonciers: String(d.revenus_fonciers || ''), autres: String(d.autres_revenus || '') })
        setRevenus2({ salaire: String(d.salaire2 || ''), fonciers: String(d.revenus_fonciers2 || ''), autres: String(d.autres_revenus2 || '') })
        setDepenses1({ logement: String(d.logement || ''), alimentation: String(d.alimentation || ''), transports: String(d.transports || ''), loisirs: String(d.loisirs || ''), sante: String(d.sante || ''), autres: String(d.autres_depenses || '') })
        setDepenses2({ logement: String(d.logement2 || ''), alimentation: String(d.alimentation2 || ''), transports: String(d.transports2 || ''), loisirs: String(d.loisirs2 || ''), sante: String(d.sante2 || ''), autres: String(d.autres_depenses2 || '') })
        if (d.credits_immo && d.credits_immo.length > 0) setCreditsImmo(d.credits_immo)
        if (d.credits_autre && d.credits_autre.length > 0) setCreditsAutre(d.credits_autre)
      }
    }
    charger()
  }, [])

  const diviserFonciers = () => {
    const valeur = parseFloat(revenus1.fonciers) || 0
    const moitie = Math.round(valeur / 2)
    setRevenus1(prev => ({ ...prev, fonciers: String(moitie) }))
    setRevenus2(prev => ({ ...prev, fonciers: String(moitie) }))
  }

  const sauvegarder = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profils_financiers').upsert([{
      user_id: user.id,
      situation,
      personnes_charge: personnesCharge,
      salaire: parseFloat(revenus1.salaire) || 0,
      revenus_fonciers: parseFloat(revenus1.fonciers) || 0,
      autres_revenus: parseFloat(revenus1.autres) || 0,
      salaire2: parseFloat(revenus2.salaire) || 0,
      revenus_fonciers2: parseFloat(revenus2.fonciers) || 0,
      autres_revenus2: parseFloat(revenus2.autres) || 0,
      logement: parseFloat(depenses1.logement) || 0,
      alimentation: parseFloat(depenses1.alimentation) || 0,
      transports: parseFloat(depenses1.transports) || 0,
      loisirs: parseFloat(depenses1.loisirs) || 0,
      sante: parseFloat(depenses1.sante) || 0,
      autres_depenses: parseFloat(depenses1.autres) || 0,
      logement2: parseFloat(depenses2.logement) || 0,
      alimentation2: parseFloat(depenses2.alimentation) || 0,
      transports2: parseFloat(depenses2.transports) || 0,
      loisirs2: parseFloat(depenses2.loisirs) || 0,
      sante2: parseFloat(depenses2.sante) || 0,
      autres_depenses2: parseFloat(depenses2.autres) || 0,
      credits_immo: creditsImmo,
      credits_autre: creditsAutre,
    }], { onConflict: 'user_id' })
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Donnees sauvegardees !')
    setLoading(false)
  }

  return (
    <div style={{ padding: '16px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Saisie des donnees</h2>

      {message && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500', background: message.includes('Erreur') ? '#fee2e2' : '#dcfce7', color: message.includes('Erreur') ? '#b91c1c' : '#15803d' }}>
          {message}
        </div>
      )}

      <div style={cardStyle}>
        <div style={titleStyle}>Votre situation</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Situation familiale</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['seul', 'foyer'].map(s => (
                <button key={s} onClick={() => setSituation(s)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: situation === s ? '2px solid #2563eb' : '1px solid #d1d5db', background: situation === s ? '#eff6ff' : 'white', color: situation === s ? '#2563eb' : '#374151', fontWeight: situation === s ? '600' : '400', cursor: 'pointer', fontSize: '14px' }}>
                  {s === 'seul' ? '👤 Seul(e)' : '👨‍👩‍👧 En foyer'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nombre de personnes a charge</label>
            <select style={{ ...inputStyle, background: 'white' }} value={personnesCharge} onChange={e => setPersonnesCharge(e.target.value)}>
              <option value="0">0 personne a charge</option>
              <option value="1">1 personne a charge</option>
              <option value="2">2 personnes a charge</option>
              <option value="3">3 personnes a charge</option>
              <option value="4+">4 personnes et plus</option>
            </select>
          </div>
        </div>
      </div>

      {situation === 'foyer' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <BlocRevenus revenus={revenus1} setRevenus={setRevenus1} label="💼 Revenus Conjoint 1" couleur="#2563eb" estConjoint2={false} onDiviser={diviserFonciers} />
          <BlocRevenus revenus={revenus2} setRevenus={setRevenus2} label="💼 Revenus Conjoint 2" couleur="#7c3aed" estConjoint2={true} onDiviser={diviserFonciers} />
        </div>
      ) : (
        <BlocRevenus revenus={revenus1} setRevenus={setRevenus1} label="Revenus mensuels" couleur="#374151" estConjoint2={false} onDiviser={diviserFonciers} />
      )}

      {situation === 'foyer' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <BlocDepenses depenses={depenses1} setDepenses={setDepenses1} label="🛒 Depenses Conjoint 1" couleur="#2563eb" />
          <BlocDepenses depenses={depenses2} setDepenses={setDepenses2} label="🛒 Depenses Conjoint 2" couleur="#7c3aed" />
        </div>
      ) : (
        <BlocDepenses depenses={depenses1} setDepenses={setDepenses1} label="Depenses mensuelles" couleur="#374151" />
      )}

      <div style={cardStyle}>
        <div style={titleStyle}>Credits en cours</div>
        <BlocCredits liste={creditsImmo} setListe={setCreditsImmo} couleur="#2563eb" emoji="🏠" label="Credit immobilier" situation={situation} />
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <BlocCredits liste={creditsAutre} setListe={setCreditsAutre} couleur="#7c3aed" emoji="💳" label="Autre credit" situation={situation} />
        </div>
        <div style={{ background: '#f5f3ff', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
          <div style={{ fontSize: '12px', color: '#7c3aed' }}>Total mensualites credits</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6d28d9' }}>{totalMensualites.toLocaleString()} EUR</div>
        </div>
      </div>

      <div style={{ background: epargne >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: epargne >= 0 ? '#16a34a' : '#dc2626' }}>Epargne disponible {situation === 'foyer' ? '(foyer)' : ''}</div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: epargne >= 0 ? '#15803d' : '#b91c1c' }}>{epargne.toLocaleString()} EUR</div>
        {totalRevenus > 0 && (
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Taux epargne : {Math.round((epargne / totalRevenus) * 100)}%</div>
        )}
      </div>

      <button onClick={sauvegarder} disabled={loading} style={{ width: '100%', background: '#2563eb', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: '500', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Sauvegarde...' : 'Sauvegarder et calculer mon score'}
      </button>
    </div>
  )
}