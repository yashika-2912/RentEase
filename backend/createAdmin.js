import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/User.js'

dotenv.config()

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' })
    if (existingAdmin) {
      console.log('Admin already exists with email admin@gmail.com')
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    })

    console.log(`Admin created successfully: ${admin.email}`)
    process.exit(0)
  } catch (error) {
    console.error(`Failed to create admin: ${error.message}`)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin()
