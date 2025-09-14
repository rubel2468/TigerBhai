'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_VENDOR_PRODUCT_COLUMN, DT_VENDOR_PRODUCT_VARIANT_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { VENDOR_DASHBOARD, VENDOR_PRODUCT_EDIT_ID, VENDOR_PRODUCT_VARIANT_EDIT, VENDOR_TRASH } from "@/routes/VendorRoute"
import { useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"

const breadcrumbData = [
    { href: VENDOR_DASHBOARD, label: 'Dashboard' },
    { href: VENDOR_TRASH, label: 'Trash' },
]

const VendorTrashPage = () => {
    const searchParams = useSearchParams()
    const trashOf = searchParams.get('trashof') || 'product'
    
    const getConfig = () => {
        switch (trashOf) {
            case 'product-variant':
                return {
                    columns: DT_VENDOR_PRODUCT_VARIANT_COLUMN,
                    fetchUrl: '/api/product-variant',
                    exportEndpoint: '/api/product-variant/export',
                    deleteEndpoint: '/api/product-variant/delete',
                    title: 'Product Variants Trash'
                }
            case 'product':
            default:
                return {
                    columns: DT_VENDOR_PRODUCT_COLUMN,
                    fetchUrl: '/api/vendor/products',
                    exportEndpoint: '/api/vendor/products/export',
                    deleteEndpoint: '/api/vendor/products/delete',
                    title: 'Products Trash'
                }
        }
    }

    const config = getConfig()
    const columns = useMemo(() => {
        return columnConfig(config.columns)
    }, [config.columns])

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        
        // Safety check for row and original data
        if (!row || !row.original) {
            console.warn('Row or original data is missing:', row)
            return actionMenu
        }
        
        const itemId = row.original._id
        let editHref = ''
        
        if (trashOf === 'product-variant') {
            editHref = VENDOR_PRODUCT_VARIANT_EDIT(itemId)
        } else {
            editHref = VENDOR_PRODUCT_EDIT_ID(itemId)
        }
        
        if (itemId && editHref) {
            actionMenu.push(<EditAction key="edit" href={editHref} />)
        }
        
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />)
        return actionMenu
    }, [trashOf])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>{config.title}</h4>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey={`vendor-${trashOf}-trash-data`}
                        fetchUrl={config.fetchUrl}
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint={config.exportEndpoint}
                        deleteEndpoint={config.deleteEndpoint}
                        deleteType="PD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default VendorTrashPage
