import { Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { FiBarChart2, FiCalendar, FiDollarSign, FiFileText, FiHome, FiMapPin, FiSearch, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi'
import axiosInstance from './api/axiosInstance'
import ApplicationCard from './components/ApplicationCard'
import DocumentViewer from './components/DocumentViewer'
import Navbar from './components/Navbar'
import PropertyCard from './components/PropertyCard'
import ProtectedRoute from './components/ProtectedRoute'
import RentCard from './components/RentCard'
import Sidebar from './components/Sidebar'
import useAuth from './hooks/useAuth'
import useFetch from './hooks/useFetch'
import formatDate from './utils/formatDate'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const demoAccounts = [
  {
    label: 'Tenant',
    description: 'Browse and apply for properties',
    email: 'tenant@rentease.demo',
    password: 'demo123',
  },
  {
    label: 'Landlord',
    description: 'Manage properties and tenants',
    email: 'landlord@rentease.demo',
    password: 'demo123',
  },
  {
    label: 'Admin',
    description: 'Full platform control',
    email: 'admin@rentease.demo',
    password: 'demo123',
  },
]

const Layout = ({ title, subtitle, children }) => (
  <div>
    <Navbar />
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        {children}
      </main>
    </div>
  </div>
)

const LoadingGrid = ({ count = 3 }) => (
  <div className="card-grid">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="card skeleton-card">
        <div className="skeleton-line tall" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    ))}
  </div>
)

const EmptyState = ({ title, description, action }) => (
  <div className="card empty-card">
    <h3>{title}</h3>
    <p>{description}</p>
    {action}
  </div>
)

const LandingPage = () => (
  <div>
    <Navbar />
    <section className="hero">
      <div className="hero-copy hero-copy-light">
        <span className="eyebrow">Property management simplified</span>
        <h1>
          Property Management,
          <br />
          <span className="accent-text">Simplified</span>
        </h1>
        <p>
          Streamline rentals, track payments, manage tenants, and handle maintenance all in one beautiful platform.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="button-link">
            Start Free
          </Link>
          <Link to="/login" className="ghost-button">
            Sign In
          </Link>
        </div>
      </div>
    </section>
    <section className="marketing-strip">
      <div className="marketing-card">
        <div className="marketing-icon"><FiHome /></div>
        <h3>For Landlords</h3>
        <p>Manage properties, track rent, approve applications, and communicate with tenants effortlessly.</p>
      </div>
      <div className="marketing-card">
        <div className="marketing-icon"><FiUsers /></div>
        <h3>For Tenants</h3>
        <p>Browse properties, submit applications, pay rent, and request maintenance all in one place.</p>
      </div>
      <div className="marketing-card">
        <div className="marketing-icon"><FiShield /></div>
        <h3>For Admins</h3>
        <p>Monitor platform activity, manage users, and send broadcast notifications with full oversight.</p>
      </div>
    </section>
    <footer className="site-footer">
      <p>© 2026 RentEase. All rights reserved.</p>
    </footer>
  </div>
)

const AuthShell = ({ title, subtitle, children, mode = 'login' }) => (
  <div className="auth-split-shell">
    <section className="auth-showcase">
      <div className="auth-brand-lockup">
        <span className="brand-mark large">R</span>
        <h1>RentEase</h1>
      </div>
      <p>
        {mode === 'login'
          ? 'Intelligent property management with smart matching, secure payments, and real-time rental workflows.'
          : 'Join thousands of property managers and tenants using RentEase.'}
      </p>
      {mode === 'login' && (
        <div className="auth-pill-row">
          <span>Smart Matching</span>
          <span>Visit Scheduling</span>
          <span>Secure Payments</span>
          <span>Reviews</span>
        </div>
      )}
    </section>
    <section className="auth-form-pane">
      <div className="auth-card auth-pane-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    </section>
  </div>
)

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const useDemoAccount = (account) => {
    setForm({ email: account.email, password: account.password })
    toast.success(`${account.label} demo loaded`)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const { data } = await axiosInstance.post('/auth/login', form)
      login(data)
      toast.success('Welcome back')
      navigate(data.user.role === 'landlord' ? '/landlord' : data.user.role === 'admin' ? '/admin' : '/tenant')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account to continue" mode="login">
      <div className="demo-access">
        <span className="demo-access-label">Quick demo access</span>
        <div className="demo-access-grid">
          {demoAccounts.map((account) => (
            <button
              key={account.label}
              type="button"
              className="demo-access-card"
              onClick={() => useDemoAccount(account)}
            >
              <strong>{account.label}</strong>
              <span>{account.description}</span>
            </button>
          ))}
        </div>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" className="primary-button">
          Sign In
        </button>
        <p className="auth-linkline">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await axiosInstance.post('/auth/register', form)
      toast.success('Account created successfully')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <AuthShell title="Create an account" subtitle="Get started with RentEase" mode="register">
      <form className="form-grid" onSubmit={handleSubmit}>
        <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input
          placeholder="Password"
          type="password"
          minLength="6"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <div className="role-toggle">
          <button type="button" className={form.role === 'tenant' ? 'role-chip active' : 'role-chip'} onClick={() => setForm({ ...form, role: 'tenant' })}>
            Tenant
          </button>
          <button type="button" className={form.role === 'landlord' ? 'role-chip active' : 'role-chip'} onClick={() => setForm({ ...form, role: 'landlord' })}>
            Landlord
          </button>
        </div>
        <button type="submit" className="primary-button">
          Create Account
        </button>
        <p className="auth-helper-text">
          If you see &quot;User already exists&quot;, that email is already registered. Use the login page instead.
        </p>
        <p className="auth-linkline">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}

