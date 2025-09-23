import { NextResponse } from 'next/server'
import { firestoreDb } from '@/lib/firebase'
import { collection, query, where, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(request) {
  try {
    const body = await request.json()
    const { buyerId, vendorId, productId, productName } = body || {}
    if (!buyerId || !vendorId || !productId) {
      return NextResponse.json({ success: false, message: 'Missing params' }, { status: 400 })
    }

    const threadsRef = collection(firestoreDb, 'threads')
    const q = query(
      threadsRef,
      where('buyerId', '==', buyerId),
      where('vendorId', '==', vendorId),
      where('productId', '==', productId),
      limit(1)
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const doc = snap.docs[0]
      return NextResponse.json({ success: true, data: { threadId: doc.id } })
    }

    const docRef = await addDoc(threadsRef, {
      participants: [buyerId, vendorId],
      buyerId,
      vendorId,
      productId,
      productName,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })
    return NextResponse.json({ success: true, data: { threadId: docRef.id } })
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}


