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

const LandingPage = () => (
  <div>
    <Navbar />
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Premium rental operations</span>
        <h1>Manage properties, tenants, applications, and rent from one polished workspace.</h1>
        <p>
          Rentora helps landlords stay organized and gives tenants a smooth journey from browsing to lease tracking.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="button-link">
            Create Account
          </Link>
          <Link to="/tenant/browse" className="ghost-button">
            Explore Listings
          </Link>
        </div>
      </div>
    </section>
  </div>
)

const AuthShell = ({ title, subtitle, children }) => (
  <div>
    <Navbar />
    <div className="auth-shell">
      <div className="auth-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
)

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const { data } = await axiosInstance.post('/auth/login', form)
      login(data)
      toast.success('Welcome back')
      navigate(data.user.role === 'landlord' ? '/landlord' : '/tenant')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue managing your rental journey.">
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
          Login
        </button>
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
    <AuthShell title="Create your account" subtitle="Join as a landlord or tenant in a few steps.">
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
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="tenant">Tenant</option>
          <option value="landlord">Landlord</option>
        </select>
        <button type="submit" className="primary-button">
          Register
        </button>
      </form>
    </AuthShell>
  )
}

const StatCard = ({ label, value }) => (
  <article className="stat-card">
    <span>{label}</span>
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
        <StatCard label="Total Properties" value={stats.total} />
        <StatCard label="Occupied" value={stats.occupied} />
        <StatCard label="Vacant" value={stats.vacant} />
        <StatCard label="Rent Collected" value={`Rs. ${stats.collected}`} />
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
    <textarea placeholder="Description" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
    <input type="file" multiple accept=".jpg,.jpeg,.png" onChange={(e) => setImages(e.target.files)} />
    <button type="submit" className="primary-button">
      {submitLabel}
    </button>
  </form>
)

export const AddProperty = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', rent: '', location: '' })
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
  const [form, setForm] = useState({ title: '', description: '', rent: '', location: '' })
  const [images, setImages] = useState([])

  useEffect(() => {
    const loadProperty = async () => {
      const { data } = await axiosInstance.get(`/properties/${id}`)
      setForm({
        title: data.title,
        description: data.description,
        rent: data.rent,
        location: data.location,
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
  const { data: properties, refetch } = useFetch('/properties/landlord/mine')
  const navigate = useNavigate()

  const handleDelete = async (id) => {
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
      <div className="card-grid">
        {properties.map((property) => (
          <PropertyCard key={property._id} property={property} role="landlord" onDelete={handleDelete} />
        ))}
      </div>
    </Layout>
  )
}

export const Applications = () => {
  const { data: applications, refetch } = useFetch('/applications/landlord/all')

  const updateStatus = async (id, action) => {
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
    </Layout>
  )
}

export const TenantList = () => {
  const { data: tenants, refetch } = useFetch('/tenants')
  const navigate = useNavigate()

  const handleRemove = async (id) => {
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
        <StatCard label="Tenant" value={payload.tenant.name} />
        <StatCard label="Property" value={payload.property.title} />
        <StatCard label="Location" value={payload.property.location} />
        <StatCard label="Payments" value={payload.rentHistory.length} />
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
  const currentApplication = applications.find((item) => item.status === 'approved') || applications[0]
  const latestRent = rents[0]

  return (
    <Layout title="Tenant Dashboard" subtitle="Track approvals, dues, and your active lease in one place.">
      <div className="stats-grid">
        <StatCard label="Current Property" value={currentApplication?.propertyId?.title || 'No property yet'} />
        <StatCard label="Application Status" value={currentApplication?.status || 'No application'} />
        <StatCard label="Latest Rent" value={latestRent ? `Rs. ${latestRent.amount}` : 'No rent'} />
        <StatCard label="Due Date" value={latestRent ? formatDate(latestRent.dueDate) : 'N/A'} />
      </div>
    </Layout>
  )
}

export const BrowseProperties = () => {
  const [search, setSearch] = useState('')
  const { data: properties } = useFetch('/properties')
  const filtered = properties.filter((item) => item.location.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout title="Browse Properties" subtitle="Discover available homes filtered by location.">
      <div className="card search-card">
        <input placeholder="Search by location" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card-grid">
        {filtered.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
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
  const { data: applications } = useFetch('/applications/my')

  return (
    <Layout title="My Applications" subtitle="Track all of your submitted rental applications.">
      <div className="card-grid">
        {applications.map((application) => (
          <ApplicationCard key={application._id} application={application} />
        ))}
      </div>
    </Layout>
  )
}

export const MyRent = () => {
  const { data: rents, refetch } = useFetch('/rent/tenant/mine')

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
      <div className="card-grid">
        {rents.map((rent) => (
          <RentCard
            key={rent._id}
            rent={rent}
            action={
              rent.status === 'pending' ? (
                <button type="button" className="primary-button" onClick={() => payRent(rent._id)}>
                  Mark as Paid
                </button>
              ) : null
            }
          />
        ))}
      </div>
    </Layout>
  )
}

export const MyLease = () => {
  const { data: leases } = useFetch('/documents/tenant/mine')

  return (
    <Layout title="My Lease" subtitle="View and download your active lease documents.">
      <div className="card-grid">
        {leases.map((lease) => (
          <div key={lease._id} className="card">
            <h3>{lease.propertyId?.title}</h3>
            <p>{lease.propertyId?.location}</p>
            <DocumentViewer fileUrl={lease.fileUrl} />
          </div>
        ))}
      </div>
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
      <Route path="/landlord/lease" element={<UploadLease />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
      <Route path="/tenant" element={<TenantDashboard />} />
      <Route path="/tenant/browse" element={<BrowseProperties />} />
      <Route path="/tenant/properties/:id" element={<PropertyDetail />} />
      <Route path="/tenant/properties/:id/apply" element={<ApplyForm />} />
      <Route path="/tenant/applications" element={<MyApplication />} />
      <Route path="/tenant/rent" element={<MyRent />} />
      <Route path="/tenant/lease" element={<MyLease />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default App
