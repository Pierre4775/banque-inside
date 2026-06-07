import { useState, useEffect, useRef, Component } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import SaisieDonnees from './pages/SaisieDonnees'
import AnalyseBancaire from './pages/AnalyseBancaire'
import Simulations from './pages/Simulations'
import Alertes from './pages/Alertes'
import Login from './pages/Login'
import PatrimoineNet from './pages/PatrimoineNet'
import GuideUtilisation from './pages/GuideUtilisation'
import Recommandations from './pages/Recommandations'
import { supabase } from './supabase'
import jsPDF from 'jspdf'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f2744', marginBottom: '8px' }}>
            Une erreur s'est produite sur cette page
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}
          >
            Réessayer
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function useCountUp(target, duration = 400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target == null) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

function AnimatedNumber({ value, suffix = '' }) {
  const animated = useCountUp(value)
  return <span>{animated.toLocaleString()}{suffix}</span>
}

const COLORS = {
  navy: '#0f2744',
  navyLight: '#163459',
  blue: '#1a56db',
  blueLight: '#3b82f6',
  bluePale: '#eff6ff',
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray400: '#94a3b8',
  gray600: '#475569',
  gray800: '#1e293b',
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

const navItems = [
  { label: 'Dashboard', icon: '⊞' },
  { label: 'Saisie donnees', sub: 'Revenus, depenses, credits', icon: '✎' },
  { label: 'Analyse bancaire', sub: 'Score et indicateurs', icon: '◎' },
  { label: 'Patrimoine net', sub: 'Actifs, passifs, evolution', icon: '◈' },
  { label: 'Simulations', sub: 'Projections et scenarios', icon: '⟁' },
  { label: 'Alertes', sub: 'Points de vigilance', icon: '⚑' },
  { label: 'Recommandations', sub: 'Plan action personnalise', icon: '★' },
  { label: 'Guide utilisation', sub: 'Mode emploi', icon: '?' },
]

// =====================
// GÉNÉRATION PDF
// =====================
function genererPDF(profil, vueMode) {
  if (!profil) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const M = 14
  let y = 0

  // Palette couleurs
  const cNavy  = [15, 39, 68]
  const cNavyL = [22, 52, 89]
  const cBlue  = [26, 86, 219]
  const cGreen = [5, 150, 105]
  const cRed   = [220, 38, 38]
  const cAmber = [217, 119, 6]
  const cPurple= [124, 58, 237]
  const cGray  = [148, 163, 184]
  const cGrayL = [241, 245, 249]
  const cWhite = [255, 255, 255]
  const cGreenL= [209, 250, 229]
  const cRedL  = [254, 226, 226]
  const cAmberL= [254, 243, 199]
  const cBlueL = [239, 246, 255]

  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  // ---- Calculs ----
  const r1 = (profil.salaire||0)+(profil.revenus_fonciers||0)+(profil.autres_revenus||0)
  const r2 = (profil.salaire2||0)+(profil.revenus_fonciers2||0)+(profil.autres_revenus2||0)
  const totalRevenus = vueMode==='foyer' ? r1+r2 : r1
  const imp1 = profil.impots||0
  const imp2 = profil.impots2||0
  const totalImpots = vueMode==='foyer' ? imp1+imp2 : imp1
  const d1 = (profil.logement||0)+(profil.alimentation||0)+(profil.transports||0)+(profil.loisirs||0)+(profil.sante||0)+(profil.autres_depenses||0)+(profil.assurance_auto||0)+(profil.assurance_habitation||0)+(profil.assurance_sante||0)+(profil.telephonie||0)+(profil.internet||0)+(profil.streaming||0)+(profil.electricite||0)+(profil.gaz||0)
  const d2 = (profil.logement2||0)+(profil.alimentation2||0)+(profil.transports2||0)+(profil.loisirs2||0)+(profil.sante2||0)+(profil.autres_depenses2||0)+(profil.assurance_auto2||0)+(profil.assurance_habitation2||0)+(profil.assurance_sante2||0)+(profil.telephonie2||0)+(profil.internet2||0)+(profil.streaming2||0)+(profil.electricite2||0)+(profil.gaz2||0)
  const totalDepenses = vueMode==='foyer' ? d1+d2 : d1
  const cI = Array.isArray(profil.credits_immo) ? profil.credits_immo : []
  const cA = Array.isArray(profil.credits_autre) ? profil.credits_autre : []
  const totalMens = [...cI,...cA].reduce((a,c)=>a+(parseFloat(c?.mensualite)||0),0)
  const loyer = vueMode==='foyer' ? (profil.logement||0)+(profil.logement2||0) : (profil.logement||0)
  const chargesEndt = totalMens+loyer
  const tauxEndt = totalRevenus>0 ? Math.round(chargesEndt/totalRevenus*100) : 0
  const revenusNets = totalRevenus-totalImpots
  const tauxEndtNet = revenusNets>0 ? Math.round(chargesEndt/revenusNets*100) : 0
  const rav = totalRevenus-chargesEndt
  const ravNet = revenusNets-chargesEndt
  const epargne = totalRevenus-totalDepenses-totalMens-totalImpots
  const tauxEp = totalRevenus>0 ? Math.round(epargne/totalRevenus*100) : 0
  const score = Math.min(100,Math.max(0,Math.round(50+tauxEp-tauxEndt)))
  const mensMax = Math.max(0, totalRevenus*0.35-totalMens)
  const rr = TAUX_MARCHE[20]/100/12
  const nn = 240
  const capEmprunt = mensMax>0 ? Math.round(mensMax*(1-Math.pow(1+rr,-nn))/rr) : 0
  const epCourt = (Array.isArray(profil.epargne_court) ? profil.epargne_court : []).reduce((a,e)=>a+(parseFloat(e?.montant)||0),0)
  const epMoyen = (Array.isArray(profil.epargne_moyen) ? profil.epargne_moyen : []).reduce((a,e)=>a+(parseFloat(e?.montant)||0),0)
  const epLong  = (Array.isArray(profil.epargne_long) ? profil.epargne_long : []).reduce((a,e)=>a+(parseFloat(e?.montant)||0),0)
  const totFin  = epCourt+epMoyen+epLong
  const totImmo = (Array.isArray(profil.biens_immo) ? profil.biens_immo : []).reduce((a,b)=>{
    const val=parseFloat(b.valeur)||0
    const cr=cI[parseInt(b.creditLie)]
    const cap=cr?parseFloat(cr.capital)||0:0
    return a+(val-cap)
  },0)
  const patTotal = totFin+totImmo
  const scoreColor = score>=70?cGreen:score>=50?cAmber:cRed
  const scoreLabel = score>=70?'PROFIL SOLIDE':score>=50?'PROFIL CORRECT':'A AMELIORER'

  // Formatage nombres propres (espace comme séparateur milliers, pas de slash)
  const fmt = (n) => {
    const rounded = Math.round(n)
    const parts = Math.abs(rounded).toString().split('')
    const withSpaces = parts.reverse().reduce((acc, digit, i) => {
      if (i > 0 && i % 3 === 0) acc.push(' ')
      acc.push(digit)
      return acc
    }, []).reverse().join('')
    return (rounded < 0 ? '-' : '') + withSpaces + ' EUR'
  }
  const fmtK = (n) => Math.round(n/1000) + 'k EUR'
  const fmtPct = (n) => n + '%'

  // ---- Helpers mise en page ----
  const pageHeader = () => {
    doc.setFillColor(...cNavy)
    doc.rect(0, 0, W, 11, 'F')
    doc.setFillColor(...cBlue)
    doc.rect(0, 11, W, 1.5, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...cWhite)
    doc.text('BANQUE INSIDE  —  ANALYSE FINANCIERE PERSONNELLE', M, 7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...cGray)
    doc.text(date, W-M, 7.5, { align: 'right' })
  }

  const secTitle = (title, yy, col) => {
    const c = col || cNavy
    doc.setFillColor(...c)
    doc.roundedRect(M, yy, W-M*2, 7.5, 1.5, 1.5, 'F')
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...cWhite)
    doc.text(title, M+3, yy+5.2)
    return yy+9.5
  }

  const dataRow = (label, value, yy, opts={}) => {
    const h = 7.5
    const bg = opts.bg || (opts.alt ? [248,250,252] : cWhite)
    doc.setFillColor(...bg)
    doc.rect(M, yy, W-M*2, h, 'F')
    doc.setDrawColor(226,232,240)
    doc.setLineWidth(0.2)
    doc.line(M, yy+h, W-M, yy+h)
    doc.setFontSize(opts.bold ? 8.5 : 8)
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    doc.setTextColor(...(opts.labelColor || cNavy))
    doc.text(label, M+3, yy+h-2)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...(opts.valueColor || (opts.bold ? cNavy : [71,85,105])))
    doc.text(value, W-M-3, yy+h-2, { align: 'right' })
    return yy+h
  }

  const kpiBox = (x, yy, w, h, label, value, unit, vc, bg) => {
    doc.setFillColor(...bg)
    doc.roundedRect(x, yy, w, h, 2, 2, 'F')
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...cGray)
    doc.text(label.toUpperCase(), x+w/2, yy+5.5, { align: 'center' })
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...vc)
    doc.text(value, x+w/2, yy+13.5, { align: 'center' })
    if (unit) {
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...cGray)
      doc.text(unit, x+w/2, yy+18.5, { align: 'center' })
    }
  }

  // =====================
  // PAGE 1 — COUVERTURE
  // =====================
  // Fond navy haut
  doc.setFillColor(...cNavy)
  doc.rect(0, 0, W, 95, 'F')
  doc.setFillColor(...cBlue)
  doc.rect(0, 95, W, 3, 'F')

  // Logo
  doc.setFillColor(...cNavyL)
  doc.roundedRect(M, 14, 55, 13, 2, 2, 'F')
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...cWhite)
  doc.text('BANQUE INSIDE', M+3, 22.5)

  // Grand titre
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...cWhite)
  doc.text('RAPPORT', M, 48)
  doc.text('FINANCIER', M, 62)
  doc.text('PERSONNEL', M, 76)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...cGray)
  doc.text('Genere le ' + date, M, 88)

  y = 106

  // Bloc score
  const sW = W-M*2
  doc.setFillColor(...cGrayL)
  doc.roundedRect(M, y, sW, 40, 3, 3, 'F')
  doc.setFillColor(...scoreColor)
  doc.roundedRect(M, y, 5, 40, 2, 2, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...cGray)
  doc.text('SCORE FINANCIER GLOBAL', M+10, y+9)

  doc.setFontSize(42)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...scoreColor)
  doc.text(String(score), M+10, y+30)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...cGray)
  doc.text('/ 100', M+10+doc.getTextWidth(String(score))+2, y+30)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...scoreColor)
  doc.text(scoreLabel, W-M-4, y+22, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...cGray)
  doc.text('Indice de sante financiere', W-M-4, y+31, { align: 'right' })

  y += 46

  // 4 KPIs
  const kW = (sW-9)/4
  kpiBox(M,        y, kW, 24, 'Revenus nets',  fmtK(revenusNets),  'par mois', cBlue,  cBlueL)
  kpiBox(M+kW+3,   y, kW, 24, 'Epargne',       fmtK(epargne),      'par mois', epargne>=0?cGreen:cRed, epargne>=0?cGreenL:cRedL)
  kpiBox(M+(kW+3)*2, y, kW, 24, 'Endettement', fmtPct(tauxEndt),   tauxEndt<=35?'Zone verte':'Attention', tauxEndt<=35?cGreen:cRed, tauxEndt<=35?cGreenL:cRedL)
  kpiBox(M+(kW+3)*3, y, kW, 24, 'Patrimoine',  fmtK(patTotal),     'net total', cNavy, cGrayL)

  y += 30

  // Situation
  doc.setFillColor(...cNavyL)
  doc.roundedRect(M, y, sW, 10, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...cGray)
  doc.text(
    'Situation : '+(profil.situation==='foyer'?'En foyer':'Seul(e)')+
    '   |   Vue : '+(vueMode==='foyer'?'Foyer':'Personnelle')+
    '   |   Personnes a charge : '+(profil.personnes_charge||0),
    W/2, y+6.5, { align: 'center' }
  )

  y += 16

  // Disclaimer
  doc.setFillColor(...cAmberL)
  doc.roundedRect(M, y, sW, 14, 2, 2, 'F')
  doc.setFillColor(...cAmber)
  doc.roundedRect(M, y, 3, 14, 1, 1, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...cAmber)
  doc.text('AVERTISSEMENT', M+6, y+5.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(146, 100, 4)
  doc.text('Ce rapport est genere automatiquement a titre informatif. Il ne constitue pas un conseil financier personnalise.', M+6, y+10.5)

  // =====================
  // PAGE 2 — REVENUS & DÉPENSES
  // =====================
  doc.addPage()
  pageHeader()
  y = 18

  y = secTitle('1.  REVENUS MENSUELS', y, cBlue)

  const revRows = [
    ['Salaire net imposable', fmt(profil.salaire||0)],
    ['Revenus fonciers', fmt(profil.revenus_fonciers||0)],
    ['Autres revenus', fmt(profil.autres_revenus||0)],
  ]
  if (vueMode==='foyer') {
    revRows.push(['Salaire Conjoint 2', fmt(profil.salaire2||0)])
    revRows.push(['Revenus fonciers Conjoint 2', fmt(profil.revenus_fonciers2||0)])
  }
  revRows.forEach(([l,v],i) => { y = dataRow(l,v,y,{alt:i%2===0}) })
  y = dataRow('TOTAL REVENUS BRUTS', fmt(totalRevenus), y, {bg:cBlueL, bold:true, valueColor:cBlue})
  y = dataRow('Impots sur le revenu', '- '+fmt(totalImpots), y, {alt:true, valueColor:cPurple})
  y = dataRow('REVENUS NETS D\'IMPOTS', fmt(revenusNets), y, {bg:cGreenL, bold:true, valueColor:cGreen})

  y += 7

  y = secTitle('2.  DEPENSES MENSUELLES', y, cRed)

  const depRows = [
    ['Logement (loyer / charges)', fmt(profil.logement||0)],
    ['Alimentation', fmt(profil.alimentation||0)],
    ['Transports', fmt(profil.transports||0)],
    ['Sante (hors mutuelle)', fmt(profil.sante||0)],
    ['Loisirs', fmt(profil.loisirs||0)],
    ['Assurance auto', fmt(profil.assurance_auto||0)],
    ['Assurance habitation', fmt(profil.assurance_habitation||0)],
    ['Mutuelle / Assurance sante', fmt(profil.assurance_sante||0)],
    ['Electricite', fmt(profil.electricite||0)],
    ['Gaz', fmt(profil.gaz||0)],
    ['Box internet', fmt(profil.internet||0)],
    ['Telephonie', fmt(profil.telephonie||0)],
    ['Streaming et abonnements', fmt(profil.streaming||0)],
    ['Autres depenses', fmt(profil.autres_depenses||0)],
  ]
  depRows.forEach(([l,v],i) => { y = dataRow(l,v,y,{alt:i%2===0}) })
  y = dataRow('TOTAL DEPENSES', fmt(totalDepenses), y, {bg:cRedL, bold:true, valueColor:cRed})

  y += 7

  y = secTitle('3.  CREDITS EN COURS', y, cAmber)

  const allC = [...cI,...cA]
  if (allC.length>0) {
    allC.forEach((c,i) => {
      y = dataRow('Credit #'+(i+1)+'  —  Mensualite', fmt(parseFloat(c.mensualite)||0), y, {alt:i%2===0})
      y = dataRow('Credit #'+(i+1)+'  —  Capital restant du', fmt(parseFloat(c.capital)||0), y, {alt:i%2!==0})
    })
  } else {
    y = dataRow('Aucun credit en cours', '—', y, {alt:true})
  }
  y = dataRow('TOTAL MENSUALITES', fmt(totalMens), y, {bg:cAmberL, bold:true, valueColor:cAmber})

  // N° page
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(...cGray)
  doc.text('Page 2', W/2, 292, {align:'center'})

  // =====================
  // PAGE 3 — INDICATEURS
  // =====================
  doc.addPage()
  pageHeader()
  y = 18

  y = secTitle('4.  INDICATEURS FINANCIERS CLES', y, cNavy)

  const indics = [
    ['Epargne mensuelle disponible',         fmt(epargne),        epargne>=0?cGreen:cRed,  epargne>=0?cGreenL:cRedL],
    ['Taux d\'epargne',                       fmtPct(tauxEp),      tauxEp>=15?cGreen:cAmber, tauxEp>=15?cGreenL:cAmberL],
    ['Taux d\'endettement (avant impots)',    fmtPct(tauxEndt),    tauxEndt<=35?cGreen:cRed, tauxEndt<=35?cGreenL:cRedL],
    ['Taux d\'endettement (apres impots)',    fmtPct(tauxEndtNet), tauxEndtNet<=35?cGreen:cRed, tauxEndtNet<=35?cGreenL:cRedL],
    ['Reste a vivre (avant impots)',          fmt(rav),            rav>=0?cGreen:cRed,       rav>=0?cGreenL:cRedL],
    ['Reste a vivre (apres impots)',          fmt(ravNet),         ravNet>=0?cGreen:cRed,    ravNet>=0?cGreenL:cRedL],
    ['Capacite d\'emprunt (20 ans)',          fmt(capEmprunt),     cBlue,                    cBlueL],
    ['Mensualite d\'emprunt disponible',      fmt(mensMax),        cBlue,                    cBlueL],
  ]

  indics.forEach(([label,value,vc,bg]) => {
    doc.setFillColor(...bg)
    doc.rect(M, y, W-M*2, 8.5, 'F')
    doc.setDrawColor(226,232,240); doc.setLineWidth(0.2)
    doc.line(M, y+8.5, W-M, y+8.5)
    doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(...cNavy)
    doc.text(label, M+3, y+6)
    doc.setFont('helvetica','bold'); doc.setTextColor(...vc)
    doc.text(value, W-M-3, y+6, {align:'right'})
    y += 9.5
  })

  y += 7

  // Barre endettement
  y = secTitle('TAUX D\'ENDETTEMENT  —  VISUALISATION', y, cNavy)
  y += 4

  const barTotalW = W-M*2
  doc.setFillColor(226,232,240)
  doc.roundedRect(M, y, barTotalW, 8, 2, 2, 'F')

  const barFillW = Math.min(tauxEndt,100)/100*barTotalW
  const bCol = tauxEndt<=35?cGreen:tauxEndt<=50?cAmber:cRed
  doc.setFillColor(...bCol)
  doc.roundedRect(M, y, barFillW, 8, 2, 2, 'F')

  // Marqueur 35%
  const x33 = M + barTotalW*0.35
  doc.setDrawColor(100,116,139); doc.setLineWidth(0.4)
  doc.line(x33, y, x33, y+8)

  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(...cGray)
  doc.text('0%', M, y+13)
  doc.text('35% — limite bancaire', x33-2, y+13, {align:'right'})
  doc.text('100%', W-M, y+13, {align:'right'})
  doc.setFontSize(8.5); doc.setFont('helvetica','bold'); doc.setTextColor(...bCol)
  doc.text('Votre taux : '+tauxEndt+'%', W/2, y+13, {align:'center'})

  y += 20

  // Patrimoine
  y = secTitle('5.  PATRIMOINE NET', y, cGreen)

  const patRows = [
    ['Epargne court terme (Livret A, LEP, LDDS)',    fmt(epCourt),  cGray,  [248,250,252]],
    ['Epargne moyen terme (PEL, CEL, Compte terme)', fmt(epMoyen),  cGray,  cWhite],
    ['Epargne long terme (PEA, Assurance vie, PER)', fmt(epLong),   cGray,  [248,250,252]],
    ['TOTAL PATRIMOINE FINANCIER',                   fmt(totFin),   cBlue,  cBlueL],
  ]
  patRows.forEach(([l,v,vc,bg],i) => {
    y = dataRow(l, v, y, {bg, bold:i===3, valueColor:vc})
  })

  ;(profil.biens_immo||[]).forEach((b,i) => {
    const val = parseFloat(b.valeur)||0
    const cr  = cI[parseInt(b.creditLie)]
    const cap = cr ? parseFloat(cr.capital)||0 : 0
    y = dataRow(
      (b.type||'Bien') + (b.nom?' — '+b.nom:''),
      fmt(val-cap),
      y,
      {alt: i%2===0}
    )
  })

  y = dataRow('TOTAL PATRIMOINE IMMOBILIER NET', fmt(totImmo), y, {bg:cGreenL, bold:true, valueColor:cGreen})

  y += 5

  // Bloc patrimoine total
  doc.setFillColor(...cNavy)
  doc.roundedRect(M, y, W-M*2, 15, 3, 3, 'F')
  doc.setFillColor(...cBlue)
  doc.roundedRect(M, y, 4, 15, 2, 2, 'F')
  doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(...cGray)
  doc.text('PATRIMOINE TOTAL NET', M+8, y+7)
  doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(...cWhite)
  doc.text(fmt(patTotal), W-M-4, y+10.5, {align:'right'})

  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(...cGray)
  doc.text('Page 3', W/2, 292, {align:'center'})

  // =====================
  // PAGE 4 — ANALYSE & RÉCAP
  // =====================
  doc.addPage()
  pageHeader()
  y = 18

  y = secTitle('6.  ANALYSE ET POINTS DE VIGILANCE', y, cNavy)
  y += 4

  const points = []
  if (tauxEp < 10)       points.push({type:'danger',  text:'Taux d\'epargne faible ('+tauxEp+'%) — objectif recommande : 15 a 20%'})
  else if (tauxEp >= 15) points.push({type:'success', text:'Taux d\'epargne satisfaisant ('+tauxEp+'%) — continuez sur cette lancee'})
  else                   points.push({type:'warning', text:'Taux d\'epargne de '+tauxEp+'% — objectif recommande : 15 a 20%'})

  if (tauxEndt > 35) points.push({type:'danger',  text:'Taux d\'endettement eleve ('+tauxEndt+'%) — depasse la limite bancaire de 35%'})
  else               points.push({type:'success', text:'Taux d\'endettement sain ('+tauxEndt+'%) — dans la zone verte'})

  if (ravNet < 500)    points.push({type:'warning', text:'Reste a vivre apres impots faible ('+Math.round(ravNet)+' EUR) — a surveiller'})
  if (totFin > 0)      points.push({type:'success', text:'Patrimoine financier constitue : '+fmt(totFin)})
  if (totImmo > 0)     points.push({type:'success', text:'Patrimoine immobilier net : '+fmt(totImmo)})
  if (capEmprunt > 0)  points.push({type:'info',    text:'Capacite d\'emprunt disponible : '+fmt(capEmprunt)+' sur 20 ans'})

  points.forEach(pt => {
    const cfg = {
      success: {bg:cGreenL, bar:cGreen,  text:[5,100,70],    badge:'OK',        badgeBg:cGreen},
      warning: {bg:cAmberL, bar:cAmber,  text:[146,100,4],   badge:'ATTENTION', badgeBg:cAmber},
      danger:  {bg:cRedL,   bar:cRed,    text:[180,20,20],   badge:'VIGILANCE', badgeBg:cRed},
      info:    {bg:cBlueL,  bar:cBlue,   text:[26,86,219],   badge:'INFO',      badgeBg:cBlue},
    }[pt.type]

    doc.setFillColor(...cfg.bg)
    doc.roundedRect(M, y, W-M*2, 11, 2, 2, 'F')
    doc.setFillColor(...cfg.bar)
    doc.roundedRect(M, y, 3, 11, 1, 1, 'F')

    // Badge
    doc.setFillColor(...cfg.badgeBg)
    doc.roundedRect(M+5, y+2.5, 20, 6, 1.5, 1.5, 'F')
    doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(...cWhite)
    doc.text(cfg.badge, M+15, y+6.3, {align:'center'})

    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(...cfg.text)
    doc.text(pt.text, M+28, y+7)
    y += 13
  })

  y += 7

  y = secTitle('7.  RECAPITULATIF MENSUEL', y, cNavy)
  y += 3

  const recap = [
    {label:'Revenus bruts',           value:fmt(totalRevenus), vc:cBlue,   bg:cBlueL},
    {label:'   - Impots sur le revenu', value:'- '+fmt(totalImpots), vc:cPurple, bg:[248,250,252]},
    {label:'   - Depenses mensuelles',  value:'- '+fmt(totalDepenses), vc:cRed,    bg:cWhite},
    {label:'   - Mensualites credits',  value:'- '+fmt(totalMens), vc:cAmber,  bg:[248,250,252]},
  ]
  recap.forEach(({label,value,vc,bg}) => {
    y = dataRow(label, value, y, {bg, valueColor:vc})
  })

  y += 3

  // Bloc épargne finale
  const epBg = epargne>=0 ? cNavy : cRedL
  const epVc = epargne>=0 ? cWhite : cRed
  doc.setFillColor(...epBg)
  doc.roundedRect(M, y, W-M*2, 16, 3, 3, 'F')
  if (epargne>=0) {
    doc.setFillColor(...cBlue)
    doc.roundedRect(M, y, 4, 16, 2, 2, 'F')
  }
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(...(epargne>=0?cGray:cRed))
  doc.text('EPARGNE DISPONIBLE', M+8, y+7)
  doc.setFontSize(15); doc.setFont('helvetica','bold'); doc.setTextColor(...epVc)
  doc.text(fmt(epargne), W-M-4, y+11.5, {align:'right'})

  y += 22

  // Disclaimer final
  doc.setFillColor(...cAmberL)
  doc.roundedRect(M, y, W-M*2, 22, 3, 3, 'F')
  doc.setFillColor(...cAmber)
  doc.roundedRect(M, y, 3, 22, 1, 1, 'F')
  doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(...cAmber)
  doc.text('AVERTISSEMENT IMPORTANT', M+6, y+6)
  doc.setFont('helvetica','normal'); doc.setTextColor(146,100,4)
  doc.text('Ce rapport est genere automatiquement a partir des donnees saisies par l\'utilisateur.', M+6, y+11)
  doc.text('Les informations presentees sont fournies a titre indicatif uniquement et ne constituent', M+6, y+15.5)
  doc.text('pas un conseil financier personnalise. Consultez un conseiller agree avant toute decision.', M+6, y+20)

  // Numéros de page sur toutes les pages
  const total = doc.getNumberOfPages()
  for (let i=1; i<=total; i++) {
    doc.setPage(i)
    doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(...cGray)
    doc.text('Page '+i+' / '+total, W/2, 292, {align:'center'})
  }

  doc.save('rapport-financier-'+new Date().toISOString().split('T')[0]+'.pdf')
}

