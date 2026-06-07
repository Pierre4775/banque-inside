import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

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
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
}

const TAUX_MARCHE = { 10: 3.20, 15: 3.40, 20: 3.55, 25: 3.75 }

function calculerIndicateurs(profil) {
  const estFoyer = profil.situation === 'foyer'

  const totalRevenus =
    (profil.salaire || 0) + (profil.revenus_fonciers || 0) + (profil.autres_revenus || 0) +
    (estFoyer ? (profil.salaire2 || 0) + (profil.revenus_fonciers2 || 0) + (profil.autres_revenus2 || 0) : 0)

  const totalImpots =
    (profil.impots || 0) + (estFoyer ? (profil.impots2 || 0) : 0)

  const totalChargesFixes =
    (profil.assurance_auto || 0) + (profil.assurance_habitation || 0) + (profil.assurance_sante || 0) +
    (profil.telephonie || 0) + (profil.internet || 0) + (profil.streaming || 0) +
    (profil.electricite || 0) + (profil.gaz || 0) +
    (estFoyer ? (
      (profil.assurance_auto2 || 0) + (profil.assurance_habitation2 || 0) + (profil.assurance_sante2 || 0) +
      (profil.telephonie2 || 0) + (profil.internet2 || 0) + (profil.streaming2 || 0) +
      (profil.electricite2 || 0) + (profil.gaz2 || 0)
    ) : 0)

  const totalDepenses =
    (profil.logement || 0) + (profil.alimentation || 0) + (profil.transports || 0) +
    (profil.loisirs || 0) + (profil.sante || 0) + (profil.autres_depenses || 0) + totalChargesFixes +
    (estFoyer ? (
      (profil.logement2 || 0) + (profil.alimentation2 || 0) + (profil.transports2 || 0) +
      (profil.loisirs2 || 0) + (profil.sante2 || 0) + (profil.autres_depenses2 || 0)
    ) : 0)

  const creditsImmo = Array.isArray(profil.credits_immo) ? profil.credits_immo : []
  const creditsAutre = Array.isArray(profil.credits_autre) ? profil.credits_autre : []
  const totalMensualites = [...creditsImmo, ...creditsAutre].reduce((a, c) => a + (parseFloat(c?.mensualite) || 0), 0)

  const loyer = (profil.logement || 0) + (estFoyer ? (profil.logement2 || 0) : 0)
  const chargesEndettement = totalMensualites + loyer
  const tauxEndettement = totalRevenus > 0 ? Math.round(chargesEndettement / totalRevenus * 100) : 0

  const revenusNets = totalRevenus - totalImpots
  const tauxEndettementNet = revenusNets > 0 ? Math.round(chargesEndettement / revenusNets * 100) : 0

  const epargne = totalRevenus - totalDepenses - totalMensualites - totalImpots
  const tauxEpargne = totalRevenus > 0 ? Math.round(epargne / totalRevenus * 100) : 0

  const tauxChargesFixes = totalRevenus > 0 ? Math.round(totalChargesFixes / totalRevenus * 100) : 0

  const resteAVivreNet = revenusNets - chargesEndettement

  const epargneCourt = (Array.isArray(profil.epargne_court) ? profil.epargne_court : []).reduce((a, e) => a + (parseFloat(e?.montant) || 0), 0)
  const depensesMensuelles = totalDepenses + totalMensualites
  const moisFondsUrgence = depensesMensuelles > 0 ? epargneCourt / depensesMensuelles : 0

  const mensualiteMax = Math.max(0, totalRevenus * 0.35 - totalMensualites)
  const r = TAUX_MARCHE[20] / 100 / 12
  const capaciteEmprunt = mensualiteMax > 0 ? Math.round(mensualiteMax * (1 - Math.pow(1 + r, -240)) / r) : 0

  const score = Math.min(100, Math.max(0, Math.round(50 + tauxEpargne - tauxEndettement)))

  return {
    score, tauxEndettement, tauxEndettementNet, tauxEpargne,
    tauxChargesFixes, resteAVivreNet, moisFondsUrgence,
    capaciteEmprunt, epargne, totalRevenus, revenusNets,
  }
}

