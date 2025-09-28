'use client'
import React, { useState } from 'react'
import { FaWhatsapp, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const WhatsAppSupport = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const whatsappNumber = '+8801234567890' // Replace with your actual WhatsApp number
    const message = 'Hello! I need support with my order.'

    const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <div className="fixed left-4 bottom-4 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-xs"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <FaWhatsapp className="text-white text-sm" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Support Chat</h4>
                                    <p className="text-xs text-gray-500">We're online now</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-3 mb-3">
                            <p className="text-sm text-gray-700">
                                Need help with your order? Our support team is here to assist you!
                            </p>
                        </div>
                        
                        <button
                            onClick={handleWhatsAppClick}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <FaWhatsapp size={16} />
                            <span>Chat on WhatsApp</span>
                        </button>
                        
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Usually responds in minutes
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300"
            >
                <FaWhatsapp size={24} />
                
                {/* Pulse animation */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500 rounded-full"
                />
                
                {/* Notification badge */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                >
                    1
                </motion.div>
            </motion.button>
        </div>
    )
}

export default WhatsAppSupport