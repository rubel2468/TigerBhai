import { SWRConfig } from 'swr'

// SWR fetcher function
export const fetcher = async (url) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.')
        error.info = await res.json()
        error.status = res.status
        throw error
    }
    return res.json()
}

// SWR configuration
export const swrConfig = {
    fetcher,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0, // Disable automatic refresh
    dedupingInterval: 2000, // Dedupe requests within 2 seconds
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    onError: (error, key) => {
        console.error('SWR Error:', error, 'for key:', key)
    },
    onSuccess: (data, key) => {
        console.log('SWR Success for key:', key)
    }
}

// SWR Provider component
export const SWRProvider = ({ children }) => {
    return (
        <SWRConfig value={swrConfig}>
            {children}
        </SWRConfig>
    )
}
