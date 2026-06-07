import { useState, useEffect, useRef } from 'react'
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
  amber: '#d97706',
  amberLight: '#fef3c7',
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
  cyan: '#0ea5e9',
  cyanLight: '#e0f2fe',
}

const produitsCourt = ['Livret A', 'LEP', 'Livret B', 'LDDS', 'Autre']
const produitsMoyen = ['PEL', 'CEL', 'Compte à terme', 'Autre']
const produitsLong = ['PEA', 'Assurance vie', 'PERP', 'PER', 'Actions', 'Autre']

const epargneVide = { produit: '', montant: '', commun: false }
const bienVide = { type: 'Residence principale', nom: '', valeur: '', creditLie: '', commun: false }

const inputStyle = {
  width: '100%', border: `1.5px solid ${COLORS.gray200}`, borderRadius: '10px',
  padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box',
  color: COLORS.navy, background: COLORS.white, outline: 'none',
}

const selectStyle = { ...inputStyle, background: COLORS.white, cursor: 'pointer' }

const labelStyle = {
  fontSize: '12px', fontWeight: '600', color: COLORS.gray600,
  display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em'
}

const cardStyle = {
  background: COLORS.white, borderRadius: '16px', padding: '20px',
  boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '16px',
}

export default function PatrimoineNet({ isActive }) {
  const [epargneCourt, setEpargneCourt] = useState([{ ...epargneVide }])
  const [epargneMoyen, setEpargneMoyen] = useState([{ ...epargneVide }])
  const [epargneLong, setEpargneLong] = useState([{ ...epargneVide }])
  const [biens, setBiens] = useState([{ ...bienVide }])
  const [creditsImmo, setCreditsImmo] = useState([])
  const [situation, setSituation] = useState('seul')
  const [vueMode, setVueMode] = useState('personnel')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [profilExiste, setProfilExiste] = useState(null)
  const hasLoadedData = useRef(false)

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
      setProfilExiste(true)
      if (d.situation) {
        setSituation(d.situation)
        if (!hasLoadedData.current) {
          setVueMode(d.situation === 'foyer' ? 'commun' : 'personnel')
        }
      }
      // Recharge toujours les crédits (viennent de SaisieDonnees)
      if (d.credits_immo && d.credits_immo.length > 0) setCreditsImmo(d.credits_immo)
      // Charge les données de formulaire uniquement au premier chargement
      if (!hasLoadedData.current) {
        if (d.epargne_court && d.epargne_court.length > 0) setEpargneCourt(d.epargne_court)
        if (d.epargne_moyen && d.epargne_moyen.length > 0) setEpargneMoyen(d.epargne_moyen)
        if (d.epargne_long && d.epargne_long.length > 0) setEpargneLong(d.epargne_long)
        if (d.biens_immo && d.biens_immo.length > 0) setBiens(d.biens_immo)
        hasLoadedData.current = true
      }
    } else {
      setProfilExiste(false)
    }
  }

  useEffect(() => {
    if (isActive) charger()
  }, [isActive])

  const sauvegarder = async () => {
    if (profilExiste === false) {
      setMessage("Veuillez d'abord saisir vos revenus et dépenses dans la page Saisie des données.")
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profils_financiers').update({
      epargne_court: epargneCourt, epargne_moyen: epargneMoyen,
      epargne_long: epargneLong, biens_immo: biens,
    }).eq('user_id', user.id)
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Patrimoine sauvegardé !')
    setLoading(false)
  }

  const updateListe = (liste, setListe, index, champ, valeur) => {
    const copie = [...liste]
    copie[index] = { ...copie[index], [champ]: valeur }
    setListe(copie)
  }

  const ajouter = (liste, setListe, vide) => setListe([...liste, { ...vide }])
  const supprimer = (liste, setListe, index) => {
    if (liste.length === 1) return
    setListe(liste.filter((_, i) => i !== index))
  }

  const montantEpargne = (e) => {
    const montant = parseFloat(e.montant) || 0
    if (vueMode === 'personnel' && e.commun) return Math.round(montant / 2)
    return montant
  }

  const totalEpargne = (liste) => Math.round(liste.reduce((a, e) => a + montantEpargne(e), 0))
  const totalFinancier = totalEpargne(epargneCourt) + totalEpargne(epargneMoyen) + totalEpargne(epargneLong)

  const valeurNetteBien = (bien) => {
    const valeur = parseFloat(bien.valeur) || 0
    if (bien.creditLie === '' || bien.creditLie === undefined) {
      return vueMode === 'personnel' && bien.commun ? Math.round(valeur / 2) : valeur
    }
    const credit = creditsImmo[parseInt(bien.creditLie)]
    const capital = credit ? (parseFloat(credit.capital) || 0) : 0
    const valeurNette = valeur - capital
    if (credit && credit.commun && situation === 'foyer' && vueMode === 'personnel') return Math.round(valeurNette / 2)
    return valeurNette
  }

  const totalImmo = biens.reduce((a, b) => a + valeurNetteBien(b), 0)
  const patrimoineTotal = totalFinancier + totalImmo

  const renderEpargne = (liste, setListe, produits, couleur, couleurLight, label, icon) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontWeight: '700', color: couleur, fontSize: '12px', marginBottom: '12px',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>{icon} {label}</span>
        <span style={{ fontSize: '13px', color: couleur }}>{totalEpargne(liste).toLocaleString()} EUR</span>
      </div>
      {liste.map((e, i) => (
        <div key={i} style={{ background: COLORS.gray50, borderRadius: '12px', padding: '14px', marginBottom: '10px', border: `1px solid ${COLORS.gray200}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.navy }}>Produit {liste.length > 1 ? `#${i + 1}` : ''}</span>
            {liste.length > 1 && (
              <button onClick={() => supprimer(liste, setListe, i)} style={{ background: COLORS.redLight, color: COLORS.red, border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                Supprimer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Type de produit</label>
              <select style={selectStyle} value={e.produit} onChange={ev => updateListe(liste, setListe, i, 'produit', ev.target.value)}>
                <option value="">Sélectionnez...</option>
                {produits.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Montant (EUR)</label>
              <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 5 000" value={e.montant} onChange={ev => updateListe(liste, setListe, i, 'montant', ev.target.value)} />
            </div>
            {situation === 'foyer' && (
              <label style={{ fontSize: '13px', color: COLORS.gray600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', background: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.gray200}` }}>
                <input type="checkbox" checked={e.commun || false} onChange={() => updateListe(liste, setListe, i, 'commun', !e.commun)} style={{ accentColor: COLORS.blue }} />
                Produit commun aux deux conjoints
              </label>
            )}
            {vueMode === 'personnel' && e.commun && (
              <div style={{ fontSize: '12px', color: COLORS.purple, background: COLORS.purpleLight, padding: '8px 10px', borderRadius: '8px', fontWeight: '500' }}>
                Votre part : {Math.round((parseFloat(e.montant) || 0) / 2).toLocaleString()} EUR
              </div>
            )}
          </div>
        </div>
      ))}
      <button onClick={() => ajouter(liste, setListe, epargneVide)} style={{
        background: COLORS.white, color: couleur, border: `1.5px dashed ${couleur}`,
        borderRadius: '10px', padding: '10px', fontSize: '13px', cursor: 'pointer',
        fontWeight: '600', width: '100%',
      }}>
        + Ajouter un produit
      </button>
    </div>
  )

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* HEADER */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Patrimoine net</h1>
          <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0 }}>Visualisez et gérez l'ensemble de vos actifs</p>
        </div>
        {situation === 'foyer' && (
          <div style={{ display: 'flex', gap: '6px', background: COLORS.white, padding: '4px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
            {['personnel', 'commun'].map(mode => (
              <button key={mode} onClick={() => setVueMode(mode)} style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                background: vueMode === mode ? COLORS.navy : 'transparent',
                color: vueMode === mode ? 'white' : COLORS.gray600,
                fontWeight: vueMode === mode ? '600' : '400',
                cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease'
              }}>
                {mode === 'personnel' ? '👤 Personnel' : '👨‍👩‍👧 Commun'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BANNIÈRE NOUVEAU COMPTE */}
      {profilExiste === false && (
        <div style={{
          padding: '14px 16px', borderRadius: '10px', marginBottom: '16px',
          background: COLORS.amberLight, color: COLORS.amber,
          border: `1px solid #fcd34d`, fontSize: '13px', fontWeight: '500',
          borderLeft: `4px solid ${COLORS.amber}`,
        }}>
          ⚠️ <strong>Aucun profil financier trouvé.</strong> Renseignez d'abord vos revenus et dépenses dans la page <strong>Saisie des données</strong> avant de sauvegarder votre patrimoine.
        </div>
      )}

      {/* MESSAGE */}
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

      {/* KPI RESUME */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: COLORS.bluePale, borderRadius: '14px', padding: '16px', borderTop: `3px solid ${COLORS.blue}` }}>
          <div style={{ fontSize: '11px', color: COLORS.blue, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '6px' }}>
            PATRIMOINE FINANCIER {vueMode === 'personnel' && situation === 'foyer' ? '· VOTRE PART' : ''}
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: COLORS.navy }}>{totalFinancier.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400 }}>EUR</div>
        </div>
        <div style={{ background: COLORS.greenLight, borderRadius: '14px', padding: '16px', borderTop: `3px solid ${COLORS.green}` }}>
          <div style={{ fontSize: '11px', color: COLORS.green, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '6px' }}>
            IMMOBILIER NET {vueMode === 'personnel' && situation === 'foyer' ? '· VOTRE PART' : ''}
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: COLORS.navy }}>{totalImmo.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400 }}>EUR</div>
        </div>
        <div style={{ background: COLORS.navy, borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: COLORS.gray400, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '6px' }}>
            PATRIMOINE TOTAL NET
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>{patrimoineTotal.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400 }}>EUR</div>
        </div>
      </div>

      {/* PATRIMOINE FINANCIER */}
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.navy, marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid ${COLORS.gray200}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          💰 Patrimoine financier
        </div>
        {renderEpargne(epargneCourt, setEpargneCourt, produitsCourt, COLORS.cyan, COLORS.cyanLight, 'Épargne court terme', '📅')}
        <div style={{ borderTop: `1px solid ${COLORS.gray200}`, paddingTop: '16px' }}>
          {renderEpargne(epargneMoyen, setEpargneMoyen, produitsMoyen, COLORS.purple, COLORS.purpleLight, 'Épargne moyen terme', '📆')}
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.gray200}`, paddingTop: '16px' }}>
          {renderEpargne(epargneLong, setEpargneLong, produitsLong, COLORS.amber, COLORS.amberLight, 'Épargne long terme', '📈')}
        </div>
      </div>

      {/* PATRIMOINE IMMOBILIER */}
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.navy, marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid ${COLORS.gray200}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🏠 Patrimoine immobilier
        </div>
        {biens.map((bien, i) => {
          const valeurNette = valeurNetteBien(bien)
          const credit = bien.creditLie !== '' && bien.creditLie !== undefined && creditsImmo[parseInt(bien.creditLie)]
          const capital = credit ? parseFloat(credit.capital) || 0 : 0
          const estCommun = credit && credit.commun && situation === 'foyer' && vueMode === 'personnel'
          return (
            <div key={i} style={{ background: COLORS.gray50, borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `1px solid ${COLORS.gray200}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: COLORS.navy }}>
                  Bien {biens.length > 1 ? `#${i + 1}` : ''} {bien.nom ? `· ${bien.nom}` : ''}
                </span>
                {biens.length > 1 && (
                  <button onClick={() => supprimer(biens, setBiens, i)} style={{ background: COLORS.redLight, color: COLORS.red, border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                    Supprimer
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Type de bien</label>
                  <select style={selectStyle} value={bien.type} onChange={e => updateListe(biens, setBiens, i, 'type', e.target.value)}>
                    <option>Residence principale</option>
                    <option>Residence secondaire</option>
                    <option>Residence locative</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Nom / Description</label>
                  <input type="text" style={inputStyle} placeholder="ex: Appartement Paris" value={bien.nom} onChange={e => updateListe(biens, setBiens, i, 'nom', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Valeur estimée (EUR)</label>
                  <input type="text" inputMode="numeric" style={inputStyle} placeholder="ex: 300 000" value={bien.valeur} onChange={e => updateListe(biens, setBiens, i, 'valeur', e.target.value)} />
                </div>
                {situation === 'foyer' && (
                  <label style={{ fontSize: '13px', color: COLORS.gray600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', background: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.gray200}` }}>
                    <input type="checkbox" checked={bien.commun || false} onChange={() => updateListe(biens, setBiens, i, 'commun', !bien.commun)} style={{ accentColor: COLORS.blue }} />
                    Bien commun aux deux conjoints
                  </label>
                )}
                <div>
                  <label style={labelStyle}>Crédit immobilier lié</label>
                  <select style={selectStyle} value={bien.creditLie} onChange={e => updateListe(biens, setBiens, i, 'creditLie', e.target.value)}>
                    <option value="">Aucun crédit</option>
                    {creditsImmo.map((c, idx) => (
                      <option key={idx} value={idx}>
                        Crédit {idx + 1} — {(parseFloat(c.mensualite) || 0).toLocaleString()} EUR/mois — Capital : {(parseFloat(c.capital) || 0).toLocaleString()} EUR {c.commun ? '(commun)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{
                  borderRadius: '10px', padding: '14px',
                  background: valeurNette >= 0 ? COLORS.greenLight : COLORS.redLight,
                  borderLeft: `3px solid ${valeurNette >= 0 ? COLORS.green : COLORS.red}`
                }}>
                  <div style={{ fontSize: '11px', color: valeurNette >= 0 ? COLORS.green : COLORS.red, fontWeight: '700', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    VALEUR NETTE {estCommun ? '· VOTRE PART' : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: COLORS.gray600, marginBottom: '6px' }}>
                    {(parseFloat(bien.valeur) || 0).toLocaleString()} EUR
                    {capital > 0 ? ` - ${capital.toLocaleString()} EUR (crédit)` : ''}
                    {estCommun ? ' ÷ 2' : ''}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: valeurNette >= 0 ? COLORS.green : COLORS.red }}>
                    {valeurNette.toLocaleString()} EUR
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <button onClick={() => ajouter(biens, setBiens, bienVide)} style={{
          width: '100%', background: COLORS.white, color: COLORS.blue,
          border: `1.5px dashed ${COLORS.blue}`, borderRadius: '10px',
          padding: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600',
        }}>
          + Ajouter un bien immobilier
        </button>
      </div>

      {/* BOUTON SAVE */}
      <button onClick={sauvegarder} disabled={loading} style={{
        width: '100%', background: COLORS.navy, color: 'white',
        padding: '16px', borderRadius: '12px', border: 'none',
        fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1, letterSpacing: '0.02em',
      }}>
        {loading ? 'Sauvegarde en cours...' : 'Sauvegarder le patrimoine'}
      </button>
    </div>
  )
}