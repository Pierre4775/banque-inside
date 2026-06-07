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
}

function calculerAlertes(profil) {
  const alertes = []

  const totalRevenus =
    (profil.salaire || 0) + (profil.revenus_fonciers || 0) + (profil.autres_revenus || 0) +
    (profil.situation === 'foyer' ? (profil.salaire2 || 0) + (profil.revenus_fonciers2 || 0) + (profil.autres_revenus2 || 0) : 0)

  const totalImpots =
    (profil.impots || 0) +
    (profil.situation === 'foyer' ? (profil.impots2 || 0) : 0)

  const totalChargesFixes =
    (profil.assurance_auto || 0) + (profil.assurance_habitation || 0) + (profil.assurance_sante || 0) +
    (profil.telephonie || 0) + (profil.internet || 0) + (profil.streaming || 0) +
    (profil.electricite || 0) + (profil.gaz || 0) +
    (profil.situation === 'foyer' ? (
      (profil.assurance_auto2 || 0) + (profil.assurance_habitation2 || 0) + (profil.assurance_sante2 || 0) +
      (profil.telephonie2 || 0) + (profil.internet2 || 0) + (profil.streaming2 || 0) +
      (profil.electricite2 || 0) + (profil.gaz2 || 0)
    ) : 0)

  const totalDepensesHorsChargesFixes =
    (profil.logement || 0) + (profil.alimentation || 0) + (profil.transports || 0) +
    (profil.loisirs || 0) + (profil.sante || 0) + (profil.autres_depenses || 0) +
    (profil.situation === 'foyer' ? (
      (profil.logement2 || 0) + (profil.alimentation2 || 0) + (profil.transports2 || 0) +
      (profil.loisirs2 || 0) + (profil.sante2 || 0) + (profil.autres_depenses2 || 0)
    ) : 0)

  const totalDepenses = totalDepensesHorsChargesFixes + totalChargesFixes

  const creditsImmo = Array.isArray(profil.credits_immo) ? profil.credits_immo : []
  const creditsAutre = Array.isArray(profil.credits_autre) ? profil.credits_autre : []
  const totalMensualites = [...creditsImmo, ...creditsAutre].reduce((a, c) => a + (parseFloat(c?.mensualite) || 0), 0)

  const loyer = (profil.logement || 0) + (profil.situation === 'foyer' ? (profil.logement2 || 0) : 0)
  const tauxEndettement = totalRevenus > 0 ? (totalMensualites + loyer) / totalRevenus * 100 : 0
  const epargne = totalRevenus - totalDepenses - totalMensualites - totalImpots
  const tauxEpargne = totalRevenus > 0 ? epargne / totalRevenus * 100 : 0
  const tauxChargesTotales = totalRevenus > 0 ? (totalDepenses + totalMensualites) / totalRevenus * 100 : 0

  const epargneCourt = (Array.isArray(profil.epargne_court) ? profil.epargne_court : []).reduce((a, e) => a + (parseFloat(e?.montant) || 0), 0)
  const depensesMensuelles = totalDepenses + totalMensualites
  const moisFondsUrgence = depensesMensuelles > 0 ? epargneCourt / depensesMensuelles : 0

  // --- Charges globales ---
  if (totalRevenus > 0) {
    if (tauxChargesTotales > 60) {
      alertes.push({
        type: 'warning', priorite: 'Haute',
        titre: 'Charges très élevées',
        desc: `Vos charges totales représentent ${Math.round(tauxChargesTotales)}% de vos revenus. Le seuil recommandé est 50%.`,
        action: 'Identifier les postes les plus importants et les réduire en priorité',
      })
    } else if (tauxChargesTotales > 50) {
      alertes.push({
        type: 'warning', priorite: 'Moyenne',
        titre: 'Charges élevées',
        desc: `Vos charges représentent ${Math.round(tauxChargesTotales)}% de vos revenus. L'objectif recommandé est en dessous de 50%.`,
        action: 'Revoir vos abonnements et contrats pour identifier des économies',
      })
    } else {
      alertes.push({
        type: 'success', priorite: 'OK',
        titre: 'Charges maîtrisées',
        desc: `Vos charges représentent ${Math.round(tauxChargesTotales)}% de vos revenus — en dessous du seuil de 50%. Bonne gestion !`,
        action: 'Aucune action requise',
      })
    }
  }

  // --- Épargne ---
  if (totalRevenus > 0) {
    if (epargne < 0) {
      alertes.push({
        type: 'warning', priorite: 'Haute',
        titre: 'Budget déficitaire',
        desc: `Votre budget est déficitaire de ${Math.abs(Math.round(epargne)).toLocaleString()} EUR/mois. Vos dépenses dépassent vos revenus.`,
        action: 'Réduire les dépenses non essentielles ou chercher des revenus complémentaires',
      })
    } else if (tauxEpargne < 10) {
      alertes.push({
        type: 'warning', priorite: 'Moyenne',
        titre: 'Épargne insuffisante',
        desc: `Votre taux d'épargne est de ${Math.round(tauxEpargne)}%. L'objectif recommandé est 15-20%.`,
        action: 'Mettre en place un virement automatique épargne le jour de la paie',
      })
    } else if (tauxEpargne < 15) {
      alertes.push({
        type: 'info', priorite: 'Info',
        titre: 'Épargne améliorable',
        desc: `Votre taux d'épargne de ${Math.round(tauxEpargne)}% est acceptable, mais vous pouvez viser 15-20%.`,
        action: 'Augmenter progressivement votre épargne mensuelle de 50 EUR',
      })
    } else {
      alertes.push({
        type: 'success', priorite: 'OK',
        titre: 'Taux d\'épargne satisfaisant',
        desc: `Votre taux d'épargne est de ${Math.round(tauxEpargne)}% — dans la zone verte (objectif 15-20%). Continuez sur cette lancée !`,
        action: 'Aucune action requise',
      })
    }
  }

  // --- Taux d'endettement ---
  if (totalMensualites > 0 || loyer > 0 || totalRevenus > 0) {
    if (tauxEndettement > 40) {
      alertes.push({
        type: 'warning', priorite: 'Haute',
        titre: 'Taux d\'endettement très élevé',
        desc: `Votre taux d'endettement est de ${Math.round(tauxEndettement)}%, bien au-delà de la limite bancaire de 35%.`,
        action: 'Envisager un rachat ou regroupement de crédits pour alléger les mensualités',
      })
    } else if (tauxEndettement > 35) {
      alertes.push({
        type: 'warning', priorite: 'Haute',
        titre: 'Taux d\'endettement élevé',
        desc: `Votre taux d'endettement est de ${Math.round(tauxEndettement)}%, au-delà de la limite bancaire de 35%.`,
        action: 'Consulter un courtier pour étudier un rachat de crédit',
      })
    } else {
      alertes.push({
        type: 'success', priorite: 'OK',
        titre: 'Taux d\'endettement sain',
        desc: `Votre taux d'endettement est de ${Math.round(tauxEndettement)}% — dans la zone verte (seuil : 35%).`,
        action: 'Aucune action requise',
      })
    }
  }

  // --- Fonds d'urgence ---
  if (epargneCourt === 0 && depensesMensuelles > 0) {
    alertes.push({
      type: 'warning', priorite: 'Haute',
      titre: 'Fonds d\'urgence absent',
      desc: 'Votre épargne de précaution est nulle. Il est recommandé d\'avoir 3 à 6 mois de dépenses en réserve sur un livret accessible.',
      action: 'Ouvrir un Livret A et y verser 3 à 6 mois de dépenses progressivement',
    })
  } else if (epargneCourt > 0 && moisFondsUrgence < 3) {
    alertes.push({
      type: 'warning', priorite: 'Moyenne',
      titre: 'Fonds d\'urgence insuffisant',
      desc: `Votre épargne de précaution couvre ${moisFondsUrgence.toFixed(1)} mois de dépenses. L'objectif est 3 à 6 mois.`,
      action: 'Renforcer votre épargne de précaution jusqu\'à 3 mois de dépenses minimum',
    })
  } else if (moisFondsUrgence >= 3) {
    alertes.push({
      type: 'success', priorite: 'OK',
      titre: 'Fonds d\'urgence constitué',
      desc: `Votre épargne de précaution couvre ${moisFondsUrgence.toFixed(1)} mois de dépenses. Objectif atteint !`,
      action: 'Aucune action requise',
    })
  }

  // --- Revenus stables (informatif) ---
  if (totalRevenus > 0) {
    alertes.push({
      type: 'info', priorite: 'Info',
      titre: 'Analyse basée sur vos données saisies',
      desc: `Analyse calculée sur des revenus de ${Math.round(totalRevenus).toLocaleString()} EUR/mois. Mettez à jour vos données régulièrement pour un suivi précis.`,
      action: 'Mettre à jour la page Saisie des données chaque mois',
    })
  }

  return alertes
}

