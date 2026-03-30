import express from 'express'
import { getPropertyMessages, messageValidation, propertyMessageValidation, sendMessage } from '../controllers/messageController.js'
import protect from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.get('/:propertyId', protect, propertyMessageValidation, validateRequest, asyncHandler(getPropertyMessages))
router.post('/', protect, messageValidation, validateRequest, asyncHandler(sendMessage))

export default router
