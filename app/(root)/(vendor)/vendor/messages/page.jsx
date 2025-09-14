'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VendorMessagesPage() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/vendor/messages')
            if (data.success) {
                setMessages(data.data.messages)
            }
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-6">Loading...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Messages</h1>
            <div className="grid gap-4">
                {messages.map((m) => (
                    <Card key={m._id}>
                        <CardHeader>
                            <CardTitle className="text-base">{m.subject}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-600">From: {m.sender?.name}</div>
                            <div className="text-sm text-gray-600">To: {m.receiver?.name}</div>
                            <div className="text-sm mt-2">{m.message}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}


