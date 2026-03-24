import { body, param } from 'express-validator'
import Application from '../models/Application.js'
import Property from '../models/Property.js'

export const propertyValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('rent').isFloat({ gt: 0 }).withMessage('Rent must be a positive number'),
]

export const propertyIdValidation = [param('id').isMongoId().withMessage('Invalid property id')]

export const getProperties = async (_req, res) => {
  const properties = await Property.find({ status: 'vacant' }).populate('landlordId', 'name email')
  res.json(properties)
}

export const getPropertyById = async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('landlordId', 'name email')
    .populate('assignedTenant', 'name email')

  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  res.json(property)
}

export const createProperty = async (req, res) => {
  const imagePaths = (req.files || []).map((file) => `/uploads/properties/${file.filename}`)
  const property = await Property.create({
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    rent: Number(req.body.rent),
    images: imagePaths,
    landlordId: req.user._id,
  })

  res.status(201).json(property)
}

export const updateProperty = async (req, res) => {
  const property = await Property.findById(req.params.id)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (property.landlordId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to update this property' })
  }

  const newImages = (req.files || []).map((file) => `/uploads/properties/${file.filename}`)
  const updatePayload = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    rent: Number(req.body.rent),
  }

  if (newImages.length) {
    updatePayload.images = newImages
  }

  const updated = await Property.findByIdAndUpdate(req.params.id, updatePayload, { new: true })
  res.json(updated)
}

export const deleteProperty = async (req, res) => {
  const property = await Property.findById(req.params.id)

  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (property.landlordId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to delete this property' })
  }

  if (property.assignedTenant) {
    return res.status(400).json({ message: 'Cannot delete occupied property' })
  }

  await Application.deleteMany({ propertyId: property._id })
  await property.deleteOne()
  res.json({ message: 'Property deleted successfully' })
}

export const getLandlordProperties = async (req, res) => {
  const properties = await Property.find({ landlordId: req.user._id }).populate('assignedTenant', 'name email')
  res.json(properties)
}
