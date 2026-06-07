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

const cardStyle = {
  background: COLORS.white, borderRadius: '16px', padding: '24px',
  boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '16px',
}

function Section({ numero, titre, icon, couleur, children }) {
  return (
    <div style={{ ...cardStyle, borderTop: `3px solid ${couleur}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '11px', color: COLORS.gray400, fontWeight: '600', letterSpacing: '0.06em' }}>ÉTAPE {numero}</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.navy }}>{titre}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function Info({ children, couleur, icon }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: '10px',
      background: couleur + '18',
      borderLeft: `3px solid ${couleur}`,
      marginBottom: '10px', fontSize: '13px',
      color: COLORS.gray600, lineHeight: '1.7'
    }}>
      {icon && <span style={{ marginRight: '6px' }}>{icon}</span>}
      {children}
    </div>
  )
}

function Titre({ children }) {
  return (
    <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.navy, marginBottom: '10px', marginTop: '20px' }}>
      {children}
    </div>
  )
}

export default function GuideUtilisation() {
  return (
    <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: COLORS.navy, margin: '0 0 8px' }}>Guide d'utilisation</h1>
        <p style={{ fontSize: '14px', color: COLORS.gray400, margin: 0, lineHeight: '1.6' }}>
          Bienvenue ! Ce guide vous explique comment utiliser chaque module de l'application et ce que signifient les indicateurs affichés.
        </p>
      </div>

      {/* VUE D'ENSEMBLE */}
      <div style={{ background: COLORS.navy, borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          🗺 Les 6 modules de l'application
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {[
            { icon: '✎', label: 'Saisie des données', desc: 'Votre point de départ obligatoire', color: COLORS.blue },
            { icon: '⊞', label: 'Dashboard', desc: 'Vos indicateurs financiers clés', color: COLORS.green },
            { icon: '◈', label: 'Patrimoine net', desc: 'Vos actifs et vos dettes', color: '#0ea5e9' },
            { icon: '⟁', label: 'Simulations', desc: 'Projections épargne et crédit', color: COLORS.amber },
            { icon: '⚑', label: 'Alertes', desc: 'Points de vigilance', color: COLORS.red },
            { icon: '◎', label: 'Analyse bancaire', desc: 'Score et indicateurs avancés', color: COLORS.purple },
          ].map((m, i) => (
            <div key={i} style={{ background: COLORS.navyLight, borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>{m.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', marginBottom: '3px' }}>{m.label}</div>
              <div style={{ fontSize: '11px', color: COLORS.gray400, lineHeight: '1.4' }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ETAPE 1 */}
      <Section numero="1" titre="Saisie des données — Par où commencer" icon="✎" couleur={COLORS.blue}>
        <Info couleur={COLORS.blue} icon="💡">
          C'est la première page à remplir. Toutes les autres analyses sont basées sur les informations que vous saisissez ici. Pensez à sauvegarder après chaque modification.
        </Info>

        <Titre>👤 Situation familiale</Titre>
        <Info couleur={COLORS.green}>
          <strong>Seul(e)</strong> — Vous saisissez vos revenus et dépenses personnels. Toutes les analyses portent sur votre situation individuelle.
        </Info>
        <Info couleur={COLORS.purple}>
          <strong>En foyer</strong> — Deux colonnes apparaissent pour saisir les données de chaque conjoint séparément. Dans le Dashboard et le Patrimoine, vous pouvez ensuite basculer entre la vue <strong>Personnelle</strong> et la vue <strong>Foyer</strong>.
        </Info>

        <Titre>💼 Revenus à saisir</Titre>
        <Info couleur={COLORS.blue} icon="⚠️">
          Saisissez votre <strong>salaire net imposable</strong> — c'est le montant indiqué sur votre fiche de paie, avant le prélèvement à la source. Ce n'est pas le montant net à payer sur votre compte.
        </Info>
        <Info couleur={COLORS.green}>
          Vous pouvez également renseigner vos <strong>revenus fonciers</strong> (loyers perçus) et vos <strong>autres revenus</strong> (primes, revenus exceptionnels, etc.).
        </Info>
        <Info couleur={COLORS.purple}>
          <strong>En foyer :</strong> si vos revenus fonciers sont communs aux deux conjoints, utilisez le bouton <strong>÷ 2 commun</strong> sur le Conjoint 2. L'application répartit automatiquement le montant en deux parts égales.
        </Info>

        <Titre>🛒 Dépenses à saisir</Titre>
        <Info couleur={COLORS.red}>
          Renseignez toutes vos dépenses mensuelles : logement, alimentation, transports, loisirs, santé, et autres. Ces données servent à calculer votre épargne disponible et à analyser la répartition de vos dépenses.
        </Info>
        <Info couleur={COLORS.purple} icon="🏛">
          <strong>Impôts</strong> — Saisissez le montant mensuel de votre impôt sur le revenu (divisez le montant annuel par 12). Cela permet d'afficher dans le Dashboard votre taux d'endettement et votre reste à vivre <strong>avant et après impôts</strong>, ce qui donne une vision beaucoup plus réaliste de votre situation.
        </Info>

        <Titre>🏦 Crédits en cours</Titre>
        <Info couleur={COLORS.navy}>
          Pour chaque crédit, renseignez la <strong>mensualité</strong>, la <strong>durée restante en mois</strong> et le <strong>capital restant dû</strong>. Ces informations sont utilisées pour calculer votre taux d'endettement et votre capacité d'emprunt.
        </Info>
        <Info couleur={COLORS.purple}>
          <strong>En foyer :</strong> cochez "Crédit commun aux deux conjoints" si le crédit est partagé. En vue personnelle, seule la moitié de la mensualité sera comptabilisée dans votre taux d'endettement.
        </Info>
      </Section>

      {/* ETAPE 2 */}
      <Section numero="2" titre="Dashboard — Comprendre vos indicateurs" icon="⊞" couleur={COLORS.green}>
        <Info couleur={COLORS.green} icon="💡">
          Le Dashboard se met à jour automatiquement dès que vous sauvegardez vos données. En foyer, utilisez le toggle <strong>Personnel / Foyer</strong> pour voir les chiffres individuels ou combinés.
        </Info>

        <Titre>🎯 Score financier</Titre>
        <Info couleur={COLORS.green}>
          Le score sur 100 reflète la santé globale de votre situation financière. Il tient compte de votre taux d'épargne et de votre taux d'endettement. Un score de <strong>70 ou plus</strong> indique un profil solide. Entre <strong>50 et 70</strong>, votre profil est correct. En dessous de <strong>50</strong>, des améliorations sont nécessaires.
        </Info>

        <Titre>💰 Épargne mensuelle</Titre>
        <Info couleur={COLORS.blue}>
          C'est ce qu'il vous reste chaque mois après avoir payé toutes vos dépenses et vos mensualités de crédit. L'objectif recommandé est d'épargner entre <strong>15% et 20%</strong> de vos revenus mensuels.
        </Info>

        <Titre>📊 Taux d'endettement</Titre>
        <Info couleur={COLORS.amber}>
          C'est le calcul utilisé par les banques pour évaluer votre capacité à emprunter. Il mesure la part de vos revenus consacrée au remboursement de vos crédits et de votre loyer. La règle bancaire impose un maximum de <strong>35%</strong>.
        </Info>
        <Info couleur={COLORS.blue}>
          <strong>Avant impôts</strong> — C'est le calcul bancaire classique, basé sur vos revenus bruts. C'est ce que regarde votre banque quand vous faites une demande de prêt.
        </Info>
        <Info couleur={COLORS.purple}>
          <strong>Après impôts</strong> — C'est la vision la plus réaliste de votre situation. Votre impôt sur le revenu est déduit de vos revenus avant le calcul, ce qui donne un taux d'endettement souvent plus élevé mais plus proche de la réalité.
        </Info>

        <Titre>🏠 Reste à vivre</Titre>
        <Info couleur={COLORS.green}>
          C'est ce qu'il vous reste après avoir payé tous vos crédits et votre loyer. Le reste à vivre <strong>avant impôts</strong> correspond à la vision bancaire. Le reste à vivre <strong>après impôts</strong> est ce dont vous disposez réellement au quotidien.
        </Info>

        <Titre>🏦 Capacité d'emprunt</Titre>
        <Info couleur={COLORS.navy}>
          Indique le montant maximum que vous pouvez emprunter en respectant la règle des 35% d'endettement. Votre capacité d'emprunt tient compte de vos crédits déjà en cours — seule la part disponible est utilisée pour calculer le nouveau prêt possible.
        </Info>
        <Info couleur={COLORS.blue}>
          Utilisez le toggle <strong>10 / 15 / 20 / 25 ans</strong> pour voir comment la durée du prêt influence le montant empruntable. Les taux utilisés sont les taux moyens du marché actuels mis à jour régulièrement.
        </Info>
      </Section>

      {/* ETAPE 3 */}
      <Section numero="3" titre="Patrimoine net — Vos actifs et vos dettes" icon="◈" couleur="#0ea5e9">
        <Info couleur="#0ea5e9" icon="💡">
          Cette page calcule votre patrimoine net total, c'est-à-dire tout ce que vous possédez réellement après déduction de ce que vous devez encore rembourser.
        </Info>

        <Titre>💰 Patrimoine financier</Titre>
        <Info couleur="#0ea5e9">
          Renseignez vos produits d'épargne répartis en trois horizons : <strong>court terme</strong> (Livret A, LEP, LDDS), <strong>moyen terme</strong> (PEL, CEL, Compte à terme) et <strong>long terme</strong> (PEA, Assurance vie, PER, Actions).
        </Info>
        <Info couleur={COLORS.purple}>
          <strong>En foyer :</strong> cochez "Produit commun" pour les produits partagés. En vue personnelle, la valeur des produits communs est automatiquement divisée par 2 pour afficher votre part.
        </Info>

        <Titre>🏠 Patrimoine immobilier</Titre>
        <Info couleur={COLORS.green}>
          Pour chaque bien immobilier, renseignez le type, le nom, la valeur estimée et le crédit immobilier associé. L'application calcule automatiquement la <strong>valeur nette</strong> en déduisant le capital restant dû sur le crédit lié.
        </Info>
        <Info couleur={COLORS.amber}>
          <strong>Conseil :</strong> liez toujours vos biens immobiliers à leur crédit correspondant (saisi dans Saisie des données) pour obtenir une valeur nette précise et réaliste.
        </Info>

        <Titre>👤 Toggle Personnel / Commun</Titre>
        <Info couleur={COLORS.navy}>
          <strong>Vue Commun</strong> — Affiche le patrimoine total du foyer, tous produits et biens confondus sans division. <br /><br />
          <strong>Vue Personnelle</strong> — Affiche uniquement votre part : les produits et biens marqués comme communs sont divisés par 2.
        </Info>
      </Section>

      {/* ETAPE 4 */}
      <Section numero="4" titre="Simulations — Projetez votre avenir financier" icon="⟁" couleur={COLORS.amber}>
        <Info couleur={COLORS.amber} icon="💡">
          Les simulations sont totalement indépendantes de vos données saisies. Vous pouvez tester librement n'importe quel scénario avec les sliders sans que cela ne modifie votre profil.
        </Info>

        <Titre>💰 Famille Épargne</Titre>
        <Info couleur={COLORS.amber}>
          Simulez la croissance de votre épargne sur trois horizons indépendants : court terme (1 à 5 ans), moyen terme (3 à 15 ans) et long terme (10 à 40 ans). Le graphique en haut affiche la progression combinée de vos trois poches d'épargne.
        </Info>
        <Info couleur={COLORS.blue}>
          Les intérêts sont calculés en <strong>intérêts composés</strong> — chaque année, les intérêts générés sont réinvestis et produisent eux-mêmes des intérêts. C'est l'effet boule de neige de l'épargne sur le long terme.
        </Info>

        <Titre>🏦 Famille Crédit</Titre>
        <Info couleur={COLORS.blue}>
          Le <strong>capital emprunté</strong> est calculé ainsi : prix du bien + frais de notaire - apport. Les frais de notaire sont généralement financés par le crédit, c'est pourquoi ils sont inclus dans le capital emprunté.
        </Info>
        <Info couleur={COLORS.green}>
          La <strong>mensualité totale</strong> comprend deux parties : la mensualité du crédit et la mensualité d'assurance emprunteur. Ces deux montants sont affichés séparément pour plus de transparence.
        </Info>
        <Info couleur={COLORS.red}>
          Le <strong>coût total de l'opération</strong> représente le vrai coût de votre acquisition au-delà du prix du bien : il additionne les frais de notaire, le coût total des intérêts et le coût total de l'assurance sur toute la durée du prêt.
        </Info>
        <Info couleur={COLORS.purple}>
          Le <strong>graphique d'amortissement</strong> montre année par année la part du capital déjà remboursé (en vert) et le capital qu'il vous reste à rembourser (en rouge). Au début du crédit, vous remboursez surtout des intérêts — la part de capital augmente progressivement.
        </Info>
      </Section>

      {/* ETAPE 5 */}
      <Section numero="5" titre="Alertes — Points de vigilance" icon="⚑" couleur={COLORS.red}>
        <Info couleur={COLORS.red} icon="💡">
          Les alertes sont générées automatiquement en analysant vos données financières. Elles sont classées en trois niveaux de priorité.
        </Info>
        <Info couleur={COLORS.amber}>
          <strong>⚠ Points de vigilance</strong> — Situations qui nécessitent une action de votre part : charges trop élevées par rapport à vos revenus, taux d'épargne insuffisant, taux d'endettement trop élevé.
        </Info>
        <Info couleur={COLORS.blue}>
          <strong>ℹ Informations</strong> — Points à surveiller sans urgence immédiate : échéances à venir, renouvellements de contrats, opportunités d'optimisation.
        </Info>
        <Info couleur={COLORS.green}>
          <strong>✓ Points positifs</strong> — Objectifs atteints et indicateurs au vert : fonds d'urgence constitué, taux d'endettement sain, revenus stables, épargne régulière.
        </Info>
      </Section>

      {/* CONSEILS */}
      <div style={{ background: COLORS.navy, borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          💡 Conseils pour bien utiliser l'application
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { icon: '1️⃣', text: 'Commencez toujours par la Saisie des données — c\'est le socle de toutes vos analyses.' },
            { icon: '2️⃣', text: 'Mettez à jour vos données chaque mois pour suivre l\'évolution de votre situation dans le temps.' },
            { icon: '3️⃣', text: 'En foyer, utilisez les deux vues Personnel et Foyer pour avoir une vision complète de votre situation.' },
            { icon: '4️⃣', text: 'Dans Patrimoine, liez toujours vos biens immobiliers à leurs crédits pour un calcul de valeur nette précis.' },
            { icon: '5️⃣', text: 'Les Simulations sont libres — testez différents scénarios sans modifier vos données réelles.' },
            { icon: '6️⃣', text: 'Le taux d\'endettement après impôts est le plus réaliste pour évaluer votre vraie capacité financière au quotidien.' },
            { icon: '7️⃣', text: 'Dans la capacité d\'emprunt, comparez les différentes durées — un crédit plus long réduit la mensualité mais augmente le coût total.' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 12px', background: COLORS.navyLight, borderRadius: '10px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{c.icon}</span>
              <span style={{ fontSize: '13px', color: COLORS.gray400, lineHeight: '1.6' }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DISCLAIMER */}
      <div style={{ padding: '16px', background: COLORS.amberLight, borderRadius: '12px', fontSize: '12px', color: COLORS.amber, fontWeight: '500', borderLeft: `3px solid ${COLORS.amber}`, lineHeight: '1.7' }}>
        ⚠️ Les informations et calculs fournis par cette application sont purement indicatifs et ne constituent pas un conseil financier personnalisé. Consultez un conseiller financier agréé avant toute décision importante.
      </div>
    </div>
  )
}