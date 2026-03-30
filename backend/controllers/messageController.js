import { body, param } from 'express-validator'
import Message from '../models/Message.js'
import Property from '../models/Property.js'

export const messageValidation = [
  body('propertyId').isMongoId().withMessage('Valid property is required'),
  body('text').trim().notEmpty().withMessage('Message text is required'),
]

export const propertyMessageValidation = [param('propertyId').isMongoId().withMessage('Invalid property id')]

const canAccessPropertyThread = (property, userId, role) => {
  if (role === 'admin') return true
  if (role === 'landlord') return property.landlordId.toString() === userId.toString()
  if (role === 'tenant') return property.assignedTenant?.toString() === userId.toString()
  return false
}

export const getPropertyMessages = async (req, res) => {
  const property = await Property.findById(req.params.propertyId)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (!canAccessPropertyThread(property, req.user._id, req.user.role)) {
    return res.status(403).json({ message: 'Not allowed to view this thread' })
  }

  const messages = await Message.find({ propertyId: property._id }).populate('senderId', 'name role').sort({ sentAt: 1 })
  res.json(messages)
}

export const sendMessage = async (req, res) => {
  const property = await Property.findById(req.body.propertyId)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (!canAccessPropertyThread(property, req.user._id, req.user.role)) {
    return res.status(403).json({ message: 'Not allowed to send messages in this thread' })
  }

  const message = await Message.create({
    propertyId: property._id,
    senderId: req.user._id,
    text: req.body.text,
  })

  const populated = await Message.findById(message._id).populate('senderId', 'name role')
  res.status(201).json(populated)
}
