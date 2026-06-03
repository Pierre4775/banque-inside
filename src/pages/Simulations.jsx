import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function Simulations() {
  const [epargne, setEpargne] = useState(850)
  const [rendement, setRendement] = useState(5)
  const [duree, setDuree] = useState(10)

  const genererProjection = () => {
    const data = []
    for (let an = 1; an <= duree; an++) {
      const p = Math.round(epargne * 12 * an * (1 + (rendement - 2) / 100))
      const r = Math.round(epargne * 12 * an * (1 + rendement / 100))
      const o = Math.round(epargne * 12 * an * (1 + (rendement + 3) / 100))
      data.push({ an: `${an}`, p, r, o })
    }
    return data
  }

  const data = genererProjection()
  const final = data[data.length - 1]

  const cardStyle = { background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', marginBottom:'16px' }
  const titleStyle = { fontSize:'11px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', marginBottom:'12px' }
  const sliderRow = { marginBottom:'16px' }
  const sliderLabel = { display:'flex', justifyContent:'space-between', fontSize:'14px', marginBottom:'6px' }
  const sliderVal = { fontWeight:'bold', color:'#2563eb' }

  return (
    <div style={{padding:'16px', maxWidth:'600px', margin:'0 auto'}}>
      <h2 style={{fontSize:'20px', fontWeight:'bold', color:'#1f2937', marginBottom:'16px'}}>Simulations et projections</h2>

      <div style={cardStyle}>
        <div style={titleStyle}>Parametres</div>
        <div style={sliderRow}>
          <div style={sliderLabel}>
            <span style={{color:'#4b5563'}}>Epargne mensuelle</span>
            <span style={sliderVal}>{epargne} EUR</span>
          </div>
          <input type="range" min="100" max="3000" step="50" value={epargne} onChange={e => setEpargne(Number(e.target.value))} style={{width:'100%'}}/>
        </div>
        <div style={sliderRow}>
          <div style={sliderLabel}>
            <span style={{color:'#4b5563'}}>Rendement annuel</span>
            <span style={sliderVal}>{rendement}%</span>
          </div>
          <input type="range" min="1" max="15" step="0.5" value={rendement} onChange={e => setRendement(Number(e.target.value))} style={{width:'100%'}}/>
        </div>
        <div style={sliderRow}>
          <div style={sliderLabel}>
            <span style={{color:'#4b5563'}}>Duree</span>
            <span style={sliderVal}>{duree} ans</span>
          </div>
          <input type="range" min="1" max="30" value={duree} onChange={e => setDuree(Number(e.target.value))} style={{width:'100%'}}/>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'16px'}}>
        <div style={{background:'#eff6ff', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
          <div style={{fontSize:'11px', color:'#2563eb', marginBottom:'4px'}}>Prudent</div>
          <div style={{fontSize:'18px', fontWeight:'bold', color:'#1d4ed8'}}>{(final?.p/1000).toFixed(0)}k EUR</div>
        </div>
        <div style={{background:'#f0fdf4', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
          <div style={{fontSize:'11px', color:'#16a34a', marginBottom:'4px'}}>Realiste</div>
          <div style={{fontSize:'18px', fontWeight:'bold', color:'#15803d'}}>{(final?.r/1000).toFixed(0)}k EUR</div>
        </div>
        <div style={{background:'#fefce8', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
          <div style={{fontSize:'11px', color:'#ca8a04', marginBottom:'4px'}}>Optimiste</div>
          <div style={{fontSize:'18px', fontWeight:'bold', color:'#854d0e'}}>{(final?.o/1000).toFixed(0)}k EUR</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>Projection patrimoine</div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis dataKey="an" tick={{fontSize:10}}/>
            <YAxis tick={{fontSize:10}} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v => `${v.toLocaleString()} EUR`}/>
            <Legend/>
            <Line type="monotone" dataKey="p" name="Prudent" stroke="#2563eb" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="r" name="Realiste" stroke="#16a34a" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="o" name="Optimiste" stroke="#ca8a04" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}