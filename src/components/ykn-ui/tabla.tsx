import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@radix-ui/react-dropdown-menu'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
  OnChangeFn
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import { useState } from 'react'

type TablaProps<T> = {
  data: T[]
  columnas: ColumnDef<T>[]
  estaCargando: boolean
  hayError: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  pageSizeDefault?: number
}

export default function Tabla<T>({
  data,
  columnas,
  estaCargando,
  hayError,
  rowSelection,
  onRowSelectionChange,
  pageSizeDefault = 10
}: TablaProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSizeDefault
      }
    },
    state: {
      globalFilter,
      sorting,
      rowSelection: rowSelection || {}
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange,
    enableRowSelection: true
  })

  return (
    <div className='space-y-4'>
      <Input
        placeholder='Buscar...'
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className='w-64'
      />

      {estaCargando ? (
        <p className='text-center text-gray-500'>Cargando datos...</p>
      ) : hayError ? (
        <p className='text-center text-red-500'>
          Ocurrió un error al cargar los datos.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className='cursor-pointer'
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === 'asc'
                        ? ' 🔼'
                        : header.column.getIsSorted() === 'desc'
                          ? ' 🔽'
                          : ''}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnas.length}
                    className='text-center py-4'
                  >
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className='flex justify-between items-center mt-4'>
            <span className='text-xs text-gray-600'>
              Registros: {data.length}
            </span>
            <div className='flex items-center space-x-2 text-gray-600 text-sm'>
              <Button
                variant='outline'
                className='w-3 h-7'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>
              <span>
                {table.getState().pagination.pageIndex + 1} de{' '}
                {table.getPageCount()}
              </span>
              <Button
                variant='outline'
                className='w-3 h-7'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface MenuContextualProps {
  items: { texto: string; onClick: () => void }[]
}

Tabla.MenuContextual = function MenuContextual({ items }: MenuContextualProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon'>
          <MoreVertical className='w-5 h-5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='bg-white min-w-32 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50 p-3'
      >
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className='py-1 cursor-pointer'
          >
            {item.texto}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
