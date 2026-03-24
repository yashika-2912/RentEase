import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="page-shell centered">Loading session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
