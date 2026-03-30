import { param } from 'express-validator'
import LeaseDocument from '../models/LeaseDocument.js'
import Notification from '../models/Notification.js'
import Property from '../models/Property.js'
import RentPayment from '../models/RentPayment.js'
import User from '../models/User.js'
import Message from '../models/Message.js'

export const tenantIdValidation = [param('id').isMongoId().withMessage('Invalid tenant id')]

export const getLandlordTenants = async (req, res) => {
  const properties = await Property.find({
    landlordId: req.user._id,
    assignedTenant: { $ne: null },
  }).populate('assignedTenant', 'name email')

  const propertyIds = properties.map((property) => property._id)
  const rentPayments = await RentPayment.find({ propertyId: { $in: propertyIds } }).sort({ dueDate: -1 })

  const latestRentMap = new Map()
  for (const entry of rentPayments) {
    const key = entry.tenantId.toString()
    if (!latestRentMap.has(key)) {
      latestRentMap.set(key, entry)
    }
  }

  const tenants = properties.map((property) => ({
    propertyId: property._id,
    propertyTitle: property.title,
    propertyLocation: property.location,
    tenant: property.assignedTenant,
    latestRent: latestRentMap.get(property.assignedTenant._id.toString()) || null,
  }))

  res.json(tenants)
}

export const getTenantById = async (req, res) => {
  const property = await Property.findOne({
    landlordId: req.user._id,
    assignedTenant: req.params.id,
  }).populate('assignedTenant', 'name email role')

  if (!property) {
    return res.status(404).json({ message: 'Tenant not found under this landlord' })
  }

  const tenant = await User.findById(req.params.id).select('-password')
  const rentHistory = await RentPayment.find({
    landlordId: req.user._id,
    tenantId: req.params.id,
  }).sort({ dueDate: -1 })

  res.json({
    tenant,
    property,
    rentHistory,
  })
}

export const removeTenant = async (req, res) => {
  const property = await Property.findOne({
    landlordId: req.user._id,
    assignedTenant: req.params.id,
  })

  if (!property) {
    return res.status(404).json({ message: 'Tenant not assigned to your property' })
  }

  property.status = 'vacant'
  property.assignedTenant = null
  await property.save()

  await LeaseDocument.deleteMany({
    landlordId: req.user._id,
    tenantId: req.params.id,
    propertyId: property._id,
  })
  await Message.deleteMany({ propertyId: property._id })

  await Notification.create({
    userId: req.params.id,
    message: `You have been removed from ${property.title}.`,
    type: 'general',
  })

  res.json({ message: 'Tenant removed successfully' })
}
