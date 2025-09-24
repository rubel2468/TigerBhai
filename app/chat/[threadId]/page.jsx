'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { getFirestoreDb } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

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
    <div className="max-w-3xl mx-auto h-[80vh] flex flex-col p-4">
      <div className="border rounded flex-1 overflow-y-auto p-3 bg-card">
        {messages.map(m => {
          const ts = m.createdAt?.toDate ? m.createdAt.toDate() : (m.createdAt?._seconds ? new Date(m.createdAt._seconds * 1000) : null)
          return (
            <div key={m.id} className={`mb-2 flex ${m.senderId === auth?._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow ${m.senderId === auth?._id ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-muted-foreground rounded-bl-sm'}`}>
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
                <div className="mt-1 text-[10px] opacity-80 text-right">{ts ? format(ts, 'MMM d, h:mm a') : ''}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Type a message" />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  )
}


