'use client'
import axios from "axios"
import { useEffect, useMemo, useState } from "react"

const useFetch = (url, method = "GET", options = {}, initialData = null) => {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(!initialData)
    const [error, setError] = useState(null)
    const [refreshIndex, setRefreshIndex] = useState(0)

    const optionsString = JSON.stringify(options)
    const requestOptions = useMemo(() => {
        const opts = { ...options }
        if (method === 'POST' && !opts.data) {
            opts.data = {}
        }
        return opts
    }, [method, optionsString])

    useEffect(() => {
        // Skip API call if we have initial data and it's the first render
        if (initialData && refreshIndex === 0) {
            return
        }

        const apiCall = async () => {
            setLoading(true)
            setError(null)
            try {
                const { data: response } = await axios({
                    url,
                    method,
                    withCredentials: true,
                    ...(requestOptions)
                })

                if (!response.success) {
                    throw new Error(response.message)
                }

                setData(response)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        apiCall()

    }, [url, refreshIndex, requestOptions, initialData])


    const refetch = () => {
        setRefreshIndex(prev => prev + 1)
    }


    return { data, loading, error, refetch }

}

export default useFetch