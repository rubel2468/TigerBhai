/* eslint-disable no-console */
import 'dotenv/config'
import mongoose from 'mongoose'
import UserModel from '../models/User.model.js'

const run = async () => {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    console.error('MONGODB_URI is not set')
    process.exit(1)
  }

  await mongoose.connect(mongoUri, { dbName: 'tigerbhai' })

  const adminPayloads = [
    {
      role: 'admin',
      name: 'Admin',
      email: 'tigerbhai@gmail.com',
      password: 'TigerBhai@2025',
      phone: '0000000000',
      isEmailVerified: true
    },
    {
      role: 'admin',
      name: 'TigerBhai Office',
      email: 'tigerbhaioffice@gmail.com',
      password: 'TigerBhai@1994',
      phone: '0000000001',
      isEmailVerified: true
    }
  ]

  for (const adminPayload of adminPayloads) {
    const existing = await UserModel.findOne({ email: adminPayload.email }).select('+password')
    if (existing) {
      existing.role = 'admin'
      if (adminPayload.password) existing.password = adminPayload.password
      if (!existing.phone) existing.phone = adminPayload.phone
      if (!existing.name) existing.name = adminPayload.name
      if (existing.isEmailVerified !== true) existing.isEmailVerified = true
      await existing.save()
      console.log('Admin user updated:', existing.email)
    } else {
      await UserModel.create(adminPayload)
      console.log('Admin user created:', adminPayload.email)
    }
  }

  await mongoose.connection.close()
}

run().catch(async (err) => {
  console.error(err)
  try { await mongoose.connection.close() } catch {}
  process.exit(1)
})



