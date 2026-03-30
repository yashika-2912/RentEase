import { body, param } from 'express-validator'
import Notification from '../models/Notification.js'
import Property from '../models/Property.js'
import RentPayment from '../models/RentPayment.js'
import User from '../models/User.js'
import { sendEmail } from '../utils/emailService.js'
import { generateReceipt } from '../utils/receiptGenerator.js'

export const rentValidation = [
  body('propertyId').isMongoId().withMessage('Valid property is required'),
  body('tenantId').isMongoId().withMessage('Valid tenant is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('month').trim().notEmpty().withMessage('Month is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
]

export const rentIdValidation = [param('id').isMongoId().withMessage('Invalid rent id')]

export const createRentEntry = async (req, res) => {
  const property = await Property.findById(req.body.propertyId)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (property.landlordId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to manage rent for this property' })
  }

  if (property.assignedTenant?.toString() !== req.body.tenantId) {
    return res.status(400).json({ message: 'Selected tenant is not assigned to this property' })
  }

  const existing = await RentPayment.findOne({
    propertyId: req.body.propertyId,
    tenantId: req.body.tenantId,
    month: req.body.month,
  })

  if (existing) {
    return res.status(400).json({ message: 'Rent entry for this month already exists' })
  }

  const rentPayment = await RentPayment.create({
    propertyId: req.body.propertyId,
    tenantId: req.body.tenantId,
    amount: Number(req.body.amount),
    month: req.body.month,
    dueDate: req.body.dueDate,
    landlordId: req.user._id,
  })

  await Notification.create({
    userId: req.body.tenantId,
    message: `A new rent payment for ${req.body.month} is now due.`,
    type: 'rent',
  })

  const tenant = await User.findById(req.body.tenantId)
  await sendEmail({
    to: tenant?.email,
    subject: 'Rent Due Notice',
    text: `A new rent payment for ${req.body.month} is now due.`,
  })

  res.status(201).json(rentPayment)
}

export const getMyRent = async (req, res) => {
  const rentRecords = await RentPayment.find({ tenantId: req.user._id })
    .populate('propertyId', 'title location')
    .sort({ dueDate: -1 })

  res.json(rentRecords)
}

export const getLandlordRent = async (req, res) => {
  const rentRecords = await RentPayment.find({ landlordId: req.user._id })
    .populate('tenantId', 'name email')
    .populate('propertyId', 'title location')
    .sort({ dueDate: -1 })

  res.json(rentRecords)
}

export const payRent = async (req, res) => {
  const rentPayment = await RentPayment.findById(req.params.id)
  if (!rentPayment) {
    return res.status(404).json({ message: 'Rent entry not found' })
  }

  if (rentPayment.tenantId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to pay this rent' })
  }

  rentPayment.status = 'paid'
  rentPayment.paidAt = new Date()
  await rentPayment.save()

  await Notification.create({
    userId: rentPayment.landlordId,
    message: `Tenant marked rent for ${rentPayment.month} as paid.`,
    type: 'rent',
  })

  res.json({ message: 'Rent marked as paid', rentPayment })
}

export const verifyRentPayment = async (req, res) => {
  const rentPayment = await RentPayment.findById(req.params.id)
  if (!rentPayment) {
    return res.status(404).json({ message: 'Rent entry not found' })
  }

  if (rentPayment.landlordId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to verify this rent' })
  }

  rentPayment.verifiedAt = new Date()
  const [tenant, property] = await Promise.all([
    User.findById(rentPayment.tenantId),
    Property.findById(rentPayment.propertyId),
  ])
  rentPayment.receiptUrl = await generateReceipt({
    rentPayment,
    tenantName: tenant?.name || 'Tenant',
    propertyTitle: property?.title || 'Property',
  })
  await rentPayment.save()

  await Notification.create({
    userId: rentPayment.tenantId,
    message: `Your rent payment for ${rentPayment.month} was verified.`,
    type: 'rent',
  })

  await sendEmail({
    to: tenant?.email,
    subject: 'Rent Payment Verified',
    text: `Your rent payment for ${rentPayment.month} was verified. Receipt generated successfully.`,
  })

  res.json({ message: 'Rent payment verified', rentPayment })
}
