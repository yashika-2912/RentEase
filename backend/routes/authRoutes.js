import express from 'express'
import { getMe, loginUser, loginValidation, registerUser, registerValidation } from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'

const router = express.Router()

router.post('/register', registerValidation, validateRequest, registerUser)
router.post('/login', loginValidation, validateRequest, loginUser)
router.get('/me', protect, getMe)

export default router
