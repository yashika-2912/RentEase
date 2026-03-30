import { Link } from 'react-router-dom'
import { FiCalendar, FiHome, FiMapPin, FiStar, FiSun } from 'react-icons/fi'

const PropertyCard = ({ property, role = 'tenant', onDelete }) => {
  const primaryImage = property.images?.[0]
    ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${property.images[0]}`
    : 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80'
  const amenities = Array.isArray(property.amenities)
    ? property.amenities.filter(Boolean)
    : String(property.amenities || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
  const bedrooms = Number(property.bedrooms || 1)
  const bathrooms = Number(property.bathrooms || 1)
  const rating = (3.8 + Math.min((bedrooms + bathrooms) * 0.14, 1.1)).toFixed(1)
  const typeLabel = property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : 'Apartment'
  const isTenantCard = role === 'tenant'

  return (
    <article className="card property-card">
      <div className="property-media">
        <img src={primaryImage} alt={property.title} className="property-image" />
        {isTenantCard && (
          <div className="property-rating">
            <FiStar />
            <span>{rating}</span>
          </div>
        )}
      </div>
      <div className="card-body property-card-body">
        {isTenantCard ? (
          <>
            <div className="property-heading-row">
              <div>
                <h3>{property.title}</h3>
                <p className="icon-line property-location"><FiMapPin /> {property.location}</p>
              </div>
              <span className="property-type-badge">{typeLabel}</span>
            </div>
            {!!amenities.length && (
              <div className="property-tags">
                {amenities.slice(0, 4).map((amenity) => (
                  <span key={amenity}>{amenity}</span>
                ))}
                {amenities.length > 4 && <span>+{amenities.length - 4}</span>}
              </div>
            )}
            <div className="property-footer-row">
              <div className="property-specs">
                <span><FiHome /> {bedrooms}</span>
                <span><FiSun /> {bathrooms}</span>
              </div>
              <strong className="property-price">Rs. {Number(property.rent || 0).toLocaleString()}/mo</strong>
            </div>
            <div className="property-actions">
              <Link className="property-primary-action" to={`/tenant/properties/${property._id}`}>
                View Details
              </Link>
              <Link className="property-secondary-action" to={`/tenant/properties/${property._id}`}>
                <FiCalendar />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="property-topline">
              <span className={`status-pill ${property.status}`}>{property.status}</span>
              <strong className="price-tag">Rs. {property.rent}</strong>
            </div>
            <h3>{property.title}</h3>
            <p className="icon-line"><FiMapPin /> {property.location}</p>
            <div className="property-meta">
              <span><FiHome /> {bedrooms} bed</span>
              <span><FiSun /> {bathrooms} bath</span>
              <span><FiStar /> {property.type || 'apartment'}</span>
            </div>
            <p className="muted-line">{property.description}</p>
            <div className="card-actions">
              {role !== 'admin' && (
                <Link to={role === 'landlord' ? `/landlord/properties/${property._id}/edit` : `/tenant/properties/${property._id}`}>
                  {role === 'landlord' ? 'Edit Property' : 'View Details'}
                </Link>
              )}
              {(role === 'landlord' || role === 'admin') && (
                <button type="button" className="ghost-button" onClick={() => onDelete(property._id)}>
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  )
}

export default PropertyCard
