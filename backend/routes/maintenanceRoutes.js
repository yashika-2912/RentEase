import express from 'express'
import {
  createMaintenanceRequest,
  getLandlordMaintenance,
  getTenantMaintenance,
  maintenanceStatusValidation,
  maintenanceValidation,
  updateMaintenanceStatus,
} from '../controllers/maintenanceController.js'
import protect from '../middleware/authMiddleware.js'
import { isLandlord, isTenant } from '../middleware/roleMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.post('/', protect, isTenant, maintenanceValidation, validateRequest, asyncHandler(createMaintenanceRequest))
router.get('/tenant/mine', protect, isTenant, asyncHandler(getTenantMaintenance))
router.get('/landlord/all', protect, isLandlord, asyncHandler(getLandlordMaintenance))
router.put('/:id/status', protect, isLandlord, maintenanceStatusValidation, validateRequest, asyncHandler(updateMaintenanceStatus))

export default router
