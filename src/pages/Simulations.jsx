import { useState } from 'react'
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

function SliderRow({ label, value, min, max, step, onChange, format }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: COLORS.gray600, fontWeight: '500' }}>{label}</span>
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
        style={{ width: '100%', accentColor: COLORS.blue, height: '4px' }}
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

export default function Simulations() {
  const [familleActive, setFamilleActive] = useState('epargne')
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
  const [tauxCredit, setTauxCredit] = useState(3.5)
  const [dureeCredit, setDureeCredit] = useState(20)
  const [apport, setApport] = useState(20000)

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

  const montantEmprunte = montantCredit - apport
  const r = tauxCredit / 100 / 12
  const n = dureeCredit * 12
  const mensualiteCredit = r > 0 ? Math.round(montantEmprunte * r / (1 - Math.pow(1 + r, -n))) : Math.round(montantEmprunte / n)
  const coutTotal = mensualiteCredit * n
  const coutInterets = coutTotal - montantEmprunte

  const dataCredit = Array.from({ length: dureeCredit }, (_, i) => {
    const an = i + 1
    const capitalRembourse = Math.round(montantEmprunte * (1 - Math.pow(1 + r, -(n - an * 12)) / (1 - Math.pow(1 + r, -n))))
    const capitalRestant = montantEmprunte - capitalRembourse
    return {
      an: `${an}`,
      capitalRestant: Math.max(0, capitalRestant),
      capitalRembourse: Math.min(montantEmprunte, capitalRembourse),
    }
  })

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Simulations et projections</h1>
        <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0 }}>Projetez l'évolution de votre épargne et simulez vos crédits</p>
      </div>

      {/* TOGGLE FAMILLE */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: COLORS.white, padding: '4px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
        {[
          { key: 'epargne', label: '💰 Épargne', desc: 'Projections court, moyen et long terme' },
          { key: 'credit', label: '🏦 Crédit', desc: 'Simulation de prêt immobilier' },
        ].map(f => (
          <button key={f.key} onClick={() => setFamilleActive(f.key)} style={{
            flex: 1, padding: '12px 16px', borderRadius: '10px', border: 'none',
            background: familleActive === f.key ? COLORS.navy : 'transparent',
            color: familleActive === f.key ? 'white' : COLORS.gray600,
            fontWeight: familleActive === f.key ? '700' : '400',
            cursor: 'pointer', fontSize: '14px', transition: 'all 0.25s ease',
            textAlign: 'left',
          }}>
            <div>{f.label}</div>
            <div style={{ fontSize: '11px', color: familleActive === f.key ? COLORS.gray400 : COLORS.gray400, marginTop: '2px' }}>{f.desc}</div>
          </button>
        ))}
      </div>

      {/* FAMILLE EPARGNE */}
      {familleActive === 'epargne' && (
        <>
          {/* EPARGNE TOTALE */}
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

          {/* COURT TERME */}
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

          {/* MOYEN TERME */}
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

          {/* LONG TERME */}
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

      {/* FAMILLE CREDIT */}
      {familleActive === 'credit' && (
        <>
          <div style={cardStyle}>
            <div style={sectionTitle}>🏦 Paramètres du crédit</div>
            <SliderRow label="Prix du bien" value={montantCredit} min={50000} max={1000000} step={5000} onChange={setMontantCredit} format={v => `${v.toLocaleString()} EUR`} />
            <SliderRow label="Apport personnel" value={apport} min={0} max={Math.round(montantCredit * 0.5)} step={1000} onChange={setApport} format={v => `${v.toLocaleString()} EUR`} />
            <SliderRow label="Taux d'intérêt" value={tauxCredit} min={0.5} max={8} step={0.1} onChange={setTauxCredit} format={v => `${v}%`} />
            <SliderRow label="Durée du crédit" value={dureeCredit} min={5} max={30} onChange={setDureeCredit} format={v => `${v} ans`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <ResultCard label="MONTANT EMPRUNTÉ" value={`${montantEmprunte.toLocaleString()} EUR`} color={COLORS.blue} />
            <ResultCard label="MENSUALITÉ" value={`${mensualiteCredit.toLocaleString()} EUR`} sublabel="par mois" color={COLORS.green} />
            <ResultCard label="COÛT TOTAL INTÉRÊTS" value={`${coutInterets.toLocaleString()} EUR`} color={COLORS.red} />
            <ResultCard label="COÛT TOTAL CRÉDIT" value={`${coutTotal.toLocaleString()} EUR`} color={COLORS.amber} />
          </div>

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

          <div style={{ padding: '14px 16px', background: COLORS.amberLight, borderRadius: '10px', fontSize: '12px', color: COLORS.amber, fontWeight: '500', borderLeft: `3px solid ${COLORS.amber}` }}>
            ⚠️ Simulation indicative uniquement. Consultez un professionnel agréé avant toute décision financière.
          </div>
        </>
      )}
    </div>
  )
}