'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import ViewAction from "@/components/Application/Admin/ViewAction"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_VENDOR_ORDER_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { VENDOR_DASHBOARD, VENDOR_ORDER_DETAILS } from "@/routes/VendorRoute"
import { useCallback, useMemo } from "react"

const breadcrumbData = [
    { href: VENDOR_DASHBOARD, label: 'Dashboard' },
    { href: "", label: 'Orders' },
]

export default function VendorOrdersPage() {
    const columns = useMemo(() => {
        return columnConfig(DT_VENDOR_ORDER_COLUMN)
    }, [])

    const action = useCallback((row) => {
        let actionMenu = []
        actionMenu.push(<ViewAction key="view" href={VENDOR_ORDER_DETAILS + `/${row.original.orderNumber}`} />)
        return actionMenu
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>Your Orders</h4>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="vendor-orders-data"
                        fetchUrl="/api/vendor/orders"
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint="/api/vendor/orders/export"
                        deleteEndpoint=""
                        deleteType=""
                        trashView=""
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}


