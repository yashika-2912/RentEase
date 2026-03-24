import express from 'express'
import multer from 'multer'
import path from 'path'
import { body } from 'express-validator'
import { getLeaseByProperty, getMyLease, propertyParamValidation, uploadLease } from '../controllers/documentController.js'
import protect from '../middleware/authMiddleware.js'
import { isLandlord, isTenant } from '../middleware/roleMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), 'backend', 'uploads', 'leases')),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isValid = file.mimetype === 'application/pdf'
    cb(isValid ? null : new Error('Only PDF files are allowed'), isValid)
  },
})

router.post(
  '/upload',
  protect,
  isLandlord,
  upload.single('lease'),
  [
    body('propertyId').isMongoId().withMessage('Valid property is required'),
    body('tenantId').isMongoId().withMessage('Valid tenant is required'),
  ],
  validateRequest,
  uploadLease
)
router.get('/tenant/mine', protect, isTenant, getMyLease)
router.get('/:propertyId', protect, isLandlord, propertyParamValidation, validateRequest, getLeaseByProperty)

export default router