const StatCard = ({ label, value, icon }) => (
  <article className="stat-card">
    <div className="stat-head">
      <span>{label}</span>
      <div className="stat-icon">{icon}</div>
    </div>
    <strong>{value}</strong>
  </article>
)

export const LandlordDashboard = () => {
  const { data: properties } = useFetch('/properties/landlord/mine')
  const { data: rentItems } = useFetch('/rent/landlord/all')

  const stats = useMemo(() => {
    const occupied = properties.filter((property) => property.status === 'occupied').length
    const vacant = properties.filter((property) => property.status === 'vacant').length
    const collected = rentItems.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0)
    return { total: properties.length, occupied, vacant, collected }
  }, [properties, rentItems])

  const chartData = {
    labels: ['Occupied', 'Vacant'],
    datasets: [
      {
        label: 'Properties',
        data: [stats.occupied, stats.vacant],
        backgroundColor: ['#f59e0b', '#1e293b'],
      },
    ],
  }

  return (
    <Layout title="Landlord Dashboard" subtitle="Track portfolio occupancy, collections, and daily decisions.">
      <div className="stats-grid">
        <StatCard label="Total Properties" value={stats.total} icon={<FiHome />} />
        <StatCard label="Occupied" value={stats.occupied} icon={<FiTrendingUp />} />
        <StatCard label="Vacant" value={stats.vacant} icon={<FiFileText />} />
        <StatCard label="Rent Collected" value={`Rs. ${stats.collected}`} icon={<FiDollarSign />} />
      </div>
      <section className="card chart-card">
        <Bar data={chartData} />
      </section>
    </Layout>
  )
}

const PropertyForm = ({ form, setForm, setImages, onSubmit, submitLabel }) => (
  <form className="card form-grid" onSubmit={onSubmit}>
    <input placeholder="Property title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
    <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
    <input placeholder="Monthly rent" type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} required />
    <div className="split-grid">
      <input placeholder="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
      <input placeholder="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
    </div>
    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
      <option value="apartment">Apartment</option>
      <option value="house">House</option>
      <option value="villa">Villa</option>
      <option value="studio">Studio</option>
      <option value="commercial">Commercial</option>
    </select>
    <input
      placeholder="Amenities (comma separated)"
      value={form.amenities}
      onChange={(e) => setForm({ ...form, amenities: e.target.value })}
    />
    <textarea placeholder="Description" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
    <input type="file" multiple accept=".jpg,.jpeg,.png" onChange={(e) => setImages(e.target.files)} />
    <button type="submit" className="primary-button">
      {submitLabel}
    </button>
  </form>
)

export const AddProperty = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', rent: '', location: '', bedrooms: '1', bathrooms: '1', type: 'apartment', amenities: '' })
  const [images, setImages] = useState([])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    Array.from(images).forEach((file) => payload.append('images', file))

    try {
      await axiosInstance.post('/properties', payload)
      toast.success('Property added')
      navigate('/landlord/properties')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add property')
    }
  }

  return (
    <Layout title="Add Property" subtitle="Create a new listing for prospective tenants.">
      <PropertyForm form={form} setForm={setForm} setImages={setImages} onSubmit={handleSubmit} submitLabel="Create Property" />
    </Layout>
  )
}

