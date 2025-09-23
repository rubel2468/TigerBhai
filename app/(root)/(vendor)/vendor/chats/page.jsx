'use client'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { firestoreDb } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import Link from 'next/link'

export default function VendorChatsPage() {
  const auth = useSelector(store => store.authStore.auth)
  const [threads, setThreads] = useState([])

  useEffect(() => {
    if (!auth?._id) return
    const q = query(
      collection(firestoreDb, 'threads'),
      where('vendorId', '==', auth._id),
      orderBy('updatedAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setThreads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [auth?._id])

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Customer Chats</h1>
      <div className="space-y-2">
        {threads.map(t => (
          <Link key={t.id} href={`/chat/${t.id}`} className="block border rounded p-3 hover:bg-accent">
            <div className="font-medium">{t.productName || 'Product'}</div>
            <div className="text-sm text-muted-foreground">Buyer: {t.buyerId}</div>
          </Link>
        ))}
        {threads.length === 0 && <div className="text-sm text-muted-foreground">No chats yet.</div>}
      </div>
    </div>
  )
}


