import { NavLink } from 'react-router-dom'
import { FiClipboard, FiDollarSign, FiFileText, FiGrid, FiHome, FiMessageSquare, FiSettings, FiTool, FiUsers } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'

const linkSets = {
  admin: [
    { to: '/admin', label: 'Overview', icon: <FiGrid /> },
    { to: '/admin/users', label: 'Users', icon: <FiUsers /> },
    { to: '/admin/properties', label: 'Properties', icon: <FiHome /> },
    { to: '/admin/applications', label: 'Applications', icon: <FiClipboard /> },
    { to: '/admin/rent', label: 'Rent', icon: <FiDollarSign /> },
    { to: '/admin/broadcast', label: 'Broadcast', icon: <FiFileText /> },
    { to: '/profile', label: 'Profile', icon: <FiSettings /> },
  ],
  landlord: [
    { to: '/landlord', label: 'Dashboard', icon: <FiGrid /> },
    { to: '/landlord/properties', label: 'My Properties', icon: <FiHome /> },
    { to: '/landlord/applications', label: 'Applications', icon: <FiClipboard /> },
    { to: '/landlord/tenants', label: 'Tenants', icon: <FiUsers /> },
    { to: '/landlord/rent', label: 'Rent', icon: <FiDollarSign /> },
    { to: '/landlord/maintenance', label: 'Maintenance', icon: <FiTool /> },
    { to: '/landlord/messages', label: 'Messages', icon: <FiMessageSquare /> },
    { to: '/landlord/lease', label: 'Lease Docs', icon: <FiFileText /> },
    { to: '/profile', label: 'Profile', icon: <FiSettings /> },
  ],
  tenant: [
    { to: '/tenant', label: 'Dashboard', icon: <FiGrid /> },
    { to: '/tenant/browse', label: 'Browse', icon: <FiHome /> },
    { to: '/tenant/applications', label: 'Applications', icon: <FiClipboard /> },
    { to: '/tenant/rent', label: 'My Rent', icon: <FiDollarSign /> },
    { to: '/tenant/maintenance', label: 'Maintenance', icon: <FiTool /> },
    { to: '/tenant/messages', label: 'Messages', icon: <FiMessageSquare /> },
    { to: '/tenant/lease', label: 'Lease', icon: <FiFileText /> },
    { to: '/profile', label: 'Profile', icon: <FiSettings /> },
  ],
}

const Sidebar = () => {
  const { user } = useAuth()
  const links = linkSets[user?.role] || []

  return (
    <aside className="sidebar">
      <p className="sidebar-label">
        {user?.role === 'landlord' ? 'LANDLORD PANEL' : user?.role === 'admin' ? 'ADMIN PANEL' : 'TENANT PANEL'}
      </p>
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