export const EditProperty = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState({ title: '', description: '', rent: '', location: '', bedrooms: '1', bathrooms: '1', type: 'apartment', amenities: '' })
  const [images, setImages] = useState([])

  useEffect(() => {
    const loadProperty = async () => {
      const { data } = await axiosInstance.get(`/properties/${id}`)
      setForm({
        title: data.title,
        description: data.description,
        rent: data.rent,
        location: data.location,
        bedrooms: data.bedrooms || 1,
        bathrooms: data.bathrooms || 1,
        type: data.type || 'apartment',
        amenities: data.amenities?.join(', ') || '',
      })
    }
    loadProperty()
  }, [id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    Array.from(images).forEach((file) => payload.append('images', file))

    try {
      await axiosInstance.put(`/properties/${id}`, payload)
      toast.success('Property updated')
      navigate('/landlord/properties')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update property')
    }
  }

  return (
    <Layout title="Edit Property" subtitle="Refresh pricing, location, and listing information.">
      <PropertyForm form={form} setForm={setForm} setImages={setImages} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </Layout>
  )
}

export const MyProperties = () => {
  const { data: properties, refetch, loading } = useFetch('/properties/landlord/mine')
  const navigate = useNavigate()

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property? This action cannot be undone.')) return
    try {
      await axiosInstance.delete(`/properties/${id}`)
      toast.success('Property deleted')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete property')
    }
  }

  return (
    <Layout title="My Properties" subtitle="Manage your inventory and listing availability.">
      <div className="row-between compact-row">
        <div />
        <button type="button" className="primary-button" onClick={() => navigate('/landlord/properties/new')}>
          Add Property
        </button>
      </div>
      {loading ? (
        <LoadingGrid />
      ) : properties.length ? (
        <div className="card-grid">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} role="landlord" onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No properties yet"
          description="Add your first listing to start accepting tenant applications."
          action={
            <button type="button" className="primary-button" onClick={() => navigate('/landlord/properties/new')}>
              Add Your First Listing
            </button>
          }
        />
      )}
    </Layout>
  )
}

