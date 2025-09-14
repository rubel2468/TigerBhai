'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import EditAction from "@/components/Application/Admin/EditAction"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_VENDOR_PRODUCT_VARIANT_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperFunction'
import { VENDOR_DASHBOARD, VENDOR_PRODUCT_VARIANT_ADD, VENDOR_PRODUCT_VARIANT_EDIT, VENDOR_PRODUCT_VARIANT_VIEW, VENDOR_TRASH } from '@/routes/VendorRoute'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import { FiPlus } from 'react-icons/fi'

const breadcrumbData = [
    { href: VENDOR_DASHBOARD, label: 'Home' },
    { href: '/vendor/products/variants', label: 'Product Variants' },
]

const ProductVariants = () => {
    const columns = useMemo(() => {
        return columnConfig(DT_VENDOR_PRODUCT_VARIANT_COLUMN)
    }, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        actionMenu.push(<EditAction key="edit" href={VENDOR_PRODUCT_VARIANT_EDIT(row.original._id)} />)
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />)
        return actionMenu
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>Product Variants</h4>
                        <Button>
                            <FiPlus />
                            <Link href={VENDOR_PRODUCT_VARIANT_ADD}>New Variant</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="vendor-product-variant-data"
                        fetchUrl="/api/product-variant"
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint="/api/product-variant/export"
                        deleteEndpoint="/api/product-variant/delete"
                        deleteType="SD"
                        trashView={`${VENDOR_TRASH}?trashof=product-variant`}
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ProductVariants
