export default function Alertes() {
  const alertes = [
    { type: 'warning', titre: 'Charges fixes elevees', desc: 'Vos charges fixes representent 57% de vos revenus. Le seuil recommande est 50%.', action: 'Revoir vos abonnements et contrats', priorite: 'Haute' },
    { type: 'warning', titre: 'Epargne ameliorable', desc: 'Votre taux epargne de 18% est bon mais vous pouvez viser 20%.', action: 'Augmenter virement automatique epargne', priorite: 'Moyenne' },
    { type: 'info', titre: 'Renouvellement assurance', desc: 'Votre assurance habitation arrive a echeance dans 2 mois.', action: 'Comparer les assurances en ligne', priorite: 'Faible' },
    { type: 'success', titre: 'Fonds urgence constitue', desc: 'Votre epargne de precaution couvre 6,2 mois de depenses. Objectif atteint !', action: 'Aucune action requise', priorite: 'OK' },
    { type: 'success', titre: 'Taux endettement sain', desc: 'Votre taux endettement de 28% est dans la zone verte.', action: 'Aucune action requise', priorite: 'OK' },
    { type: 'success', titre: 'Revenus stables', desc: 'Vos revenus sont stables depuis 12 mois consecutifs.', action: 'Aucune action requise', priorite: 'OK' },
  ]

  const couleurs = {
    warning: { bg: '#fefce8', border: '#fde047', badge: '#854d0e', badgeBg: '#fef9c3' },
    info: { bg: '#eff6ff', border: '#93c5fd', badge: '#1d4ed8', badgeBg: '#dbeafe' },
    success: { bg: '#f0fdf4', border: '#86efac', badge: '#15803d', badgeBg: '#dcfce7' },
  }

  return (
    <div style={{padding:'16px', maxWidth:'600px', margin:'0 auto'}}>
      <h2 style={{fontSize:'20px', fontWeight:'bold', color:'#1f2937', marginBottom:'16px'}}>Alertes et points de vigilance</h2>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'16px'}}>
        {[
          { label: 'Critiques', count: alertes.filter(a => a.type === 'warning').length, bg: '#fefce8', color: '#854d0e' },
          { label: 'Infos', count: alertes.filter(a => a.type === 'info').length, bg: '#eff6ff', color: '#1d4ed8' },
          { label: 'Positifs', count: alertes.filter(a => a.type === 'success').length, bg: '#f0fdf4', color: '#15803d' },
        ].map(s => (
          <div key={s.label} style={{background:s.bg, borderRadius:'12px', padding:'12px', textAlign:'center'}}>
            <div style={{fontSize:'28px', fontWeight:'bold', color:s.color}}>{s.count}</div>
            <div style={{fontSize:'12px', color:s.color}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        {alertes.map((alerte, i) => {
          const c = couleurs[alerte.type]
          return (
            <div key={i} style={{background:c.bg, border:`1px solid ${c.border}`, borderRadius:'12px', padding:'16px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                <span style={{fontSize:'12px', padding:'2px 8px', borderRadius:'9999px', background:c.badgeBg, color:c.badge, fontWeight:'500'}}>{alerte.priorite}</span>
                <span style={{fontWeight:'600', color:'#1f2937', fontSize:'14px'}}>{alerte.titre}</span>
              </div>
              <div style={{fontSize:'13px', color:'#4b5563', marginBottom:'6px'}}>{alerte.desc}</div>
              <div style={{fontSize:'12px', color:'#6b7280'}}>
                <span style={{fontWeight:'500'}}>Action : </span>{alerte.action}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}