export const Applications = () => {
  const { data: applications, refetch, loading } = useFetch('/applications/landlord/all')

  const updateStatus = async (id, action) => {
    if (action === 'reject' && !window.confirm('Reject this application?')) return
    try {
      await axiosInstance.put(`/applications/${id}/${action}`)
      toast.success(`Application ${action}d`)
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update application')
    }
  }

  return (
    <Layout title="Applications" subtitle="Review applicants and assign the right tenant with one decision.">
      {loading ? (
        <LoadingGrid />
      ) : applications.length ? (
        <div className="card-grid">
          {applications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              actions={
                application.status === 'pending' ? (
                  <div className="card-actions">
                    <button type="button" className="primary-button" onClick={() => updateStatus(application._id, 'approve')}>
                      Approve
                    </button>
                    <button type="button" className="ghost-button" onClick={() => updateStatus(application._id, 'reject')}>
                      Reject
                    </button>
                  </div>
                ) : null
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No applications yet" description="Tenant applications will appear here as they come in." />
      )}
    </Layout>
  )
}

export const TenantList = () => {
  const { data: tenants, refetch, loading } = useFetch('/tenants')
  const navigate = useNavigate()

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this tenant from the property?')) return
    try {
      await axiosInstance.delete(`/tenants/${id}/remove`)
      toast.success('Tenant removed')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove tenant')
    }
  }

  return (
    <Layout title="Tenant List" subtitle="See every assigned tenant and the latest payment status.">
      {loading ? (
        <LoadingGrid />
      ) : tenants.length ? (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Rent Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((row) => (
                <tr key={row.tenant._id}>
                  <td>{row.tenant.name}</td>
                  <td>{row.propertyTitle}</td>
                  <td>
                    <span className={`status-pill ${row.latestRent?.status || 'vacant'}`}>{row.latestRent?.status || 'No rent entry'}</span>
                  </td>
                  <td className="table-actions">
                    <button type="button" onClick={() => navigate(`/landlord/tenants/${row.tenant._id}`)}>
                      View
                    </button>
                    <button type="button" onClick={() => handleRemove(row.tenant._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No tenants yet" description="Approved tenants will appear here once properties are occupied." />
      )}
    </Layout>
  )
}

export const TenantDetail = () => {
  const { id } = useParams()
  const [payload, setPayload] = useState(null)

  useEffect(() => {
    const fetchDetails = async () => {
      const { data } = await axiosInstance.get(`/tenants/${id}`)
      setPayload(data)
    }
    fetchDetails()
  }, [id])

  if (!payload) {
    return <Layout title="Tenant Detail" subtitle="Loading tenant information..."><div className="card">Loading...</div></Layout>
  }

  return (
    <Layout title="Tenant Detail" subtitle="Review assigned property details and payment history.">
      <div className="stats-grid">
        <StatCard label="Tenant" value={payload.tenant.name} icon={<FiUsers />} />
        <StatCard label="Property" value={payload.property.title} icon={<FiHome />} />
        <StatCard label="Location" value={payload.property.location} icon={<FiFileText />} />
        <StatCard label="Payments" value={payload.rentHistory.length} icon={<FiDollarSign />} />
      </div>
      <div className="card-grid">
        {payload.rentHistory.map((item) => (
          <RentCard key={item._id} rent={item} />
        ))}
      </div>
    </Layout>
  )
}

export const RentManagement = () => {
  const { data: tenants } = useFetch('/tenants')
  const { data: rents, refetch } = useFetch('/rent/landlord/all')
  const [form, setForm] = useState({ propertyId: '', tenantId: '', amount: '', month: '', dueDate: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await axiosInstance.post('/rent', form)
      toast.success('Rent entry created')
      setForm({ propertyId: '', tenantId: '', amount: '', month: '', dueDate: '' })
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create rent entry')
    }
  }

  const verifyPayment = async (id) => {
    try {
      await axiosInstance.put(`/rent/${id}/verify`)
      toast.success('Payment verified')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to verify payment')
    }
  }

  return (
    <Layout title="Rent Management" subtitle="Generate monthly rent records and confirm tenant payments.">
      <form className="card form-grid" onSubmit={handleSubmit}>
        <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required>
          <option value="">Select property</option>
          {tenants.map((item) => (
            <option key={item.propertyId} value={item.propertyId}>
              {item.propertyTitle}
            </option>
          ))}
        </select>
        <select value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} required>
          <option value="">Select tenant</option>
          {tenants.map((item) => (
            <option key={item.tenant._id} value={item.tenant._id}>
              {item.tenant.name}
            </option>
          ))}
        </select>
        <input placeholder="Month e.g. June 2026" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
        <input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
        <button type="submit" className="primary-button">
          Create Rent Entry
        </button>
      </form>
      <div className="card-grid">
        {rents.map((rent) => (
          <RentCard
            key={rent._id}
            rent={rent}
            action={
              rent.status === 'paid' && !rent.verifiedAt ? (
                <button type="button" className="primary-button" onClick={() => verifyPayment(rent._id)}>
                  Verify Payment
                </button>
              ) : null
            }
          />
        ))}
      </div>
    </Layout>
  )
}

export const UploadLease = () => {
  const { data: tenants } = useFetch('/tenants')
  const [form, setForm] = useState({ propertyId: '', tenantId: '' })
  const [file, setFile] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = new FormData()
    payload.append('propertyId', form.propertyId)
    payload.append('tenantId', form.tenantId)
    if (file) payload.append('lease', file)

    try {
      await axiosInstance.post('/documents/upload', payload)
      toast.success('Lease uploaded')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to upload lease')
    }
  }

  return (
    <Layout title="Upload Lease" subtitle="Attach signed lease PDFs for active tenants.">
      <form className="card form-grid" onSubmit={handleSubmit}>
        <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required>
          <option value="">Select property</option>
          {tenants.map((item) => (
            <option key={item.propertyId} value={item.propertyId}>
              {item.propertyTitle}
            </option>
          ))}
        </select>
        <select value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} required>
          <option value="">Select tenant</option>
          {tenants.map((item) => (
            <option key={item.tenant._id} value={item.tenant._id}>
              {item.tenant.name}
            </option>
          ))}
        </select>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit" className="primary-button">
          Upload PDF
        </button>
      </form>
    </Layout>
  )
}

export const TenantDashboard = () => {
  const { data: applications } = useFetch('/applications/my')
  const { data: rents } = useFetch('/rent/tenant/mine')
  const { data: notifications } = useFetch('/notifications')
  const currentApplication = applications.find((item) => item.status === 'approved') || applications[0]
  const latestRent = rents[0]
  const recentActivity = notifications.slice(0, 4)

  return (
    <Layout title="Tenant Dashboard" subtitle="Welcome back!">
      <div className="stats-grid">
        <StatCard label="Current Property" value={currentApplication?.propertyId?.title || 'No property yet'} icon={<FiHome />} />
        <StatCard label="Application Status" value={currentApplication?.status || 'No application'} icon={<FiFileText />} />
        <StatCard label="Latest Rent" value={latestRent ? `Rs. ${latestRent.amount}` : 'No rent'} icon={<FiDollarSign />} />
        <StatCard label="Due Date" value={latestRent ? formatDate(latestRent.dueDate) : 'N/A'} icon={<FiCalendar />} />
      </div>
      <div className="dashboard-panels two-up">
        <section className="card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <Link to="/tenant/rent" className="action-tile"><FiDollarSign /> Pay Rent</Link>
            <Link to="/tenant/maintenance" className="action-tile"><FiHome /> Submit Maintenance</Link>
            <Link to="/tenant/lease" className="action-tile"><FiFileText /> View Lease</Link>
            <Link to="/tenant/browse" className="action-tile"><FiSearch /> Browse Properties</Link>
          </div>
        </section>
        <section className="card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.length ? recentActivity.map((item) => (
              <div key={item._id} className="activity-item">
                <span>{item.message}</span>
                <small>{formatDate(item.createdAt)}</small>
              </div>
            )) : <p className="empty-state">No recent activity yet.</p>}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export const BrowseProperties = () => {
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
  })
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== '')
  ).toString()
  const { data: properties, loading } = useFetch(`/properties${query ? `?${query}` : ''}`)
  const [smartMatchOpen, setSmartMatchOpen] = useState(false)

  return (
    <Layout title="Browse Properties" subtitle="Discover available homes filtered by location.">
      <div className="browse-toolbar">
        <div className="toolbar-search">
          <FiSearch />
          <input placeholder="Search by location or title..." value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        </div>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="studio">Studio</option>
          <option value="commercial">Commercial</option>
        </select>
        <select value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}>
          <option value="">Any</option>
          <option value="1">1+ Beds</option>
          <option value="2">2+ Beds</option>
          <option value="3">3+ Beds</option>
          <option value="4">4+ Beds</option>
        </select>
        <button type="button" className="primary-button smart-match-btn" onClick={() => setSmartMatchOpen(true)}>
          Smart Match
        </button>
      </div>
      {loading ? (
        <LoadingGrid />
      ) : properties.length ? (
        <div className="card-grid">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      ) : (
        <EmptyState title="No matching properties" description="Try adjusting your filters to see more listings." />
      )}
      {smartMatchOpen && (
        <div className="modal-overlay" onClick={() => setSmartMatchOpen(false)}>
          <div className="smart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <div>
                <h3>Set Your Preferences</h3>
                <p className="muted-line">We&apos;ll rank properties based on your preferences.</p>
              </div>
              <button type="button" className="ghost-button" onClick={() => setSmartMatchOpen(false)}>Close</button>
            </div>
            <div className="form-grid">
              <input placeholder="Monthly Budget" type="number" value={filters.maxRent} onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })} />
              <input placeholder="Preferred Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
              <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">Select type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
              </select>
              <input placeholder="Desired Amenities (comma separated)" value={filters.amenities} onChange={(e) => setFilters({ ...filters, amenities: e.target.value })} />
              <button type="button" className="primary-button" onClick={() => setSmartMatchOpen(false)}>Find My Matches</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const { data: applications } = useFetch('/applications/my')
  const alreadyApplied = applications.some((item) => item.propertyId?._id === id)

  useEffect(() => {
    const fetchProperty = async () => {
      const { data } = await axiosInstance.get(`/properties/${id}`)
      setProperty(data)
    }
    fetchProperty()
  }, [id])

  if (!property) {
    return <Layout title="Property Detail" subtitle="Loading property information..."><div className="card">Loading...</div></Layout>
  }

  const imageList = property.images?.length
    ? property.images.map((image) => `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${image}`)
    : ['https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80']

  return (
    <Layout title={property.title} subtitle={property.location}>
      <div className="gallery-grid">
        {imageList.map((image) => (
          <img key={image} src={image} alt={property.title} className="gallery-image" />
        ))}
      </div>
      <div className="card">
        <div className="row-between">
          <span className={`status-pill ${property.status}`}>{property.status}</span>
          <strong>Rs. {property.rent}/month</strong>
        </div>
        <p className="muted-line">
          {property.bedrooms} bed • {property.bathrooms} bath • {property.type}
        </p>
        {!!property.amenities?.length && <p className="muted-line">Amenities: {property.amenities.join(', ')}</p>}
        <p>{property.description}</p>
        <button
          type="button"
          className="primary-button"
          disabled={alreadyApplied || property.status === 'occupied'}
          onClick={() => navigate(`/tenant/properties/${property._id}/apply`)}
        >
          {alreadyApplied ? 'Already Applied' : property.status === 'occupied' ? 'Occupied' : 'Apply Now'}
        </button>
      </div>
    </Layout>
  )
}