function Jauge({ valeur, max = 100, couleur, bg }) {
  const pct = Math.min(Math.round(valeur / max * 100), 100)
  return (
    <div style={{ height: '6px', borderRadius: '3px', background: bg || COLORS.gray200, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: '3px', width: `${pct}%`,
        background: couleur, transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

function IndicateurRow({ label, valeur, detail, statut, showBar, barVal, barMax }) {
  const cfg = {
    bon:    { dot: COLORS.green,  badge: COLORS.greenLight, badgeText: COLORS.green,  label: 'Bon' },
    moyen:  { dot: COLORS.amber,  badge: COLORS.amberLight, badgeText: COLORS.amber,  label: 'Moyen' },
    mauvais:{ dot: COLORS.red,    badge: COLORS.redLight,   badgeText: COLORS.red,    label: 'Vigilance' },
  }[statut] || { dot: COLORS.gray400, badge: COLORS.gray100, badgeText: COLORS.gray600, label: 'N/A' }

  return (
    <div style={{ padding: '14px 16px', borderRadius: '12px', background: COLORS.gray50, border: `1px solid ${COLORS.gray200}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: showBar ? '8px' : 0 }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: cfg.dot }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.navy }}>{label}</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '2px' }}>{detail}</div>
        </div>
        <div style={{ fontSize: '16px', fontWeight: '800', color: cfg.dot }}>{valeur}</div>
        <div style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: cfg.badge, color: cfg.badgeText, fontWeight: '700' }}>
          {cfg.label}
        </div>
      </div>
      {showBar && <Jauge valeur={barVal} max={barMax} couleur={cfg.dot} />}
    </div>
  )
}

export default function AnalyseBancaire() {
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const charger = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('profils_financiers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) setProfil(data[0])
      else setProfil(null)
      setLoading(false)
    }
    charger()
  }, [])

  if (loading) return (
    <div style={{ padding: '48px', textAlign: 'center', color: COLORS.gray400 }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⟳</div>
      <div>Chargement de votre analyse...</div>
    </div>
  )

  if (!profil) return (
    <div style={{ padding: '48px', textAlign: 'center', color: COLORS.gray400 }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.navy, marginBottom: '8px' }}>Aucune donnée disponible</div>
      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>Veuillez d'abord remplir la page <strong>Saisie des données</strong> pour obtenir votre analyse bancaire.</div>
    </div>
  )

  const ind = calculerIndicateurs(profil)
  const scoreColor = ind.score >= 70 ? COLORS.green : ind.score >= 50 ? COLORS.amber : COLORS.red
  const scoreLabel = ind.score >= 70 ? 'Profil solide' : ind.score >= 50 ? 'Profil correct' : 'À améliorer'

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Analyse bancaire</h1>
        <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0 }}>Score et indicateurs calculés à partir de vos données</p>
      </div>

      {/* SCORE */}
      <div style={{
        background: COLORS.navy, borderRadius: '16px', padding: '28px',
        marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '32px',
        boxShadow: '0 4px 16px rgba(15,39,68,0.15)',
      }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="10"
              strokeDasharray={`${ind.score * 2.51} ${100 * 2.51}`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '34px', fontWeight: '800', color: 'white' }}>{ind.score}</span>
            <span style={{ fontSize: '11px', color: COLORS.gray400 }}>/100</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: COLORS.gray400, fontWeight: '700', letterSpacing: '0.08em', marginBottom: '8px' }}>SCORE FINANCIER GLOBAL</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: scoreColor, marginBottom: '8px' }}>{scoreLabel}</div>
          <div style={{ fontSize: '13px', color: COLORS.gray400, lineHeight: '1.6' }}>
            Basé sur votre taux d'épargne ({ind.tauxEpargne}%) et votre taux d'endettement ({ind.tauxEndettement}%).
          </div>
          <div style={{ marginTop: '12px' }}>
            <Jauge valeur={ind.score} max={100} couleur={scoreColor} bg="rgba(255,255,255,0.1)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: COLORS.gray400, marginTop: '4px' }}>
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>
      </div>

      {/* KPI RAPIDES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Revenus bruts', value: `${Math.round(ind.totalRevenus).toLocaleString()} EUR`, color: COLORS.blue, bg: COLORS.bluePale },
          { label: 'Revenus nets d\'impôts', value: `${Math.round(ind.revenusNets).toLocaleString()} EUR`, color: COLORS.purple, bg: COLORS.purpleLight },
          { label: 'Épargne disponible', value: `${Math.round(ind.epargne).toLocaleString()} EUR`, color: ind.epargne >= 0 ? COLORS.green : COLORS.red, bg: ind.epargne >= 0 ? COLORS.greenLight : COLORS.redLight },
        ].map((k, i) => (
          <div key={i} style={{ background: k.bg, borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: k.color, letterSpacing: '0.06em', marginBottom: '6px', textTransform: 'uppercase' }}>{k.label}</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: COLORS.navy }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* INDICATEURS */}
      <div style={{
        background: COLORS.white, borderRadius: '16px', padding: '20px',
        boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '16px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Détail des indicateurs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <IndicateurRow
            label="Taux d'endettement (avant impôts)"
            valeur={`${ind.tauxEndettement}%`}
            detail={ind.tauxEndettement <= 35 ? `En dessous de la limite bancaire de 35% — zone verte` : `Au-dessus de la limite bancaire de 35% — à réduire`}
            statut={ind.tauxEndettement <= 25 ? 'bon' : ind.tauxEndettement <= 35 ? 'moyen' : 'mauvais'}
            showBar barVal={ind.tauxEndettement} barMax={60}
          />
          <IndicateurRow
            label="Taux d'endettement (après impôts)"
            valeur={`${ind.tauxEndettementNet}%`}
            detail={ind.tauxEndettementNet <= 35 ? `Zone verte après déduction des impôts` : `Zone de vigilance après déduction des impôts`}
            statut={ind.tauxEndettementNet <= 35 ? 'bon' : ind.tauxEndettementNet <= 45 ? 'moyen' : 'mauvais'}
            showBar barVal={ind.tauxEndettementNet} barMax={70}
          />
          <IndicateurRow
            label="Taux d'épargne"
            valeur={`${ind.tauxEpargne}%`}
            detail={ind.tauxEpargne >= 15 ? `Objectif 15-20% atteint — bonne gestion` : ind.tauxEpargne >= 10 ? `Acceptable — objectif recommandé : 15-20%` : `Faible — objectif recommandé : 15-20%`}
            statut={ind.tauxEpargne >= 15 ? 'bon' : ind.tauxEpargne >= 10 ? 'moyen' : 'mauvais'}
            showBar barVal={ind.tauxEpargne} barMax={30}
          />
          <IndicateurRow
            label="Charges fixes (assurances, télécom, énergie)"
            valeur={`${ind.tauxChargesFixes}%`}
            detail={ind.tauxChargesFixes <= 15 ? `Bien maîtrisées — en dessous de 15%` : ind.tauxChargesFixes <= 20 ? `Correctes — légèrement au-dessus de 15%` : `Élevées — des optimisations sont possibles`}
            statut={ind.tauxChargesFixes <= 15 ? 'bon' : ind.tauxChargesFixes <= 20 ? 'moyen' : 'mauvais'}
            showBar barVal={ind.tauxChargesFixes} barMax={35}
          />
          <IndicateurRow
            label="Reste à vivre (après impôts et crédits)"
            valeur={`${Math.round(ind.resteAVivreNet).toLocaleString()} EUR`}
            detail={ind.resteAVivreNet >= 1000 ? `Confortable — plus de 1 000 EUR disponibles` : ind.resteAVivreNet >= 500 ? `Correct — entre 500 et 1 000 EUR` : ind.resteAVivreNet >= 0 ? `Serré — moins de 500 EUR` : `Déficitaire — les charges dépassent les revenus nets`}
            statut={ind.resteAVivreNet >= 1000 ? 'bon' : ind.resteAVivreNet >= 500 ? 'moyen' : 'mauvais'}
          />
          <IndicateurRow
            label="Fonds d'urgence"
            valeur={`${ind.moisFondsUrgence.toFixed(1)} mois`}
            detail={ind.moisFondsUrgence >= 6 ? `Excellent — couvre plus de 6 mois de dépenses` : ind.moisFondsUrgence >= 3 ? `Suffisant — couvre 3 à 6 mois (objectif atteint)` : ind.moisFondsUrgence > 0 ? `Insuffisant — objectif : 3 à 6 mois de dépenses` : `Absent — aucune épargne de précaution renseignée`}
            statut={ind.moisFondsUrgence >= 3 ? 'bon' : ind.moisFondsUrgence >= 1 ? 'moyen' : 'mauvais'}
          />
        </div>
      </div>

      {/* CAPACITE D'EMPRUNT */}
      <div style={{
        background: COLORS.navy, borderRadius: '16px', padding: '20px',
        boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '16px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          Capacité d'emprunt estimée
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: COLORS.navyLight, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '6px' }}>Montant empruntable (20 ans)</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>
              {ind.capaciteEmprunt > 0 ? `${Math.round(ind.capaciteEmprunt / 1000)}k EUR` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '4px' }}>Taux {TAUX_MARCHE[20]}%</div>
          </div>
          <div style={{ background: COLORS.navyLight, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '6px' }}>Mensualité disponible</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>
              {ind.capaciteEmprunt > 0
                ? `${Math.round(Math.max(0, ind.totalRevenus * 0.35 - ([...(Array.isArray(profil.credits_immo) ? profil.credits_immo : []), ...(Array.isArray(profil.credits_autre) ? profil.credits_autre : [])].reduce((a, c) => a + (parseFloat(c?.mensualite) || 0), 0)))).toLocaleString()} EUR`
                : '—'}
            </div>
            <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '4px' }}>Règle des 35%</div>
          </div>
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: COLORS.gray400, lineHeight: '1.5' }}>
          Estimation indicative. Les banques utilisent leurs propres critères d'octroi (stabilité des revenus, apport, situation personnelle).
        </div>
      </div>

      <div style={{ padding: '14px 16px', background: COLORS.amberLight, borderRadius: '10px', fontSize: '12px', color: COLORS.amber, fontWeight: '500', borderLeft: `3px solid ${COLORS.amber}` }}>
        ⚠️ Ces indicateurs sont calculés automatiquement à titre informatif. Consultez un conseiller financier agréé pour toute décision importante.
      </div>
    </div>
  )
}
