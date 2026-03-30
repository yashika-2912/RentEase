import express from 'express'
import { fileURLToPath } from 'url'
import multer from 'multer'
import path from 'path'
import {
  createProperty,
  deleteProperty,
  getLandlordProperties,
  getProperties,
  getPropertyById,
  propertyIdValidation,
  propertyValidation,
  updateProperty,
} from '../controllers/propertyController.js'
import protect from '../middleware/authMiddleware.js'
import { isLandlord } from '../middleware/roleMiddleware.js'
import validateRequest from '../middleware/validateRequest.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'properties')),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const isValid = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)
    cb(isValid ? null : new Error('Only jpg, jpeg, and png files are allowed'), isValid)
  },
})

router.get('/landlord/mine', protect, isLandlord, asyncHandler(getLandlordProperties))
router.get('/', asyncHandler(getProperties))
router.get('/:id', propertyIdValidation, validateRequest, asyncHandler(getPropertyById))
router.post('/', protect, isLandlord, upload.array('images', 5), propertyValidation, validateRequest, asyncHandler(createProperty))
router.put('/:id', protect, isLandlord, upload.array('images', 5), [...propertyIdValidation, ...propertyValidation], validateRequest, asyncHandler(updateProperty))
router.delete('/:id', protect, isLandlord, propertyIdValidation, validateRequest, asyncHandler(deleteProperty))

export default router
