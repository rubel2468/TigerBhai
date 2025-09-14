import { IconButton, Tooltip } from '@mui/material'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { MaterialReactTable, MRT_ShowHideColumnsButton, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, MRT_ToggleGlobalFilterButton, useMaterialReactTable } from 'material-react-table'
import Link from 'next/link'
import React, { useState } from 'react'
import RecyclingIcon from '@mui/icons-material/Recycling';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import useDeleteMutation from '@/hooks/useDeleteMutation'
import ButtonLoading from '../ButtonLoading'
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { showToast } from '@/lib/showToast'
import { download, generateCsv, mkConfig } from 'export-to-csv'
const Datatable = ({
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

    // filter , sorting and pagination states 
    const [columnFilters, setColumnFilters] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState([])
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: initialPageSize
    })

    // Row selection state  
    const [rowSelection, setRowSelection] = useState({})

    // Export loading state 
    const [exportLoading, setExportLoading] = useState(false)

    // handle delete method  
    const deleteMutation = useDeleteMutation(queryKey, deleteEndpoint)

    // delete method 
    const handleDelete = (ids, deleteType) => {
        let c
        if (deleteType === 'PD') {
            c = confirm('Are you sure you want to delete the data permanently?')
        } else {
            c = confirm('Are you sure you want to move data into trash?')
        }

        if (c) {
            deleteMutation.mutate({ ids, deleteType })
            setRowSelection({})
        }
    }


    // export method  

    const handleExport = async (selectedRows) => {
        setExportLoading(true)
        try {
            const csvConfig = mkConfig({
                fieldSeparator: ',',
                decimalSeparator: '.',
                useKeysAsHeaders: true,
                filename: 'csv-data'
            })

            let csv

            if (Object.keys(rowSelection).length > 0) {
                // export only selected rows  
                const rowData = selectedRows.map((row) => row.original)
                csv = generateCsv(csvConfig)(rowData)
            } else {
                // export all data  
                const { data: response } = await axios.get(exportEndpoint)
                if (!response.success) {
                    throw new Error(response.message)
                }

                const rowData = response.data
                csv = generateCsv(csvConfig)(rowData)
            }

            download(csvConfig)(csv)

        } catch (error) {
            console.log(error)
            showToast('error', error.message)
        } finally {
            setExportLoading(false)
        }
    }


    // Data fetching logics 

    const {
        data: { data = [], meta } = {},
        isError,
        isRefetching,
        isLoading
    } = useQuery({
        queryKey: [queryKey, { columnFilters, globalFilter, pagination, sorting }],
        queryFn: async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
                if (!baseUrl) {
                    throw new Error('Base URL not available')
                }
                
                const url = new URL(fetchUrl, baseUrl)
                url.searchParams.set(
                    'start',
                    `${pagination.pageIndex * pagination.pageSize}`,
                );
                url.searchParams.set('size', `${pagination.pageSize}`);
                url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
                url.searchParams.set('globalFilter', globalFilter ?? '');
                url.searchParams.set('sorting', JSON.stringify(sorting ?? []));
                url.searchParams.set('deleteType', deleteType);

                const { data: response } = await axios.get(url.href)
                return response
            } catch (error) {
                console.error('Data fetching error:', error)
                throw error
            }
        },

        placeholderData: keepPreviousData,
        retry: 1,
        retryDelay: 1000,
    })



    // init table  

    const table = useMaterialReactTable({
        columns: columnsConfig || [],
        data: Array.isArray(data) ? data : [],
        enableRowSelection: true,
        columnFilterDisplayMode: 'popover',
        paginationDisplayMode: 'pages',
        enableColumnOrdering: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        initialState: { showColumnFilters: true },
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        muiToolbarAlertBannerProps: isError
            ? {
                color: 'error',
                children: 'Error loading data',
            }
            : undefined,

        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        rowCount: meta?.totalRowCount ?? 0,
        onRowSelectionChange: setRowSelection,
        state: {
            columnFilters,
            globalFilter,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isRefetching,
            sorting,
            rowSelection
        },

        getRowId: (originalRow) => originalRow._id,

        renderToolbarInternalActions: ({ table }) => (
            <>
                {/* built in buttons  */}
                <MRT_ToggleGlobalFilterButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleFullScreenButton table={table} />
                <MRT_ToggleDensePaddingButton table={table} />

                {deleteType !== 'PD'
                    &&
                    <Tooltip title="Recycle Bin" >
                        <Link href={trashView}>
                            <IconButton>
                                <RecyclingIcon />
                            </IconButton>
                        </Link>
                    </Tooltip>
                }


                {deleteType === 'SD'
                    &&
                    <Tooltip title="Delete All" >
                        <IconButton disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                            onClick={() => handleDelete(Object.keys(rowSelection), deleteType)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                }

                {deleteType === 'PD'
                    &&
                    <>
                        <Tooltip title="Restore Data" >
                            <IconButton disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                                onClick={() => handleDelete(Object.keys(rowSelection), 'RSD')}
                            >

                                <RestoreFromTrashIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Permanently Delete Data" >
                            <IconButton disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                                onClick={() => handleDelete(Object.keys(rowSelection), deleteType)}
                            >
                                <DeleteForeverIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                }

            </>
        ),

        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActionMenuItems: ({ row }) => createAction(row, deleteType, handleDelete),

        renderTopToolbarCustomActions: ({ table }) => (
            <Tooltip>
                <ButtonLoading
                    type="button"
                    text={<><SaveAltIcon fontSize='25' /> Export</>}
                    loading={exportLoading}
                    onClick={() => handleExport(table.getSelectedRowModel().rows)}
                    className="cursor-pointer"
                />
            </Tooltip>
        )

    })

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading data...</span>
            </div>
        )
    }

    // Show error state
    if (isError) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-red-600">
                    <p>Error loading data. Please try again.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        )
    }

    return (
        <MaterialReactTable table={table} />
    )
}

export default Datatable