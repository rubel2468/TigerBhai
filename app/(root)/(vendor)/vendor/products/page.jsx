'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_VENDOR_PRODUCT_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { VENDOR_DASHBOARD, VENDOR_PRODUCT_ADD, VENDOR_PRODUCT_EDIT_ID, VENDOR_PRODUCTS, VENDOR_TRASH } from "@/routes/VendorRoute"
import Link from "next/link"
import { useCallback, useMemo } from "react"
import { FiPlus } from "react-icons/fi"

const breadcrumbData = [
    { href: VENDOR_DASHBOARD, label: 'Dashboard' },
    { href: VENDOR_PRODUCTS, label: 'Products' },
]

const VendorProductsPage = () => {
    const columns = useMemo(() => {
        return columnConfig(DT_VENDOR_PRODUCT_COLUMN)
    }, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        
        // Safety check for row and original data
        if (!row || !row.original) {
            console.warn('Row or original data is missing:', row)
            return actionMenu
        }
        
        const productId = row.original._id
        const editHref = VENDOR_PRODUCT_EDIT_ID(productId)
        
        if (productId && editHref) {
            actionMenu.push(<EditAction key="edit" href={editHref} />)
        }
        
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />)
        return actionMenu
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>My Products</h4>
                        <Button asChild>
                            <Link href={VENDOR_PRODUCT_ADD}>
                                <FiPlus />
                                New Product
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="vendor-product-data"
                        fetchUrl="/api/vendor/products"
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint="/api/vendor/products/export"
                        deleteEndpoint="/api/vendor/products/delete"
                        deleteType="SD"
                        trashView={`${VENDOR_TRASH}?trashof=product`}
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default VendorProductsPage


