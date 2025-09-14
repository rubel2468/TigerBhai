'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'

const WhatsAppSupport = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppClick = () => {
    // Support WhatsApp number
    const supportNumber = '8801903961752'
    const message = encodeURIComponent('Hello! I need support with your services.')
    const whatsappUrl = `https://wa.me/${supportNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-lg p-4 w-80 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Need Help?</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Chat with our support team on WhatsApp for quick assistance.
          </p>
          <Button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat on WhatsApp
          </Button>
        </div>
      )}
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}

export default WhatsAppSupport

