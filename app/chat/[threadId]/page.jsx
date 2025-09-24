'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { getFirestoreDb } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ChatThreadPage() {
  const params = useParams()
  const threadId = params?.threadId
  const auth = useSelector(store => store.authStore.auth)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!threadId || !auth?._id) return
    const db = getFirestoreDb()
    const msgsRef = collection(db, 'threads', threadId, 'messages')
    const q = query(msgsRef, orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })
    return unsub
  }, [threadId, auth?._id])

  const send = async () => {
    if (!text.trim() || !threadId || !auth?._id) return
    const db = getFirestoreDb()
    const msgsRef = collection(db, 'threads', threadId, 'messages')
    await addDoc(msgsRef, {
      senderId: auth._id,
      content: text.trim(),
      type: 'text',
      createdAt: serverTimestamp(),
      readBy: [auth._id],
    })
    const db2 = getFirestoreDb()
    await updateDoc(doc(db2, 'threads', threadId), { updatedAt: serverTimestamp() })
    setText('')
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="border rounded h-[70vh] overflow-y-auto p-3 bg-card">
        {messages.map(m => (
          <div key={m.id} className={`mb-2 ${m.senderId === auth?._id ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-3 py-2 rounded ${m.senderId === auth?._id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Type a message" />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  )
}


