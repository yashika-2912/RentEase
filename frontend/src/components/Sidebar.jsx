import { NavLink } from 'react-router-dom'
import { FiClipboard, FiDollarSign, FiFileText, FiGrid, FiHome, FiUsers } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'

const linkSets = {
  landlord: [
    { to: '/landlord', label: 'Dashboard', icon: <FiGrid /> },
    { to: '/landlord/properties', label: 'My Properties', icon: <FiHome /> },
    { to: '/landlord/applications', label: 'Applications', icon: <FiClipboard /> },
    { to: '/landlord/tenants', label: 'Tenants', icon: <FiUsers /> },
    { to: '/landlord/rent', label: 'Rent', icon: <FiDollarSign /> },
    { to: '/landlord/lease', label: 'Lease Docs', icon: <FiFileText /> },
  ],
  tenant: [
    { to: '/tenant', label: 'Dashboard', icon: <FiGrid /> },
    { to: '/tenant/browse', label: 'Browse', icon: <FiHome /> },
    { to: '/tenant/applications', label: 'Applications', icon: <FiClipboard /> },
    { to: '/tenant/rent', label: 'My Rent', icon: <FiDollarSign /> },
    { to: '/tenant/lease', label: 'Lease', icon: <FiFileText /> },
  ],
}

const Sidebar = () => {
  const { user } = useAuth()
  const links = linkSets[user?.role] || []

  return (
    <aside className="sidebar">
      <p className="sidebar-label">{user?.role === 'landlord' ? 'Landlord Space' : 'Tenant Space'}</p>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.to === `/${user?.role}`}>
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </aside>
  )
}

export default Sidebar
