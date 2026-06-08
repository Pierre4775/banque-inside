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
  cyan: '#0ea5e9',
  cyanLight: '#e0f2fe',
}

const OBJECTIFS = [
  { key: 'charges', label: 'Optimiser mes charges', icon: '💡', color: COLORS.amber },
  { key: 'pret', label: 'Souscrire un prêt immobilier', icon: '🏠', color: COLORS.blue },
  { key: 'credits', label: 'Optimiser mes crédits', icon: '💳', color: COLORS.red },
  { key: 'epargne_dispo', label: 'Optimiser mon épargne disponible', icon: '💰', color: COLORS.green },
  { key: 'epargne_moyen', label: 'Constituer une épargne moyen terme', icon: '📆', color: COLORS.purple },
  { key: 'epargne_long', label: 'Constituer une épargne long terme', icon: '📈', color: COLORS.cyan },
  { key: 'retraite', label: 'Préparer ma retraite', icon: '🎯', color: COLORS.navy },
]

const cardStyle = {
  background: COLORS.white, borderRadius: '16px', padding: '20px',
  boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '16px',
}

function RecoCard({ icon, titre, analyse, pistes, partenaires, color, urgence }) {
  const [ouvert, setOuvert] = useState(false)
  const urgenceStyle = {
    haute: { bg: COLORS.redLight, color: COLORS.red, label: 'Priorité haute' },
    moyenne: { bg: COLORS.amberLight, color: COLORS.amber, label: 'Priorité moyenne' },
    basse: { bg: COLORS.greenLight, color: COLORS.green, label: 'Opportunité' },
    info: { bg: COLORS.bluePale, color: COLORS.blue, label: 'Information' },
  }
  const u = urgenceStyle[urgence] || urgenceStyle.info

  return (
    <div style={{ background: COLORS.white, borderRadius: '16px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '12px', borderLeft: `4px solid ${color}`, overflow: 'hidden' }}>
      <div
        onClick={() => setOuvert(!ouvert)}
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.navy, marginBottom: '4px' }}>{titre}</div>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: u.bg, color: u.color, fontWeight: '600' }}>
              {u.label}
            </span>
          </div>
        </div>
        <div style={{ fontSize: '18px', color: COLORS.gray400, transition: 'transform 0.2s', transform: ouvert ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
      </div>

      {ouvert && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ padding: '12px 14px', background: COLORS.gray50, borderRadius: '10px', fontSize: '13px', color: COLORS.gray600, lineHeight: '1.7', marginBottom: '14px' }}>
            {analyse}
          </div>

          <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            Pistes à explorer
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {pistes.map((piste, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: color + '10', borderRadius: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>{i + 1}</div>
                <div style={{ fontSize: '13px', color: COLORS.gray600, lineHeight: '1.6' }}>{piste}</div>
              </div>
            ))}
          </div>

          {partenaires && partenaires.length > 0 && (
            <>
              <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Comparer & agir
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '8px' }}>
                {partenaires.map((p, i) => (
                  <a key={i} href={p.lien} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '12px', borderRadius: '10px', background: COLORS.navy,
                    textDecoration: 'none', gap: '4px', cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'white', textAlign: 'center' }}>{p.nom}</span>
                    <span style={{ fontSize: '11px', color: COLORS.gray400, textAlign: 'center' }}>{p.desc}</span>
                  </a>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: COLORS.gray400, fontStyle: 'italic', lineHeight: '1.5' }}>
                🔗 Liens partenaires — nous percevons une commission si vous souscrivez via ces liens, sans coût supplémentaire pour vous.
              </div>
            </>
          )}

          <div style={{ marginTop: '14px', padding: '10px 12px', background: COLORS.gray50, borderRadius: '8px', fontSize: '11px', color: COLORS.gray400, fontStyle: 'italic', lineHeight: '1.6', borderLeft: `2px solid ${COLORS.gray200}` }}>
            Ces informations sont génériques et ne tiennent pas compte de l'intégralité de votre situation personnelle. Consultez un conseiller financier agréé avant toute décision.
          </div>
        </div>
      )}
    </div>
  )
}

function genererRecommandations(profil, objectifsSelectionnes) {
  if (!profil) return []
  const recos = []

  const totalRevenus = (profil.salaire || 0) + (profil.revenus_fonciers || 0) + (profil.autres_revenus || 0)
  const totalImpots = profil.impots || 0
  const revenusNets = totalRevenus - totalImpots

  const totalChargesFixes =
    (profil.assurance_auto || 0) + (profil.assurance_habitation || 0) + (profil.assurance_sante || 0) +
    (profil.telephonie || 0) + (profil.internet || 0) + (profil.streaming || 0) +
    (profil.electricite || 0) + (profil.gaz || 0)

  const creditsImmo = Array.isArray(profil.credits_immo) ? profil.credits_immo : []
  const creditsAutre = Array.isArray(profil.credits_autre) ? profil.credits_autre : []
  const totalMensualites = [...creditsImmo, ...creditsAutre].reduce((a, c) => a + (parseFloat(c?.mensualite) || 0), 0)
  const tauxEndettement = totalRevenus > 0 ? (totalMensualites + (profil.logement || 0)) / totalRevenus * 100 : 0

  const totalDepenses =
    (profil.logement || 0) + (profil.alimentation || 0) + (profil.transports || 0) +
    (profil.loisirs || 0) + (profil.sante || 0) + (profil.autres_depenses || 0) + totalChargesFixes
  const epargne = totalRevenus - totalDepenses - totalMensualites - totalImpots
  const tauxEpargne = totalRevenus > 0 ? (epargne / totalRevenus) * 100 : 0

  const actif = (key) => objectifsSelectionnes.length === 0 || objectifsSelectionnes.includes(key)

  // 1. OPTIMISER LES CHARGES
  if (actif('charges')) {
    const tauxCharges = totalRevenus > 0 ? (totalChargesFixes / totalRevenus) * 100 : 0
    recos.push({
      key: 'charges',
      icon: '💡',
      color: COLORS.amber,
      urgence: tauxCharges > 15 ? 'haute' : tauxCharges > 10 ? 'moyenne' : 'basse',
      titre: 'Optimiser vos charges fixes',
      analyse: tauxCharges > 15
        ? `Vos charges fixes (assurances, télécom, énergie) représentent ${Math.round(tauxCharges)}% de vos revenus soit ${Math.round(totalChargesFixes)} EUR/mois. C'est au-dessus de la moyenne — des économies significatives sont possibles.`
        : `Vos charges fixes représentent ${Math.round(tauxCharges)}% de vos revenus soit ${Math.round(totalChargesFixes)} EUR/mois. Une comparaison rapide peut quand même révéler des économies.`,
      pistes: [
        `Assurances auto et habitation : comparez tous les ans, les économies peuvent atteindre 200 à 400 EUR par an.`,
        `Mutuelle santé : vérifiez que votre niveau de couverture correspond à vos besoins réels.`,
        `Box internet et mobile : les offres évoluent vite, un changement peut faire économiser 20 à 40 EUR par mois.`,
        `Énergie : les comparateurs permettent de trouver des offres jusqu'à 15% moins chères sur l'électricité et le gaz.`,
        `Abonnements streaming : listez tous vos abonnements, certains sont peut-être sous-utilisés.`,
      ],
      partenaires: [
        { nom: 'LeLynx', desc: 'Comparer assurances', lien: 'https://www.lelynx.fr' },
        { nom: 'Reassurez-moi', desc: 'Assurances auto & habitation', lien: 'https://www.reassurez-moi.fr' },
        { nom: 'Selectra', desc: 'Comparer énergie', lien: 'https://selectra.info' },
        { nom: 'meilleurmobile', desc: 'Comparer forfaits', lien: 'https://www.meilleurmobile.com' },
      ]
    })
  }

  // 2. PRET IMMOBILIER
  if (actif('pret')) {
    const mensualiteMax = Math.max(0, totalRevenus * 0.35 - totalMensualites)
    const capacite = Math.round(mensualiteMax * (1 - Math.pow(1 + 3.55 / 100 / 12, -240)) / (3.55 / 100 / 12))
    recos.push({
      key: 'pret',
      icon: '🏠',
      color: COLORS.blue,
      urgence: tauxEndettement < 20 ? 'basse' : tauxEndettement < 35 ? 'moyenne' : 'info',
      titre: 'Souscrire un prêt immobilier',
      analyse: tauxEndettement < 35
        ? `D'après les données saisies, votre taux d'endettement indicatif est de ${Math.round(tauxEndettement)}%. À titre informatif, une capacité d'emprunt approximative de ${capacite.toLocaleString()} EUR sur 20 ans est calculée aux taux de marché en vigueur. Cette estimation ne vaut pas accord de financement.`
        : `D'après les données saisies, votre taux d'endettement indicatif est de ${Math.round(tauxEndettement)}%, proche ou au-delà de la limite bancaire de 35%. Cette estimation est fournie à titre informatif uniquement. Seul un établissement prêteur peut évaluer votre situation réelle.`,
      pistes: [
        `Simulez votre projet avec plusieurs courtiers pour obtenir le meilleur taux.`,
        `Constituez un apport si possible — 10% minimum est généralement demandé pour couvrir les frais de notaire.`,
        `Comparez les offres d'assurance emprunteur séparément — elles peuvent être jusqu'à 3x moins chères hors banque.`,
        `Anticipez les frais annexes : notaire (7-8% dans l'ancien), garantie, frais de dossier.`,
      ],
      partenaires: [
        { nom: 'Pretto', desc: 'Courtier en ligne', lien: 'https://www.pretto.fr' },
        { nom: 'Meilleurtaux', desc: 'Comparer les taux', lien: 'https://www.meilleurtaux.com' },
        { nom: 'Empruntis', desc: 'Simulation gratuite', lien: 'https://www.empruntis.com' },
        { nom: 'Cafpi', desc: 'Courtier immobilier', lien: 'https://www.cafpi.fr' },
      ]
    })
  }

  // 3. OPTIMISER LES CREDITS
  if (actif('credits') && totalMensualites > 0) {
    recos.push({
      key: 'credits',
      icon: '💳',
      color: COLORS.red,
      urgence: tauxEndettement > 35 ? 'haute' : tauxEndettement > 20 ? 'moyenne' : 'basse',
      titre: 'Optimiser vos crédits en cours',
      analyse: `D'après les données saisies, vos mensualités s'élèvent à ${Math.round(totalMensualites)} EUR. ${tauxEndettement > 35 ? 'Votre taux d\'endettement indicatif dépasse 35%. Un regroupement de crédits peut, dans certains cas, alléger les mensualités — à évaluer avec un professionnel.' : 'Un rachat ou regroupement de crédits peut, dans certains cas, permettre de réduire les mensualités ou le coût total — à étudier au cas par cas avec un établissement financier.'}`,
      pistes: [
        `Rachat de crédit : si les taux ont baissé depuis votre souscription, une renégociation peut faire économiser des milliers d'euros.`,
        `Regroupement de crédits : fusionner plusieurs crédits en un seul peut réduire la mensualité globale.`,
        `Remboursement anticipé : si vous avez de l'épargne disponible, calculez si rembourser par anticipation est avantageux.`,
        `Assurance emprunteur : la délégation d'assurance peut réduire ce poste de 30 à 60%.`,
      ],
      partenaires: [
        { nom: 'Meilleurtaux', desc: 'Rachat de crédit', lien: 'https://www.meilleurtaux.com' },
        { nom: 'Empruntis', desc: 'Regroupement crédits', lien: 'https://www.empruntis.com' },
        { nom: 'Ymanci', desc: 'Rachat & regroupement', lien: 'https://www.ymanci.fr' },
      ]
    })
  }

  // 4. EPARGNE DISPONIBLE
  if (actif('epargne_dispo')) {
    recos.push({
      key: 'epargne_dispo',
      icon: '💰',
      color: COLORS.green,
      urgence: epargne < 0 ? 'haute' : tauxEpargne < 10 ? 'moyenne' : 'basse',
      titre: 'Optimiser votre épargne disponible',
      analyse: epargne < 0
        ? `D'après les données saisies, le solde mensuel calculé est déficitaire de ${Math.abs(Math.round(epargne))} EUR. Cette estimation indicative suggère de revoir les charges avant d'envisager une épargne supplémentaire. Consultez un professionnel pour une analyse complète.`
        : `D'après les données saisies, la capacité d'épargne mensuelle calculée est d'environ ${Math.round(epargne)} EUR (${Math.round(tauxEpargne)}% des revenus). Les livrets réglementés (Livret A, LDDS, LEP si éligible) permettent de constituer une épargne de précaution disponible à tout moment.`,
      pistes: [
        `Fonds d'urgence : conservez 3 à 6 mois de dépenses sur un livret accessible (Livret A, LDDS, LEP).`,
        `Automatisez votre épargne avec un virement automatique le jour de la paie.`,
        `Comparez les taux des livrets — certaines banques en ligne proposent des bonus à l'ouverture.`,
        `Le LEP (Livret d'Épargne Populaire) offre le meilleur taux si vous y êtes éligible.`,
      ],
      partenaires: [
        { nom: 'Fortuneo', desc: 'Livret épargne', lien: 'https://www.fortuneo.fr' },
        { nom: 'Boursorama', desc: 'Livret boosté', lien: 'https://www.boursobank.com' },
        { nom: 'Hello bank', desc: 'Épargne en ligne', lien: 'https://www.hellobank.fr' },
        { nom: 'Panorabanques', desc: 'Comparer les taux', lien: 'https://www.panorabanques.com' },
      ]
    })
  }

  // 5. EPARGNE MOYEN TERME
  if (actif('epargne_moyen')) {
    recos.push({
      key: 'epargne_moyen',
      icon: '📆',
      color: COLORS.purple,
      urgence: 'basse',
      titre: 'Constituer une épargne moyen terme (3-10 ans)',
      analyse: `L'épargne moyen terme vise des objectifs à 3-10 ans : achat immobilier, travaux, financement des études des enfants. Elle doit être placée sur des supports peu risqués mais plus rémunérateurs que le livret.`,
      pistes: [
        `PEL (Plan Épargne Logement) : taux garanti, utile si projet immobilier dans 4+ ans.`,
        `Compte à terme : taux fixé à l'avance, capital garanti, durée de 1 à 5 ans.`,
        `Assurance vie en fonds euros : capital garanti, fiscalité avantageuse après 8 ans.`,
        `Versements réguliers mensuels pour lisser le risque et bénéficier des intérêts composés.`,
      ],
      partenaires: [
        { nom: 'Linxo', desc: 'Épargne & investissement', lien: 'https://www.linxo.com' },
        { nom: 'Placement-direct', desc: 'Assurance vie', lien: 'https://www.placement-direct.fr' },
        { nom: 'Fortuneo', desc: 'Assurance vie', lien: 'https://www.fortuneo.fr' },
        { nom: 'Panorabanques', desc: 'Comparer PEL', lien: 'https://www.panorabanques.com' },
      ]
    })
  }

  // 6. EPARGNE LONG TERME
  if (actif('epargne_long')) {
    recos.push({
      key: 'epargne_long',
      icon: '📈',
      color: COLORS.cyan,
      urgence: 'basse',
      titre: 'Constituer une épargne long terme (10+ ans)',
      analyse: `Sur le long terme, les marchés financiers offrent historiquement les meilleurs rendements. Un horizon de 10+ ans permet d'absorber les fluctuations et de profiter des intérêts composés.`,
      pistes: [
        `PEA (Plan Épargne en Actions) : exonération fiscale après 5 ans, plafond 150 000 EUR.`,
        `Assurance vie multisupport : combinez fonds euros sécurisés et unités de compte dynamiques.`,
        `Investissement progressif mensuel : même 100 EUR/mois sur 20 ans à 7% génèrent plus de 50 000 EUR.`,
        `Diversifiez géographiquement et sectoriellement pour réduire le risque.`,
      ],
      partenaires: [
        { nom: 'Yomoni', desc: 'Gestion pilotée', lien: 'https://www.yomoni.fr' },
        { nom: 'Nalo', desc: 'Investissement intelligent', lien: 'https://www.nalo.fr' },
        { nom: 'Ramify', desc: 'PEA & Assurance vie', lien: 'https://www.ramify.fr' },
        { nom: 'Fortuneo', desc: 'PEA en ligne', lien: 'https://www.fortuneo.fr' },
      ]
    })
  }

  // 7. RETRAITE
  if (actif('retraite')) {
    recos.push({
      key: 'retraite',
      icon: '🎯',
      color: COLORS.navy,
      urgence: 'basse',
      titre: 'Préparer ma retraite',
      analyse: `Plus tôt vous préparez votre retraite, plus l'effort mensuel est faible. Le PER (Plan Épargne Retraite) est l'outil principal : les versements sont déductibles de vos revenus imposables, ce qui réduit votre impôt aujourd'hui.`,
      pistes: [
        `PER individuel : déduisez vos versements de votre revenu imposable — économie fiscale immédiate.`,
        `Plus votre tranche d'imposition est élevée, plus l'avantage fiscal du PER est intéressant.`,
        `Commencez tôt : 200 EUR/mois à 35 ans génèrent autant que 400 EUR/mois à 50 ans.`,
        `Diversifiez votre PER entre fonds sécurisés et actions selon votre horizon de départ.`,
        `Envisagez aussi l'immobilier locatif comme complément de revenus à la retraite.`,
      ],
      partenaires: [
        { nom: 'Ramify', desc: 'PER en ligne', lien: 'https://www.ramify.fr' },
        { nom: 'Yomoni', desc: 'PER piloté', lien: 'https://www.yomoni.fr' },
        { nom: 'Nalo', desc: 'Retraite sur mesure', lien: 'https://www.nalo.fr' },
        { nom: 'Linxo', desc: 'PER & patrimoine', lien: 'https://www.linxo.com' },
      ]
    })
  }

  return recos
}

export default function Recommandations() {
  const [profil, setProfil] = useState(null)
  const [objectifsSelectionnes, setObjectifsSelectionnes] = useState([])
  const [afficherRecos, setAfficherRecos] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
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

  const toggleObjectif = (key) => {
    setObjectifsSelectionnes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
    setAfficherRecos(false)
  }

  const recos = genererRecommandations(profil, objectifsSelectionnes)

  if (loading) return (
    <div style={{ padding: '48px', textAlign: 'center', color: COLORS.gray400 }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⟳</div>
      <div>Chargement...</div>
    </div>
  )

  if (!profil) return (
    <div style={{ padding: '48px', textAlign: 'center', color: COLORS.gray400 }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
      <div>Veuillez d'abord remplir la page Saisie des données.</div>
    </div>
  )

  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* HEADER */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Recommandations</h1>
        <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0, lineHeight: '1.6' }}>
          Sélectionnez vos objectifs pour accéder à des informations génériques sur les produits financiers disponibles.
        </p>
      </div>

      {/* ENCADRÉ AFFILIATION */}
      <div style={{ padding: '12px 16px', background: COLORS.bluePale, borderRadius: '10px', borderLeft: `3px solid ${COLORS.blue}`, marginBottom: '20px', fontSize: '12px', color: COLORS.gray600, lineHeight: '1.7' }}>
        <strong style={{ color: COLORS.blue }}>Information sur les liens partenaires</strong><br />
        Certains liens présents sur cette page sont des liens affiliés rémunérés. Cela ne modifie pas l'objectivité des informations présentées. Nous vous redirigeons uniquement vers des plateformes reconnues et réglementées.
      </div>

      {/* OBJECTIFS */}
      <div style={{ ...cardStyle, borderTop: `3px solid ${COLORS.blue}` }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.navy, marginBottom: '6px' }}>Quels sont vos objectifs ?</div>
        <div style={{ fontSize: '13px', color: COLORS.gray400, marginBottom: '16px' }}>
          Sélectionnez un ou plusieurs objectifs — ou laissez tout vide pour voir toutes les recommandations adaptées à votre profil.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {OBJECTIFS.map(obj => {
            const actif = objectifsSelectionnes.includes(obj.key)
            return (
              <button key={obj.key} onClick={() => toggleObjectif(obj.key)} style={{
                padding: '12px 14px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                border: actif ? `2px solid ${obj.color}` : `1.5px solid ${COLORS.gray200}`,
                background: actif ? obj.color + '15' : COLORS.white,
                transition: 'all 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{obj.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: actif ? '700' : '500', color: actif ? obj.color : COLORS.gray600, lineHeight: '1.4' }}>
                    {obj.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setAfficherRecos(true)}
          style={{
            width: '100%', marginTop: '16px', padding: '14px',
            background: COLORS.navy, color: 'white', border: 'none',
            borderRadius: '12px', fontSize: '15px', fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          {objectifsSelectionnes.length === 0 ? 'Voir toutes mes recommandations' : `Voir mes recommandations (${objectifsSelectionnes.length} objectif${objectifsSelectionnes.length > 1 ? 's' : ''})`}
        </button>
      </div>

      {/* RECOMMANDATIONS */}
      {afficherRecos && (
        <>
          {/* RESUME PROFIL */}
          <div style={{ background: COLORS.navy, borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
              Votre profil en un coup d'œil
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {[
                { label: 'Revenus nets', value: `${Math.round((profil.salaire || 0) + (profil.revenus_fonciers || 0) + (profil.autres_revenus || 0) - (profil.impots || 0)).toLocaleString()} EUR`, color: COLORS.green },
                { label: 'Mensualités', value: `${Math.round([...(Array.isArray(profil.credits_immo) ? profil.credits_immo : []), ...(Array.isArray(profil.credits_autre) ? profil.credits_autre : [])].reduce((a, c) => a + (parseFloat(c?.mensualite) || 0), 0)).toLocaleString()} EUR`, color: COLORS.red },
                { label: 'Charges fixes', value: `${Math.round((profil.assurance_auto || 0) + (profil.assurance_habitation || 0) + (profil.assurance_sante || 0) + (profil.telephonie || 0) + (profil.internet || 0) + (profil.streaming || 0) + (profil.electricite || 0) + (profil.gaz || 0)).toLocaleString()} EUR`, color: COLORS.amber },
                { label: 'Situation', value: profil.situation === 'foyer' ? 'En foyer' : 'Seul(e)', color: COLORS.blue },
              ].map((item, i) => (
                <div key={i} style={{ background: COLORS.navyLight, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '4px', fontWeight: '600' }}>{item.label.toUpperCase()}</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* LISTE RECOS */}
          <div style={{ marginBottom: '20px' }}>
            {recos.map(reco => (
              <RecoCard key={reco.key} {...reco} />
            ))}
          </div>

          {/* DISCLAIMER */}
          <div style={{ padding: '16px', background: COLORS.amberLight, borderRadius: '12px', fontSize: '12px', color: COLORS.amber, fontWeight: '500', borderLeft: `3px solid ${COLORS.amber}`, lineHeight: '1.7' }}>
            ⚠️ Ces recommandations sont générées automatiquement à titre informatif et ne constituent pas un conseil financier personnalisé. Certains liens sont des liens partenaires — nous pouvons percevoir une commission si vous souscrivez via ces liens, sans coût supplémentaire pour vous. Consultez un conseiller financier agréé (CGP, banquier) avant toute décision importante.
          </div>
        </>
      )}
    </div>
  )
}