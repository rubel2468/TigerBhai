'use client'

import { MessageCircle } from 'lucide-react'

const WhatsAppSupport = () => {
  const supportNumber = '8801903961752'
  const whatsappUrl = `https://wa.me/${supportNumber}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}

export default WhatsAppSupport

