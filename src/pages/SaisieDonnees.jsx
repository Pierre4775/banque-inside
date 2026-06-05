import { useState, useEffect } from 'react'
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
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
}

const creditVide = { mensualite: '', duree: '', capital: '', commun: false }
const revenusVide = { salaire: '', fonciers: '', autres: '' }
const depensesVide = { logement: '', alimentation: '', transports: '', loisirs: '', sante: '', autres: '', impots: '' }

const inputStyle = {
  width: '100%', border: `1.5px solid ${COLORS.gray200}`, borderRadius: '10px',
  padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box',
  color: COLORS.navy, background: COLORS.white, outline: 'none',
  transition: 'border-color 0.2s ease',
}

const labelStyle = {
  fontSize: '12px', fontWeight: '600', color: COLORS.gray600,
  display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em'
}

const cardStyle = {
  background: COLORS.white, borderRadius: '16px', padding: '20px',
  boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '16px',
}

const titleStyle = {
  fontWeight: '700', color: COLORS.navy, marginBottom: '18px',
  paddingBottom: '12px', borderBottom: `1px solid ${COLORS.gray200}`, fontSize: '14px',
  textTransform: 'uppercase', letterSpacing: '0.06em'
}

function BlocRevenus({ revenus, setRevenus, label, couleur, estConjoint2, onDiviser }) {
  return (
    <div style={{ ...cardStyle, borderTop: `3px solid ${couleur}` }}>
      <div style={{ ...titleStyle, color: couleur }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Salaire net imposable</label>
          <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 3 000" value={revenus.salaire} onChange={e => setRevenus(prev => ({ ...prev, salaire: e.target.value }))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Revenus fonciers</label>
            {estConjoint2 && (
              <button onClick={onDiviser} style={{
                fontSize: '11px', color: COLORS.purple, background: COLORS.purpleLight,
                border: `1px solid ${COLORS.purple}`, borderRadius: '6px',
                padding: '3px 10px', cursor: 'pointer', fontWeight: '600'
              }}>
                ÷ 2 commun
              </button>
            )}
          </div>
          <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 500" value={revenus.fonciers} onChange={e => setRevenus(prev => ({ ...prev, fonciers: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Autres revenus</label>
          <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 200" value={revenus.autres} onChange={e => setRevenus(prev => ({ ...prev, autres: e.target.value }))} />
        </div>
        <div style={{ background: COLORS.bluePale, borderRadius: '10px', padding: '14px', borderLeft: `3px solid ${COLORS.blue}` }}>
          <div style={{ fontSize: '11px', color: COLORS.blue, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '4px' }}>TOTAL REVENUS</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: COLORS.navy }}>
            {Math.round(Object.values(revenus).reduce((a, b) => a + (parseFloat(b) || 0), 0)).toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlocDepenses({ depenses, setDepenses, label, couleur }) {
  const items = [
    { key: 'logement', label: 'Logement', placeholder: '1 050' },
    { key: 'alimentation', label: 'Alimentation', placeholder: '600' },
    { key: 'transports', label: 'Transports', placeholder: '450' },
    { key: 'loisirs', label: 'Loisirs', placeholder: '300' },
    { key: 'sante', label: 'Santé', placeholder: '300' },
    { key: 'autres', label: 'Autres', placeholder: '300' },
    { key: 'impots', label: 'Impôts (mensuel)', placeholder: '200', highlight: true },
  ]
  return (
    <div style={{ ...cardStyle, borderTop: `3px solid ${couleur}` }}>
      <div style={{ ...titleStyle, color: couleur }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {items.map(item => (
          <div key={item.key}>
            <label style={{ ...labelStyle, color: item.highlight ? COLORS.purple : COLORS.gray600 }}>{item.label}</label>
            <input
              type="text" inputMode="numeric"
              style={{ ...inputStyle, borderColor: item.highlight ? COLORS.purple : COLORS.gray200 }}
              placeholder={item.placeholder}
              value={depenses[item.key] || ''}
              onChange={e => setDepenses(prev => ({ ...prev, [item.key]: e.target.value }))}
            />
          </div>
        ))}
        <div style={{ background: COLORS.redLight, borderRadius: '10px', padding: '14px', borderLeft: `3px solid ${COLORS.red}` }}>
          <div style={{ fontSize: '11px', color: COLORS.red, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '4px' }}>TOTAL DÉPENSES</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: COLORS.navy }}>
            {Math.round(Object.values(depenses).reduce((a, b) => a + (parseFloat(b) || 0), 0)).toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
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
      <div style={{ fontWeight: '700', color: couleur, fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{emoji} {label}</div>
      {liste.map((c, i) => (
        <div key={i} style={{ background: COLORS.gray50, borderRadius: '12px', padding: '16px', marginBottom: '10px', border: `1px solid ${COLORS.gray200}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.navy }}>{label} {liste.length > 1 ? `#${i + 1}` : ''}</span>
            {liste.length > 1 && (
              <button onClick={() => supprimer(i)} style={{ background: COLORS.redLight, color: COLORS.red, border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                Supprimer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Mensualité (EUR)</label>
              <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 800" value={c.mensualite} onChange={e => updateCredit(i, 'mensualite', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Durée restante (mois)</label>
              <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 240" value={c.duree} onChange={e => updateCredit(i, 'duree', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Capital restant dû (EUR)</label>
              <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 150 000" value={c.capital} onChange={e => updateCredit(i, 'capital', e.target.value)} />
            </div>
            {situation === 'foyer' && (
              <label style={{ fontSize: '13px', color: COLORS.gray600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', background: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.gray200}` }}>
                <input type="checkbox" checked={c.commun || false} onChange={() => toggleCommun(i)} style={{ accentColor: COLORS.blue }} />
                Crédit commun aux deux conjoints
              </label>
            )}
          </div>
        </div>
      ))}
      <button onClick={ajouter} style={{
        width: '100%', background: COLORS.white, color: couleur,
        border: `1.5px dashed ${couleur}`, borderRadius: '10px',
        padding: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '600',
      }}>
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
  const totalImpots = situation === 'foyer'
    ? (parseFloat(depenses1.impots) || 0) + (parseFloat(depenses2.impots) || 0)
    : (parseFloat(depenses1.impots) || 0)
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
        setDepenses1({ logement: String(d.logement || ''), alimentation: String(d.alimentation || ''), transports: String(d.transports || ''), loisirs: String(d.loisirs || ''), sante: String(d.sante || ''), autres: String(d.autres_depenses || ''), impots: String(d.impots || '') })
        setDepenses2({ logement: String(d.logement2 || ''), alimentation: String(d.alimentation2 || ''), transports: String(d.transports2 || ''), loisirs: String(d.loisirs2 || ''), sante: String(d.sante2 || ''), autres: String(d.autres_depenses2 || ''), impots: String(d.impots2 || '') })
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
      impots: parseFloat(depenses1.impots) || 0,
      logement2: parseFloat(depenses2.logement) || 0,
      alimentation2: parseFloat(depenses2.alimentation) || 0,
      transports2: parseFloat(depenses2.transports) || 0,
      loisirs2: parseFloat(depenses2.loisirs) || 0,
      sante2: parseFloat(depenses2.sante) || 0,
      autres_depenses2: parseFloat(depenses2.autres) || 0,
      impots2: parseFloat(depenses2.impots) || 0,
      credits_immo: creditsImmo,
      credits_autre: creditsAutre,
    }], { onConflict: 'user_id' })
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Données sauvegardées !')
    setLoading(false)
  }

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Saisie des données</h1>
        <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0 }}>Renseignez vos informations financières pour obtenir votre analyse</p>
      </div>

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

      <div style={cardStyle}>
        <div style={titleStyle}>Votre situation</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Situation familiale</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['seul', 'foyer'].map(s => (
                <button key={s} onClick={() => setSituation(s)} style={{
                  flex: 1, padding: '14px', borderRadius: '10px',
                  border: situation === s ? `2px solid ${COLORS.blue}` : `1.5px solid ${COLORS.gray200}`,
                  background: situation === s ? COLORS.bluePale : COLORS.white,
                  color: situation === s ? COLORS.blue : COLORS.gray600,
                  fontWeight: situation === s ? '700' : '400',
                  cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease'
                }}>
                  {s === 'seul' ? '👤 Seul(e)' : '👨‍👩‍👧 En foyer'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Personnes à charge</label>
            <select style={{ ...inputStyle, background: COLORS.white, cursor: 'pointer' }} value={personnesCharge} onChange={e => setPersonnesCharge(e.target.value)}>
              <option value="0">0 personne à charge</option>
              <option value="1">1 personne à charge</option>
              <option value="2">2 personnes à charge</option>
              <option value="3">3 personnes à charge</option>
              <option value="4+">4 personnes et plus</option>
            </select>
          </div>
        </div>
      </div>

      {situation === 'foyer' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <BlocRevenus revenus={revenus1} setRevenus={setRevenus1} label="💼 Conjoint 1" couleur={COLORS.blue} estConjoint2={false} onDiviser={diviserFonciers} />
          <BlocRevenus revenus={revenus2} setRevenus={setRevenus2} label="💼 Conjoint 2" couleur={COLORS.purple} estConjoint2={true} onDiviser={diviserFonciers} />
        </div>
      ) : (
        <BlocRevenus revenus={revenus1} setRevenus={setRevenus1} label="💼 Revenus mensuels" couleur={COLORS.blue} estConjoint2={false} onDiviser={diviserFonciers} />
      )}

      {situation === 'foyer' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <BlocDepenses depenses={depenses1} setDepenses={setDepenses1} label="🛒 Dépenses Conjoint 1" couleur={COLORS.blue} />
          <BlocDepenses depenses={depenses2} setDepenses={setDepenses2} label="🛒 Dépenses Conjoint 2" couleur={COLORS.purple} />
        </div>
      ) : (
        <BlocDepenses depenses={depenses1} setDepenses={setDepenses1} label="🛒 Dépenses mensuelles" couleur={COLORS.red} />
      )}

      <div style={cardStyle}>
        <div style={titleStyle}>Crédits en cours</div>
        <BlocCredits liste={creditsImmo} setListe={setCreditsImmo} couleur={COLORS.blue} emoji="🏠" label="Crédit immobilier" situation={situation} />
        <div style={{ borderTop: `1px solid ${COLORS.gray200}`, paddingTop: '16px', marginTop: '4px' }}>
          <BlocCredits liste={creditsAutre} setListe={setCreditsAutre} couleur={COLORS.purple} emoji="💳" label="Autre crédit" situation={situation} />
        </div>
        <div style={{ background: COLORS.navy, borderRadius: '10px', padding: '14px', marginTop: '8px' }}>
          <div style={{ fontSize: '11px', color: COLORS.gray400, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '4px' }}>TOTAL MENSUALITÉS</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>
            {totalMensualites.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
          </div>
        </div>
      </div>

      {/* RESUME AVANT / APRES IMPOTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: COLORS.white, borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)', borderTop: `3px solid ${COLORS.blue}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.blue, letterSpacing: '0.06em', marginBottom: '10px' }}>ÉPARGNE AVANT IMPÔTS</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.navy }}>{epargne.toLocaleString()} <span style={{ fontSize: '13px', color: COLORS.gray400 }}>EUR</span></div>
          {totalRevenus > 0 && <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '4px' }}>Taux : {Math.round((epargne / totalRevenus) * 100)}%</div>}
        </div>
        <div style={{ background: COLORS.white, borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)', borderTop: `3px solid ${COLORS.purple}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.purple, letterSpacing: '0.06em', marginBottom: '10px' }}>ÉPARGNE APRÈS IMPÔTS</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.navy }}>{(epargne - totalImpots).toLocaleString()} <span style={{ fontSize: '13px', color: COLORS.gray400 }}>EUR</span></div>
          {totalRevenus > 0 && <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '4px' }}>Taux : {Math.round(((epargne - totalImpots) / totalRevenus) * 100)}%</div>}
        </div>
      </div>

      <div style={{
        borderRadius: '16px', padding: '20px', marginBottom: '20px',
        background: epargne >= 0 ? COLORS.navy : COLORS.redLight,
      }}>
        <div style={{ fontSize: '11px', color: COLORS.gray400, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '6px' }}>
          ÉPARGNE DISPONIBLE {situation === 'foyer' ? '· FOYER' : ''}
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: epargne >= 0 ? 'white' : COLORS.red }}>
          {epargne.toLocaleString()} <span style={{ fontSize: '18px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
        </div>
        {totalRevenus > 0 && (
          <div style={{ fontSize: '13px', color: COLORS.gray400, marginTop: '6px' }}>
            Taux d'épargne : {Math.round((epargne / totalRevenus) * 100)}%
          </div>
        )}
      </div>

      <button onClick={sauvegarder} disabled={loading} style={{
        width: '100%', background: COLORS.blue, color: 'white',
        padding: '16px', borderRadius: '12px', border: 'none',
        fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1, letterSpacing: '0.02em',
      }}>
        {loading ? 'Sauvegarde en cours...' : 'Sauvegarder et calculer mon score'}
      </button>
    </div>
  )
}