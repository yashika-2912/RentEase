import express from 'express'
import { getNotifications, markAllAsRead, markAsRead, notificationIdValidation } from '../controllers/notificationController.js'
import protect from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.get('/', protect, asyncHandler(getNotifications))
router.put('/read-all', protect, asyncHandler(markAllAsRead))
router.put('/:id/read', protect, notificationIdValidation, validateRequest, asyncHandler(markAsRead))

export default router
