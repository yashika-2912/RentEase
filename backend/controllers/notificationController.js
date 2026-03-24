import { param } from 'express-validator'
import Notification from '../models/Notification.js'

export const notificationIdValidation = [param('id').isMongoId().withMessage('Invalid notification id')]

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 })
  res.json(notifications)
}

export const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification || notification.userId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Notification not found' })
  }

  notification.isRead = true
  await notification.save()
  res.json(notification)
}

export const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } })
  res.json({ message: 'All notifications marked as read' })
}
