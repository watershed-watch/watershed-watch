import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const PARAM_COLORS = {
  ph: '#4f46e5', do_ppm: '#059669', temp_c: '#dc2626',
  conductivity_us_cm: '#d97706', nitrate_mg_l: '#0284c7',
  phosphate_mg_l: '#7c3aed', orp_mv: '#0891b2',
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

    const color = PARAM_COLORS[selectedParam] || '#2563eb'

    sites.forEach(site => {
      const latestReading = data.find(d => d.site_id === site.id)
      const paramValue = latestReading?.[selectedParam]
      const isSelected = selectedSite?.id === site.id

      const el = document.createElement('div')
      el.style.cssText = `
        width: ${isSelected ? 20 : 14}px;
        height: ${isSelected ? 20 : 14}px;
        border-radius: 50%;
        background: ${isSelected ? color : '#fff'};
        border: 2.5px solid ${color};
        cursor: pointer;
        box-shadow: 0 1px 6px rgba(0,0,0,0.2);
        transition: all 0.15s;
      `

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: false }).setHTML(`
        <div style="font-family:IBM Plex Sans,sans-serif;font-size:12px;">
          <div style="font-weight:600;color:#1a2332;margin-bottom:4px;">${site.name}</div>
          <div style="font-family:IBM Plex Mono,monospace;color:#475569;font-size:11px;">${site.site_code}</div>
          ${paramValue != null
            ? `<div style="margin-top:6px;font-family:IBM Plex Mono,monospace;">
                <span style="color:#94a3b8;font-size:10px;">${selectedParam.replace(/_/g,' ')}</span><br/>
                <span style="color:${color};font-weight:600;font-size:14px;">${Number(paramValue).toFixed(2)}</span>
               </div>`
            : `<div style="margin-top:6px;color:#cbd5e1;font-size:10px;">no data for parameter</div>`
          }
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([site.longitude, site.latitude])
        .setPopup(popup)
        .addTo(map.current)

      el.addEventListener('click', () => onSiteSelect(site))
      markers.current[site.id] = marker
    })
  }, [sites, data, selectedSite, selectedParam, onSiteSelect])

  return (
    <div className="map-wrapper" style={{ height: '440px' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
