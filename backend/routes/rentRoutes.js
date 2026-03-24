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

const router = express.Router()

router.post('/', protect, isLandlord, rentValidation, validateRequest, createRentEntry)
router.get('/tenant/mine', protect, isTenant, getMyRent)
router.get('/landlord/all', protect, isLandlord, getLandlordRent)
router.put('/:id/pay', protect, isTenant, rentIdValidation, validateRequest, payRent)
router.put('/:id/verify', protect, isLandlord, rentIdValidation, validateRequest, verifyRentPayment)

export default router
