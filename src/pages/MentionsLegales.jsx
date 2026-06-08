const COLORS = {
  navy: '#0f2744', blue: '#1a56db', bluePale: '#eff6ff',
  white: '#ffffff', gray50: '#f8fafc', gray100: '#f1f5f9', gray200: '#e2e8f0',
  gray400: '#94a3b8', gray600: '#475569', amberLight: '#fef3c7', amber: '#d97706',
}

const Section = ({ titre, children }) => (
  <div style={{ background: COLORS.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)', marginBottom: '16px' }}>
    <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.navy, marginBottom: '12px', paddingBottom: '10px', borderBottom: `1px solid ${COLORS.gray200}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {titre}
    </div>
    <div style={{ fontSize: '13px', color: COLORS.gray600, lineHeight: '1.8' }}>{children}</div>
  </div>
)

export default function MentionsLegales() {
  return (
    <div style={{ padding: '28px', maxWidth: '720px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: '0 0 6px' }}>Mentions légales</h1>
        <p style={{ fontSize: '13px', color: COLORS.gray400, margin: 0 }}>Informations légales et réglementaires relatives à Banque Inside</p>
      </div>

      <Section titre="Éditeur du site">
        <p><strong>Raison sociale :</strong> [NOM / STRUCTURE JURIDIQUE À COMPLÉTER]</p>
        <p><strong>Adresse :</strong> [ADRESSE À COMPLÉTER]</p>
        <p><strong>Responsable de publication :</strong> [NOM DU RESPONSABLE]</p>
        <p><strong>Contact :</strong> [EMAIL DE CONTACT]</p>
      </Section>

      <Section titre="Hébergement">
        <p><strong>Hébergeur :</strong> Vercel Inc.</p>
        <p><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
        <p><strong>Site :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.blue }}>vercel.com</a></p>
      </Section>

      <Section titre="Statut réglementaire">
        <div style={{ padding: '12px 14px', background: COLORS.amberLight, borderRadius: '10px', borderLeft: `3px solid ${COLORS.amber}`, marginBottom: '12px' }}>
          <strong style={{ color: COLORS.amber }}>Inscription ORIAS en cours</strong><br />
          <span style={{ fontSize: '12px' }}>Intermédiaire en Opérations de Banque et Services de Paiement (IOBSP) — numéro ORIAS : [À COMPLÉTER LORS DE L'OBTENTION]</span>
        </div>
        <p>En attendant l'obtention du statut réglementaire, Banque Inside est un outil de simulation et d'information financière personnelle. Les informations présentées ne constituent pas un conseil financier personnalisé au sens de la réglementation MIF2.</p>
      </Section>

      <Section titre="Disclaimer financier">
        <p>Les simulations, calculs et informations présentés sur Banque Inside sont fournis à titre indicatif uniquement. Ils ne constituent en aucun cas :</p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
          <li>un conseil en investissement financier,</li>
          <li>une offre de crédit ou un engagement de financement,</li>
          <li>un conseil fiscal ou juridique personnalisé.</li>
        </ul>
        <p>Toute décision financière importante doit être prise après consultation d'un professionnel agréé (conseiller financier, courtier, notaire, expert-comptable).</p>
        <p>Les taux et données de marché utilisés dans les simulations sont indicatifs et peuvent ne pas refléter les conditions réelles proposées par les établissements financiers.</p>
      </Section>

      <Section titre="Liens affiliés et partenariats">
        <p>Certains liens présents sur Banque Inside sont des liens affiliés. Banque Inside peut percevoir une commission si vous souscrivez un produit ou service via ces liens, <strong>sans coût supplémentaire pour vous</strong>.</p>
        <p>Ces partenariats ne modifient pas l'objectivité des informations présentées. Banque Inside ne recommande que des plateformes reconnues et réglementées.</p>
        <p>La présence d'un lien affilié est systématiquement signalée par la mention "🔗 Lien partenaire".</p>
      </Section>

      <Section titre="Protection des données (RGPD)">
        <p><strong>Responsable du traitement :</strong> [NOM / STRUCTURE À COMPLÉTER]</p>
        <p><strong>Données collectées :</strong> adresse email, données financières personnelles saisies (revenus, dépenses, crédits). Ces données sont stockées sur les serveurs Supabase (infrastructure AWS eu-west-1).</p>
        <p><strong>Finalité :</strong> fourniture du service d'analyse financière personnelle.</p>
        <p><strong>Conservation :</strong> jusqu'à suppression du compte par l'utilisateur.</p>
        <p><strong>Droits :</strong> vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données via la page "Mon Compte". Pour toute demande, contactez [EMAIL DE CONTACT].</p>
        <p><strong>Politique de confidentialité complète :</strong> [LIEN À AJOUTER]</p>
      </Section>

      <Section titre="Cookies et traceurs">
        <p>Banque Inside n'utilise pas de cookies publicitaires. Des cookies techniques strictement nécessaires au fonctionnement de l'authentification (Supabase Auth) sont utilisés.</p>
      </Section>

      <div style={{ fontSize: '12px', color: COLORS.gray400, textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  )
}
