import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/User.js'

dotenv.config()

const DEMO_PASSWORD = 'demo123'

const demoUsers = [
  {
    name: 'Sarah Chen',
    email: 'tenant@rentease.demo',
    role: 'tenant',
    isActive: true,
  },
  {
    name: 'James Wilson',
    email: 'landlord@rentease.demo',
    role: 'landlord',
    isActive: true,
  },
  {
    name: 'Admin User',
    email: 'admin@rentease.demo',
    role: 'admin',
    isActive: true,
  },
]

const seedDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)

    for (const demoUser of demoUsers) {
      const existingUser = await User.findOne({ email: demoUser.email })

      if (existingUser) {
        existingUser.name = demoUser.name
        existingUser.role = demoUser.role
        existingUser.isActive = demoUser.isActive
        existingUser.password = hashedPassword
        await existingUser.save()
        console.log(`Updated demo ${demoUser.role}: ${demoUser.email}`)
        continue
      }

      await User.create({
        ...demoUser,
        password: hashedPassword,
      })

      console.log(`Created demo ${demoUser.role}: ${demoUser.email}`)
    }

    console.log('')
    console.log('Demo login credentials')
    console.log('Tenant   : tenant@rentease.demo / demo123')
    console.log('Landlord : landlord@rentease.demo / demo123')
    console.log('Admin    : admin@rentease.demo / demo123')
    process.exit(0)
  } catch (error) {
    console.error(`Failed to seed demo users: ${error.message}`)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seedDemoUsers()
