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
}

export default function Alertes() {
  const alertes = [
    { type: 'warning', titre: 'Charges fixes élevées', desc: 'Vos charges fixes représentent 57% de vos revenus. Le seuil recommandé est 50%.', action: 'Revoir vos abonnements et contrats', priorite: 'Haute' },
    { type: 'warning', titre: 'Épargne améliorable', desc: 'Votre taux épargne de 18% est bon mais vous pouvez viser 20%.', action: 'Augmenter virement automatique épargne', priorite: 'Moyenne' },
    { type: 'info', titre: 'Renouvellement assurance', desc: 'Votre assurance habitation arrive à échéance dans 2 mois.', action: 'Comparer les assurances en ligne', priorite: 'Info' },
    { type: 'success', titre: 'Fonds urgence constitué', desc: 'Votre épargne de précaution couvre 6,2 mois de dépenses. Objectif atteint !', action: 'Aucune action requise', priorite: 'OK' },
    { type: 'success', titre: 'Taux endettement sain', desc: 'Votre taux endettement de 28% est dans la zone verte.', action: 'Aucune action requise', priorite: 'OK' },
    { type: 'success', titre: 'Revenus stables', desc: 'Vos revenus sont stables depuis 12 mois consécutifs.', action: 'Aucune action requise', priorite: 'OK' },
  ]

  const styles = {
    warning: {
      bg: COLORS.amberLight,
      border: '#fcd34d',
      badgeBg: '#fde68a',
      badgeColor: '#92400e',
      icon: '⚠',
      accentColor: COLORS.amber,
    },
    info: {
      bg: COLORS.bluePale,
      border: '#93c5fd',
      badgeBg: '#dbeafe',
      badgeColor: '#1d4ed8',
      icon: 'ℹ',
      accentColor: COLORS.blue,
    },
    success: {
      bg: COLORS.greenLight,
      border: '#6ee7b7',
      badgeBg: '#a7f3d0',
      badgeColor: '#065f46',
      icon: '✓',
      accentColor: COLORS.green,
    },
  }

  const nbWarning = alertes.filter(a => a.type === 'warning').length
  const nbInfo = alertes.filter(a => a.type === 'info').length
  const nbSuccess = alertes.filter(a => a.type === 'success').length

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Alertes et vigilance</h1>
        <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0 }}>Points d'attention et recommandations pour optimiser votre situation</p>
      </div>

      {/* KPI RESUME */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: COLORS.white, borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)', borderTop: `3px solid ${COLORS.amber}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.amber, letterSpacing: '0.06em', marginBottom: '8px' }}>POINTS DE VIGILANCE</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: COLORS.navy }}>{nbWarning}</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '2px' }}>à traiter en priorité</div>
        </div>
        <div style={{ background: COLORS.white, borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)', borderTop: `3px solid ${COLORS.blue}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.blue, letterSpacing: '0.06em', marginBottom: '8px' }}>INFORMATIONS</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: COLORS.navy }}>{nbInfo}</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '2px' }}>à suivre</div>
        </div>
        <div style={{ background: COLORS.white, borderRadius: '14px', padding: '16px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)', borderTop: `3px solid ${COLORS.green}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.green, letterSpacing: '0.06em', marginBottom: '8px' }}>POINTS POSITIFS</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: COLORS.navy }}>{nbSuccess}</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '2px' }}>objectifs atteints</div>
        </div>
      </div>

      {/* SECTION WARNINGS */}
      {nbWarning > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            ⚠ Points de vigilance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alertes.filter(a => a.type === 'warning').map((alerte, i) => {
              const s = styles[alerte.type]
              return (
                <div key={i} style={{
                  background: COLORS.white, borderRadius: '14px', padding: '18px',
                  boxShadow: '0 1px 4px rgba(15,39,68,0.08)',
                  borderLeft: `4px solid ${s.accentColor}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: s.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: s.badgeColor, fontWeight: '700', flexShrink: 0 }}>
                        {s.icon}
                      </div>
                      <span style={{ fontWeight: '700', color: COLORS.navy, fontSize: '14px' }}>{alerte.titre}</span>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: s.badgeBg, color: s.badgeColor, fontWeight: '700', letterSpacing: '0.04em' }}>
                      {alerte.priorite}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: COLORS.gray600, marginBottom: '10px', lineHeight: '1.6' }}>{alerte.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: COLORS.gray50, borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</span>
                    <span style={{ fontSize: '12px', color: COLORS.gray600 }}>{alerte.action}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SECTION INFOS */}
      {nbInfo > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            ℹ Informations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alertes.filter(a => a.type === 'info').map((alerte, i) => {
              const s = styles[alerte.type]
              return (
                <div key={i} style={{
                  background: COLORS.white, borderRadius: '14px', padding: '18px',
                  boxShadow: '0 1px 4px rgba(15,39,68,0.08)',
                  borderLeft: `4px solid ${s.accentColor}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: s.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: s.badgeColor, fontWeight: '700', flexShrink: 0 }}>
                        {s.icon}
                      </div>
                      <span style={{ fontWeight: '700', color: COLORS.navy, fontSize: '14px' }}>{alerte.titre}</span>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: s.badgeBg, color: s.badgeColor, fontWeight: '700', letterSpacing: '0.04em' }}>
                      {alerte.priorite}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: COLORS.gray600, marginBottom: '10px', lineHeight: '1.6' }}>{alerte.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: COLORS.gray50, borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</span>
                    <span style={{ fontSize: '12px', color: COLORS.gray600 }}>{alerte.action}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SECTION SUCCESS */}
      {nbSuccess > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            ✓ Points positifs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alertes.filter(a => a.type === 'success').map((alerte, i) => {
              const s = styles[alerte.type]
              return (
                <div key={i} style={{
                  background: COLORS.white, borderRadius: '14px', padding: '18px',
                  boxShadow: '0 1px 4px rgba(15,39,68,0.08)',
                  borderLeft: `4px solid ${s.accentColor}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: s.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: s.badgeColor, fontWeight: '700', flexShrink: 0 }}>
                        {s.icon}
                      </div>
                      <span style={{ fontWeight: '700', color: COLORS.navy, fontSize: '14px' }}>{alerte.titre}</span>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: s.badgeBg, color: s.badgeColor, fontWeight: '700', letterSpacing: '0.04em' }}>
                      {alerte.priorite}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: COLORS.gray600, lineHeight: '1.6' }}>{alerte.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      <div style={{ padding: '14px 16px', background: COLORS.amberLight, borderRadius: '10px', fontSize: '12px', color: COLORS.amber, fontWeight: '500', borderLeft: `3px solid ${COLORS.amber}` }}>
        ⚠️ Ces alertes sont générées automatiquement à titre indicatif. Consultez un conseiller financier agréé pour toute décision importante.
      </div>
    </div>
  )
}