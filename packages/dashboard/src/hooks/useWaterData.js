import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useWaterData() {
  const [data, setData] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const { data: sitesData, error: sitesError } = await supabase
          .from('sites')
          .select('*')
          .order('name')
        if (sitesError) throw sitesError

        const { data: readings, error: readingsError } = await supabase
          .from('published_data')
          .select('*')
          .order('observation_date', { ascending: false })
        if (readingsError) throw readingsError

        setSites(sitesData || [])
        setData(readings || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, sites, loading, error }
}