const styles = {
  warning: {
    bg: '#fffbeb',
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

function AlerteCard({ alerte }) {
  const s = styles[alerte.type]
  return (
    <div style={{
      background: COLORS.white, borderRadius: '14px', padding: '18px',
      boxShadow: '0 1px 4px rgba(15,39,68,0.08)',
      borderLeft: `4px solid ${s.accentColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px', background: s.badgeBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', color: s.badgeColor, fontWeight: '700', flexShrink: 0,
          }}>
            {s.icon}
          </div>
          <span style={{ fontWeight: '700', color: COLORS.navy, fontSize: '14px' }}>{alerte.titre}</span>
        </div>
        <span style={{
          fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
          background: s.badgeBg, color: s.badgeColor, fontWeight: '700', letterSpacing: '0.04em',
        }}>
          {alerte.priorite}
        </span>
      </div>
      <div style={{ fontSize: '13px', color: COLORS.gray600, marginBottom: alerte.type !== 'success' ? '10px' : 0, lineHeight: '1.6' }}>
        {alerte.desc}
      </div>
      {alerte.type !== 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: COLORS.gray50, borderRadius: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</span>
          <span style={{ fontSize: '12px', color: COLORS.gray600 }}>{alerte.action}</span>
        </div>
      )}
    </div>
  )
}

export default function Alertes() {
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('profils_financiers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data.length > 0) setProfil(data[0])
      setLoading(false)
    }
    charger()
  }, [])

  if (loading) return (
    <div style={{ padding: '48px', textAlign: 'center', color: COLORS.gray400 }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⟳</div>
      <div>Chargement...</div>
    </div>
  )

  if (!profil) return (
    <div style={{ padding: '48px', textAlign: 'center', color: COLORS.gray400 }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.navy, marginBottom: '8px' }}>Aucune donnée disponible</div>
      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>Veuillez d'abord remplir la page <strong>Saisie des données</strong> pour voir vos alertes personnalisées.</div>
    </div>
  )

  const alertes = calculerAlertes(profil)
  const nbWarning = alertes.filter(a => a.type === 'warning').length
  const nbInfo = alertes.filter(a => a.type === 'info').length
  const nbSuccess = alertes.filter(a => a.type === 'success').length

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Alertes et vigilance</h1>
        <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0 }}>Points d'attention calculés à partir de vos données financières</p>
      </div>

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

      {nbWarning > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            ⚠ Points de vigilance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alertes.filter(a => a.type === 'warning').map((alerte, i) => <AlerteCard key={i} alerte={alerte} />)}
          </div>
        </div>
      )}

      {nbInfo > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            ℹ Informations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alertes.filter(a => a.type === 'info').map((alerte, i) => <AlerteCard key={i} alerte={alerte} />)}
          </div>
        </div>
      )}

      {nbSuccess > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            ✓ Points positifs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alertes.filter(a => a.type === 'success').map((alerte, i) => <AlerteCard key={i} alerte={alerte} />)}
          </div>
        </div>
      )}

      <div style={{ padding: '14px 16px', background: COLORS.amberLight, borderRadius: '10px', fontSize: '12px', color: COLORS.amber, fontWeight: '500', borderLeft: `3px solid ${COLORS.amber}` }}>
        ⚠️ Ces alertes sont générées automatiquement à titre indicatif. Consultez un conseiller financier agréé pour toute décision importante.
      </div>
    </div>
  )
}
