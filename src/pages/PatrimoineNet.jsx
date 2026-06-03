import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const produitsCourt = ['Livret A', 'LEP', 'Livret B', 'LDDS', 'Autre']
const produitsMoyen = ['PEL', 'CEL', 'Compte a terme', 'Autre']
const produitsLong = ['PEA', 'Assurance vie', 'PERP', 'PER', 'Actions', 'Autre']

const epargneVide = { produit: '', montant: '' }
const bienVide = { type: 'Residence principale', nom: '', valeur: '', creditLie: '' }

export default function PatrimoineNet() {
  const [epargneCourt, setEpargneCourt] = useState([{ ...epargneVide }])
  const [epargneMoyen, setEpargneMoyen] = useState([{ ...epargneVide }])
  const [epargneLong, setEpargneLong] = useState([{ ...epargneVide }])
  const [biens, setBiens] = useState([{ ...bienVide }])
  const [creditsImmo, setCreditsImmo] = useState([])
  const [situation, setSituation] = useState('seul')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
        if (d.epargne_court && d.epargne_court.length > 0) setEpargneCourt(d.epargne_court)
        if (d.epargne_moyen && d.epargne_moyen.length > 0) setEpargneMoyen(d.epargne_moyen)
        if (d.epargne_long && d.epargne_long.length > 0) setEpargneLong(d.epargne_long)
        if (d.biens_immo && d.biens_immo.length > 0) setBiens(d.biens_immo)
        if (d.credits_immo && d.credits_immo.length > 0) setCreditsImmo(d.credits_immo)
      }
    }
    charger()
  }, [])

  const sauvegarder = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: existing } = await supabase
      .from('profils_financiers')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    let error
    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from('profils_financiers')
        .update({
          epargne_court: epargneCourt,
          epargne_moyen: epargneMoyen,
          epargne_long: epargneLong,
          biens_immo: biens,
        })
        .eq('user_id', user.id)
      error = updateError
    } else {
      setMessage('Erreur : veuillez d\'abord remplir la page Saisie de donnees')
      setLoading(false)
      return
    }

    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Patrimoine sauvegarde !')
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

  const totalEpargne = (liste) => Math.round(liste.reduce((a, e) => a + (parseFloat(e.montant) || 0), 0))
  const totalFinancier = totalEpargne(epargneCourt) + totalEpargne(epargneMoyen) + totalEpargne(epargneLong)

  const valeurNetteBien = (bien) => {
    const valeur = parseFloat(bien.valeur) || 0
    if (bien.creditLie === '' || bien.creditLie === undefined) return valeur
    const credit = creditsImmo[parseInt(bien.creditLie)]
    const capital = credit ? (parseFloat(credit.capital) || 0) : 0
    const valeurNette = valeur - capital
    // Si credit commun et foyer, diviser par 2
    if (credit && credit.commun && situation === 'foyer') return Math.round(valeurNette / 2)
    return valeurNette
  }

  const totalImmo = biens.reduce((a, b) => a + valeurNetteBien(b), 0)
  const patrimoineTotal = totalFinancier + totalImmo

  const inputStyle = { width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' }
  const selectStyle = { ...inputStyle, background: 'white' }
  const labelStyle = { fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }
  const cardStyle = { background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }
  const titleStyle = { fontWeight: '600', color: '#374151', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', fontSize: '15px' }

  const renderEpargne = (liste, setListe, produits, couleur, label) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontWeight: '600', color: couleur, fontSize: '13px', marginBottom: '10px' }}>{label}</div>
      {liste.map((e, i) => (
        <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px', marginBottom: '10px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>Produit {liste.length > 1 ? `#${i + 1}` : ''}</span>
            {liste.length > 1 && (
              <button onClick={() => supprimer(liste, setListe, i)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
                Supprimer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Type de produit</label>
              <select style={selectStyle} value={e.produit} onChange={ev => updateListe(liste, setListe, i, 'produit', ev.target.value)}>
                <option value="">Selectionnez...</option>
                {produits.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Montant (EUR)</label>
              <input type="number" style={inputStyle} placeholder="ex: 5000" value={e.montant} onChange={ev => updateListe(liste, setListe, i, 'montant', ev.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <button onClick={() => ajouter(liste, setListe, epargneVide)} style={{ background: 'white', color: couleur, border: `1px dashed ${couleur}`, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
          + Ajouter un produit
        </button>
        <div style={{ fontSize: '14px', fontWeight: '600', color: couleur }}>Total : {totalEpargne(liste).toLocaleString()} EUR</div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '16px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Patrimoine net</h2>

      {message && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500', background: message.includes('Erreur') ? '#fee2e2' : '#dcfce7', color: message.includes('Erreur') ? '#b91c1c' : '#15803d' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#2563eb', marginBottom: '4px' }}>Patrimoine financier</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>{totalFinancier.toLocaleString()} EUR</div>
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>
            Patrimoine immobilier net {situation === 'foyer' ? '(votre part)' : ''}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>{totalImmo.toLocaleString()} EUR</div>
        </div>
        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Patrimoine total net</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{patrimoineTotal.toLocaleString()} EUR</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>💰 Patrimoine financier</div>
        {renderEpargne(epargneCourt, setEpargneCourt, produitsCourt, '#0ea5e9', '📅 Epargne court terme')}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          {renderEpargne(epargneMoyen, setEpargneMoyen, produitsMoyen, '#8b5cf6', '📆 Epargne moyen terme')}
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          {renderEpargne(epargneLong, setEpargneLong, produitsLong, '#f59e0b', '📈 Epargne long terme')}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>🏠 Patrimoine immobilier</div>
        {biens.map((bien, i) => {
          const valeurNette = valeurNetteBien(bien)
          const credit = bien.creditLie !== '' && creditsImmo[parseInt(bien.creditLie)]
          const capital = credit ? parseFloat(credit.capital) || 0 : 0
          const estCommun = credit && credit.commun && situation === 'foyer'
          return (
            <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px', marginBottom: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Bien {biens.length > 1 ? `#${i + 1}` : ''}</span>
                {biens.length > 1 && (
                  <button onClick={() => supprimer(biens, setBiens, i)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
                    Supprimer
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  <label style={labelStyle}>Valeur estimee (EUR)</label>
                  <input type="number" style={inputStyle} placeholder="ex: 300000" value={bien.valeur} onChange={e => updateListe(biens, setBiens, i, 'valeur', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Credit immobilier lie</label>
                  <select style={selectStyle} value={bien.creditLie} onChange={e => updateListe(biens, setBiens, i, 'creditLie', e.target.value)}>
                    <option value="">Aucun credit</option>
                    {creditsImmo.map((c, idx) => (
                      <option key={idx} value={idx}>
                        Credit {idx + 1} — {(parseFloat(c.mensualite) || 0).toLocaleString()} EUR/mois — Capital : {(parseFloat(c.capital) || 0).toLocaleString()} EUR {c.commun ? '(commun)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ background: valeurNette >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    {(parseFloat(bien.valeur) || 0).toLocaleString()} EUR
                    {capital > 0 ? ` - ${capital.toLocaleString()} EUR (credit)` : ''}
                    {estCommun ? ' ÷ 2 (credit commun)' : ''} = Valeur nette {estCommun ? 'votre part' : ''}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: valeurNette >= 0 ? '#15803d' : '#b91c1c' }}>
                    {valeurNette.toLocaleString()} EUR
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <button onClick={() => ajouter(biens, setBiens, bienVide)} style={{ width: '100%', background: 'white', color: '#2563eb', border: '1px dashed #2563eb', borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
          + Ajouter un bien immobilier
        </button>
      </div>

      <button onClick={sauvegarder} disabled={loading} style={{ width: '100%', background: '#0f172a', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: '500', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Sauvegarde...' : 'Sauvegarder le patrimoine'}
      </button>
    </div>
  )
}