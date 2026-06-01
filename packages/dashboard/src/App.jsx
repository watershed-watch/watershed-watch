import { useState } from 'react'
import './App.css'
import { useWaterData } from './hooks/useWaterData'
import SiteMap from './components/SiteMap'
import TimeSeriesChart from './components/TimeSeriesChart'
import StatCards from './components/StatCards'

const PARAMETERS = [
  { key: 'ph', label: 'pH' },
  { key: 'do_ppm', label: 'DO ppm' },
  { key: 'temp_c', label: 'Temp °C' },
  { key: 'conductivity_us_cm', label: 'Conductivity' },
  { key: 'nitrate_mg_l', label: 'Nitrate' },
  { key: 'phosphate_mg_l', label: 'Phosphate' },
  { key: 'orp_mv', label: 'ORP mV' },
]

export default function App() {
  const { data, sites, loading, error } = useWaterData()
  const [selectedSite, setSelectedSite] = useState(null)
  const [selectedParam, setSelectedParam] = useState('ph')

  const filteredData = selectedSite ? data.filter(d => d.site_id === selectedSite.id) : data

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f4f6f8' }}>
      <span style={{ fontFamily:'IBM Plex Mono', fontSize:'0.85rem', color:'#94a3b8' }}>Fetching watershed data…</span>
    </div>
  )

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <span style={{ color:'#ef4444', fontFamily:'IBM Plex Mono', fontSize:'0.85rem' }}>Error: {error}</span>
    </div>
  )

  return (
    <>
      <div className="app-topbar">
        <div className="app-logo">
          <div className="app-logo-dot" />
          Watershed Watch
          {selectedSite && <span className="site-badge">{selectedSite.site_code}</span>}
        </div>
        <span className="app-meta">
          Centre County, PA &nbsp;·&nbsp; {data.length} observations &nbsp;·&nbsp; {sites.length} sites
        </span>
      </div>

      <div className="app-shell">
        <div className="param-bar">
          {PARAMETERS.map(p => (
            <button
              key={p.key}
              onClick={() => setSelectedParam(p.key)}
              className={`param-pill${selectedParam === p.key ? ' active' : ''}`}
            >
              {p.label}
            </button>
          ))}
          {selectedSite && (
            <button className="clear-btn" onClick={() => setSelectedSite(null)}>
              ✕ {selectedSite.name}
            </button>
          )}
        </div>

        <StatCards data={filteredData} selectedSite={selectedSite} />

        <SiteMap
          sites={sites}
          data={data}
          selectedSite={selectedSite}
          onSiteSelect={site => setSelectedSite(prev => prev?.id === site.id ? null : site)}
          selectedParam={selectedParam}
        />

        <TimeSeriesChart data={data} sites={sites} selectedParam={selectedParam} />
      </div>
    </>
  )
}
