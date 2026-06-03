import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function Simulations() {
  const [epargne, setEpargne] = useState(850)
  const [rendement, setRendement] = useState(5)
  const [duree, setDuree] = useState(10)

  const genererProjection = () => {
    const data = []
    for (let an = 1; an <= duree; an++) {
      const prudent = Math.round(epargne * 12 * an * (1 + (rendement - 2) / 100))
      const realiste = Math.round(epargne * 12 * an * (1 + rendement / 100))
      const optimiste = Math.round(epargne * 12 * an * (1 + (rendement + 3) / 100))
      data.push({ an: `An ${an}`, prudent, realiste, optimiste })
    }
    return data
  }

  const data = genererProjection()
  const final = data[data.length - 1]

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Simulations et projections</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Parametres</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-gray-600">Epargne mensuelle</label>
                <span className="font-bold text-blue-600">{epargne} EUR</span>
              </div>
              <input type="range" min="100" max="3000" step="50" value={epargne} onChange={e => setEpargne(Number(e.target.value))} className="w-full"/>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-gray-600">Rendement annuel</label>
                <span className="font-bold text-blue-600">{rendement}%</span>
              </div>
              <input type="range" min="1" max="15" step="0.5" value={rendement} onChange={e => setRendement(Number(e.target.value))} className="w-full"/>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-gray-600">Duree</label>
                <span className="font-bold text-blue-600">{duree} ans</span>
              </div>
              <input type="range" min="1" max="30" value={duree} onChange={e => setDuree(Number(e.target.value))} className="w-full"/>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">Resultats a {duree} ans</h4>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600">Scenario prudent</div>
              <div className="text-xl font-bold text-blue-700">{final?.prudent.toLocaleString()} EUR</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-600">Scenario realiste</div>
              <div className="text-xl font-bold text-green-700">{final?.realiste.toLocaleString()} EUR</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-xs text-yellow-600">Scenario optimiste</div>
              <div className="text-xl font-bold text-yellow-700">{final?.optimiste.toLocaleString()} EUR</div>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Projection patrimoine</h3>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={data}>
              <XAxis dataKey="an" tick={{fontSize: 11}}/>
              <YAxis tick={{fontSize: 11}} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v => `${v.toLocaleString()} EUR`}/>
              <Legend/>
              <Line type="monotone" dataKey="prudent" name="Prudent" stroke="#2563eb" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="realiste" name="Realiste" stroke="#16a34a" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="optimiste" name="Optimiste" stroke="#ca8a04" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}