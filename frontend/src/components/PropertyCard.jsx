import { Link } from 'react-router-dom'

const PropertyCard = ({ property, role = 'tenant', onDelete }) => {
  const primaryImage = property.images?.[0]
    ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${property.images[0]}`
    : 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80'

  return (
    <article className="card property-card">
      <img src={primaryImage} alt={property.title} className="property-image" />
      <div className="card-body">
        <div className="property-topline">
          <span className={`status-pill ${property.status}`}>{property.status}</span>
          <strong>Rs. {property.rent}</strong>
        </div>
        <h3>{property.title}</h3>
        <p>{property.location}</p>
        <p className="muted-line">{property.description}</p>
        <div className="card-actions">
          <Link to={role === 'landlord' ? `/landlord/properties/${property._id}/edit` : `/tenant/properties/${property._id}`}>
            {role === 'landlord' ? 'Edit Property' : 'View Details'}
          </Link>
          {role === 'landlord' && (
            <button type="button" className="ghost-button" onClick={() => onDelete(property._id)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default PropertyCard
