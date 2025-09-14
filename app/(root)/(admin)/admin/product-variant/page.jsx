'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_PRODUCT_VARIANT_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_EDIT, ADMIN_PRODUCT_VARIANT_ADD, ADMIN_PRODUCT_VARIANT_EDIT, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_TRASH } from "@/routes/AdminPanelRoute"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { FiPlus } from "react-icons/fi"
import { ErrorBoundary } from "@/components/Application/ErrorBoundary"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variant' },
]
const ShowProductVariant = () => {
    const [error, setError] = useState(null)

    const columns = useMemo(() => {
        try {
            return columnConfig(DT_PRODUCT_VARIANT_COLUMN)
        } catch (err) {
            console.error('Error creating columns:', err)
            setError(`Column configuration error: ${err.message}`)
            return []
        }
    }, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        try {
            let actionMenu = []
            actionMenu.push(<EditAction key="edit" href={ADMIN_PRODUCT_VARIANT_EDIT(row.original._id)} />)
            actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />)
            return actionMenu
        } catch (err) {
            console.error('Error creating action menu:', err)
            setError(`Action menu error: ${err.message}`)
            return []
        }
    }, [])

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Error in Product Variant Page</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <pre className="whitespace-pre-wrap">{error}</pre>
                </div>
                <button 
                    onClick={() => setError(null)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>Show Product Variants</h4>
                        <Button>
                            <FiPlus />
                            <Link href={ADMIN_PRODUCT_VARIANT_ADD}>New Variant</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <ErrorBoundary>
                        <DatatableWrapper
                            queryKey="product-variant-data"
                            fetchUrl="/api/product-variant"
                            initialPageSize={10}
                            columnsConfig={columns}
                            exportEndpoint="/api/product-variant/export"
                            deleteEndpoint="/api/product-variant/delete"
                            deleteType="SD"
                            trashView={`${ADMIN_TRASH}?trashof=product-variant`}
                            createAction={action}
                        />
                    </ErrorBoundary>
                </CardContent>
            </Card>
        </div>
    )
}

export default ShowProductVariant