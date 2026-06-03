import { useState } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import SaisieDonnees from './pages/SaisieDonnees'
import AnalyseBancaire from './pages/AnalyseBancaire'
import Simulations from './pages/Simulations'
import Alertes from './pages/Alertes'

const depenses = [
  { name: 'Logement', value: 1050, color: '#1e3a5f' },
  { name: 'Alimentation', value: 600, color: '#2563eb' },
  { name: 'Transports', value: 450, color: '#16a34a' },
  { name: 'Loisirs', value: 300, color: '#ca8a04' },
  { name: 'Sante', value: 300, color: '#dc2626' },
  { name: 'Autres', value: 300, color: '#9ca3af' },
]

const patrimoine = [
  { mois: 'Juin', valeur: 18000 },
  { mois: 'Aout', valeur: 22000 },
  { mois: 'Oct', valeur: 28000 },
  { mois: 'Dec', valeur: 32000 },
  { mois: 'Fevr', valeur: 38000 },
  { mois: 'Avr', valeur: 42000 },
  { mois: 'Juin', valeur: 45200 },
]

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

function DashboardPage() {
  return (
    <div style={S.page}>
      <div style={S.grid4}>
        <div style={S.card}>
          <div style={S.cardTitle}>Score financier global</div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <div style={{position:'relative', width:'96px', height:'96px'}}>
              <svg viewBox="0 0 100 100" style={{width:'100%', height:'100%', transform:'rotate(-90deg)'}}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={`${82*2.51} ${100*2.51}`}/>
              </svg>
              <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                <span style={{fontSize:'24px', fontWeight:'bold'}}>82</span>
                <span style={{fontSize:'12px', color:'#9ca3af'}}>/100</span>
              </div>
            </div>
            <div style={{color:'#16a34a', fontWeight:'600', marginTop:'4px'}}>Profil solide</div>
            <div style={{fontSize:'12px', color:'#22c55e', textAlign:'center', marginTop:'4px'}}>Votre profil est bon !</div>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Patrimoine net</div>
          <div style={S.bigNum}>45 200 EUR</div>
          <div style={S.green}>+12% / an</div>
          <div style={S.muted}>vs mois dernier</div>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={patrimoine}>
              <Line type="monotone" dataKey="valeur" stroke="#2563eb" dot={false} strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Taux endettement</div>
          <div style={S.bigNum}>28%</div>
          <div style={S.green}>OK</div>
          <div style={{marginTop:'12px', height:'12px', borderRadius:'9999px', overflow:'hidden', display:'flex'}}>
            <div style={{background:'#22c55e', flex:1}}/>
            <div style={{background:'#facc15', width:'16%'}}/>
            <div style={{background:'#ef4444', width:'25%'}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#9ca3af', marginTop:'4px'}}>
            <span>0%</span><span>33%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Epargne mensuelle</div>
          <div style={S.bigNum}>850 EUR</div>
          <div style={S.green}>18%</div>
          <div style={S.muted}>Taux epargne</div>
          <div style={{marginTop:'12px', padding:'8px', background:'#f9fafb', borderRadius:'8px', fontSize:'12px', color:'#6b7280', textAlign:'center'}}>Objectif : 15 a 20%</div>
        </div>
      </div>

      <div style={S.grid3}>
        <div style={S.card}>
          <div style={S.cardTitle}>Depenses mensuelles</div>
          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <PieChart width={120} height={120}>
              <Pie data={depenses} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value">
                {depenses.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
            </PieChart>
            <div style={{fontSize:'12px', display:'flex', flexDirection:'column', gap:'4px'}}>
              {depenses.map(d => (
                <div key={d.name} style={{display:'flex', alignItems:'center', gap:'4px'}}>
                  <div style={{width:'8px', height:'8px', borderRadius:'50%', background:d.color}}/>
                  <span>{d.name}</span>
                  <span style={{marginLeft:'4px', fontWeight:'500'}}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Evolution patrimoine</div>
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
          <div style={S.cardTitle}>Projection 10 ans</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={[
              {an:'1',p:5000,r:5000,o:5000},
              {an:'4',p:28000,r:35000,o:50000},
              {an:'7',p:55000,r:90000,o:150000},
              {an:'10',p:95000,r:168000,o:267000},
            ]}>
              <XAxis dataKey="an" tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:10}}/>
              <Tooltip/>
              <Line type="monotone" dataKey="p" stroke="#2563eb" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="r" stroke="#16a34a" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="o" stroke="#ca8a04" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <div style={S.cardTitle}>Alertes</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            {[
              {title:'Epargne', msg:'Taux correct mais ameliorable.', warn:true},
              {title:'Charges fixes', msg:'57% de vos revenus.', warn:true},
              {title:'Stabilite revenus', msg:'Bonne stabilite sur 12 mois.', warn:false},
              {title:'Fonds urgence', msg:'Couvre 6,2 mois de depenses.', warn:false},
            ].map(a => (
              <div key={a.title} style={{padding:'12px', borderRadius:'8px', fontSize:'12px', background:a.warn?'#fefce8':'#f0fdf4', border:`1px solid ${a.warn?'#fde047':'#86efac'}`}}>
                <div style={{fontWeight:'600', marginBottom:'4px'}}>{a.title}</div>
                <div style={{color:'#4b5563'}}>{a.msg}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Capacite emprunt</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'16px'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>Montant empruntable</div>
              <div style={{fontSize:'26px', fontWeight:'bold'}}>182 000 EUR</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>Mensualite max</div>
              <div style={{fontSize:'26px', fontWeight:'bold'}}>890 EUR</div>
            </div>
          </div>
          <div style={{marginTop:'16px', padding:'12px', background:'#f9fafb', borderRadius:'8px', fontSize:'12px', color:'#6b7280', textAlign:'center'}}>
            Taux endettement apres projet : 32%
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  const isMobile = () => window.innerWidth < 768

  const renderPage = () => {
    switch(active) {
      case 'Saisie donnees': return <SaisieDonnees/>
      case 'Analyse bancaire': return <AnalyseBancaire/>
      case 'Simulations': return <Simulations/>
      case 'Alertes': return <Alertes/>
      default: return <DashboardPage/>
    }
  }

  return (
    <div style={S.app}>
      {/* Sidebar — cachee sur mobile via JS */}
      <div style={{...S.sidebar, display: isMobile() ? 'none' : 'flex'}}>
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

      {/* Menu mobile overlay */}
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
        </div>
      )}

      <div style={S.main}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <button style={S.menuBtn} onClick={() => setMenuOpen(true)}>☰</button>
            <div>
              <div style={S.profileLabel}>Profil</div>
              <div style={S.profileName}>Dupont Julien</div>
            </div>
          </div>
          <div style={{fontSize:'12px', color:'#94a3b8'}}>BANQUE INSIDE</div>
        </div>
        {renderPage()}
      </div>
    </div>
  )
}