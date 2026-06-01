const PARAM_META = {
  ph:                 { label: 'pH',           unit: '',       color: '#4f46e5' },
  do_ppm:             { label: 'Dissolved O₂', unit: 'ppm',   color: '#059669' },
  temp_c:             { label: 'Temperature',  unit: '°C',    color: '#dc2626' },
  conductivity_us_cm: { label: 'Conductivity', unit: 'µS/cm', color: '#d97706' },
  nitrate_mg_l:       { label: 'Nitrate',      unit: 'mg/L',  color: '#0284c7' },
  phosphate_mg_l:     { label: 'Phosphate',    unit: 'mg/L',  color: '#7c3aed' },
  orp_mv:             { label: 'ORP',          unit: 'mV',    color: '#0891b2' },
}

const ALL_PARAMS = ['ph', 'do_ppm', 'temp_c', 'conductivity_us_cm', 'nitrate_mg_l', 'phosphate_mg_l', 'orp_mv']

export default function SiteDetailPanel({ site, data, selectedParam, onClose }) {
  const meta = PARAM_META[selectedParam] || { label: selectedParam, unit: '', color: '#2563eb' }

  const sorted = [...data].sort((a, b) => new Date(b.observation_date) - new Date(a.observation_date))

  const vals = sorted.map(d => d[selectedParam]).filter(v => v != null).map(Number)
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '—'
  const min = vals.length ? Math.min(...vals).toFixed(2) : '—'
  const max = vals.length ? Math.max(...vals).toFixed(2) : '—'

  return (
    <div className="site-panel">
      <div className="site-panel-header">
        <div>
          <div className="site-panel-name">{site.name}</div>
          <div className="site-panel-code">{site.site_code} · {site.latitude.toFixed(4)}°N, {Math.abs(site.longitude).toFixed(4)}°W</div>
        </div>
        <button className="site-panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="site-panel-stats">
        <div className="site-panel-stat">
          <div className="site-panel-stat-label">Avg {meta.label}</div>
          <div className="site-panel-stat-value" style={{ color: meta.color }}>{avg}{meta.unit ? ' ' + meta.unit : ''}</div>
        </div>
        <div className="site-panel-stat">
          <div className="site-panel-stat-label">Min</div>
          <div className="site-panel-stat-value">{min}</div>
        </div>
        <div className="site-panel-stat">
          <div className="site-panel-stat-label">Max</div>
          <div className="site-panel-stat-value">{max}</div>
        </div>
        <div className="site-panel-stat">
          <div className="site-panel-stat-label">Readings</div>
          <div className="site-panel-stat-value">{data.length}</div>
        </div>
      </div>

      <div className="site-panel-table-label">Recent Observations</div>
      <div className="site-panel-table-wrap">
        <table className="site-panel-table">
          <thead>
            <tr>
              <th>Date</th>
              <th style={{ color: meta.color }}>{meta.label}</th>
              <th>pH</th>
              <th>DO</th>
              <th>Temp</th>
              <th>Weather</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 20).map((row, i) => {
              const date = new Date(row.observation_date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: '2-digit'
              })
              return (
                <tr key={i}>
                  <td className="mono">{date}</td>
                  <td className="mono" style={{ color: meta.color, fontWeight: 600 }}>
                    {row[selectedParam] != null ? Number(row[selectedParam]).toFixed(2) : '—'}
                  </td>
                  <td className="mono">{row.ph != null ? Number(row.ph).toFixed(1) : '—'}</td>
                  <td className="mono">{row.do_ppm != null ? Number(row.do_ppm).toFixed(1) : '—'}</td>
                  <td className="mono">{row.temp_c != null ? Number(row.temp_c).toFixed(1) : '—'}</td>
                  <td className="weather-cell">{row.weather_condition || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {sorted.length > 20 && (
        <div className="site-panel-more">+{sorted.length - 20} more observations</div>
      )}
    </div>
  )
}
