import { body, param } from 'express-validator'
import Application from '../models/Application.js'
import Notification from '../models/Notification.js'
import Property from '../models/Property.js'
import User from '../models/User.js'
import { sendEmail } from '../utils/emailService.js'

export const applicationValidation = [
  body('propertyId').isMongoId().withMessage('Valid property is required'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('occupation').trim().notEmpty().withMessage('Occupation is required'),
  body('monthlyIncome').isFloat({ gt: 0 }).withMessage('Monthly income must be positive'),
  body('message').optional().isString(),
]

export const applicationIdValidation = [param('id').isMongoId().withMessage('Invalid application id')]

export const submitApplication = async (req, res) => {
  const { propertyId } = req.body
  const property = await Property.findById(propertyId)

  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (property.status !== 'vacant') {
    return res.status(400).json({ message: 'Cannot apply to an occupied property' })
  }

  const existingApplication = await Application.findOne({
    tenantId: req.user._id,
    propertyId,
  })

  if (existingApplication) {
    return res.status(400).json({ message: 'Already applied' })
  }

  const activeProperty = await Property.findOne({ assignedTenant: req.user._id })
  if (activeProperty) {
    return res.status(400).json({ message: 'Tenant already has an active property' })
  }

  const application = await Application.create({
    propertyId,
    tenantId: req.user._id,
    fullName: req.body.fullName,
    phone: req.body.phone,
    occupation: req.body.occupation,
    monthlyIncome: Number(req.body.monthlyIncome),
    message: req.body.message || '',
  })

  await Notification.create({
    userId: property.landlordId,
    message: `New application received for ${property.title}.`,
    type: 'application',
  })

  res.status(201).json(application)
}

export const getMyApplications = async (req, res) => {
  const applications = await Application.find({ tenantId: req.user._id })
    .populate('propertyId')
    .sort({ appliedAt: -1 })

  res.json(applications)
}

export const getPropertyApplications = async (req, res) => {
  const property = await Property.findById(req.params.propertyId)
  if (!property) {
    return res.status(404).json({ message: 'Property not found' })
  }

  if (property.landlordId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to view these applications' })
  }

  const applications = await Application.find({ propertyId: req.params.propertyId })
    .populate('tenantId', 'name email')
    .sort({ appliedAt: -1 })

  res.json(applications)
}

export const getLandlordApplications = async (req, res) => {
  const properties = await Property.find({ landlordId: req.user._id }).select('_id')
  const propertyIds = properties.map((property) => property._id)

  const applications = await Application.find({ propertyId: { $in: propertyIds } })
    .populate('tenantId', 'name email')
    .populate('propertyId', 'title location')
    .sort({ appliedAt: -1 })

  res.json(applications)
}

export const approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    const property = await Property.findById(application.propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    if (property.landlordId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to approve this application' })
    }

    if (property.assignedTenant && property.assignedTenant.toString() !== application.tenantId.toString()) {
      return res.status(400).json({ message: 'Property already has an assigned tenant' })
    }

    application.status = 'approved'
    await application.save()

    property.status = 'occupied'
    property.assignedTenant = application.tenantId
    await property.save()

    await Application.updateMany(
      {
        propertyId: property._id,
        _id: { $ne: application._id },
        status: 'pending',
      },
      { $set: { status: 'rejected' } }
    )

    const rejectedApplications = await Application.find({
      propertyId: property._id,
      _id: { $ne: application._id },
      status: 'rejected',
    })

    await Notification.insertMany([
      {
        userId: application.tenantId,
        message: `Your application for ${property.title} was approved.`,
        type: 'application',
      },
      ...rejectedApplications.map((item) => ({
        userId: item.tenantId,
        message: `Your application for ${property.title} was rejected.`,
        type: 'application',
      })),
    ])

    const participants = await User.find({ _id: { $in: [application.tenantId, ...rejectedApplications.map((item) => item.tenantId)] } })
    const approvedTenant = participants.find((item) => item._id.toString() === application.tenantId.toString())
    await sendEmail({
      to: approvedTenant?.email,
      subject: 'Application Approved',
      text: `Your application for ${property.title} was approved.`,
    })

    await Promise.all(
      rejectedApplications.map((item) => {
        const tenant = participants.find((candidate) => candidate._id.toString() === item.tenantId.toString())
        return sendEmail({
          to: tenant?.email,
          subject: 'Application Rejected',
          text: `Your application for ${property.title} was rejected.`,
        })
      })
    )

    res.json({ message: 'Application approved successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve application', error: error.message })
  }
}

export const rejectApplication = async (req, res) => {
  const application = await Application.findById(req.params.id)
  if (!application) {
    return res.status(404).json({ message: 'Application not found' })
  }

  const property = await Property.findById(application.propertyId)
  if (!property || property.landlordId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not allowed to reject this application' })
  }

  application.status = 'rejected'
  await application.save()

  await Notification.create({
    userId: application.tenantId,
    message: `Your application for ${property.title} was rejected.`,
    type: 'application',
  })

  const tenant = await User.findById(application.tenantId)
  await sendEmail({
    to: tenant?.email,
    subject: 'Application Rejected',
    text: `Your application for ${property.title} was rejected.`,
  })

  res.json({ message: 'Application rejected successfully' })
}
