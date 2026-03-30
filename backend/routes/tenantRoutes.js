import express from 'express'
import {
  getLandlordTenants,
  getTenantById,
  removeTenant,
  tenantIdValidation,
} from '../controllers/tenantController.js'
import protect from '../middleware/authMiddleware.js'
import { isLandlord } from '../middleware/roleMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.get('/', protect, isLandlord, asyncHandler(getLandlordTenants))
router.get('/:id', protect, isLandlord, tenantIdValidation, validateRequest, asyncHandler(getTenantById))
router.delete('/:id/remove', protect, isLandlord, tenantIdValidation, validateRequest, asyncHandler(removeTenant))

export default router
