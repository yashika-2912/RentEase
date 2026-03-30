import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import adminRoutes from './routes/adminRoutes.js'
import connectDB from './config/db.js'
import applicationRoutes from './routes/applicationRoutes.js'
import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import maintenanceRoutes from './routes/maintenanceRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import rentRoutes from './routes/rentRoutes.js'
import tenantRoutes from './routes/tenantRoutes.js'
import startCronJobs from './utils/cronJobs.js'

dotenv.config()
connectDB()
startCronJobs()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isProduction = process.env.NODE_ENV === 'production'

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 200 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many API requests. Please try again in a few minutes.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait a moment and try again.' },
})

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)
app.use(morgan(isProduction ? 'combined' : 'dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api', apiLimiter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/rent', rentRoutes)
app.use('/api/tenants', tenantRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/messages', messageRoutes)

app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message })
  }

  if (err.message?.includes('Only')) {
    return res.status(400).json({ message: err.message })
  }

  console.error(err)
  return res.status(500).json({ message: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
