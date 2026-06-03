import { useState } from 'react'
import { supabase } from '../supabase'

export default function SaisieDonnees() {
  const [revenus, setRevenus] = useState({ salaire: '', autres: '' })
  const [depenses, setDepenses] = useState({ logement: '', alimentation: '', transports: '', loisirs: '', sante: '', autres: '' })
  const [credits, setCredits] = useState({ mensualite: '', duree: '' })
  const [message, setMessage] = useState('')

  const totalDepenses = Object.values(depenses).reduce((a, b) => a + (parseFloat(b) || 0), 0)
  const totalRevenus = Object.values(revenus).reduce((a, b) => a + (parseFloat(b) || 0), 0)
  const epargne = totalRevenus - totalDepenses

  const sauvegarder = async () => {
    const { error } = await supabase.from('profils_financiers').insert([{
      salaire: parseFloat(revenus.salaire) || 0,
      autres_revenus: parseFloat(revenus.autres) || 0,
      logement: parseFloat(depenses.logement) || 0,
      alimentation: parseFloat(depenses.alimentation) || 0,
      transports: parseFloat(depenses.transports) || 0,
      loisirs: parseFloat(depenses.loisirs) || 0,
      sante: parseFloat(depenses.sante) || 0,
      autres_depenses: parseFloat(depenses.autres) || 0,
      mensualite_credit: parseFloat(credits.mensualite) || 0,
    }])
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Donnees sauvegardees !')
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Saisie des donnees financieres</h2>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Revenus mensuels</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Salaire net</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: 3000" value={revenus.salaire} onChange={e => setRevenus({...revenus, salaire: e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Autres revenus</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: 500" value={revenus.autres} onChange={e => setRevenus({...revenus, autres: e.target.value})}/>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 mt-4">
              <div className="text-xs text-blue-600">Total revenus</div>
              <div className="text-2xl font-bold text-blue-700">{totalRevenus.toLocaleString()} EUR</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Depenses mensuelles</h3>
          <div className="space-y-3">
            {[
              { key: 'logement', label: 'Logement', placeholder: '1050' },
              { key: 'alimentation', label: 'Alimentation', placeholder: '600' },
              { key: 'transports', label: 'Transports', placeholder: '450' },
              { key: 'loisirs', label: 'Loisirs', placeholder: '300' },
              { key: 'sante', label: 'Sante', placeholder: '300' },
              { key: 'autres', label: 'Autres', placeholder: '300' },
            ].map(item => (
              <div key={item.key}>
                <label className="text-xs text-gray-500 block mb-1">{item.label}</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder={item.placeholder} value={depenses[item.key]} onChange={e => setDepenses({...depenses, [item.key]: e.target.value})}/>
              </div>
            ))}
            <div className="bg-red-50 rounded-lg p-3 mt-2">
              <div className="text-xs text-red-600">Total depenses</div>
              <div className="text-2xl font-bold text-red-700">{totalDepenses.toLocaleString()} EUR</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Credits en cours</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Mensualite totale</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: 800" value={credits.mensualite} onChange={e => setCredits({...credits, mensualite: e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Duree restante (mois)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: 120" value={credits.duree} onChange={e => setCredits({...credits, duree: e.target.value})}/>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-700 pb-2 border-b">Bilan mensuel</h3>
            <div className={`rounded-lg p-4 ${epargne >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-xs ${epargne >= 0 ? 'text-green-600' : 'text-red-600'}`}>Epargne disponible</div>
              <div className={`text-3xl font-bold ${epargne >= 0 ? 'text-green-700' : 'text-red-700'}`}>{epargne.toLocaleString()} EUR</div>
            </div>
            {totalRevenus > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Taux epargne</div>
                <div className="text-xl font-bold text-gray-700">{Math.round((epargne / totalRevenus) * 100)}%</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={sauvegarder} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
        Sauvegarder et calculer mon score
      </button>
    </div>
  )
}