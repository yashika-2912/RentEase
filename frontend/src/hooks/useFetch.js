import { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

const useFetch = (url, immediate = true) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState('')

  const refetch = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axiosInstance.get(url)
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (immediate) {
      refetch()
    }
  }, [url, immediate])

  return { data, setData, loading, error, refetch }
}

export default useFetch
