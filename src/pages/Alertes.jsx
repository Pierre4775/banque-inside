export default function Alertes() {
  const alertes = [
    { type: 'warning', titre: 'Charges fixes elevees', desc: 'Vos charges fixes representent 57% de vos revenus. Le seuil recommande est 50%.', action: 'Revoir vos abonnements et contrats', priorite: 'Haute' },
    { type: 'warning', titre: 'Epargne ameliorable', desc: 'Votre taux epargne de 18% est bon mais vous pouvez viser 20% pour atteindre vos objectifs plus vite.', action: 'Augmenter virement automatique epargne', priorite: 'Moyenne' },
    { type: 'info', titre: 'Renouvellement assurance', desc: 'Votre assurance habitation arrive a echeance dans 2 mois. Profitez-en pour comparer les offres.', action: 'Comparer les assurances en ligne', priorite: 'Faible' },
    { type: 'success', titre: 'Fonds urgence constitue', desc: 'Votre epargne de precaution couvre 6,2 mois de depenses. Objectif atteint !', action: 'Aucune action requise', priorite: 'OK' },
    { type: 'success', titre: 'Taux endettement sain', desc: 'Votre taux endettement de 28% est dans la zone verte (inferieur a 33%).', action: 'Aucune action requise', priorite: 'OK' },
    { type: 'success', titre: 'Revenus stables', desc: 'Vos revenus sont stables depuis 12 mois consecutifs. Bonne base financiere.', action: 'Aucune action requise', priorite: 'OK' },
  ]

  const couleurs = {
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-700', icon: 'WARN' },
    info: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-100 text-blue-700', icon: 'INFO' },
    success: { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-100 text-green-700', icon: 'OK' },
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Alertes et points de vigilance</h2>

      <div className="grid grid-cols-3 gap-4 mb-2">
        {[
          { label: 'Points critiques', count: alertes.filter(a => a.type === 'warning').length, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Informations', count: alertes.filter(a => a.type === 'info').length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Points positifs', count: alertes.filter(a => a.type === 'success').length, color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <div className="text-3xl font-bold">{s.count}</div>
            <div className="text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {alertes.map((alerte, i) => {
          const c = couleurs[alerte.type]
          return (
            <div key={i} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{alerte.priorite}</span>
                    <span className="font-semibold text-gray-800">{alerte.titre}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{alerte.desc}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="font-medium">Action :</span> {alerte.action}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}