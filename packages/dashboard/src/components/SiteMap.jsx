import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const PARAM_META = {
  ph:                  { label: 'pH',           unit: '',       color: '#4f46e5' },
  do_ppm:              { label: 'Dissolved O₂', unit: 'ppm',   color: '#059669' },
  temp_c:              { label: 'Temperature',  unit: '°C',    color: '#dc2626' },
  conductivity_us_cm:  { label: 'Conductivity', unit: 'µS/cm', color: '#d97706' },
  nitrate_mg_l:        { label: 'Nitrate',      unit: 'mg/L',  color: '#0284c7' },
  phosphate_mg_l:      { label: 'Phosphate',    unit: 'mg/L',  color: '#7c3aed' },
  orp_mv:              { label: 'ORP',          unit: 'mV',    color: '#0891b2' },
}

function buildPopupHTML(site, readings, selectedParam) {
  const meta = PARAM_META[selectedParam] || { label: selectedParam, unit: '', color: '#2563eb' }
  const last3 = readings
    .filter(d => d[selectedParam] != null)
    .sort((a, b) => new Date(b.observation_date) - new Date(a.observation_date))
    .slice(0, 3)

  const rowsHTML = last3.length === 0
    ? `<div style="color:#94a3b8;font-size:11px;padding:4px 0;">No data for this parameter</div>`
    : last3.map(r => {
        const date = new Date(r.observation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
        const val = Number(r[selectedParam]).toFixed(2)
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #f1f5f9;">
            <span style="font-family:IBM Plex Mono,monospace;font-size:10px;color:#64748b;">${date}</span>
            <span style="font-family:IBM Plex Mono,monospace;font-size:12px;font-weight:600;color:${meta.color};">${val}${meta.unit ? ' ' + meta.unit : ''}</span>
          </div>`
      }).join('')

  const latest = last3[0]
  const trend = last3.length >= 2
    ? (Number(last3[0][selectedParam]) > Number(last3[1][selectedParam]) ? '↑' : '↓')
    : ''
  const trendColor = trend === '↑' ? '#059669' : '#dc2626'

  return `
    <div style="font-family:IBM Plex Sans,sans-serif;min-width:180px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid ${meta.color};">
        <div>
          <div style="font-weight:600;font-size:13px;color:#1a2332;">${site.name}</div>
          <div style="font-family:IBM Plex Mono,monospace;font-size:10px;color:#94a3b8;margin-top:1px;">${site.site_code} · ${site.latitude.toFixed(4)}°N</div>
        </div>
        ${trend ? `<span style="font-size:18px;color:${trendColor};font-weight:700;">${trend}</span>` : ''}
      </div>
      <div style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:4px;">
        Last 3 · ${meta.label}
      </div>
      ${rowsHTML}
      ${latest ? `
        <div style="margin-top:8px;font-size:10px;color:#94a3b8;font-family:IBM Plex Mono,monospace;">
          ${latest.weather_condition ? `☁ ${latest.weather_condition}` : ''}
        </div>` : ''}
      <div style="margin-top:8px;text-align:center;">
        <span style="font-size:10px;color:#2563eb;cursor:pointer;">Click marker to filter dashboard →</span>
      </div>
    </div>`
}

export default function SiteMap({ sites, data, selectedSite, onSiteSelect, selectedParam }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef({})

  useEffect(() => {
    if (map.current || !mapContainer.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-77.8, 40.98],
      zoom: 9.5,
    })
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left')
  }, [])

  useEffect(() => {
    if (!map.current || !sites.length) return
    Object.values(markers.current).forEach(m => m.remove())
    markers.current = {}

    const meta = PARAM_META[selectedParam] || { color: '#2563eb' }

    sites.forEach(site => {
      const siteReadings = data.filter(d => d.site_id === site.id)
      const isSelected = selectedSite?.id === site.id
      const color = meta.color

      const el = document.createElement('div')
      el.style.cssText = `
        width: ${isSelected ? 22 : 15}px;
        height: ${isSelected ? 22 : 15}px;
        border-radius: 50%;
        background: ${isSelected ? color : '#ffffff'};
        border: ${isSelected ? '3px' : '2px'} solid ${color};
        cursor: pointer;
        box-shadow: ${isSelected
          ? `0 0 0 4px ${color}33, 0 2px 8px rgba(0,0,0,0.2)`
          : '0 1px 5px rgba(0,0,0,0.18)'};
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      if (isSelected) {
        const inner = document.createElement('div')
        inner.style.cssText = `width:6px;height:6px;border-radius:50%;background:#fff;`
        el.appendChild(inner)
      }

      const popup = new mapboxgl.Popup({
        offset: 18,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '240px',
      }).setHTML(buildPopupHTML(site, siteReadings, selectedParam))

      const marker = new mapboxgl.Marker(el)
        .setLngLat([site.longitude, site.latitude])
        .setPopup(popup)
        .addTo(map.current)

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSiteSelect(site)
        marker.togglePopup()
      })

      markers.current[site.id] = marker

      if (isSelected) {
        setTimeout(() => marker.togglePopup(), 100)
      }
    })
  }, [sites, data, selectedSite, selectedParam, onSiteSelect])

  return (
    <div className="map-wrapper" style={{ flex: 1, minHeight: '420px' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      <div className="map-legend">
        {Object.entries(PARAM_META).map(([key, m]) => (
          key === selectedParam
            ? <div key={key} className="map-legend-item">
                <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background: m.color, marginRight:5 }} />
                <span>{m.label}</span>
              </div>
            : null
        ))}
        <div className="map-legend-item">
          <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', border:`2px solid ${PARAM_META[selectedParam]?.color || '#2563eb'}`, background:'#fff', marginRight:5 }} />
          <span style={{color:'#94a3b8'}}>Unselected site</span>
        </div>
        <div className="map-legend-item">
          <span style={{ display:'inline-block', width:12, height:12, borderRadius:'50%', background: PARAM_META[selectedParam]?.color || '#2563eb', marginRight:5 }} />
          <span style={{color:'#94a3b8'}}>Selected site</span>
        </div>
      </div>
    </div>
  )
}
