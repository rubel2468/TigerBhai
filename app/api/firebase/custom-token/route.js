import { NextResponse } from 'next/server'
import admin from 'firebase-admin'

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

export async function POST(request) {
  try {
    initAdmin()
    const { user } = await request.json()
    if (!user?._id) return NextResponse.json({ success: false, message: 'Missing user' }, { status: 400 })

    const uid = String(user._id)
    const claims = { role: user.role || 'customer' }

    try { await admin.auth().getUser(uid) }
    catch { await admin.auth().createUser({ uid }) }

    await admin.auth().setCustomUserClaims(uid, claims)
    const token = await admin.auth().createCustomToken(uid, claims)
    return NextResponse.json({ success: true, token })
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}


