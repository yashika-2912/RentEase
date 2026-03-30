import express from 'express'
import {
  createRentEntry,
  getLandlordRent,
  getMyRent,
  payRent,
  rentIdValidation,
  rentValidation,
  verifyRentPayment,
} from '../controllers/rentController.js'
import protect from '../middleware/authMiddleware.js'
import { isLandlord, isTenant } from '../middleware/roleMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.post('/', protect, isLandlord, rentValidation, validateRequest, asyncHandler(createRentEntry))
router.get('/tenant/mine', protect, isTenant, asyncHandler(getMyRent))
router.get('/landlord/all', protect, isLandlord, asyncHandler(getLandlordRent))
router.put('/:id/pay', protect, isTenant, rentIdValidation, validateRequest, asyncHandler(payRent))
router.put('/:id/verify', protect, isLandlord, rentIdValidation, validateRequest, asyncHandler(verifyRentPayment))

export default router
