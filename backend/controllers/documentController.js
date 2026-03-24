import { param } from 'express-validator'
import LeaseDocument from '../models/LeaseDocument.js'
import Property from '../models/Property.js'

export const propertyParamValidation = [param('propertyId').isMongoId().withMessage('Invalid property id')]

export const uploadLease = async (req, res) => {
  const { propertyId, tenantId } = req.body

  if (!req.file) {
    return res.status(400).json({ message: 'Lease PDF is required' })
  }

  const property = await Property.findById(propertyId)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (property.landlordId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to upload for this property' })
  }

  if (property.assignedTenant?.toString() !== tenantId) {
    return res.status(400).json({ message: 'Tenant is not assigned to this property' })
  }

  const existing = await LeaseDocument.findOne({ propertyId })
  if (existing) {
    existing.fileUrl = `/uploads/leases/${req.file.filename}`
    existing.tenantId = tenantId
    existing.landlordId = req.user._id
    existing.uploadedAt = new Date()
    await existing.save()
    return res.json(existing)
  }

  const document = await LeaseDocument.create({
    propertyId,
    tenantId,
    landlordId: req.user._id,
    fileUrl: `/uploads/leases/${req.file.filename}`,
  })

  res.status(201).json(document)
}

export const getMyLease = async (req, res) => {
  const documents = await LeaseDocument.find({ tenantId: req.user._id }).populate('propertyId', 'title location')
  res.json(documents)
}

export const getLeaseByProperty = async (req, res) => {
  const property = await Property.findById(req.params.propertyId)
  if (!property || property.landlordId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Property not found' })
  }

  const document = await LeaseDocument.findOne({ propertyId: req.params.propertyId }).populate('tenantId', 'name email')
  if (!document) {
    return res.status(404).json({ message: 'Lease document not found' })
  }

  res.json(document)
}
