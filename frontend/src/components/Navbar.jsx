import { FiLogOut } from 'react-icons/fi'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import NotificationBell from './NotificationBell'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleStatus =
    user?.role === 'admin' ? 'Approved' : user?.role === 'landlord' ? 'Occupied' : 'Pending'

  const publicMode = !user || ['/login', '/register', '/'].includes(location.pathname) || location.pathname === '/browse'

  return (
    <header className={`navbar ${publicMode ? 'public-navbar' : 'dashboard-navbar'}`}>
      <Link
        to={
          user
            ? user.role === 'landlord'
              ? '/landlord'
              : user.role === 'admin'
                ? '/admin'
                : '/tenant'
            : '/'
        }
        className="brand"
      >
        <span className="brand-mark">R</span>
        <div>
          <strong>RentEase</strong>
          <span>{publicMode ? 'Property Management Simplified' : 'Workspace Hub'}</span>
        </div>
      </Link>

      <nav className="navbar-links">
        {publicMode && !user && (
          <>
            <NavLink to="/login" className="ghost-button">
              Sign In
            </NavLink>
            <NavLink to="/register" className="button-link">
              Get Started
            </NavLink>
          </>
        )}

        {!publicMode && user && (
          <>
            <NotificationBell />
            <div className="user-meta">
              <strong>{user.name}</strong>
              <span className={`status-pill ${user.role === 'admin' ? 'approved' : user.role === 'landlord' ? 'pending' : 'pending'}`}>
                {roleStatus}
              </span>
            </div>
            <button type="button" className="icon-button logout-icon" onClick={handleLogout} aria-label="Logout">
              <FiLogOut />
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar
