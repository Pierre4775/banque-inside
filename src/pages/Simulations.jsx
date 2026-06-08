import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts'

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

const cardStyle = {
  background: COLORS.white, borderRadius: '16px', padding: '20px',
  boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '16px',
}

const sectionTitle = {
  fontSize: '13px', fontWeight: '700', color: COLORS.navy,
  marginBottom: '16px', paddingBottom: '10px',
  borderBottom: `1px solid ${COLORS.gray200}`,
  textTransform: 'uppercase', letterSpacing: '0.06em'
}

function SliderRow({ label, value, min, max, step, onChange, format, sublabel }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div>
          <span style={{ fontSize: '13px', color: COLORS.gray600, fontWeight: '500' }}>{label}</span>
          {sublabel && <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '1px' }}>{sublabel}</div>}
        </div>
        <span style={{
          fontSize: '13px', fontWeight: '700', color: COLORS.navy,
          background: COLORS.bluePale, padding: '3px 10px', borderRadius: '6px'
        }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step || 1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: COLORS.blue, height: '4px', marginTop: '6px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: COLORS.gray400, marginTop: '4px' }}>
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  )
}

function ResultCard({ label, value, sublabel, color, bg }) {
  return (
    <div style={{ background: bg || COLORS.gray50, borderRadius: '12px', padding: '16px', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '11px', color: color, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: COLORS.navy }}>{value}</div>
      {sublabel && <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '4px' }}>{sublabel}</div>}
    </div>
  )
}

