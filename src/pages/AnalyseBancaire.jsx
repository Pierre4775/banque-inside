export default function AnalyseBancaire() {
  const score = 82
  const indicateurs = [
    { label: 'Taux endettement', valeur: '28%', statut: 'bon', detail: 'Inferieur a 33% - zone verte' },
    { label: 'Taux epargne', valeur: '18%', statut: 'bon', detail: 'Entre 15 et 20% - objectif atteint' },
    { label: 'Stabilite revenus', valeur: '95%', statut: 'bon', detail: 'Revenus stables sur 12 mois' },
    { label: 'Charges fixes', valeur: '57%', statut: 'moyen', detail: 'Elevees - a surveiller' },
    { label: 'Fonds urgence', valeur: '6.2 mois', statut: 'bon', detail: 'Couvre plus de 6 mois de depenses' },
    { label: 'Diversification', valeur: '2/5', statut: 'moyen', detail: 'Peu de sources de revenus' },
  ]

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Analyse bancaire</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-4">Score financier global</div>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="10"
                strokeDasharray={`${score * 2.51} ${100 * 2.51}`}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{score}</span>
              <span className="text-sm text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="text-green-600 font-bold text-lg mt-2">Profil solide</div>
          <div className="text-xs text-gray-500 text-center mt-2">Votre profil financier est bon. Continuez ainsi !</div>
          <div className="w-full mt-4 space-y-2">
            {[
              { label: 'Excellent', min: 80, color: 'bg-green-500' },
              { label: 'Bon', min: 60, color: 'bg-yellow-400' },
              { label: 'A ameliorer', min: 0, color: 'bg-red-400' },
            ].map(n => (
              <div key={n.label} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded-full ${n.color}`}/>
                <span className="text-gray-500">{n.label} ({n.min}+)</span>
                {score >= n.min && <span className="ml-auto text-green-600 font-medium">Votre niveau</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-4">Detail des indicateurs</div>
          <div className="space-y-4">
            {indicateurs.map(ind => (
              <div key={ind.label} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${ind.statut === 'bon' ? 'bg-green-500' : 'bg-yellow-400'}`}/>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{ind.label}</div>
                  <div className="text-xs text-gray-400">{ind.detail}</div>
                </div>
                <div className={`text-sm font-bold ${ind.statut === 'bon' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {ind.valeur}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${ind.statut === 'bon' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {ind.statut === 'bon' ? 'Bon' : 'Moyen'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-4">Recommandations prioritaires</div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { num: '1', titre: 'Reduire charges fixes', desc: 'Vos charges fixes a 57% sont elevees. Ciblez 50% maximum.', urgence: 'haute' },
            { num: '2', titre: 'Diversifier revenus', desc: 'Ajoutez une source de revenus complementaire (freelance, investissement).', urgence: 'moyenne' },
            { num: '3', titre: 'Augmenter epargne', desc: 'Visez 20% d epargne mensuelle pour atteindre vos objectifs plus vite.', urgence: 'moyenne' },
          ].map(r => (
            <div key={r.num} className={`p-4 rounded-lg border-l-4 ${r.urgence === 'haute' ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'}`}>
              <div className="font-semibold text-gray-700 mb-1">{r.titre}</div>
              <div className="text-xs text-gray-500">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}