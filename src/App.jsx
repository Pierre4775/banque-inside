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
  { label: 'Dashboard', icon: 'DB' },
  { label: 'Saisie donnees', icon: 'SD', sub: 'Revenus, depenses, credits' },
  { label: 'Analyse bancaire', icon: 'AB', sub: 'Score et indicateurs' },
  { label: 'Patrimoine net', icon: 'PN', sub: 'Actifs, passifs, evolution' },
  { label: 'Simulations', icon: 'SI', sub: 'Projections et scenarios' },
  { label: 'Alertes', icon: 'AL', sub: 'Points de vigilance' },
  { label: 'Recommandations', icon: 'RE', sub: 'Plan action personnalise' },
  { label: 'Guide utilisation', icon: 'GU', sub: 'Mode emploi' },
]

function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Score financier global</div>
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={`${82 * 2.51} ${100 * 2.51}`}/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">82</span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <div className="text-green-600 font-semibold mt-1">Profil solide</div>
            <div className="text-xs text-green-500 text-center mt-1">Votre profil financier est bon. Continuez ainsi !</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Patrimoine net</div>
          <div className="text-3xl font-bold">45 200 EUR</div>
          <div className="text-green-500 text-sm font-medium mt-1">+12% / an</div>
          <div className="text-xs text-gray-400">vs mois dernier</div>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={patrimoine}>
              <Line type="monotone" dataKey="valeur" stroke="#2563eb" dot={false} strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-400 text-center">Evolution sur 12 mois</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Taux endettement</div>
          <div className="text-3xl font-bold">28%</div>
          <div className="text-green-500 text-sm font-medium mt-1">OK</div>
          <div className="mt-3 h-3 rounded-full overflow-hidden flex">
            <div className="bg-green-500 flex-1"/>
            <div className="bg-yellow-400 w-1/6"/>
            <div className="bg-red-500 w-1/4"/>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>33%</span><span>50%</span><span>100%</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Epargne mensuelle</div>
          <div className="text-3xl font-bold">850 EUR</div>
          <div className="text-green-500 text-sm font-medium mt-1">18%</div>
          <div className="text-xs text-gray-400">Taux epargne</div>
          <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">Objectif : 15 a 20%</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Depenses mensuelles</div>
          <div className="flex items-center gap-4">
            <PieChart width={120} height={120}>
              <Pie data={depenses} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value">
                {depenses.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
              </Pie>
            </PieChart>
            <div className="text-xs space-y-1">
              {depenses.map(d => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{background: d.color}}/>
                  <span className="text-gray-600">{d.name}</span>
                  <span className="ml-2 font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Evolution patrimoine</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={patrimoine}>
              <XAxis dataKey="mois" tick={{fontSize: 10}}/>
              <YAxis tick={{fontSize: 10}}/>
              <Tooltip/>
              <Line type="monotone" dataKey="valeur" stroke="#1e3a5f" strokeWidth={2} dot={{r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Projection 10 ans</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={[
              {an:'1',prudent:5000,realiste:5000,optimiste:5000},
              {an:'4',prudent:28000,realiste:35000,optimiste:50000},
              {an:'7',prudent:55000,realiste:90000,optimiste:150000},
              {an:'10',prudent:95000,realiste:168000,optimiste:267000},
            ]}>
              <XAxis dataKey="an" tick={{fontSize: 10}}/>
              <YAxis tick={{fontSize: 10}}/>
              <Tooltip/>
              <Line type="monotone" dataKey="prudent" stroke="#2563eb" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="realiste" stroke="#16a34a" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="optimiste" stroke="#ca8a04" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Alertes</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'WARN', title: 'Epargne', msg: "Taux correct mais ameliorable.", warn: true },
              { icon: 'WARN', title: 'Charges fixes', msg: "57% de vos revenus.", warn: true },
              { icon: 'OK', title: 'Stabilite revenus', msg: "Bonne stabilite sur 12 mois.", warn: false },
              { icon: 'OK', title: 'Fonds urgence', msg: "Couvre 6,2 mois de depenses.", warn: false },
            ].map(a => (
              <div key={a.title} className={`p-3 rounded-lg text-xs ${a.warn ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="font-semibold mb-1">{a.title}</div>
                <div className="text-gray-600">{a.msg}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Capacite emprunt</div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Montant empruntable</div>
              <div className="text-3xl font-bold">182 000 EUR</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Mensualite maximale</div>
              <div className="text-3xl font-bold">890 EUR<span className="text-sm font-normal text-gray-500"> / mois</span></div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
            Taux endettement apres projet : 32% (zone saine)
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('Dashboard')

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
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="font-bold text-lg">BANQUE INSIDE</div>
          <div className="text-xs text-slate-400">ANALYSE FINANCIERE PERSONNELLE</div>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${active === item.label ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{item.label}</span>
              </div>
              {item.sub && <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>}
            </button>
          ))}
        </nav>
        <div className="p-3 m-3 bg-slate-800 rounded-lg text-xs text-slate-300">
          <div className="font-medium text-yellow-400 mb-1">Conseil du jour</div>
          Augmentez votre taux epargne mensuel pour renforcer votre profil financier.
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-sm">
              <div className="text-xs text-slate-400">Profil</div>
              <div className="font-medium">Dupont Julien</div>
            </div>
            <div className="text-sm">
              <div className="text-xs text-slate-400">Derniere mise a jour</div>
              <div className="font-medium">12/05/2025</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            MODELE INSPIRE DES ANALYSES BANCAIRES SIMPLIFIEES
          </div>
        </div>
        {renderPage()}
      </div>
    </div>
  )
}