import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebaseAdmin'

export async function POST(request) {
  try {
    const body = await request.json()
    const { buyerId, vendorId, productId, productName } = body || {}
    if (!buyerId || !vendorId || !productId) {
      return NextResponse.json({ success: false, message: 'Missing params' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const threadsRef = db.collection('threads')
    const snap = await threadsRef
      .where('buyerId', '==', buyerId)
      .where('vendorId', '==', vendorId)
      .where('productId', '==', productId)
      .limit(1)
      .get()
    if (!snap.empty) {
      const doc = snap.docs[0]
      return NextResponse.json({ success: true, data: { threadId: doc.id } })
    }

    const now = new Date()
    const docRef = await threadsRef.add({
      participants: [buyerId, vendorId],
      buyerId,
      vendorId,
      productId,
      productName,
      updatedAt: now,
      createdAt: now,
    })
    return NextResponse.json({ success: true, data: { threadId: docRef.id } })
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}


