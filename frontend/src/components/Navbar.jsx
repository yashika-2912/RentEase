import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import NotificationBell from './NotificationBell'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to={user ? (user.role === 'landlord' ? '/landlord' : '/tenant') : '/'} className="brand">
        <span className="brand-mark">R</span>
        <div>
          <strong>Rentora</strong>
          <span>Property command center</span>
        </div>
      </Link>

      <nav className="navbar-links">
        {!user && (
          <>
            <NavLink to="/browse">Browse</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" className="button-link">
              Get Started
            </NavLink>
          </>
        )}

        {user && (
          <>
            <NavLink to={user.role === 'landlord' ? '/landlord/properties' : '/tenant/browse'}>Workspace</NavLink>
            <NotificationBell />
            <button type="button" className="ghost-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar
