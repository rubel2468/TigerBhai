'use client'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

export default function ChatButton({ productId, productName, vendorId, className = '' }) {
  const router = useRouter()
  const auth = useSelector(store => store.authStore.auth)

  const startChat = async () => {
    if (!auth?._id) {
      router.push('/auth/login')
      return
    }
    try {
      const sellerId = vendorId || 'ADMIN'
      const res = await fetch('/api/chat/create-or-get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: auth._id, vendorId: sellerId, productId, productName })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      router.push(`/chat/${json.data.threadId}`)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Button onClick={startChat} className={`bg-primary hover:bg-primary/90 text-primary-foreground ${className}`}>
      <MessageCircle className="h-4 w-4 mr-2" />
      Chat with Seller
    </Button>
  )
}