function StatCard({ title, children, accent }) {
  return (
    <div style={{
      background: COLORS.white, borderRadius: '16px', padding: '20px',
      boxShadow: '0 1px 4px rgba(15,39,68,0.08), 0 4px 16px rgba(15,39,68,0.04)',
      borderTop: `3px solid ${accent || COLORS.blue}`,
    }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{title}</div>
      {children}
    </div>
  )
}

function DashboardPage({ profil, profilCharge, vueMode, setVueMode, dureeEmprunt, setDureeEmprunt }) {
  if (!profil) return (
    <div style={{ padding: '48px', textAlign: 'center', color: COLORS.gray400 }}>
      {profilCharge ? (
        <>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.navy, marginBottom: '8px' }}>
            Bienvenue sur Banque Inside
          </div>
          <div style={{ fontSize: '14px', color: COLORS.gray400, maxWidth: '320px', margin: '0 auto', lineHeight: '1.6' }}>
            Commencez par saisir vos revenus et dépenses dans <strong>Saisie des données</strong> pour obtenir votre analyse financière.
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⟳</div>
          <div>Chargement de votre profil...</div>
        </>
      )}
    </div>
  )

  const estFoyer = profil.situation === 'foyer'
  const revenus1 = Math.round((profil.salaire || 0) + (profil.revenus_fonciers || 0) + (profil.autres_revenus || 0))
  const revenus2 = Math.round((profil.salaire2 || 0) + (profil.revenus_fonciers2 || 0) + (profil.autres_revenus2 || 0))
  const totalRevenus = vueMode === 'foyer' ? revenus1 + revenus2 : revenus1
  const impots1 = profil.impots || 0
  const impots2 = profil.impots2 || 0
  const totalImpots = vueMode === 'foyer' ? impots1 + impots2 : impots1
  const depenses1 = Math.round((profil.logement || 0) + (profil.alimentation || 0) + (profil.transports || 0) + (profil.loisirs || 0) + (profil.sante || 0) + (profil.autres_depenses || 0) + (profil.assurance_auto || 0) + (profil.assurance_habitation || 0) + (profil.assurance_sante || 0) + (profil.telephonie || 0) + (profil.internet || 0) + (profil.streaming || 0) + (profil.electricite || 0) + (profil.gaz || 0))
  const depenses2 = Math.round((profil.logement2 || 0) + (profil.alimentation2 || 0) + (profil.transports2 || 0) + (profil.loisirs2 || 0) + (profil.sante2 || 0) + (profil.autres_depenses2 || 0) + (profil.assurance_auto2 || 0) + (profil.assurance_habitation2 || 0) + (profil.assurance_sante2 || 0) + (profil.telephonie2 || 0) + (profil.internet2 || 0) + (profil.streaming2 || 0) + (profil.electricite2 || 0) + (profil.gaz2 || 0))
  const totalDepenses = vueMode === 'foyer' ? depenses1 + depenses2 : depenses1
  const creditsImmo = Array.isArray(profil.credits_immo) ? profil.credits_immo : []
  const creditsAutre = Array.isArray(profil.credits_autre) ? profil.credits_autre : []
  const totalMensualites = Math.round([...creditsImmo, ...creditsAutre].reduce((a, c) => a + (parseFloat(c?.mensualite) || 0), 0))
  const loyer = vueMode === 'foyer' ? Math.round((profil.logement || 0) + (profil.logement2 || 0)) : Math.round(profil.logement || 0)
  const chargesEndettement = totalMensualites + loyer
  const tauxEndettement = totalRevenus > 0 ? Math.round((chargesEndettement / totalRevenus) * 100) : 0
  const revenusApresImpots = totalRevenus - totalImpots
  const tauxEndettementApresImpots = revenusApresImpots > 0 ? Math.round((chargesEndettement / revenusApresImpots) * 100) : 0
  const resteAVivre = totalRevenus - chargesEndettement
  const resteAVivreApresImpots = revenusApresImpots - chargesEndettement
  const epargne = totalRevenus - totalDepenses - totalMensualites - totalImpots
  const tauxEpargne = totalRevenus > 0 ? Math.round((epargne / totalRevenus) * 100) : 0
  const score = Math.min(100, Math.max(0, Math.round(50 + tauxEpargne - tauxEndettement)))
  const mensualiteMax = Math.round(Math.max(0, totalRevenus * 0.35 - totalMensualites))
  const r = TAUX_MARCHE[dureeEmprunt] / 100 / 12
  const n = dureeEmprunt * 12
  const capaciteEmprunt = mensualiteMax > 0 ? Math.round(mensualiteMax * (1 - Math.pow(1 + r, -n)) / r) : 0

  const depensesBase = vueMode === 'foyer' ? {
    logement: (profil.logement || 0) + (profil.logement2 || 0),
    alimentation: (profil.alimentation || 0) + (profil.alimentation2 || 0),
    transports: (profil.transports || 0) + (profil.transports2 || 0),
    loisirs: (profil.loisirs || 0) + (profil.loisirs2 || 0),
    sante: (profil.sante || 0) + (profil.sante2 || 0),
    impots: (profil.impots || 0) + (profil.impots2 || 0),
    assurances: (profil.assurance_auto || 0) + (profil.assurance_habitation || 0) + (profil.assurance_sante || 0) + (profil.assurance_auto2 || 0) + (profil.assurance_habitation2 || 0) + (profil.assurance_sante2 || 0),
    telecom: (profil.telephonie || 0) + (profil.internet || 0) + (profil.streaming || 0) + (profil.telephonie2 || 0) + (profil.internet2 || 0) + (profil.streaming2 || 0),
    energie: (profil.electricite || 0) + (profil.gaz || 0) + (profil.electricite2 || 0) + (profil.gaz2 || 0),
    autres: (profil.autres_depenses || 0) + (profil.autres_depenses2 || 0),
  } : {
    logement: profil.logement || 0,
    alimentation: profil.alimentation || 0,
    transports: profil.transports || 0,
    loisirs: profil.loisirs || 0,
    sante: profil.sante || 0,
    impots: profil.impots || 0,
    assurances: (profil.assurance_auto || 0) + (profil.assurance_habitation || 0) + (profil.assurance_sante || 0),
    telecom: (profil.telephonie || 0) + (profil.internet || 0) + (profil.streaming || 0),
    energie: (profil.electricite || 0) + (profil.gaz || 0),
    autres: profil.autres_depenses || 0,
  }

  const depensesData = [
    { name: 'Logement', value: depensesBase.logement, color: COLORS.navy },
    { name: 'Alimentation', value: depensesBase.alimentation, color: COLORS.blue },
    { name: 'Transports', value: depensesBase.transports, color: COLORS.green },
    { name: 'Assurances', value: depensesBase.assurances, color: COLORS.amber },
    { name: 'Impôts', value: depensesBase.impots, color: COLORS.purple },
    { name: 'Énergie', value: depensesBase.energie, color: '#f59e0b' },
    { name: 'Télécom', value: depensesBase.telecom, color: '#0ea5e9' },
    { name: 'Loisirs', value: depensesBase.loisirs, color: COLORS.red },
    { name: 'Santé', value: depensesBase.sante, color: '#ec4899' },
    { name: 'Autres', value: depensesBase.autres, color: COLORS.gray400 },
  ].filter(d => d.value > 0)

  const patrimoine = [
    { mois: 'M-6', valeur: Math.round(epargne * 1) },
    { mois: 'M-5', valeur: Math.round(epargne * 2) },
    { mois: 'M-4', valeur: Math.round(epargne * 3) },
    { mois: 'M-3', valeur: Math.round(epargne * 4) },
    { mois: 'M-2', valeur: Math.round(epargne * 5) },
    { mois: 'M-1', valeur: Math.round(epargne * 6) },
    { mois: 'Auj', valeur: Math.round(epargne * 7) },
  ]

  const scoreColor = score >= 70 ? COLORS.green : score >= 50 ? COLORS.amber : COLORS.red
  const scoreLabel = score >= 70 ? 'Profil solide' : score >= 50 ? 'Profil correct' : 'A améliorer'

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', background: COLORS.gray50, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: COLORS.navy, margin: 0 }}>Tableau de bord</h1>
          <p style={{ fontSize: '13px', color: COLORS.gray400, margin: '4px 0 0' }}>Vue d'ensemble de votre situation financière</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {estFoyer && (
            <div style={{ display: 'flex', gap: '8px', background: COLORS.white, padding: '4px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
              {['personnel', 'foyer'].map(mode => (
                <button key={mode} onClick={() => setVueMode(mode)} style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: vueMode === mode ? COLORS.navy : 'transparent',
                  color: vueMode === mode ? 'white' : COLORS.gray600,
                  fontWeight: vueMode === mode ? '600' : '400',
                  cursor: 'pointer', fontSize: '13px', transition: 'all 0.3s ease'
                }}>
                  {mode === 'personnel' ? '👤 Personnel' : '👨‍👩‍👧 Foyer'}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => genererPDF(profil, vueMode)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px', border: 'none',
              background: COLORS.navy, color: 'white',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15,39,68,0.2)',
            }}
          >
            ⬇ Exporter PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard title="Score financier" accent={scoreColor}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke={COLORS.gray200} strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={scoreColor} strokeWidth="10"
                  strokeDasharray={`${score * 2.51} ${100 * 2.51}`}
                  style={{ transition: 'stroke-dasharray 0.6s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: COLORS.navy }}>{score}</span>
                <span style={{ fontSize: '10px', color: COLORS.gray400 }}>/100</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: scoreColor }}>{scoreLabel}</div>
              <div style={{ fontSize: '12px', color: COLORS.gray400, marginTop: '4px' }}>Indice de santé financière</div>
            </div>
          </div>
        </StatCard>

        <StatCard title={`Épargne mensuelle ${vueMode === 'foyer' ? '· Foyer' : ''}`} accent={COLORS.blue}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: COLORS.navy }}>
            <AnimatedNumber value={epargne} /> <span style={{ fontSize: '14px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
            <div style={{ padding: '3px 8px', borderRadius: '6px', background: tauxEpargne >= 15 ? COLORS.greenLight : COLORS.amberLight, color: tauxEpargne >= 15 ? COLORS.green : COLORS.amber, fontSize: '12px', fontWeight: '600' }}>
              {tauxEpargne}% épargne
            </div>
          </div>
          <div style={{ marginTop: '10px', padding: '8px 10px', background: COLORS.gray100, borderRadius: '8px', fontSize: '12px', color: COLORS.gray600 }}>
            Objectif : 15 à 20%
          </div>
        </StatCard>

        <StatCard title="Taux d'endettement" accent={tauxEndettement <= 35 ? COLORS.green : COLORS.red}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1, background: COLORS.gray50, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: COLORS.gray400, fontWeight: '700', letterSpacing: '0.04em', marginBottom: '4px' }}>AVANT IMPÔTS</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: tauxEndettement <= 35 ? COLORS.green : COLORS.red }}>
                <AnimatedNumber value={tauxEndettement} suffix="%" />
              </div>
            </div>
            <div style={{ flex: 1, background: COLORS.purpleLight, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: COLORS.purple, fontWeight: '700', letterSpacing: '0.04em', marginBottom: '4px' }}>APRÈS IMPÔTS</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: tauxEndettementApresImpots <= 35 ? COLORS.green : COLORS.red }}>
                <AnimatedNumber value={tauxEndettementApresImpots} suffix="%" />
              </div>
            </div>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: COLORS.gray200, overflow: 'hidden', marginBottom: '4px' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${Math.min(tauxEndettementApresImpots, 100)}%`,
              background: tauxEndettementApresImpots <= 35 ? COLORS.green : tauxEndettementApresImpots <= 50 ? COLORS.amber : COLORS.red,
              transition: 'width 0.6s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: COLORS.gray400, marginBottom: '10px' }}>
            <span>0%</span><span>35%</span><span>50%</span><span>100%</span>
          </div>
          <div style={{ fontSize: '10px', color: COLORS.gray400, fontWeight: '700', letterSpacing: '0.06em', marginBottom: '6px' }}>RESTE À VIVRE</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, padding: '8px', borderRadius: '8px', background: resteAVivre >= 0 ? COLORS.greenLight : COLORS.redLight }}>
              <div style={{ fontSize: '10px', color: COLORS.gray600, fontWeight: '600' }}>AVANT IMPÔTS</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: resteAVivre >= 0 ? COLORS.green : COLORS.red }}>
                <AnimatedNumber value={resteAVivre} /> EUR
              </div>
            </div>
            <div style={{ flex: 1, padding: '8px', borderRadius: '8px', background: resteAVivreApresImpots >= 0 ? COLORS.purpleLight : COLORS.redLight }}>
              <div style={{ fontSize: '10px', color: COLORS.purple, fontWeight: '600' }}>APRÈS IMPÔTS</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: resteAVivreApresImpots >= 0 ? COLORS.purple : COLORS.red }}>
                <AnimatedNumber value={resteAVivreApresImpots} /> EUR
              </div>
            </div>
          </div>
        </StatCard>

        <StatCard title={`Revenus · Dépenses ${vueMode === 'foyer' ? '· Foyer' : ''}`} accent={COLORS.navy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Revenus avant impôts */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: COLORS.bluePale, border: '1px solid #bfdbfe', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: COLORS.blue, fontWeight: '700', letterSpacing: '0.04em' }}>REVENUS AVANT IMPÔTS</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: COLORS.navy }}>
                  <AnimatedNumber value={totalRevenus} /> <span style={{ fontSize: '12px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
                </div>
              </div>
              <div style={{ fontSize: '20px', color: COLORS.blue }}>↑</div>
            </div>
            {/* Dépenses mensuelles courantes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: COLORS.redLight, border: '1px solid #fca5a5', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: COLORS.red, fontWeight: '700', letterSpacing: '0.04em' }}>DÉPENSES MENSUELLES</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.navy }}>
                  <AnimatedNumber value={totalDepenses} /> <span style={{ fontSize: '12px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
                </div>
              </div>
              <div style={{ fontSize: '16px', color: COLORS.red }}>↓</div>
            </div>
            {/* Dont impôts */}
            {totalImpots > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: COLORS.purpleLight, border: '1px solid #e9d5ff', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: COLORS.purple, fontWeight: '700', letterSpacing: '0.04em' }}>DONT IMPÔTS</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.navy }}>
                    <AnimatedNumber value={totalImpots} /> <span style={{ fontSize: '12px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
                  </div>
                </div>
                <div style={{ fontSize: '16px' }}>🏛</div>
              </div>
            )}
            {/* Mensualités crédits */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: COLORS.amberLight, border: '1px solid #fcd34d', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: COLORS.amber, fontWeight: '700', letterSpacing: '0.04em' }}>MENSUALITÉS CRÉDITS</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.navy }}>
                  <AnimatedNumber value={totalMensualites} /> <span style={{ fontSize: '12px', fontWeight: '400', color: COLORS.gray400 }}>EUR</span>
                </div>
              </div>
              <div style={{ fontSize: '16px' }}>🏦</div>
            </div>
            {/* Dépenses totales — tout additionné */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fca5a5', border: '1px solid #f87171', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700', letterSpacing: '0.04em' }}>DÉPENSES TOTALES</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#7f1d1d' }}>
                  <AnimatedNumber value={totalDepenses + totalMensualites + totalImpots} /> <span style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b' }}>EUR</span>
                </div>
              </div>
              <div style={{ fontSize: '20px', color: '#dc2626' }}>↓</div>
            </div>
          </div>
        </StatCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ background: COLORS.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Répartition des dépenses</div>
          {depensesData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <PieChart width={110} height={110}>
                <Pie data={depensesData} cx={50} cy={50} innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                  {depensesData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                {depensesData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />
                      <span style={{ color: COLORS.gray600 }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: '600', color: COLORS.navy }}>{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ color: COLORS.gray400, fontSize: '14px', textAlign: 'center', padding: '20px' }}>Aucune dépense saisie</div>}
        </div>

        <div style={{ background: COLORS.white, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Projection épargne</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={patrimoine}>
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: COLORS.gray400 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: COLORS.gray400 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: COLORS.navy, border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} formatter={v => [`${v.toLocaleString()} EUR`]} />
              <Line type="monotone" dataKey="valeur" stroke={COLORS.blue} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: COLORS.navy, borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(15,39,68,0.08)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Capacité d'emprunt</div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: COLORS.navyLight, padding: '3px', borderRadius: '8px' }}>
            {[10, 15, 20, 25].map(d => (
              <button key={d} onClick={() => setDureeEmprunt(d)} style={{
                flex: 1, padding: '5px 0', borderRadius: '6px', border: 'none',
                background: dureeEmprunt === d ? 'white' : 'transparent',
                color: dureeEmprunt === d ? COLORS.navy : COLORS.gray400,
                fontWeight: dureeEmprunt === d ? '700' : '400',
                fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s ease'
              }}>
                {d}ans
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ textAlign: 'center', background: COLORS.navyLight, borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '6px' }}>Montant max</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>
                <AnimatedNumber value={Math.round(capaciteEmprunt / 1000)} suffix="k" />
              </div>
              <div style={{ fontSize: '11px', color: COLORS.gray400 }}>EUR</div>
            </div>
            <div style={{ textAlign: 'center', background: COLORS.navyLight, borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: COLORS.gray400, marginBottom: '6px' }}>Mensualité max</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>
                <AnimatedNumber value={mensualiteMax} />
              </div>
              <div style={{ fontSize: '11px', color: COLORS.gray400 }}>EUR/mois</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: COLORS.navyLight, borderRadius: '10px', fontSize: '11px', color: COLORS.gray400 }}>
            <span>Taux {TAUX_MARCHE[dureeEmprunt]}% · {dureeEmprunt} ans</span>
            <span>Endettement actuel : {tauxEndettement}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profil, setProfil] = useState(null)
  const [profilCharge, setProfilCharge] = useState(false)
  const [vueMode, setVueMode] = useState('personnel')
  const [dureeEmprunt, setDureeEmprunt] = useState(20)
  const [mountedPages, setMountedPages] = useState(new Set())
  const prevSituationRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) chargerProfil(session.user.id)
      else setProfilCharge(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) chargerProfil(session.user.id)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && active === 'Dashboard') chargerProfil(user.id)
  }, [active, user])

  useEffect(() => {
    if (active === 'Saisie donnees' || active === 'Patrimoine net') {
      setMountedPages(prev => new Set([...prev, active]))
    }
  }, [active])

  useEffect(() => {
    if (profil && profil.situation !== prevSituationRef.current) {
      setVueMode(profil.situation === 'foyer' ? 'foyer' : 'personnel')
      prevSituationRef.current = profil.situation
    }
  }, [profil])

  const chargerProfil = async (userId) => {
    const { data } = await supabase
      .from('profils_financiers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) setProfil(data[0])
    setProfilCharge(true)
  }

  const deconnecter = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const renderPage = () => {
    const pages = {
      'Analyse bancaire': <AnalyseBancaire />,
      'Simulations': <Simulations />,
      'Alertes': <Alertes />,
      'Recommandations': <Recommandations />,
      'Guide utilisation': <GuideUtilisation />,
    }
    if (pages[active]) return pages[active]
    if (active === 'Saisie donnees' || active === 'Patrimoine net') return null
    return <DashboardPage profil={profil} profilCharge={profilCharge} vueMode={vueMode} setVueMode={setVueMode} dureeEmprunt={dureeEmprunt} setDureeEmprunt={setDureeEmprunt} />
  }

  if (!user) return <Login onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user))} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.gray50, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ width: '260px', background: COLORS.navy, color: 'white', display: window.innerWidth < 768 ? 'none' : 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '0.05em', color: 'white' }}>BANQUE INSIDE</div>
          <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '3px', letterSpacing: '0.08em' }}>ANALYSE FINANCIÈRE</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = active === item.label
            return (
              <button key={item.label} onClick={() => setActive(item.label)} style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                color: isActive ? 'white' : COLORS.gray400,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'all 0.25s ease',
              }}>
                <span style={{ fontSize: '14px', opacity: 0.7 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400' }}>{item.label}</div>
                  {item.sub && <div style={{ fontSize: '11px', color: COLORS.gray400, marginTop: '1px' }}>{item.sub}</div>}
                </div>
                {isActive && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: COLORS.blueLight }} />}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '16px', margin: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#fbbf24', marginBottom: '6px', letterSpacing: '0.05em' }}>💡 CONSEIL DU JOUR</div>
          <div style={{ fontSize: '12px', color: COLORS.gray400, lineHeight: '1.5' }}>Augmentez votre taux d'épargne mensuel pour optimiser votre patrimoine.</div>
        </div>
      </div>

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: COLORS.navy, zIndex: 50, color: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '16px', fontWeight: '800' }}>BANQUE INSIDE</div>
            <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }} onClick={() => setMenuOpen(false)}>×</button>
          </div>
          <nav style={{ flex: 1, padding: '12px 10px' }}>
            {navItems.map(item => (
              <button key={item.label} onClick={() => { setActive(item.label); setMenuOpen(false) }} style={{
                width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: '10px', marginBottom: '4px',
                background: active === item.label ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', color: 'white', cursor: 'pointer', fontSize: '15px'
              }}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: '16px' }}>
            <button onClick={deconnecter} style={{ width: '100%', background: COLORS.red, color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: COLORS.white, borderBottom: '1px solid ' + COLORS.gray200, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: COLORS.navy, fontSize: '20px', cursor: 'pointer', padding: '4px' }} onClick={() => setMenuOpen(true)}>☰</button>
            <div>
              <div style={{ fontSize: '11px', color: COLORS.gray400 }}>Connecté en tant que</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.navy }}>{user.email}</div>
            </div>
          </div>
          <button onClick={deconnecter} style={{
            background: 'transparent', color: COLORS.red, border: '1px solid ' + COLORS.red,
            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '500'
          }}>
            Déconnexion
          </button>
        </div>
        <div style={{ flex: 1 }}>
          {renderPage()}
          {mountedPages.has('Saisie donnees') && (
            <div style={{ display: active === 'Saisie donnees' ? 'block' : 'none' }}>
              <ErrorBoundary>
                <SaisieDonnees />
              </ErrorBoundary>
            </div>
          )}
          {mountedPages.has('Patrimoine net') && (
            <div style={{ display: active === 'Patrimoine net' ? 'block' : 'none' }}>
              <PatrimoineNet isActive={active === 'Patrimoine net'} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}