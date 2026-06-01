import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PARAM_LABELS = {
  ph: 'pH', do_ppm: 'Dissolved Oxygen (ppm)', do_percent: 'DO Saturation (%)',
  temp_c: 'Water Temperature (°C)', temp_f: 'Water Temperature (°F)',
  conductivity_us_cm: 'Specific Conductance (µS/cm)', tds_ppm: 'Total Dissolved Solids (ppm)',
  nitrate_mg_l: 'Nitrate (mg/L)', phosphate_mg_l: 'Phosphate (mg/L)',
  chloride_mg_l: 'Chloride (mg/L)', orp_mv: 'Oxidation-Reduction Potential (mV)',
}

const COLORS = ['#2563eb','#059669','#dc2626','#d97706','#7c3aed']

export default function TimeSeriesChart({ data, sites, selectedParam }) {
  const grouped = {}
  data.forEach(row => {
    if (!grouped[row.observation_date]) grouped[row.observation_date] = { date: row.observation_date }
    if (row[selectedParam] != null) grouped[row.observation_date][row.site_name] = Number(row[selectedParam])
  })

  const chartData = Object.values(grouped)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(row => ({ ...row, date: row.date.slice(5) }))

  return (
    <div className="chart-wrapper">
      <div className="chart-title">{PARAM_LABELS[selectedParam] || selectedParam} — Temporal Trend by Site</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #dde3ea', borderRadius: 6, fontSize: 12, fontFamily: 'IBM Plex Sans' }}
            labelStyle={{ color: '#1a2332', fontFamily: 'IBM Plex Mono', fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'IBM Plex Sans', color: '#64748b' }} />
          {sites.map((site, i) => (
            <Line key={site.id} type="monotone" dataKey={site.name}
              stroke={COLORS[i % COLORS.length]} strokeWidth={1.5} dot={false} connectNulls={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
