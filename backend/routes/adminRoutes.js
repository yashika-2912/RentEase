import express from 'express'
import {
  adminPropertyIdValidation,
  adminUserFiltersValidation,
  adminUserIdValidation,
  broadcastNotification,
  broadcastValidation,
  deleteUser,
  forceDeleteProperty,
  getAdminStats,
  getAllApplications,
  getAllProperties,
  getAllRent,
  getUserDetail,
  getUsers,
  toggleSuspendUser,
} from '../controllers/adminController.js'
import protect from '../middleware/authMiddleware.js'
import { isAdmin } from '../middleware/roleMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.use(protect, isAdmin)

router.get('/users', adminUserFiltersValidation, validateRequest, asyncHandler(getUsers))
router.get('/users/:id', adminUserIdValidation, validateRequest, asyncHandler(getUserDetail))
router.put('/users/:id/suspend', adminUserIdValidation, validateRequest, asyncHandler(toggleSuspendUser))
router.delete('/users/:id', adminUserIdValidation, validateRequest, asyncHandler(deleteUser))
router.get('/properties', asyncHandler(getAllProperties))
router.delete('/properties/:id', adminPropertyIdValidation, validateRequest, asyncHandler(forceDeleteProperty))
router.get('/applications', asyncHandler(getAllApplications))
router.get('/rent', asyncHandler(getAllRent))
router.get('/stats', asyncHandler(getAdminStats))
router.post('/notify', broadcastValidation, validateRequest, asyncHandler(broadcastNotification))

export default router
