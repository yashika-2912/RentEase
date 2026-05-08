import { useEffect, useState } from 'react';
import { Bath, Bed, Eye, Pencil, Plus, Search, X, Upload } from 'lucide-react';
import api from '../../api/axios.js';

export default function LandlordProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [editingPropertyId, setEditingPropertyId] = useState(null);

  const defaultFormData = {
    title: '',
    description: '',
    type: 'apartment',
    rent: '',
    deposit: '',
    availableFrom: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    amenities: [],
    furnished: false,
    images: []
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setActionMessage(`Viewing ${property.title}`);
  };

  const handleEditProperty = (property) => {
    setActionMessage(`Editing ${property.title}`);
    setEditingPropertyId(property._id);
    setShowAddModal(true);
    setFormData({
      title: property.title || '',
      description: property.description || '',
      type: property.type || 'apartment',
      rent: property.rent || '',
      deposit: property.deposit || '',
      availableFrom: property.availableFrom || '',
      street: property.address?.street || '',
      city: property.address?.city || '',
      state: property.address?.state || '',
      pincode: property.address?.pincode || '',
      bedrooms: property.bedrooms || 1,
      bathrooms: property.bathrooms || 1,
      area: property.area || '',
      amenities: property.amenities || [],
      furnished: property.furnished || false,
      images: property.images || []
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setEditingPropertyId(null);
    setFormData(defaultFormData);
    setImageFiles([]);
    setDragOver(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await api.get('/properties/landlord/mine');
      setProperties(data);
    } catch (error) {
      console.error('Failed to load properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPropertyId) {
        const payload = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          rent: Number(formData.rent),
          deposit: Number(formData.deposit || 0),
          availableFrom: formData.availableFrom || null,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          area: Number(formData.area || 0),
          amenities: formData.amenities,
          furnished: formData.furnished,
        };

        const { data: updatedProperty } = await api.put(`/properties/${editingPropertyId}`, payload);
        setProperties((prev) =>
          prev.map((property) => (property._id === editingPropertyId ? updatedProperty : property))
        );
        setActionMessage('Property updated successfully.');
      } else {
        const formDataToSend = new FormData();

        Object.keys(formData).forEach(key => {
          if (key === 'amenities') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else if (key === 'images') {
            // Skip images array, we'll handle files separately
          } else {
            formDataToSend.append(key, formData[key]);
          }
        });

        const address = {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          coordinates: { lat: 19.076, lng: 72.8777 }
        };
        formDataToSend.append('address', JSON.stringify(address));

        imageFiles.forEach((file) => {
          formDataToSend.append('images', file);
        });

        await api.post('/properties', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setActionMessage('Property created successfully.');
        fetchProperties();
      }

      closeAddModal();
    } catch (error) {
      console.error('Failed to save property', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const term = searchTerm.trim().toLowerCase();
    const title = String(property.title || '').toLowerCase();
    const city = String(property.address?.city || '').toLowerCase();
    const street = String(property.address?.street || '').toLowerCase();
    const matchesSearch =
      !term || title.includes(term) || city.includes(term) || street.includes(term);

    const matchesStatus = statusFilter === 'All status' ||
      (statusFilter === 'Available' && property.isAvailable) ||
      (statusFilter === 'Occupied' && !property.isAvailable) ||
      (statusFilter === 'Pending approval' && !property.isApproved);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-8">Loading properties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My properties</h1>
          <p className="text-sm text-slate-600">{properties.length} properties · {properties.filter(p => !p.isAvailable).length} occupied</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add property
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
            placeholder="Search title, area, city…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All status</option>
          <option>Available</option>
          <option>Occupied</option>
          <option>Pending approval</option>
        </select>
      </div>

      {actionMessage && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700 shadow-sm">
          {actionMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.map((property) => (
          <article key={property._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <span className="text-sm">No image</span>
                </div>
              )}
              <div className="absolute left-3 top-3 flex gap-2">
                <span
                  className={[
                    'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white',
                    property.isAvailable ? 'bg-emerald-600' : 'bg-brand-600',
                  ].join(' ')}
                >
                  {property.isAvailable ? 'Available' : 'Occupied'}
                </span>
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-800 ring-1 ring-slate-200">
                  {property.type}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-900">{property.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {property.address?.city}, {property.address?.state}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 ring-1 ring-slate-100">
                  <Bed className="h-3.5 w-3.5" />
                  {property.bedrooms} bed
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 ring-1 ring-slate-100">
                  <Bath className="h-3.5 w-3.5" />
                  {property.bathrooms} bath
                </span>
                <span className="rounded-full bg-slate-50 px-2 py-0.5 ring-1 ring-slate-100">{property.area} sqft</span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Monthly rent</p>
                  <p className="text-lg font-bold text-brand-700">₹{property.rent.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2 text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleViewProperty(property)}
                    className="rounded-full border border-slate-200 bg-white p-2 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditProperty(property)}
                    className="rounded-full border border-slate-200 bg-white p-2 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedProperty.title}</h2>
                <p className="text-sm text-slate-500">{selectedProperty.address?.city}, {selectedProperty.address?.state}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">Description</p>
                <p className="mt-2 text-sm text-slate-600">{selectedProperty.description}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Details</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  <li>Type: {selectedProperty.type}</li>
                  <li>Rent: ₹{selectedProperty.rent.toLocaleString('en-IN')}</li>
                  <li>Deposit: ₹{selectedProperty.deposit}</li>
                  <li>Area: {selectedProperty.area} sqft</li>
                  <li>Bedrooms: {selectedProperty.bedrooms}</li>
                  <li>Bathrooms: {selectedProperty.bathrooms}</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedProperty.amenities?.map((amenity) => (
                <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Add New Property</h2>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="studio">Studio</option>
                    <option value="villa">Villa</option>
                    <option value="pg">PG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Area (sqft)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Available From</label>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Amenities</label>
                <div className="grid gap-2 md:grid-cols-3">
                  {['Parking', 'Gym', 'WiFi', 'AC', 'Security', 'Power Backup', 'Pet-Friendly', 'Balcony', 'Garden'].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-slate-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="furnished"
                    checked={formData.furnished}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Furnished</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Images</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <div className="text-sm text-slate-600">
                      <label className="cursor-pointer text-brand-600 hover:text-brand-700">
                        <span>Upload images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <span> or drag and drop</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                  {imageFiles.length > 0 && (
                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? (editingPropertyId ? 'Updating...' : 'Creating...') : (editingPropertyId ? 'Update Property' : 'Create Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