export default function Simulations({ prefillMontant }) {
  const [familleActive, setFamilleActive] = useState('credit')

  useEffect(() => {
    if (prefillMontant != null && prefillMontant > 0) {
      setMontantCredit(Math.min(1000000, Math.max(50000, prefillMontant)))
      setFamilleActive('credit')
    }
  }, [prefillMontant])
  const [epargneCourt, setEpargneCourt] = useState(200)
  const [rendementCourt, setRendementCourt] = useState(3)
  const [dureeCourt, setDureeCourt] = useState(3)
  const [epargneMoyen, setEpargneMoyen] = useState(300)
  const [rendementMoyen, setRendementMoyen] = useState(5)
  const [dureeMoyen, setDureeMoyen] = useState(7)
  const [epargneLong, setEpargneLong] = useState(350)
  const [rendementLong, setRendementLong] = useState(8)
  const [dureeLong, setDureeLong] = useState(20)
  const [montantCredit, setMontantCredit] = useState(200000)
  const [tauxCredit, setTauxCredit] = useState(3.50)
  const [tauxAssurance, setTauxAssurance] = useState(0.36)
  const [dureeCredit, setDureeCredit] = useState(20)
  const [apport, setApport] = useState(20000)
  const [fraisNotaire, setFraisNotaire] = useState(8)
  const [typeProjet, setTypeProjet] = useState('principale')
  const [revenusSitu, setRevenusSitu] = useState(3000)
  const [mensualitesSitu, setMensualitesSitu] = useState(0)
  const [loyerSitu, setLoyerSitu] = useState(0)
  const [loyerLocatifSimu, setLoyerLocatifSimu] = useState(500)
  const [importLoading, setImportLoading] = useState(false)

  const importerDonnees = async () => {
    setImportLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setImportLoading(false); return }
    const { data } = await supabase.from('profils_financiers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
    if (data && data.length > 0) {
      const d = data[0]
      const totalRev = (d.salaire||0)+(d.revenus_fonciers||0)+(d.autres_revenus||0)+(d.salaire2||0)+(d.revenus_fonciers2||0)+(d.autres_revenus2||0)
      const parseC = v => Array.isArray(v) ? v : (typeof v==='string' ? (() => { try { return JSON.parse(v) } catch { return [] } })() : [])
      const mensual = [...parseC(d.credits_immo), ...parseC(d.credits_autre)].reduce((a, c) => a + (parseFloat(c.mensualite)||0), 0)
      const loyer = (d.logement||0) + (d.logement2||0)
      setRevenusSitu(Math.round(totalRev))
      setMensualitesSitu(Math.round(mensual))
      setLoyerSitu(Math.round(loyer))
    }
    setImportLoading(false)
  }

  const calculerEpargne = (mensuel, taux, ans) => {
    const r = taux / 100 / 12
    const n = ans * 12
    if (r === 0) return mensuel * n
    return Math.round(mensuel * ((Math.pow(1 + r, n) - 1) / r) * (1 + r))
  }

  const totalCourt = calculerEpargne(epargneCourt, rendementCourt, dureeCourt)
  const totalMoyen = calculerEpargne(epargneMoyen, rendementMoyen, dureeMoyen)
  const totalLong = calculerEpargne(epargneLong, rendementLong, dureeLong)
  const totalEpargne = totalCourt + totalMoyen + totalLong

  const dureeMax = Math.max(dureeCourt, dureeMoyen, dureeLong)
  const dataEpargne = Array.from({ length: dureeMax }, (_, i) => {
    const an = i + 1
    return {
      an: `${an}`,
      court: an <= dureeCourt ? calculerEpargne(epargneCourt, rendementCourt, an) : calculerEpargne(epargneCourt, rendementCourt, dureeCourt),
      moyen: an <= dureeMoyen ? calculerEpargne(epargneMoyen, rendementMoyen, an) : calculerEpargne(epargneMoyen, rendementMoyen, dureeMoyen),
      long: an <= dureeLong ? calculerEpargne(epargneLong, rendementLong, an) : calculerEpargne(epargneLong, rendementLong, dureeLong),
    }
  }).map(d => ({ ...d, total: d.court + d.moyen + d.long }))

  // Calculs crédit — capital emprunté = prix + notaire - apport
  const montantFraisNotaire = Math.round(montantCredit * fraisNotaire / 100)
  const montantEmprunte = Math.max(0, montantCredit + montantFraisNotaire - apport)
  const coutTotalAchat = montantCredit + montantFraisNotaire

  const r = tauxCredit / 100 / 12
  const n = dureeCredit * 12

  const mensualiteHorsAssurance = r > 0
    ? Math.round(montantEmprunte * r / (1 - Math.pow(1 + r, -n)))
    : Math.round(montantEmprunte / n)

  const mensualiteAssurance = Math.round(montantEmprunte * tauxAssurance / 100 / 12)
  const mensualiteCredit = mensualiteHorsAssurance + mensualiteAssurance

  const coutInterets = (mensualiteHorsAssurance * n) - montantEmprunte
  const coutAssurance = mensualiteAssurance * n
  const coutTotal = mensualiteCredit * n
  const coutOperation = montantFraisNotaire + coutInterets + coutAssurance

  // Taux d'endettement résultant selon type de projet
  const revenusPourEndet = typeProjet === 'locatif' ? revenusSitu + loyerLocatifSimu * 0.7 : revenusSitu
  const chargesAvantCredit = (typeProjet === 'primo' || typeProjet === 'principale')
    ? mensualitesSitu
    : mensualitesSitu + loyerSitu
  const tauxEndettementSimu = revenusPourEndet > 0
    ? Math.round((chargesAvantCredit + mensualiteCredit) / revenusPourEndet * 100)
    : 0
  const tauxColor = tauxEndettementSimu <= 35 ? COLORS.green : tauxEndettementSimu <= 40 ? COLORS.amber : COLORS.red
  const tauxBg = tauxEndettementSimu <= 35 ? COLORS.greenLight : tauxEndettementSimu <= 40 ? COLORS.amberLight : COLORS.redLight
  const tauxLabel = tauxEndettementSimu <= 35 ? 'Finançable' : tauxEndettementSimu <= 40 ? 'Limite bancaire' : 'Refus probable'

  // Graphique amortissement corrigé
  // CRD après k mensualités = montantEmprunte * (1+r)^k - mensualite * ((1+r)^k - 1) / r
  const dataCredit = Array.from({ length: dureeCredit }, (_, i) => {
    const k = (i + 1) * 12
    const crd = r > 0
      ? Math.max(0, Math.round(montantEmprunte * Math.pow(1 + r, k) - mensualiteHorsAssurance * (Math.pow(1 + r, k) - 1) / r))
      : Math.max(0, montantEmprunte - mensualiteHorsAssurance * k)
    const capitalRembourse = Math.min(montantEmprunte, montantEmprunte - crd)
    return {
      an: `${i + 1}`,
      capitalRembourse: Math.max(0, capitalRembourse),
      capitalRestant: crd,
    }
  })

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Simulations et projections</h1>
        <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0 }}>Projetez l'évolution de votre épargne et simulez vos crédits</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: COLORS.white, padding: '4px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
        {[
          { key: 'credit', label: '🏦 Crédit', desc: 'Simulation de prêt immobilier' },
          { key: 'epargne', label: '💰 Épargne', desc: 'Projections court, moyen et long terme' },
        ].map(f => (
          <button key={f.key} onClick={() => setFamilleActive(f.key)} style={{
            flex: 1, padding: '12px 16px', borderRadius: '10px', border: 'none',
            background: familleActive === f.key ? COLORS.navy : 'transparent',
            color: familleActive === f.key ? 'white' : COLORS.gray600,
            fontWeight: familleActive === f.key ? '700' : '400',
            cursor: 'pointer', fontSize: '14px', transition: 'all 0.25s ease', textAlign: 'left',
          }}>
            <div>{f.label}</div>
            <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '2px' }}>{f.desc}</div>
          </button>
        ))}
      </div>

      {familleActive === 'epargne' && (
        <>
          <div style={{ background: COLORS.navy, borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              📊 Épargne totale projetée
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Court terme', value: totalCourt, duree: dureeCourt, color: COLORS.cyan },
                { label: 'Moyen terme', value: totalMoyen, duree: dureeMoyen, color: '#a78bfa' },
                { label: 'Long terme', value: totalLong, duree: dureeLong, color: '#fbbf24' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', background: COLORS.navyLight, borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.04em' }}>{item.label.toUpperCase()}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: item.color }}>{(item.value / 1000).toFixed(1)}k</div>
                  <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '2px' }}>en {item.duree} ans</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', background: COLORS.navyLight, borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: COLORS.gray400, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '6px' }}>PATRIMOINE TOTAL PROJETÉ</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'white' }}>{totalEpargne.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span></div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dataEpargne}>
                <XAxis dataKey="an" tick={{ fontSize: 10, fill: COLORS.gray400 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: COLORS.gray400 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `${v.toLocaleString()} EUR`} contentStyle={{ background: COLORS.navyLight, border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                <Legend wrapperStyle={{ color: COLORS.gray400, fontSize: '12px' }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="white" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="court" name="Court" stroke={COLORS.cyan} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="moyen" name="Moyen" stroke="#a78bfa" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="long" name="Long" stroke="#fbbf24" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...cardStyle, borderTop: `3px solid ${COLORS.cyan}` }}>
            <div style={sectionTitle}>📅 Épargne court terme</div>
            <SliderRow label="Épargne mensuelle" value={epargneCourt} min={50} max={2000} step={50} onChange={setEpargneCourt} format={v => `${v} EUR`} />
            <SliderRow label="Rendement annuel" value={rendementCourt} min={0.5} max={5} step={0.5} onChange={setRendementCourt} format={v => `${v}%`} />
            <SliderRow label="Durée" value={dureeCourt} min={1} max={5} onChange={setDureeCourt} format={v => `${v} ans`} />
            <div style={{ background: COLORS.cyanLight, borderRadius: '10px', padding: '14px', borderLeft: `3px solid ${COLORS.cyan}` }}>
              <div style={{ fontSize: '11px', color: COLORS.cyan, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '4px' }}>CAPITAL EN {dureeCourt} ANS</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.navy }}>{totalCourt.toLocaleString()} EUR</div>
              <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '4px' }}>
                {(epargneCourt * 12 * dureeCourt).toLocaleString()} EUR versés + {(totalCourt - epargneCourt * 12 * dureeCourt).toLocaleString()} EUR intérêts
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, borderTop: `3px solid ${COLORS.purple}` }}>
            <div style={sectionTitle}>📆 Épargne moyen terme</div>
            <SliderRow label="Épargne mensuelle" value={epargneMoyen} min={50} max={2000} step={50} onChange={setEpargneMoyen} format={v => `${v} EUR`} />
            <SliderRow label="Rendement annuel" value={rendementMoyen} min={1} max={10} step={0.5} onChange={setRendementMoyen} format={v => `${v}%`} />
            <SliderRow label="Durée" value={dureeMoyen} min={3} max={15} onChange={setDureeMoyen} format={v => `${v} ans`} />
            <div style={{ background: COLORS.purpleLight, borderRadius: '10px', padding: '14px', borderLeft: `3px solid ${COLORS.purple}` }}>
              <div style={{ fontSize: '11px', color: COLORS.purple, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '4px' }}>CAPITAL EN {dureeMoyen} ANS</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.navy }}>{totalMoyen.toLocaleString()} EUR</div>
              <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '4px' }}>
                {(epargneMoyen * 12 * dureeMoyen).toLocaleString()} EUR versés + {(totalMoyen - epargneMoyen * 12 * dureeMoyen).toLocaleString()} EUR intérêts
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, borderTop: `3px solid ${COLORS.amber}` }}>
            <div style={sectionTitle}>📈 Épargne long terme</div>
            <SliderRow label="Épargne mensuelle" value={epargneLong} min={50} max={2000} step={50} onChange={setEpargneLong} format={v => `${v} EUR`} />
            <SliderRow label="Rendement annuel" value={rendementLong} min={3} max={15} step={0.5} onChange={setRendementLong} format={v => `${v}%`} />
            <SliderRow label="Durée" value={dureeLong} min={10} max={40} onChange={setDureeLong} format={v => `${v} ans`} />
            <div style={{ background: COLORS.amberLight, borderRadius: '10px', padding: '14px', borderLeft: `3px solid ${COLORS.amber}` }}>
              <div style={{ fontSize: '11px', color: COLORS.amber, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '4px' }}>CAPITAL EN {dureeLong} ANS</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.navy }}>{totalLong.toLocaleString()} EUR</div>
              <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '4px' }}>
                {(epargneLong * 12 * dureeLong).toLocaleString()} EUR versés + {(totalLong - epargneLong * 12 * dureeLong).toLocaleString()} EUR intérêts
              </div>
            </div>
          </div>
        </>
      )}

      {familleActive === 'credit' && (
        <>
          {/* SITUATION FINANCIÈRE + IMPORT */}
          <div style={{ ...cardStyle, borderTop: `3px solid ${COLORS.blue}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ ...sectionTitle, marginBottom: '2px', paddingBottom: '0', borderBottom: 'none' }}>Votre situation financière</div>
                <div style={{ fontSize: '12px', color: COLORS.gray400 }}>Renseignez vos revenus et charges actuelles</div>
              </div>
              <button onClick={importerDonnees} disabled={importLoading} style={{
                background: COLORS.blue, color: 'white', border: 'none', borderRadius: '8px',
                padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: importLoading ? 'not-allowed' : 'pointer',
                opacity: importLoading ? 0.7 : 1, whiteSpace: 'nowrap', flexShrink: 0
              }}>
                {importLoading ? 'Chargement...' : 'Importer mes données'}
              </button>
            </div>
            <SliderRow label="Revenus mensuels nets" value={revenusSitu} min={500} max={15000} step={100} onChange={setRevenusSitu} format={v => `${v.toLocaleString()} EUR`} />
            <SliderRow label="Mensualités crédits existants" value={mensualitesSitu} min={0} max={5000} step={50} onChange={setMensualitesSitu} format={v => `${v.toLocaleString()} EUR`} />
            <SliderRow label="Loyer actuel" value={loyerSitu} min={0} max={3000} step={50} onChange={setLoyerSitu} format={v => `${v.toLocaleString()} EUR`} sublabel="Loyer ou charges de copropriété actuelles" />
          </div>

          {/* TYPE DE PROJET */}
          <div style={cardStyle}>
            <div style={sectionTitle}>Type de projet</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'primo', label: 'Primo-accédant résidence principale', desc: 'Première acquisition, le loyer est remplacé par le crédit' },
                { id: 'principale', label: 'Résidence principale', desc: 'Le loyer actuel est remplacé par la nouvelle mensualité' },
                { id: 'secondaire', label: 'Résidence secondaire', desc: 'Loyer conservé + nouvelle mensualité dans le calcul' },
                { id: 'locatif', label: 'Investissement locatif', desc: '70% des revenus locatifs estimés ajoutés aux revenus' },
                { id: 'autre', label: 'Autre crédit', desc: 'Loyer conservé dans le calcul d\'endettement' },
              ].map(p => (
                <button key={p.id} onClick={() => setTypeProjet(p.id)} style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: '10px', border: 'none',
                  background: typeProjet === p.id ? COLORS.bluePale : COLORS.gray50,
                  borderLeft: `3px solid ${typeProjet === p.id ? COLORS.blue : COLORS.gray200}`,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: typeProjet === p.id ? COLORS.blue : COLORS.navy, marginBottom: '2px' }}>{p.label}</div>
                  <div style={{ fontSize: '11px', color: COLORS.gray400 }}>{p.desc}</div>
                </button>
              ))}
            </div>

            {typeProjet === 'primo' && (
              <div style={{ padding: '14px 16px', background: COLORS.bluePale, borderRadius: '10px', borderLeft: `3px solid ${COLORS.blue}`, fontSize: '13px', color: COLORS.navy, lineHeight: '1.6' }}>
                <div style={{ fontWeight: '700', marginBottom: '6px', color: COLORS.blue }}>Prêt à Taux Zéro (PTZ) et dispositifs primo-accédants</div>
                En tant que primo-accédant, vous pouvez bénéficier du PTZ, du Prêt Action Logement et d'autres dispositifs à taux réduits selon votre zone géographique et revenus. Comparez les offres et simulez votre éligibilité au PTZ via un courtier ou votre banque.{' '}
                <a href="#" style={{ color: COLORS.blue, fontWeight: '600' }}>Comparer les offres partenaires →</a>
              </div>
            )}

            {typeProjet === 'locatif' && (
              <SliderRow
                label="Revenus locatifs estimés"
                sublabel="70% pris en compte dans le calcul (règle bancaire)"
                value={loyerLocatifSimu} min={0} max={3000} step={50}
                onChange={setLoyerLocatifSimu}
                format={v => `${v.toLocaleString()} EUR/mois`}
              />
            )}
          </div>

          {/* PARAMÈTRES DU CRÉDIT */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🏦 Paramètres du crédit</div>
            <SliderRow label="Prix du bien" value={montantCredit} min={50000} max={1000000} step={5000} onChange={setMontantCredit} format={v => `${v.toLocaleString()} EUR`} />
            <SliderRow
              label="Frais de notaire"
              sublabel={`Soit ${montantFraisNotaire.toLocaleString()} EUR`}
              value={fraisNotaire} min={2} max={12} step={0.5}
              onChange={setFraisNotaire}
              format={v => `${v}%`}
            />
            <SliderRow label="Apport personnel" value={apport} min={0} max={Math.round(montantCredit * 0.5)} step={1000} onChange={setApport} format={v => `${v.toLocaleString()} EUR`} />
            <SliderRow
              label="Taux d'intérêt"
              value={tauxCredit} min={0.5} max={8} step={0.01}
              onChange={v => setTauxCredit(Math.round(v * 100) / 100)}
              format={v => `${v.toFixed(2)}%`}
            />
            <SliderRow
              label="Taux assurance emprunteur"
              sublabel={`Soit ${mensualiteAssurance.toLocaleString()} EUR/mois`}
              value={tauxAssurance} min={0.1} max={1.5} step={0.01}
              onChange={setTauxAssurance}
              format={v => `${v.toFixed(2)}%`}
            />
            <SliderRow label="Durée du crédit" value={dureeCredit} min={5} max={30} onChange={setDureeCredit} format={v => `${v} ans`} />
          </div>

          {/* RÉSUMÉ OPÉRATION */}
          <div style={{ background: COLORS.navy, borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              🏠 Résumé de l'opération
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: COLORS.navyLight, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '4px', fontWeight: '600' }}>PRIX DU BIEN</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>{montantCredit.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: COLORS.gray400 }}>EUR</div>
              </div>
              <div style={{ background: COLORS.navyLight, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '4px', fontWeight: '600' }}>FRAIS NOTAIRE</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#fbbf24' }}>{montantFraisNotaire.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: COLORS.gray400 }}>EUR ({fraisNotaire}%)</div>
              </div>
              <div style={{ background: COLORS.navyLight, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '4px', fontWeight: '600' }}>COÛT TOTAL OPÉRATION</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: COLORS.red }}>{coutOperation.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: COLORS.gray400 }}>EUR</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <ResultCard label="CAPITAL EMPRUNTÉ" value={`${montantEmprunte.toLocaleString()} EUR`} sublabel="Prix + notaire - apport" color={COLORS.blue} />
            <ResultCard label="MENSUALITÉ TOTALE" value={`${mensualiteCredit.toLocaleString()} EUR`} sublabel={`${mensualiteHorsAssurance.toLocaleString()} crédit + ${mensualiteAssurance.toLocaleString()} assurance`} color={COLORS.green} />
            <ResultCard label="COÛT TOTAL INTÉRÊTS" value={`${coutInterets.toLocaleString()} EUR`} color={COLORS.red} />
            <ResultCard label="COÛT TOTAL ASSURANCE" value={`${coutAssurance.toLocaleString()} EUR`} sublabel={`sur ${dureeCredit} ans`} color={COLORS.purple} />
          </div>

          {/* TAUX D'ENDETTEMENT RÉSULTANT */}
          {revenusSitu > 0 && (
            <div style={{ background: tauxBg, borderRadius: '14px', padding: '18px 20px', marginBottom: '16px', borderLeft: `4px solid ${tauxColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: tauxColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Taux d'endettement résultant</div>
                  <div style={{ fontSize: '13px', color: COLORS.gray600 }}>
                    {(typeProjet === 'primo' || typeProjet === 'principale') ? 'Loyer remplacé par la nouvelle mensualité' : 'Loyer conservé dans les charges'}
                    {typeProjet === 'locatif' && ` · +${Math.round(loyerLocatifSimu * 0.7).toLocaleString()} EUR/mois de revenus locatifs`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '36px', fontWeight: '800', color: tauxColor, lineHeight: 1 }}>{tauxEndettementSimu}%</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: tauxColor, marginTop: '4px' }}>{tauxLabel}</div>
                </div>
              </div>
            </div>
          )}

          {/* AMORTISSEMENT */}
          <div style={cardStyle}>
            <div style={sectionTitle}>Amortissement du crédit</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataCredit} barSize={8}>
                <XAxis dataKey="an" tick={{ fontSize: 10, fill: COLORS.gray400 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: COLORS.gray400 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `${v.toLocaleString()} EUR`} contentStyle={{ background: COLORS.navy, border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="capitalRembourse" name="Capital remboursé" fill={COLORS.green} stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="capitalRestant" name="Capital restant" fill={COLORS.red} stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DISCLAIMER */}
          <div style={{ background: COLORS.gray50, borderRadius: '12px', padding: '16px 18px', border: `1px solid ${COLORS.gray200}`, fontSize: '12px', color: COLORS.gray600, lineHeight: '1.7' }}>
            <div style={{ fontWeight: '700', color: COLORS.navy, marginBottom: '6px', fontSize: '13px' }}>Avertissement important</div>
            Cette simulation est fournie à titre indicatif uniquement. Elle ne constitue pas une offre de crédit ni un engagement de financement. L'acceptation d'un crédit dépend de l'analyse complète de votre dossier par l'établissement prêteur. Les taux et conditions peuvent varier. Consultez un courtier ou conseiller financier agréé avant toute décision.
          </div>
        </>
      )}
    </div>
  )
}