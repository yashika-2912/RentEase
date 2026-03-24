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
