import { body, param } from 'express-validator'
import MaintenanceRequest from '../models/MaintenanceRequest.js'
import Notification from '../models/Notification.js'
import Property from '../models/Property.js'

export const maintenanceValidation = [
  body('propertyId').isMongoId().withMessage('Valid property is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
]

export const maintenanceStatusValidation = [
  param('id').isMongoId().withMessage('Invalid request id'),
  body('status').isIn(['open', 'in-progress', 'resolved']).withMessage('Invalid maintenance status'),
]

export const createMaintenanceRequest = async (req, res) => {
  const property = await Property.findById(req.body.propertyId)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (property.assignedTenant?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only create requests for your assigned property' })
  }

  const request = await MaintenanceRequest.create({
    propertyId: property._id,
    tenantId: req.user._id,
    landlordId: property.landlordId,
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority,
  })

  await Notification.create({
    userId: property.landlordId,
    message: `New maintenance request submitted for ${property.title}.`,
    type: 'general',
  })

  res.status(201).json(request)
}

export const getTenantMaintenance = async (req, res) => {
  const requests = await MaintenanceRequest.find({ tenantId: req.user._id }).populate('propertyId', 'title location').sort({ createdAt: -1 })
  res.json(requests)
}

export const getLandlordMaintenance = async (req, res) => {
  const requests = await MaintenanceRequest.find({ landlordId: req.user._id })
    .populate('propertyId', 'title location')
    .populate('tenantId', 'name email')
    .sort({ createdAt: -1 })

  res.json(requests)
}

export const updateMaintenanceStatus = async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id)
  if (!request) {
    return res.status(404).json({ message: 'Maintenance request not found' })
  }

  if (request.landlordId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to update this maintenance request' })
  }

  request.status = req.body.status
  await request.save()

  await Notification.create({
    userId: request.tenantId,
    message: `Maintenance request "${request.title}" is now ${request.status}.`,
    type: 'general',
  })

  res.json(request)
}