export const ApplyForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    occupation: '',
    monthlyIncome: '',
    message: '',
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await axiosInstance.post('/applications', { ...form, propertyId: id })
      toast.success('Application submitted')
      navigate('/tenant/applications')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit application')
    }
  }

  return (
    <Layout title="Apply for Property" subtitle="Share your profile with the landlord to request approval.">
      <form className="card form-grid" onSubmit={handleSubmit}>
        <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder="Occupation" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} required />
        <input
          placeholder="Monthly income"
          type="number"
          value={form.monthlyIncome}
          onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
          required
        />
        <textarea placeholder="Message" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <button type="submit" className="primary-button">
          Submit Application
        </button>
      </form>
    </Layout>
  )
}

export const MyApplication = () => {
  const { data: applications, loading } = useFetch('/applications/my')

  return (
    <Layout title="My Applications" subtitle="Track all of your submitted rental applications.">
      {loading ? (
        <LoadingGrid />
      ) : applications.length ? (
        <div className="card-grid">
          {applications.map((application) => (
            <ApplicationCard key={application._id} application={application} />
          ))}
        </div>
      ) : (
        <EmptyState title="No applications yet" description="Browse available properties and submit your first application." />
      )}
    </Layout>
  )
}

export const MyRent = () => {
  const { data: rents, refetch, loading } = useFetch('/rent/tenant/mine')

  const payRent = async (id) => {
    try {
      await axiosInstance.put(`/rent/${id}/pay`)
      toast.success('Rent marked as paid')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update rent')
    }
  }

  return (
    <Layout title="My Rent" subtitle="Stay on top of due dates and payment history.">
      {loading ? (
        <LoadingGrid />
      ) : rents.length ? (
        <div className="card-grid">
          {rents.map((rent) => (
            <RentCard
              key={rent._id}
              rent={rent}
              action={
                rent.status === 'pending' || rent.status === 'overdue' ? (
                  <button type="button" className="primary-button" onClick={() => payRent(rent._id)}>
                    Mark as Paid
                  </button>
                ) : rent.receiptUrl ? (
                  <a
                    className="button-link"
                    href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${rent.receiptUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Receipt
                  </a>
                ) : null
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No rent records" description="Rent entries will appear here once your landlord assigns them." />
      )}
    </Layout>
  )
}

export const MyLease = () => {
  const { data: leases, loading } = useFetch('/documents/tenant/mine')

  return (
    <Layout title="My Lease" subtitle="View and download your active lease documents.">
      {loading ? (
        <LoadingGrid />
      ) : leases.length ? (
        <div className="card-grid">
          {leases.map((lease) => (
            <div key={lease._id} className="card">
              <h3>{lease.propertyId?.title}</h3>
              <p>{lease.propertyId?.location}</p>
              <DocumentViewer fileUrl={lease.fileUrl} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No lease uploaded yet" description="Your landlord will upload the signed lease here." />
      )}
    </Layout>
  )
}

export const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' })

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, name: user.name || '', email: user.email || '' }))
    }
  }, [user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const payload = {
        name: form.name,
        email: form.email,
      }

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword
        payload.newPassword = form.newPassword
      }

      const { data } = await axiosInstance.put('/auth/profile', payload)
      setUser(data.user)
      toast.success('Profile updated')
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile')
    }
  }

  return (
    <Layout title="Profile Settings" subtitle="Update your personal details and password.">
      <form className="card form-grid" onSubmit={handleSubmit}>
        <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input
          placeholder="Current password"
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
        <input
          placeholder="New password"
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <button type="submit" className="primary-button">
          Save Profile
        </button>
      </form>
    </Layout>
  )
}

