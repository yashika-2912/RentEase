import express from 'express'
import { getMe, loginUser, loginValidation, profileValidation, registerUser, registerValidation, updateProfile } from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.post('/register', registerValidation, validateRequest, asyncHandler(registerUser))
router.post('/login', loginValidation, validateRequest, asyncHandler(loginUser))
router.get('/me', protect, asyncHandler(getMe))
router.put('/profile', protect, profileValidation, validateRequest, asyncHandler(updateProfile))

export default router
