'use client'
import { useEffect, useMemo, useState } from 'react'
import { firestoreDb } from '@/lib/firebase'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import Link from 'next/link'

export default function AdminChatsPage() {
  const [threads, setThreads] = useState([])

  useEffect(() => {
    const q = query(collection(firestoreDb, 'threads'), orderBy('updatedAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setThreads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const grouped = useMemo(() => {
    const m = new Map()
    for (const t of threads) {
      const key = t.vendorId || 'unknown'
      if (!m.has(key)) m.set(key, [])
      m.get(key).push(t)
    }
    return Array.from(m.entries())
  }, [threads])

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">All Chats by Vendor</h1>
      <div className="space-y-6">
        {grouped.map(([vendorId, list]) => (
          <div key={vendorId}>
            <h2 className="font-semibold mb-2">Vendor: {vendorId === 'ADMIN' ? 'Admin' : vendorId}</h2>
            <div className="space-y-2">
              {list.map(t => (
                <Link key={t.id} href={`/chat/${t.id}`} className="block border rounded p-3 hover:bg-accent">
                  <div className="font-medium">{t.productName || 'Product'}</div>
                  <div className="text-sm text-muted-foreground">Buyer: {t.buyerId}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && <div className="text-sm text-muted-foreground">No chats yet.</div>}
      </div>
    </div>
  )
}