export const TenantMaintenance = () => {
  const { data: applications } = useFetch('/applications/my')
  const { data: requests, refetch, loading } = useFetch('/maintenance/tenant/mine')
  const approved = applications.find((item) => item.status === 'approved')
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!approved?.propertyId?._id) {
      toast.error('No approved property found for maintenance request')
      return
    }

    try {
      await axiosInstance.post('/maintenance', { ...form, propertyId: approved.propertyId._id })
      toast.success('Maintenance request submitted')
      setForm({ title: '', description: '', priority: 'medium' })
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit request')
    }
  }

  return (
    <Layout title="Maintenance Requests" subtitle="Report property issues and track landlord updates.">
      <form className="card form-grid" onSubmit={handleSubmit}>
        <input placeholder="Issue title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <textarea placeholder="Describe the issue" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <button type="submit" className="primary-button">
          Submit Request
        </button>
      </form>
      {loading ? (
        <LoadingGrid />
      ) : requests.length ? (
        <div className="card-grid">
          {requests.map((request) => (
            <article key={request._id} className="card">
              <div className="row-between">
                <h3>{request.title}</h3>
                <span className={`status-pill ${request.status === 'resolved' ? 'approved' : request.status === 'in-progress' ? 'pending' : 'vacant'}`}>
                  {request.status}
                </span>
              </div>
              <p className="muted-line">{request.propertyId?.title}</p>
              <p>{request.description}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No maintenance requests yet" description="Report issues here and your landlord can update progress." />
      )}
    </Layout>
  )
}

export const LandlordMaintenance = () => {
  const { data: requests, refetch, loading } = useFetch('/maintenance/landlord/all')

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/maintenance/${id}/status`, { status })
      toast.success('Maintenance status updated')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update request')
    }
  }

  return (
    <Layout title="Maintenance Board" subtitle="Manage tenant issues from open to resolved.">
      {loading ? (
        <LoadingGrid />
      ) : requests.length ? (
        <div className="card-grid">
          {requests.map((request) => (
            <article key={request._id} className="card">
              <div className="row-between">
                <div>
                  <h3>{request.title}</h3>
                  <p className="muted-line">{request.propertyId?.title} • {request.tenantId?.name}</p>
                </div>
                <span className={`status-pill ${request.status === 'resolved' ? 'approved' : request.status === 'in-progress' ? 'pending' : 'vacant'}`}>
                  {request.status}
                </span>
              </div>
              <p>{request.description}</p>
              <div className="card-actions">
                <button type="button" className="ghost-button" onClick={() => updateStatus(request._id, 'open')}>Open</button>
                <button type="button" className="ghost-button" onClick={() => updateStatus(request._id, 'in-progress')}>In Progress</button>
                <button type="button" className="primary-button" onClick={() => updateStatus(request._id, 'resolved')}>Resolve</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No maintenance tickets" description="Tenant maintenance requests will appear here." />
      )}
    </Layout>
  )
}

const MessageWorkspace = ({ title, subtitle, propertyOptions }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    if (!selectedPropertyId && propertyOptions[0]?.value) {
      setSelectedPropertyId(propertyOptions[0].value)
    }
  }, [propertyOptions, selectedPropertyId])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedPropertyId) return
      try {
        const { data } = await axiosInstance.get(`/messages/${selectedPropertyId}`)
        setMessages(data)
      } catch (error) {
        setMessages([])
      }
    }
    fetchMessages()
  }, [selectedPropertyId])

  const handleSend = async (event) => {
    event.preventDefault()
    if (!selectedPropertyId || !text.trim()) return

    try {
      const { data } = await axiosInstance.post('/messages', { propertyId: selectedPropertyId, text })
      setMessages((prev) => [...prev, data])
      setText('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send message')
    }
  }

  if (!propertyOptions.length) {
    return (
      <Layout title={title} subtitle={subtitle}>
        <EmptyState title="No message threads yet" description="A conversation thread becomes available once a property is assigned." />
      </Layout>
    )
  }

  return (
    <Layout title={title} subtitle={subtitle}>
      <div className="card form-grid">
        <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)}>
          {propertyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="card message-thread">
        <div className="message-list">
          {messages.length ? (
            messages.map((message) => (
              <article key={message._id} className="message-bubble">
                <strong>{message.senderId?.name}</strong>
                <p>{message.text}</p>
              </article>
            ))
          ) : (
            <p className="empty-state">No messages in this thread yet.</p>
          )}
        </div>
        <form className="message-composer" onSubmit={handleSend}>
          <input placeholder="Type your message" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="primary-button">Send</button>
        </form>
      </div>
    </Layout>
  )
}

export const TenantMessages = () => {
  const { data: applications } = useFetch('/applications/my')
  const propertyOptions = applications
    .filter((item) => item.status === 'approved')
    .map((item) => ({
      value: item.propertyId?._id,
      label: item.propertyId?.title || 'Property',
    }))

  return <MessageWorkspace title="Messages" subtitle="Chat with your landlord about your assigned property." propertyOptions={propertyOptions} />
}

export const LandlordMessages = () => {
  const { data: tenants } = useFetch('/tenants')
  const propertyOptions = tenants.map((item) => ({
    value: item.propertyId,
    label: `${item.propertyTitle} • ${item.tenant.name}`,
  }))

  return <MessageWorkspace title="Messages" subtitle="Respond to tenant conversations property by property." propertyOptions={propertyOptions} />
}

export const AdminDashboard = () => {
  const { data: stats } = useFetch('/admin/stats')

  return (
    <Layout title="Admin Overview" subtitle="Monitor platform health, user growth, and rent activity.">
      <div className="stats-grid">
        <StatCard label="Users" value={stats.users || 0} icon={<FiUsers />} />
        <StatCard label="Properties" value={stats.properties || 0} icon={<FiHome />} />
        <StatCard label="Applications" value={stats.applications || 0} icon={<FiFileText />} />
        <StatCard label="Rent Volume" value={`Rs. ${stats.totalRentVolume || 0}`} icon={<FiDollarSign />} />
        <StatCard label="Collected" value={`Rs. ${stats.collectedRent || 0}`} icon={<FiBarChart2 />} />
        <StatCard label="Overdue" value={stats.overdueRentCount || 0} icon={<FiShield />} />
      </div>
    </Layout>
  )
}

export const AdminUsers = () => {
  const { data: users, refetch, loading } = useFetch('/admin/users')

  const toggleSuspend = async (id) => {
    try {
      await axiosInstance.put(`/admin/users/${id}/suspend`)
      toast.success('User status updated')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user')
    }
  }

  const removeUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return
    try {
      await axiosInstance.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete user')
    }
  }

  return (
    <Layout title="Admin Users" subtitle="Suspend, review, or remove platform users.">
      {loading ? (
        <LoadingGrid />
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? 'Active' : 'Suspended'}</td>
                  <td className="table-actions">
                    <button type="button" onClick={() => toggleSuspend(user._id)}>
                      {user.isActive ? 'Suspend' : 'Activate'}
                    </button>
                    <button type="button" onClick={() => removeUser(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}

export const AdminProperties = () => {
  const { data: properties, refetch, loading } = useFetch('/admin/properties')

  const removeProperty = async (id) => {
    if (!window.confirm('Force delete this property and related records?')) return
    try {
      await axiosInstance.delete(`/admin/properties/${id}`)
      toast.success('Property deleted')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete property')
    }
  }

  return (
    <Layout title="Admin Properties" subtitle="View and moderate all platform properties.">
      {loading ? (
        <LoadingGrid />
      ) : (
        <div className="card-grid">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} role="admin" onDelete={removeProperty} />
          ))}
        </div>
      )}
    </Layout>
  )
}

export const AdminApplications = () => {
  const { data: applications, loading } = useFetch('/admin/applications')

  return (
    <Layout title="Admin Applications" subtitle="Review platform-wide application activity.">
      {loading ? (
        <LoadingGrid />
      ) : (
        <div className="card-grid">
          {applications.map((application) => (
            <ApplicationCard key={application._id} application={application} />
          ))}
        </div>
      )}
    </Layout>
  )
}

export const AdminRent = () => {
  const { data: rents, loading } = useFetch('/admin/rent')

  return (
    <Layout title="Admin Rent" subtitle="Track all rent records and payment statuses across the platform.">
      {loading ? (
        <LoadingGrid />
      ) : (
        <div className="card-grid">
          {rents.map((rent) => (
            <RentCard key={rent._id} rent={rent} />
          ))}
        </div>
      )}
    </Layout>
  )
}

export const AdminBroadcast = () => {
  const [form, setForm] = useState({ role: '', message: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await axiosInstance.post('/admin/notify', form)
      toast.success('Broadcast sent')
      setForm({ role: '', message: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send broadcast')
    }
  }

  return (
    <Layout title="Broadcast Notification" subtitle="Send platform-wide notifications to all users or a selected role.">
      <form className="card form-grid" onSubmit={handleSubmit}>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="">All users</option>
          <option value="tenant">Tenants</option>
          <option value="landlord">Landlords</option>
          <option value="admin">Admins</option>
        </select>
        <textarea placeholder="Broadcast message" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        <button type="submit" className="primary-button">
          Send Notification
        </button>
      </form>
    </Layout>
  )
}

const Unauthorized = () => (
  <div>
    <Navbar />
    <div className="page-shell centered">
      <div className="card auth-card">
        <h1>Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
        <Link to="/" className="button-link">
          Return Home
        </Link>
      </div>
    </div>
  </div>
)

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/browse" element={<LandingPage />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
      <Route path="/landlord" element={<LandlordDashboard />} />
      <Route path="/landlord/properties" element={<MyProperties />} />
      <Route path="/landlord/properties/new" element={<AddProperty />} />
      <Route path="/landlord/properties/:id/edit" element={<EditProperty />} />
      <Route path="/landlord/applications" element={<Applications />} />
      <Route path="/landlord/tenants" element={<TenantList />} />
      <Route path="/landlord/tenants/:id" element={<TenantDetail />} />
      <Route path="/landlord/rent" element={<RentManagement />} />
      <Route path="/landlord/maintenance" element={<LandlordMaintenance />} />
      <Route path="/landlord/messages" element={<LandlordMessages />} />
      <Route path="/landlord/lease" element={<UploadLease />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
      <Route path="/tenant" element={<TenantDashboard />} />
      <Route path="/tenant/browse" element={<BrowseProperties />} />
      <Route path="/tenant/properties/:id" element={<PropertyDetail />} />
      <Route path="/tenant/properties/:id/apply" element={<ApplyForm />} />
      <Route path="/tenant/applications" element={<MyApplication />} />
      <Route path="/tenant/rent" element={<MyRent />} />
      <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
      <Route path="/tenant/messages" element={<TenantMessages />} />
      <Route path="/tenant/lease" element={<MyLease />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/properties" element={<AdminProperties />} />
      <Route path="/admin/applications" element={<AdminApplications />} />
      <Route path="/admin/rent" element={<AdminRent />} />
      <Route path="/admin/broadcast" element={<AdminBroadcast />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['tenant', 'landlord', 'admin']} />}>
      <Route path="/profile" element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default App
