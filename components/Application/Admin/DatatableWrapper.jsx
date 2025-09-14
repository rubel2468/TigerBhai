'use client'

import { ThemeProvider } from "@mui/material"
import Datatable from "./Datatable"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { darkTheme, lightTheme } from "@/lib/materialTheme"

const DatatableWrapper = ({
    queryKey,
    fetchUrl,
    columnsConfig,
    initialPageSize = 10,
    exportEndpoint,
    deleteEndpoint,
    deleteType,
    trashView,
    createAction
}) => {

    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <ThemeProvider theme={resolvedTheme === 'dark' ? darkTheme : lightTheme}>
            <Datatable
                queryKey={queryKey}
                fetchUrl={fetchUrl}
                columnsConfig={columnsConfig}
                initialPageSize={initialPageSize}
                exportEndpoint={exportEndpoint}
                deleteEndpoint={deleteEndpoint}
                deleteType={deleteType}
                trashView={trashView}
                createAction={createAction}
            />
        </ThemeProvider>
    )
}

export default DatatableWrapper