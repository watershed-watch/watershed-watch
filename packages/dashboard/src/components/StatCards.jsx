const PARAMS = [
  { key: 'ph', label: 'pH', unit: '', color: '#4f46e5' },
  { key: 'do_ppm', label: 'Dissolved O₂', unit: 'ppm', color: '#059669' },
  { key: 'temp_c', label: 'Temperature', unit: '°C', color: '#dc2626' },
  { key: 'conductivity_us_cm', label: 'Conductivity', unit: 'µS/cm', color: '#d97706' },
  { key: 'nitrate_mg_l', label: 'Nitrate', unit: 'mg/L', color: '#0284c7' },
]

function avg(data, key) {
  const vals = data.map(d => d[key]).filter(v => v != null)
  if (!vals.length) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
}

export default function StatCards({ data, selectedSite }) {
  const filtered = selectedSite ? data.filter(d => d.site_id === selectedSite.id) : data
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.75rem' }}>
      {PARAMS.map(p => {
        const value = avg(filtered, p.key)
        const n = filtered.filter(d => d[p.key] != null).length
        return (
          <div key={p.key} style={{
            background: '#fff',
            border: '1px solid #dde3ea',
            borderTop: `3px solid ${p.color}`,
            borderRadius: '6px',
            padding: '0.9rem 1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize:'0.67rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94a3b8', marginBottom:'0.5rem' }}>
              {p.label}
            </div>
            <div style={{ fontSize:'1.65rem', fontWeight:600, color: p.color, fontFamily:'IBM Plex Mono, monospace', lineHeight:1 }}>
              {value ?? '—'}
            </div>
            <div style={{ fontSize:'0.68rem', color:'#94a3b8', marginTop:'0.35rem', fontFamily:'IBM Plex Mono, monospace' }}>
              {p.unit && `${p.unit} · `}n={n}
            </div>
          </div>
        )
      })}
    </div>
  )
}
