import { body, param, query } from 'express-validator'
import Application from '../models/Application.js'
import LeaseDocument from '../models/LeaseDocument.js'
import MaintenanceRequest from '../models/MaintenanceRequest.js'
import Message from '../models/Message.js'
import Notification from '../models/Notification.js'
import Property from '../models/Property.js'
import RentPayment from '../models/RentPayment.js'
import User from '../models/User.js'

export const adminUserFiltersValidation = [
  query('role').optional().isIn(['tenant', 'landlord', 'admin']).withMessage('Invalid role filter'),
  query('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
]

export const adminUserIdValidation = [param('id').isMongoId().withMessage('Invalid user id')]
export const adminPropertyIdValidation = [param('id').isMongoId().withMessage('Invalid property id')]
export const broadcastValidation = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('role').optional().isIn(['tenant', 'landlord', 'admin']).withMessage('Invalid target role'),
]

export const getUsers = async (req, res) => {
  const filters = {}
  if (req.query.role) filters.role = req.query.role
  if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true'

  const users = await User.find(filters).select('-password').sort({ createdAt: -1 })
  res.json(users)
}

export const getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const [properties, applications, rents, maintenance] = await Promise.all([
    Property.find({ $or: [{ landlordId: user._id }, { assignedTenant: user._id }] }).limit(10),
    Application.find({ tenantId: user._id }).populate('propertyId', 'title'),
    RentPayment.find({ $or: [{ tenantId: user._id }, { landlordId: user._id }] }).limit(10),
    MaintenanceRequest.find({ $or: [{ tenantId: user._id }, { landlordId: user._id }] }).limit(10),
  ])

  res.json({ user, activity: { properties, applications, rents, maintenance } })
}

export const toggleSuspendUser = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'Admin cannot suspend self' })
  }

  user.isActive = !user.isActive
  await user.save()
  res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`, user })
}

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  await Promise.all([
    Property.deleteMany({ landlordId: user._id }),
    Application.deleteMany({ tenantId: user._id }),
    RentPayment.deleteMany({ $or: [{ tenantId: user._id }, { landlordId: user._id }] }),
    Notification.deleteMany({ userId: user._id }),
    MaintenanceRequest.deleteMany({ $or: [{ tenantId: user._id }, { landlordId: user._id }] }),
    Message.deleteMany({ senderId: user._id }),
    LeaseDocument.deleteMany({ $or: [{ tenantId: user._id }, { landlordId: user._id }] }),
  ])

  await user.deleteOne()
  res.json({ message: 'User deleted permanently' })
}

export const getAllProperties = async (_req, res) => {
  const properties = await Property.find().populate('landlordId', 'name email').populate('assignedTenant', 'name email')
  res.json(properties)
}

export const forceDeleteProperty = async (req, res) => {
  const property = await Property.findById(req.params.id)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  await Promise.all([
    Application.deleteMany({ propertyId: property._id }),
    RentPayment.deleteMany({ propertyId: property._id }),
    LeaseDocument.deleteMany({ propertyId: property._id }),
    MaintenanceRequest.deleteMany({ propertyId: property._id }),
    Message.deleteMany({ propertyId: property._id }),
  ])

  await property.deleteOne()
  res.json({ message: 'Property deleted successfully' })
}

export const getAllApplications = async (_req, res) => {
  const applications = await Application.find()
    .populate('tenantId', 'name email')
    .populate('propertyId', 'title location')
    .sort({ appliedAt: -1 })

  res.json(applications)
}

export const getAllRent = async (_req, res) => {
  const rents = await RentPayment.find()
    .populate('tenantId', 'name email')
    .populate('propertyId', 'title location')
    .populate('landlordId', 'name email')
    .sort({ dueDate: -1 })

  res.json(rents)
}

export const getAdminStats = async (_req, res) => {
  const [users, properties, applications, rents] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Application.countDocuments(),
    RentPayment.find(),
  ])

  const totalRentVolume = rents.reduce((sum, item) => sum + item.amount, 0)
  const collectedRent = rents.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0)

  res.json({
    users,
    properties,
    applications,
    totalRentVolume,
    collectedRent,
    overdueRentCount: rents.filter((item) => item.status === 'overdue').length,
  })
}

export const broadcastNotification = async (req, res) => {
  const filters = req.body.role ? { role: req.body.role } : {}
  const users = await User.find(filters).select('_id')

  await Notification.insertMany(
    users.map((user) => ({
      userId: user._id,
      message: req.body.message,
      type: 'general',
    }))
  )

  res.json({ message: `Broadcast sent to ${users.length} users` })
}
