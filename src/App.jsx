import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import SaisieDonnees from './pages/SaisieDonnees'
import AnalyseBancaire from './pages/AnalyseBancaire'
import Simulations from './pages/Simulations'
import Alertes from './pages/Alertes'
import Login from './pages/Login'
import PatrimoineNet from './pages/PatrimoineNet'
import { supabase } from './supabase'

function useCountUp(target, duration = 400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

function AnimatedNumber({ value, suffix = '' }) {
  const animated = useCountUp(value)
  return <span>{animated.toLocaleString()}{suffix}</span>
}

const COLORS = {
  navy: '#0f2744',
  navyLight: '#163459',
  blue: '#1a56db',
  blueLight: '#3b82f6',
  bluePale: '#eff6ff',
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray400: '#94a3b8',
  gray600: '#475569',
  gray800: '#1e293b',
  green: '#059669',
  greenLight: '#d1fae5',
  red: '#dc2626',
  redLight: '#fee2e2',
  amber: '#d97706',
  amberLight: '#fef3c7',
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
}

const TAUX_MARCHE = { 10: 3.20, 15: 3.40, 20: 3.55, 25: 3.75 }

const navItems = [
  { label: 'Dashboard', icon: '⊞' },
  { label: 'Saisie donnees', sub: 'Revenus, depenses, credits', icon: '✎' },
  { label: 'Analyse bancaire', sub: 'Score et indicateurs', icon: '◎' },
  { label: 'Patrimoine net', sub: 'Actifs, passifs, evolution', icon: '◈' },
  { label: 'Simulations', sub: 'Projections et scenarios', icon: '⟁' },
  { label: 'Alertes', sub: 'Points de vigilance', icon: '⚑' },
  { label: 'Recommandations', sub: 'Plan action personnalise', icon: '★' },
  { label: 'Guide utilisation', sub: 'Mode emploi', icon: '?' },
]

function StatCard({ title, children, accent }) {
  return (
    <div style={{
      background: COLORS.white, borderRadius: '16px', padding: '20px',
      boxShadow: '0 1px 4px rgba(15,39,68,0.08), 0 4px 16px rgba(15,39,68,0.04)',
      borderTop: `3px solid ${accent || COLORS.blue}`,
    }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{title}</div>
      {children}
    </div>
  )
}

function DashboardPage({ profil, vueMode, setVueMode, dureeEmprunt, setDureeEmprunt }) {
  if (!profil) return (
    <div style={{ padding: '48px', textAlign: 'center', color: COLORS.gray400 }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⟳</div>
      <div>Chargement de votre profil...</div>
    </div>
  )

  const estFoyer = profil.situation === 'foyer'
  const revenus1 = Math.round((profil.salaire || 0) + (profil.revenus_fonciers || 0) + (profil.autres_revenus || 0))
  const revenus2 = Math.round((profil.salaire2 || 0) + (profil.revenus_fonciers2 || 0) + (profil.autres_revenus2 || 0))
  const totalRevenus = vueMode === 'foyer' ? revenus1 + revenus2 : revenus1

  const depenses1 = Math.round((profil.logement || 0) + (profil.alimentation || 0) + (profil.transports || 0) + (profil.loisirs || 0) + (profil.sante || 0) + (profil.autres_depenses || 0) + (profil.impots || 0))
  const depenses2 = Math.round((profil.logement2 || 0) + (profil.alimentation2 || 0) + (profil.transports2 || 0) + (profil.loisirs2 || 0) + (profil.sante2 || 0) + (profil.autres_depenses2 || 0) + (profil.impots2 || 0))
  const totalDepenses = vueMode === 'foyer' ? depenses1 + depenses2 : depenses1

  const impots1 = profil.impots || 0
  const impots2 = profil.impots2 || 0
  const totalImpots = vueMode === 'foyer' ? impots1 + impots2 : impots1

  const depensesHorsImpots1 = depenses1 - impots1
  const depensesHorsImpots2 = depenses2 - impots2
  const totalDepensesHorsImpots = vueMode === 'foyer' ? depensesHorsImpots1 + depensesHorsImpots2 : depensesHorsImpots1

  const creditsImmo = profil.credits_immo || []
  const creditsAutre = profil.credits_autre || []
  const totalMensualites = Math.round([...creditsImmo, ...creditsAutre].reduce((a, c) => a + (parseFloat(c.mensualite) || 0), 0))

  const loyer = vueMode === 'foyer' ? Math.round((profil.logement || 0) + (profil.logement2 || 0)) : Math.round(profil.logement || 0)
  const chargesEndettement = totalMensualites + loyer

  const tauxEndettement = totalRevenus > 0 ? Math.round((chargesEndettement / totalRevenus) * 100) : 0
  const revenusApresImpots = totalRevenus - totalImpots
  const tauxEndettementApresImpots = revenusApresImpots > 0 ? Math.round((chargesEndettement / revenusApresImpots) * 100) : 0

  const resteAVivre = totalRevenus - chargesEndettement
  const resteAVivreApresImpots = revenusApresImpots - chargesEndettement

  const epargne = totalRevenus - totalDepenses - totalMensualites
  const tauxEpargne = totalRevenus > 0 ? Math.round((epargne / totalRevenus) * 100) : 0
  const score = Math.min(100, Math.max(0, Math.round(50 + tauxEpargne - tauxEndettement)))

  // Capacité emprunt avec taux marché
  const mensualiteMax = Math.round(Math.max(0, totalRevenus * 0.33 - totalMensualites))
  const r = TAUX_MARCHE[dureeEmprunt] / 100 / 12
  const n = dureeEmprunt * 12
  const capaciteEmprunt = mensualiteMax > 0 ? Math.round(mensualiteMax * (1 - Math.pow(1 + r, -n)) / r) : 0

  const depensesBase = vueMode === 'foyer' ? {
    logement: (profil.logement || 0) + (profil.logement2 || 0),
    alimentation: (profil.alimentation || 0) + (profil.alimentation2 || 0),
    transports: (profil.transports || 0) + (profil.transports2 || 0),
    loisirs: (profil.loisirs || 0) + (profil.loisirs2 || 0),
    sante: (profil.sante || 0) + (profil.sante2 || 0),
    impots: (profil.impots || 0) + (profil.impots2 || 0),
    autres: (profil.autres_depenses || 0) + (profil.autres_depenses2 || 0),
  } : {
    logement: profil.logement || 0,
    alimentation: profil.alimentation || 0,
    transports: profil.transports || 0,
    loisirs: profil.loisirs || 0,
    sante: profil.sante || 0,
    impots: profil.impots || 0,
    autres: profil.autres_depenses || 0,
  }

  const depensesData = [
    { name: 'Logement', value: depensesBase.logement, color: COLORS.navy },
    { name: 'Alimentation', value: depensesBase.alimentation, color: COLORS.blue },
    { name: 'Transports', value: depensesBase.transports, color: COLORS.green },
    { name: 'Loisirs', value: depensesBase.loisirs, color: COLORS.amber },
    { name: 'Impôts', value: depensesBase.impots, color: COLORS.purple },
    { name: 'Santé', value: depensesBase.sante, color: COLORS.red },
    { name: 'Autres', value: depensesBase.autres, color: COLORS.gray400 },
  ].filter(d => d.value > 0)

  const patrimoine = [
    { mois: 'M-6', valeur: Math.round(epargne * 1) },
    { mois: 'M-5', valeur: Math.round(epargne * 2) },
    { mois: 'M-4', valeur: Math.round(epargne * 3) },
    { mois: 'M-3', valeur: Math.round(epargne * 4) },
    { mois: 'M-2', valeur: Math.round(epargne * 5) },
    { mois: 'M-1', valeur: Math.round(epargne * 6) },
    { mois: 'Auj', valeur: Math.round(epargne * 7) },
  ]

  const scoreColor = score >= 70 ? COLORS.green : score >= 50 ? COLORS.amber : COLORS.red
  const scoreLabel = score >= 70 ? 'Profil solide' : score >= 50 ? 'Profil correct' : 'A améliorer'

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', background: COLORS.gray50, minHeight: '100%' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: 0 }}>Tableau de bord</h1>
          <p style={{ fontSize: '13px', color: COLORS.gray400, margin: '4px 0 0' }}>Vue d'ensemble de votre situation financière</p>
        </div>
        {estFoyer && (
          <div style={{ display: 'flex', gap: '8px', background: COLORS.white, padding: '4px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
            {['personnel', 'foyer'].map(mode => (
              <button key={mode} onClick={() => setVueMode(mode)} style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: vueMode === mode ? COLORS.navy : 'transparent',
                color: vueMode === mode ? 'white' : COLORS.gray600,
                fontWeight: vueMode === mode ? '600' : '400',
                cursor: 'pointer', fontSize: '13px', transition: 'all 0.3s ease'
              }}>
                {mode === 'personnel' ? '👤 Personnel' : '👨‍👩‍👧 Foyer'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

        <StatCard title="Score financier" accent={scoreColor}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke={COLORS.gray200} strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="10"
                  strokeDasharray={`${score * 2.51} ${100 * 2.51}`}
                  style={{ transition: 'stroke-dasharray 0.6s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: COLORS.navy }}>{score}</span>
                <span style={{ fontSize: '10px', color: COLORS.gray400 }}>/100</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: scoreColor }}>{scoreLabel}</div>
              <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '4px' }}>Indice de santé financière</div>
            </div>
          </div>
        </StatCard>

        <StatCard title={`Épargne mensuelle ${vueMode === 'foyer' ? '· Foyer' : ''}`} accent={COLORS.blue}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: COLORS.navy }}>
            <AnimatedNumber value={epargne} /> <span style={{ fontSize: '14px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
            <div style={{ padding: '3px 8px', borderRadius: '6px', background: tauxEpargne >= 15 ? COLORS.greenLight : COLORS.amberLight, color: tauxEpargne >= 15 ? COLORS.green : COLORS.amber, fontSize: '12px', fontWeight: '600' }}>
              {tauxEpargne}% épargne
            </div>
          </div>
          <div style={{ marginTop: '10px', padding: '8px 10px', background: COLORS.gray100, borderRadius: '8px', fontSize: '12px', color: COLORS.gray600 }}>
            Objectif : 15 à 20%
          </div>
        </StatCard>

        <StatCard title="Taux d'endettement" accent={tauxEndettement <= 33 ? COLORS.green : COLORS.red}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1, background: COLORS.gray50, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: COLORS.gray400, fontWeight: '700', letterSpacing: '0.04em', marginBottom: '4px' }}>AVANT IMPÔTS</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: tauxEndettement <= 33 ? COLORS.green : COLORS.red }}>
                <AnimatedNumber value={tauxEndettement} suffix="%" />
              </div>
            </div>
            <div style={{ flex: 1, background: COLORS.purpleLight, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: COLORS.purple, fontWeight: '700', letterSpacing: '0.04em', marginBottom: '4px' }}>APRÈS IMPÔTS</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: tauxEndettementApresImpots <= 33 ? COLORS.green : COLORS.red }}>
                <AnimatedNumber value={tauxEndettementApresImpots} suffix="%" />
              </div>
            </div>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: COLORS.gray200, overflow: 'hidden', marginBottom: '4px' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${Math.min(tauxEndettementApresImpots, 100)}%`,
              background: tauxEndettementApresImpots <= 33 ? COLORS.green : tauxEndettementApresImpots <= 50 ? COLORS.amber : COLORS.red,
              transition: 'width 0.6s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: COLORS.gray400, marginBottom: '10px' }}>
            <span>0%</span><span>33%</span><span>50%</span><span>100%</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, padding: '8px', borderRadius: '8px', background: resteAVivre >= 0 ? COLORS.greenLight : COLORS.redLight }}>
              <div style={{ fontSize: '10px', color: COLORS.gray600, fontWeight: '600' }}>AVANT IMPÔTS</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: resteAVivre >= 0 ? COLORS.green : COLORS.red }}>
                <AnimatedNumber value={resteAVivre} /> EUR
              </div>
            </div>
            <div style={{ flex: 1, padding: '8px', borderRadius: '8px', background: resteAVivreApresImpots >= 0 ? COLORS.purpleLight : COLORS.redLight }}>
              <div style={{ fontSize: '10px', color: COLORS.purple, fontWeight: '600' }}>APRÈS IMPÔTS</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: resteAVivreApresImpots >= 0 ? COLORS.purple : COLORS.red }}>
                <AnimatedNumber value={resteAVivreApresImpots} /> EUR
              </div>
            </div>
          </div>
        </StatCard>

        <StatCard title={`Revenus · Dépenses ${vueMode === 'foyer' ? '· Foyer' : ''}`} accent={COLORS.navy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: COLORS.bluePale, borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: COLORS.blue, fontWeight: '600' }}>REVENUS BRUTS</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: COLORS.navy }}>
                  <AnimatedNumber value={totalRevenus} /> <span style={{ fontSize: '12px', fontWeight: '400' }}>EUR</span>
                </div>
              </div>
              <div style={{ fontSize: '24px' }}>↑</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: COLORS.redLight, borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: COLORS.red, fontWeight: '600' }}>DÉPENSES TOTALES</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: COLORS.navy }}>
                  <AnimatedNumber value={totalDepenses} /> <span style={{ fontSize: '12px', fontWeight: '400' }}>EUR</span>
                </div>
              </div>
              <div style={{ fontSize: '24px' }}>↓</div>
            </div>
            {totalImpots > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: COLORS.purpleLight, borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.purple, fontWeight: '600' }}>DONT IMPÔTS</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.navy }}>
                    <AnimatedNumber value={totalImpots} /> <span style={{ fontSize: '12px', fontWeight: '400' }}>EUR</span>
                  </div>
                </div>
                <div style={{ fontSize: '18px' }}>🏛</div>
              </div>
            )}
          </div>
        </StatCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

        <div style={{ background: COLORS.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Répartition des dépenses</div>
          {depensesData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <PieChart width={110} height={110}>
                <Pie data={depensesData} cx={50} cy={50} innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                  {depensesData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                {depensesData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />
                      <span style={{ color: COLORS.gray600 }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: '600', color: COLORS.navy }}>{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ color: COLORS.gray400, fontSize: '14px', textAlign: 'center', padding: '20px' }}>Aucune dépense saisie</div>}
        </div>

        <div style={{ background: COLORS.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Projection épargne</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={patrimoine}>
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: COLORS.gray400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.gray400 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: COLORS.navy, border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} formatter={v => [`${v.toLocaleString()} EUR`]} />
              <Line type="monotone" dataKey="valeur" stroke={COLORS.blue} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: COLORS.navy, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Capacité d'emprunt</div>

          {/* TOGGLE DUREE */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: COLORS.navyLight, padding: '3px', borderRadius: '8px' }}>
            {[10, 15, 20, 25].map(d => (
              <button key={d} onClick={() => setDureeEmprunt(d)} style={{
                flex: 1, padding: '5px 0', borderRadius: '6px', border: 'none',
                background: dureeEmprunt === d ? 'white' : 'transparent',
                color: dureeEmprunt === d ? COLORS.navy : COLORS.gray400,
                fontWeight: dureeEmprunt === d ? '700' : '400',
                fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s ease'
              }}>
                {d}ans
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ textAlign: 'center', background: COLORS.navyLight, borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '6px' }}>Montant max</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>
                <AnimatedNumber value={Math.round(capaciteEmprunt / 1000)} suffix="k" />
              </div>
              <div style={{ fontSize: '11px', color: COLORS.gray400 }}>EUR</div>
            </div>
            <div style={{ textAlign: 'center', background: COLORS.navyLight, borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '6px' }}>Mensualité max</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>
                <AnimatedNumber value={mensualiteMax} />
              </div>
              <div style={{ fontSize: '11px', color: COLORS.gray400 }}>EUR/mois</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: COLORS.navyLight, borderRadius: '10px', fontSize: '11px', color: COLORS.gray400 }}>
            <span>Taux {TAUX_MARCHE[dureeEmprunt]}% · {dureeEmprunt} ans</span>
            <span>Endettement actuel : {tauxEndettement}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profil, setProfil] = useState(null)
  const [vueMode, setVueMode] = useState('personnel')
  const [dureeEmprunt, setDureeEmprunt] = useState(20)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) chargerProfil(session.user.id)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) chargerProfil(session.user.id)
    })
  }, [])

  useEffect(() => {
    if (user && active === 'Dashboard') chargerProfil(user.id)
  }, [active])

  const chargerProfil = async (userId) => {
    const { data } = await supabase
      .from('profils_financiers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) {
      setProfil(data[0])
      setVueMode(data[0].situation === 'foyer' ? 'foyer' : 'personnel')
    }
  }

  const deconnecter = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const renderPage = () => {
    const pages = {
      'Saisie donnees': <SaisieDonnees />,
      'Analyse bancaire': <AnalyseBancaire />,
      'Patrimoine net': <PatrimoineNet />,
      'Simulations': <Simulations />,
      'Alertes': <Alertes />,
    }
    return pages[active] || <DashboardPage profil={profil} vueMode={vueMode} setVueMode={setVueMode} dureeEmprunt={dureeEmprunt} setDureeEmprunt={setDureeEmprunt} />
  }

  if (!user) return <Login onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user))} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray50, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ width: '260px', background: COLORS.navy, color: 'white', display: window.innerWidth < 768 ? 'none' : 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '0.05em', color: 'white' }}>BANQUE INSIDE</div>
          <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '3px', letterSpacing: '0.08em' }}>ANALYSE FINANCIÈRE</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = active === item.label
            return (
              <button key={item.label} onClick={() => setActive(item.label)} style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                color: isActive ? 'white' : COLORS.gray400,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'all 0.25s ease',
              }}>
                <span style={{ fontSize: '14px', opacity: 0.7 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400' }}>{item.label}</div>
                  {item.sub && <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '1px' }}>{item.sub}</div>}
                </div>
                {isActive && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: COLORS.blueLight }} />}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '16px', margin: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#fbbf24', marginBottom: '6px', letterSpacing: '0.05em' }}>💡 CONSEIL DU JOUR</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400, lineHeight: '1.5' }}>Augmentez votre taux d'épargne mensuel pour optimiser votre patrimoine.</div>
        </div>
      </div>

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: COLORS.navy, zIndex: 50, color: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '16px', fontWeight: '800' }}>BANQUE INSIDE</div>
            <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }} onClick={() => setMenuOpen(false)}>×</button>
          </div>
          <nav style={{ flex: 1, padding: '12px 10px' }}>
            {navItems.map(item => (
              <button key={item.label} onClick={() => { setActive(item.label); setMenuOpen(false) }} style={{
                width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: '10px', marginBottom: '4px',
                background: active === item.label ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', color: 'white', cursor: 'pointer', fontSize: '15px'
              }}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: '16px' }}>
            <button onClick={deconnecter} style={{ width: '100%', background: COLORS.red, color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: COLORS.white, borderBottom: '1px solid ' + COLORS.gray200, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: COLORS.navy, fontSize: '20px', cursor: 'pointer', padding: '4px' }} onClick={() => setMenuOpen(true)}>☰</button>
            <div>
              <div style={{ fontSize: '11px', color: COLORS.gray400 }}>Connecté en tant que</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.navy }}>{user.email}</div>
            </div>
          </div>
          <button onClick={deconnecter} style={{
            background: 'transparent', color: COLORS.red, border: '1px solid ' + COLORS.red,
            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '500'
          }}>
            Déconnexion
          </button>
        </div>
        <div style={{ flex: 1 }}>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}