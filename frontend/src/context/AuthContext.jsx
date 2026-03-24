import { createContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import axiosInstance from '../api/axiosInstance'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('rms_token'))
  const [loading, setLoading] = useState(true)

  const login = (payload) => {
    localStorage.setItem('rms_token', payload.token)
    setToken(payload.token)
    setUser(payload.user)
  }

  const logout = () => {
    localStorage.removeItem('rms_token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await axiosInstance.get('/auth/me')
        setUser(data)
      } catch (error) {
        localStorage.removeItem('rms_token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
