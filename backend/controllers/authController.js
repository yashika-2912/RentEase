import bcrypt from 'bcryptjs'
import { body } from 'express-validator'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['tenant', 'landlord']).withMessage('Role must be tenant or landlord'),
]

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

export const profileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('currentPassword').optional().notEmpty().withMessage('Current password is required'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
]

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  })

  return res.status(201).json({
    message: 'Registration successful',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Account is suspended. Contact admin.' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  return res.json({
    token: generateToken(user),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

export const getMe = async (req, res) => res.json(req.user)

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email, _id: { $ne: user._id } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }
    user.email = req.body.email
  }

  if (req.body.name) {
    user.name = req.body.name
  }

  if (req.body.newPassword) {
    if (!req.body.currentPassword) {
      return res.status(400).json({ message: 'Current password is required' })
    }

    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = await bcrypt.hash(req.body.newPassword, 10)
  }

  await user.save()

  res.json({
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  })
}
