'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

const WhatsAppChat = ({ productName, whatsappLink, className = "" }) => {
  const handleWhatsAppClick = () => {
    if (!whatsappLink) {
      // Fallback to general support if no product-specific WhatsApp link
      const supportNumber = '8801903961752'
      const message = encodeURIComponent(`Hello! I'm interested in this product: ${productName}`)
      const whatsappUrl = `https://wa.me/${supportNumber}?text=${message}`
      window.open(whatsappUrl, '_blank')
      return
    }

    // Use product-specific WhatsApp link
    const message = encodeURIComponent(`Hello! I'm interested in this product: ${productName}`)
    const whatsappUrl = `${whatsappLink}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Chat with Seller
    </Button>
  )
}

export default WhatsAppChat

