import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import admin from 'firebase-admin'
import { verifyToken } from '@/lib/authentication'

function initAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
}

export async function POST() {
  try {
    initAdmin()
    const cookieStore = await cookies()
    const access = cookieStore.get('access_token')?.value
    if (!access) return NextResponse.json({ success: false, message: 'No access token' }, { status: 401 })

    const res = await verifyToken(access)
    if (!res.success) return NextResponse.json({ success: false, message: res.message }, { status: 401 })

    const user = res.payload || {}
    const uid = String(user._id)
    const claims = { role: user.role || 'customer' }

    try { await admin.auth().getUser(uid) }
    catch { await admin.auth().createUser({ uid }) }

    await admin.auth().setCustomUserClaims(uid, claims)
    const token = await admin.auth().createCustomToken(uid, claims)
    return NextResponse.json({ success: true, token, uid, role: claims.role })
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}


