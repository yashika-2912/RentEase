import express from 'express'
import { param } from 'express-validator'
import {
  applicationIdValidation,
  applicationValidation,
  approveApplication,
  getLandlordApplications,
  getMyApplications,
  getPropertyApplications,
  rejectApplication,
  submitApplication,
} from '../controllers/applicationController.js'
import protect from '../middleware/authMiddleware.js'
import { isLandlord, isTenant } from '../middleware/roleMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'

const router = express.Router()

router.post('/', protect, isTenant, applicationValidation, validateRequest, submitApplication)
router.get('/my', protect, isTenant, getMyApplications)
router.get('/landlord/all', protect, isLandlord, getLandlordApplications)
router.get('/property/:propertyId', protect, isLandlord, [param('propertyId').isMongoId().withMessage('Invalid property id')], validateRequest, getPropertyApplications)
router.put('/:id/approve', protect, isLandlord, applicationIdValidation, validateRequest, approveApplication)
router.put('/:id/reject', protect, isLandlord, applicationIdValidation, validateRequest, rejectApplication)

export default router
