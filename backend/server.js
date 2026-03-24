import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import connectDB from './config/db.js'
import applicationRoutes from './routes/applicationRoutes.js'
import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import rentRoutes from './routes/rentRoutes.js'
import tenantRoutes from './routes/tenantRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/rent', rentRoutes)
app.use('/api/tenants', tenantRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/notifications', notificationRoutes)

app.use((err, _req, res, _next) => {
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
