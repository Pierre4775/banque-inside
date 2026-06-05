import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import SaisieDonnees from './pages/SaisieDonnees'
import AnalyseBancaire from './pages/AnalyseBancaire'
import Simulations from './pages/Simulations'
import Alertes from './pages/Alertes'
import Login from './pages/Login'
import PatrimoineNet from './pages/PatrimoineNet'
import { supabase } from './supabase'

const navItems = [
  { label: 'Dashboard' },
  { label: 'Saisie donnees', sub: 'Revenus, depenses, credits' },
  { label: 'Analyse bancaire', sub: 'Score et indicateurs' },
  { label: 'Patrimoine net', sub: 'Actifs, passifs, evolution' },
  { label: 'Simulations', sub: 'Projections et scenarios' },
  { label: 'Alertes', sub: 'Points de vigilance' },
  { label: 'Recommandations', sub: 'Plan action personnalise' },
  { label: 'Guide utilisation', sub: 'Mode emploi' },
]

const S = {
  app: { display:'flex', minHeight:'100vh', background:'#f3f4f6', fontFamily:'sans-serif' },
  sidebar: { width:'256px', background:'#0f172a', color:'white', display:'flex', flexDirection:'column', flexShrink:0 },
  sidebarHeader: { padding:'16px', borderBottom:'1px solid #334155' },
  sidebarTitle: { fontWeight:'bold', fontSize:'18px' },
  sidebarSub: { fontSize:'12px', color:'#94a3b8' },
  nav: { flex:1, padding:'8px' },
  navBtn: (active) => ({ width:'100%', textAlign:'left', padding:'12px', borderRadius:'8px', marginBottom:'4px', background: active ? '#2563eb' : 'transparent', border:'none', color:'white', cursor:'pointer' }),
  navLabel: { fontSize:'14px', fontWeight:'500' },
  navSub: { fontSize:'12px', color:'#94a3b8', marginTop:'2px' },
  tip: { padding:'12px', margin:'12px', background:'#1e293b', borderRadius:'8px', fontSize:'12px', color:'#cbd5e1' },
  tipTitle: { fontWeight:'500', color:'#facc15', marginBottom:'4px' },
  main: { flex:1, overflow:'auto' },
  header: { background:'#0f172a', color:'white', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  headerLeft: { display:'flex', alignItems:'center', gap:'16px' },
  menuBtn: { background:'none', border:'none', color:'white', fontSize:'24px', cursor:'pointer' },
  profileLabel: { fontSize:'12px', color:'#94a3b8' },
  profileName: { fontWeight:'500' },
  overlay: { position:'fixed', inset:0, background:'#0f172a', zIndex:50, color:'white', display:'flex', flexDirection:'column' },
  overlayHeader: { padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #334155' },
  closeBtn: { background:'none', border:'none', color:'white', fontSize:'28px', cursor:'pointer' },
  page: { padding:'24px', display:'flex', flexDirection:'column', gap:'24px' },
  grid4: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'16px' },
  grid3: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px' },
  grid2: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px' },
  card: { background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize:'11px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', marginBottom:'12px' },
  bigNum: { fontSize:'30px', fontWeight:'bold' },
  green: { color:'#22c55e', fontSize:'14px', fontWeight:'500', marginTop:'4px' },
  muted: { fontSize:'12px', color:'#9ca3af' },
}

function DashboardPage({ profil, vueMode, setVueMode }) {
  if (!profil) return <div style={{padding:'24px', color:'#6b7280'}}>Chargement...</div>

  const estFoyer = profil.situation === 'foyer'

  // Revenus selon le mode (revenus fonciers déjà divisés par 2 si commun dans saisie)
  const revenus1 = Math.round((profil.salaire || 0) + (profil.revenus_fonciers || 0) + (profil.autres_revenus || 0))
  const revenus2 = Math.round((profil.salaire2 || 0) + (profil.revenus_fonciers2 || 0) + (profil.autres_revenus2 || 0))
  const totalRevenus = vueMode === 'foyer' ? revenus1 + revenus2 : revenus1

  // Depenses selon le mode
  const depenses1 = Math.round((profil.logement || 0) + (profil.alimentation || 0) + (profil.transports || 0) + (profil.loisirs || 0) + (profil.sante || 0) + (profil.autres_depenses || 0))
  const depenses2 = Math.round((profil.logement2 || 0) + (profil.alimentation2 || 0) + (profil.transports2 || 0) + (profil.loisirs2 || 0) + (profil.sante2 || 0) + (profil.autres_depenses2 || 0))
  const totalDepenses = vueMode === 'foyer' ? depenses1 + depenses2 : depenses1

  // Credits — mensualité entière même si commun
  const creditsImmo = profil.credits_immo || []
  const creditsAutre = profil.credits_autre || []
  const totalMensualites = Math.round([...creditsImmo, ...creditsAutre].reduce((a, c) => {
    return a + (parseFloat(c.mensualite) || 0)
  }, 0))

  // Loyer pour taux endettement
  const loyer = vueMode === 'foyer'
    ? Math.round((profil.logement || 0) + (profil.logement2 || 0))
    : Math.round(profil.logement || 0)

  // Charges totales pour taux endettement = crédits + loyer
  const chargesEndettement = totalMensualites + loyer

  // Taux endettement bancaire réel
  const tauxEndettement = totalRevenus > 0 ? Math.round((chargesEndettement / totalRevenus) * 100) : 0

  // Reste à vivre = revenus - crédits - loyer
  const resteAVivre = totalRevenus - chargesEndettement

  // Epargne disponible = revenus - toutes dépenses - crédits
  const epargne = totalRevenus - totalDepenses - totalMensualites
  const tauxEpargne = totalRevenus > 0 ? Math.round((epargne / totalRevenus) * 100) : 0

  const score = Math.min(100, Math.max(0, Math.round(50 + tauxEpargne - tauxEndettement)))
  const capaciteEmprunt = Math.round(totalRevenus * 0.33 * 12 * 20)
  const mensualiteMax = Math.round(totalRevenus * 0.33)

  const depensesBase = vueMode === 'foyer' ? {
    logement: (profil.logement || 0) + (profil.logement2 || 0),
    alimentation: (profil.alimentation || 0) + (profil.alimentation2 || 0),
    transports: (profil.transports || 0) + (profil.transports2 || 0),
    loisirs: (profil.loisirs || 0) + (profil.loisirs2 || 0),
    sante: (profil.sante || 0) + (profil.sante2 || 0),
    autres: (profil.autres_depenses || 0) + (profil.autres_depenses2 || 0),
  } : {
    logement: profil.logement || 0,
    alimentation: profil.alimentation || 0,
    transports: profil.transports || 0,
    loisirs: profil.loisirs || 0,
    sante: profil.sante || 0,
    autres: profil.autres_depenses || 0,
  }

  const depensesData = [
    { name: 'Logement', value: depensesBase.logement, color: '#1e3a5f' },
    { name: 'Alimentation', value: depensesBase.alimentation, color: '#2563eb' },
    { name: 'Transports', value: depensesBase.transports, color: '#16a34a' },
    { name: 'Loisirs', value: depensesBase.loisirs, color: '#ca8a04' },
    { name: 'Sante', value: depensesBase.sante, color: '#dc2626' },
    { name: 'Autres', value: depensesBase.autres, color: '#9ca3af' },
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

  return (
    <div style={S.page}>

      {estFoyer && (
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <span style={{fontSize:'14px', color:'#6b7280', fontWeight:'500'}}>Vue :</span>
          {['personnel', 'foyer'].map(mode => (
            <button key={mode} onClick={() => setVueMode(mode)} style={{
              padding:'8px 16px', borderRadius:'8px', border: vueMode === mode ? '2px solid #2563eb' : '1px solid #d1d5db',
              background: vueMode === mode ? '#eff6ff' : 'white', color: vueMode === mode ? '#2563eb' : '#374151',
              fontWeight: vueMode === mode ? '600' : '400', cursor:'pointer', fontSize:'14px'
            }}>
              {mode === 'personnel' ? '👤 Personnel' : '👨‍👩‍👧 Foyer'}
            </button>
          ))}
          <span style={{fontSize:'12px', color:'#9ca3af'}}>
            {vueMode === 'foyer' ? 'Donnees combinees des deux conjoints' : 'Donnees du Conjoint 1 uniquement'}
          </span>
        </div>
      )}

      <div style={S.grid4}>
        <div style={S.card}>
          <div style={S.cardTitle}>Score financier global</div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <div style={{position:'relative', width:'96px', height:'96px'}}>
              <svg viewBox="0 0 100 100" style={{width:'100%', height:'100%', transform:'rotate(-90deg)'}}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={`${score*2.51} ${100*2.51}`}/>
              </svg>
              <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                <span style={{fontSize:'24px', fontWeight:'bold'}}>{score}</span>
                <span style={{fontSize:'12px', color:'#9ca3af'}}>/100</span>
              </div>
            </div>
            <div style={{color:'#16a34a', fontWeight:'600', marginTop:'4px'}}>{score >= 70 ? 'Profil solide' : score >= 50 ? 'Profil correct' : 'A ameliorer'}</div>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Epargne mensuelle {vueMode === 'foyer' ? '(foyer)' : '(personnel)'}</div>
          <div style={S.bigNum}>{epargne.toLocaleString()} EUR</div>
          <div style={{...S.green, color: tauxEpargne >= 15 ? '#22c55e' : '#f59e0b'}}>{tauxEpargne}%</div>
          <div style={S.muted}>Taux epargne</div>
          <div style={{marginTop:'12px', padding:'8px', background:'#f9fafb', borderRadius:'8px', fontSize:'12px', color:'#6b7280', textAlign:'center'}}>Objectif : 15 a 20%</div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Taux endettement</div>
          <div style={S.bigNum}>{tauxEndettement}%</div>
          <div style={{...S.green, color: tauxEndettement <= 33 ? '#22c55e' : '#ef4444'}}>{tauxEndettement <= 33 ? 'OK' : 'Eleve'}</div>
          <div style={{fontSize:'11px', color:'#6b7280', marginTop:'4px'}}>
            Credits : {totalMensualites.toLocaleString()} EUR + Loyer : {loyer.toLocaleString()} EUR
          </div>
          <div style={{marginTop:'8px', height:'12px', borderRadius:'9999px', overflow:'hidden', display:'flex'}}>
            <div style={{background:'#22c55e', flex:1}}/>
            <div style={{background:'#facc15', width:'16%'}}/>
            <div style={{background:'#ef4444', width:'25%'}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#9ca3af', marginTop:'4px'}}>
            <span>0%</span><span>33%</span><span>50%</span><span>100%</span>
          </div>
          <div style={{marginTop:'12px', padding:'8px', background: resteAVivre >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius:'8px'}}>
            <div style={{fontSize:'11px', color:'#6b7280'}}>Reste a vivre</div>
            <div style={{fontSize:'18px', fontWeight:'bold', color: resteAVivre >= 0 ? '#15803d' : '#b91c1c'}}>{resteAVivre.toLocaleString()} EUR</div>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Revenus / Depenses {vueMode === 'foyer' ? '(foyer)' : '(personnel)'}</div>
          <div style={{fontSize:'14px', color:'#6b7280', marginBottom:'4px'}}>Revenus</div>
          <div style={{fontSize:'22px', fontWeight:'bold', color:'#1d4ed8'}}>{totalRevenus.toLocaleString()} EUR</div>
          <div style={{fontSize:'14px', color:'#6b7280', marginTop:'8px', marginBottom:'4px'}}>Depenses</div>
          <div style={{fontSize:'22px', fontWeight:'bold', color:'#dc2626'}}>{totalDepenses.toLocaleString()} EUR</div>
        </div>
      </div>

      <div style={S.grid3}>
        <div style={S.card}>
          <div style={S.cardTitle}>Depenses mensuelles</div>
          {depensesData.length > 0 ? (
            <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
              <PieChart width={120} height={120}>
                <Pie data={depensesData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value">
                  {depensesData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
              <div style={{fontSize:'12px', display:'flex', flexDirection:'column', gap:'4px'}}>
                {depensesData.map(d => (
                  <div key={d.name} style={{display:'flex', alignItems:'center', gap:'4px'}}>
                    <div style={{width:'8px', height:'8px', borderRadius:'50%', background:d.color}}/>
                    <span>{d.name}</span>
                    <span style={{marginLeft:'4px', fontWeight:'500'}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{color:'#9ca3af', fontSize:'14px'}}>Aucune depense saisie</div>}
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Evolution epargne (projection)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={patrimoine}>
              <XAxis dataKey="mois" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:10}}/>
              <Tooltip/>
              <Line type="monotone" dataKey="valeur" stroke="#1e3a5f" strokeWidth={2} dot={{r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Capacite emprunt</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'16px'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>Montant empruntable</div>
              <div style={{fontSize:'22px', fontWeight:'bold'}}>{capaciteEmprunt.toLocaleString()} EUR</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>Mensualite max</div>
              <div style={{fontSize:'22px', fontWeight:'bold'}}>{mensualiteMax.toLocaleString()} EUR</div>
            </div>
          </div>
          <div style={{marginTop:'16px', padding:'12px', background:'#f9fafb', borderRadius:'8px', fontSize:'12px', color:'#6b7280', textAlign:'center'}}>
            Taux endettement apres projet : {Math.min(100, tauxEndettement + 10)}%
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
    switch(active) {
      case 'Saisie donnees': return <SaisieDonnees/>
      case 'Analyse bancaire': return <AnalyseBancaire/>
      case 'Patrimoine net': return <PatrimoineNet/>
      case 'Simulations': return <Simulations/>
      case 'Alertes': return <Alertes/>
      default: return <DashboardPage profil={profil} vueMode={vueMode} setVueMode={setVueMode}/>
    }
  }

  if (!user) return <Login onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user))} />

  return (
    <div style={S.app}>
      <div style={{...S.sidebar, display: window.innerWidth < 768 ? 'none' : 'flex'}}>
        <div style={S.sidebarHeader}>
          <div style={S.sidebarTitle}>BANQUE INSIDE</div>
          <div style={S.sidebarSub}>ANALYSE FINANCIERE PERSONNELLE</div>
        </div>
        <nav style={S.nav}>
          {navItems.map(item => (
            <button key={item.label} onClick={() => setActive(item.label)} style={S.navBtn(active === item.label)}>
              <div style={S.navLabel}>{item.label}</div>
              {item.sub && <div style={S.navSub}>{item.sub}</div>}
            </button>
          ))}
        </nav>
        <div style={S.tip}>
          <div style={S.tipTitle}>Conseil du jour</div>
          Augmentez votre taux epargne mensuel.
        </div>
      </div>

      {menuOpen && (
        <div style={S.overlay}>
          <div style={S.overlayHeader}>
            <div style={S.sidebarTitle}>BANQUE INSIDE</div>
            <button style={S.closeBtn} onClick={() => setMenuOpen(false)}>×</button>
          </div>
          <nav style={S.nav}>
            {navItems.map(item => (
              <button key={item.label} onClick={() => { setActive(item.label); setMenuOpen(false) }} style={{...S.navBtn(active === item.label), fontSize:'16px', padding:'16px'}}>
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{padding:'16px'}}>
            <button onClick={deconnecter} style={{width:'100%', background:'#ef4444', color:'white', padding:'12px', borderRadius:'8px', border:'none', fontSize:'14px', cursor:'pointer'}}>
              Se deconnecter
            </button>
          </div>
        </div>
      )}

      <div style={S.main}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <button style={S.menuBtn} onClick={() => setMenuOpen(true)}>☰</button>
            <div>
              <div style={S.profileLabel}>Connecte en tant que</div>
              <div style={S.profileName}>{user.email}</div>
            </div>
          </div>
          <button onClick={deconnecter} style={{background:'#ef4444', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', fontSize:'12px', cursor:'pointer'}}>
            Deconnexion
          </button>
        </div>
        {renderPage()}
      </div>
    </div>
  )
}