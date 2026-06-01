import { useState } from 'react'
import './App.css'
import { useWaterData } from './hooks/useWaterData'
import SiteMap from './components/SiteMap'
import TimeSeriesChart from './components/TimeSeriesChart'
import StatCards from './components/StatCards'
import SiteDetailPanel from './components/SiteDetailPanel'

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
  const siteData = selectedSite ? data.filter(d => d.site_id === selectedSite.id) : []

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-inner">
        <div className="loading-spinner" />
        <span className="loading-text">Fetching watershed data…</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="loading-screen">
      <span style={{ color: '#ef4444', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem' }}>
        Error: {error}
      </span>
    </div>
  )

  return (
    <>
      <div className="app-topbar">
        <div className="app-logo">
          <div className="app-logo-mark">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="3.5" fill="#2563eb" />
              <circle cx="9" cy="9" r="7" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" />
            </svg>
          </div>
          <span className="app-logo-text">Watershed Watch</span>
          {selectedSite && <span className="site-badge">{selectedSite.site_code}</span>}
        </div>
        <div className="app-topbar-right">
          <span className="app-meta-item">Centre County, PA</span>
          <span className="app-meta-dot">·</span>
          <span className="app-meta-item">{data.length} obs.</span>
          <span className="app-meta-dot">·</span>
          <span className="app-meta-item">{sites.length} sites</span>
          <span className="app-meta-dot">·</span>
          <span className="app-meta-item app-meta-live">
            <span className="live-dot" />Live
          </span>
        </div>
      </div>

      <div className="app-shell">
        <div className="param-bar">
          <div className="param-bar-label">Parameter</div>
          <div className="param-pills">
            {PARAMETERS.map(p => (
              <button
                key={p.key}
                onClick={() => setSelectedParam(p.key)}
                className={`param-pill${selectedParam === p.key ? ' active' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {selectedSite && (
            <button className="clear-btn" onClick={() => setSelectedSite(null)}>✕ Clear filter</button>
          )}
        </div>

        <StatCards data={filteredData} selectedSite={selectedSite} selectedParam={selectedParam} />

        <div className="map-and-panel">
          <SiteMap
            sites={sites}
            data={data}
            selectedSite={selectedSite}
            onSiteSelect={site => setSelectedSite(prev => prev?.id === site.id ? null : site)}
            selectedParam={selectedParam}
          />
          {selectedSite && (
            <SiteDetailPanel
              site={selectedSite}
              data={siteData}
              selectedParam={selectedParam}
              onClose={() => setSelectedSite(null)}
            />
          )}
        </div>

        <TimeSeriesChart data={data} sites={sites} selectedParam={selectedParam} selectedSite={selectedSite} />
      </div>

      <footer className="app-footer">
        <span>Watershed Watch · Centre County Water Quality Monitoring</span>
        <span>Penn State Agricultural &amp; Biological Engineering · PI: F. Pandara Valappil</span>
      </footer>
    </>
  )
}
