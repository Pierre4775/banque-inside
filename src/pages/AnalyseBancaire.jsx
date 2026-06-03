export default function AnalyseBancaire() {
  const score = 82
  const indicateurs = [
    { label: 'Taux endettement', valeur: '28%', statut: 'bon', detail: 'Inferieur a 33% - zone verte' },
    { label: 'Taux epargne', valeur: '18%', statut: 'bon', detail: 'Entre 15 et 20% - objectif atteint' },
    { label: 'Stabilite revenus', valeur: '95%', statut: 'bon', detail: 'Revenus stables sur 12 mois' },
    { label: 'Charges fixes', valeur: '57%', statut: 'moyen', detail: 'Elevees - a surveiller' },
    { label: 'Fonds urgence', valeur: '6.2 mois', statut: 'bon', detail: 'Couvre plus de 6 mois' },
    { label: 'Diversification', valeur: '2/5', statut: 'moyen', detail: 'Peu de sources de revenus' },
  ]

  return (
    <div style={{padding:'16px', maxWidth:'600px', margin:'0 auto'}}>
      <h2 style={{fontSize:'20px', fontWeight:'bold', color:'#1f2937', marginBottom:'16px'}}>Analyse bancaire</h2>

      <div style={{background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'16px', display:'flex', flexDirection:'column', alignItems:'center'}}>
        <div style={{fontSize:'11px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', marginBottom:'12px'}}>Score financier global</div>
        <div style={{position:'relative', width:'120px', height:'120px'}}>
          <svg viewBox="0 0 100 100" style={{width:'100%', height:'100%', transform:'rotate(-90deg)'}}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={`${score*2.51} ${100*2.51}`}/>
          </svg>
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
            <span style={{fontSize:'32px', fontWeight:'bold'}}>{score}</span>
            <span style={{fontSize:'12px', color:'#9ca3af'}}>/ 100</span>
          </div>
        </div>
        <div style={{color:'#16a34a', fontWeight:'bold', fontSize:'18px', marginTop:'8px'}}>Profil solide</div>
        <div style={{fontSize:'13px', color:'#6b7280', textAlign:'center', marginTop:'4px'}}>Votre profil financier est bon. Continuez ainsi !</div>
      </div>

      <div style={{background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'16px'}}>
        <div style={{fontSize:'11px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', marginBottom:'12px'}}>Detail des indicateurs</div>
        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          {indicateurs.map(ind => (
            <div key={ind.label} style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px', borderRadius:'8px', background:'#f9fafb'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', flexShrink:0, background: ind.statut === 'bon' ? '#22c55e' : '#facc15'}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:'14px', fontWeight:'500', color:'#374151'}}>{ind.label}</div>
                <div style={{fontSize:'12px', color:'#9ca3af'}}>{ind.detail}</div>
              </div>
              <div style={{fontSize:'14px', fontWeight:'bold', color: ind.statut === 'bon' ? '#16a34a' : '#ca8a04'}}>{ind.valeur}</div>
              <div style={{fontSize:'12px', padding:'2px 8px', borderRadius:'9999px', background: ind.statut === 'bon' ? '#dcfce7' : '#fef9c3', color: ind.statut === 'bon' ? '#15803d' : '#854d0e'}}>
                {ind.statut === 'bon' ? 'Bon' : 'Moyen'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
        <div style={{fontSize:'11px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', marginBottom:'12px'}}>Recommandations</div>
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {[
            {titre:'Reduire charges fixes', desc:'Vos charges fixes a 57% sont elevees. Ciblez 50% maximum.', urgence:'haute'},
            {titre:'Diversifier revenus', desc:'Ajoutez une source de revenus complementaire.', urgence:'moyenne'},
            {titre:'Augmenter epargne', desc:'Visez 20% epargne mensuelle pour atteindre vos objectifs.', urgence:'moyenne'},
          ].map(r => (
            <div key={r.titre} style={{padding:'12px', borderRadius:'8px', borderLeft:`4px solid ${r.urgence === 'haute' ? '#f87171' : '#facc15'}`, background: r.urgence === 'haute' ? '#fef2f2' : '#fefce8'}}>
              <div style={{fontWeight:'600', color:'#374151', marginBottom:'4px'}}>{r.titre}</div>
              <div style={{fontSize:'13px', color:'#6b7280'}}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}