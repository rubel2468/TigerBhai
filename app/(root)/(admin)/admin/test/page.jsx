'use client'
import { useEffect, useState } from 'react'

const TestPage = () => {
    const [error, setError] = useState(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return <div>Loading...</div>
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold">Environment Check:</h2>
                    <p>NEXT_PUBLIC_BASE_URL: {process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}</p>
                    <p>Window location: {typeof window !== 'undefined' ? window.location.origin : 'Server side'}</p>
                </div>
                
                <div>
                    <h2 className="text-lg font-semibold">Authentication Check:</h2>
                    <p>Access token exists: {typeof document !== 'undefined' ? 
                        (document.cookie.includes('access_token') ? 'Yes' : 'No') : 'Server side'}</p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold">API Test:</h2>
                    <button 
                        onClick={async () => {
                            try {
                                const response = await fetch('/api/product-variant?deleteType=SD&start=0&size=5')
                                const data = await response.json()
                                console.log('API Response:', data)
                                setError(`API Response: ${JSON.stringify(data, null, 2)}`)
                            } catch (err) {
                                console.error('API Error:', err)
                                setError(`API Error: ${err.message}`)
                            }
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Test API Call
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <pre className="whitespace-pre-wrap">{error}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TestPage
