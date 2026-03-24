import express from 'express'
import { getNotifications, markAllAsRead, markAsRead, notificationIdValidation } from '../controllers/notificationController.js'
import protect from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'

const router = express.Router()

router.get('/', protect, getNotifications)
router.put('/read-all', protect, markAllAsRead)
router.put('/:id/read', protect, notificationIdValidation, validateRequest, markAsRead)

export default router
