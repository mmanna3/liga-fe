import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/base-ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/design-system/base-ui/table'
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
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import Icono from '@/design-system/ykn-ui/icono'
import { useState } from 'react'

type TablaProps<T> = {
  data: T[]
  columnas: ColumnDef<T>[]
  estaCargando: boolean
  hayError: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  pageSizeDefault?: number
  onRowClick?: (row: Row<T>) => void
  /** Contenido del filtro (ej. botón con Popover) alineado con la búsqueda */
  filtro?: React.ReactNode
  /** Entre la barra de búsqueda y la tabla */
  debajoDeBusqueda?: React.ReactNode
}

export default function Tabla<T>({
  data,
  columnas,
  estaCargando,
  hayError,
  rowSelection,
  onRowSelectionChange,
  pageSizeDefault = 10,
  onRowClick,
  filtro,
  debajoDeBusqueda
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
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Buscar...'
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className='w-64'
        />
        {filtro}
      </div>

      {debajoDeBusqueda}

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
                      {header.column.getIsSorted() === 'asc' ? (
                        <Icono
                          nombre='Orden ascendente'
                          className='ml-1 inline h-4 w-4 shrink-0 align-middle'
                        />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <Icono
                          nombre='Orden descendente'
                          className='ml-1 inline h-4 w-4 shrink-0 align-middle'
                        />
                      ) : null}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={
                      onRowClick
                        ? 'cursor-pointer hover:bg-gray-100 transition-colors'
                        : undefined
                    }
                  >
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
              <Boton
                variant='outline'
                className='w-3 h-7'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <Icono nombre='Anterior' className='w-4 h-4' />
              </Boton>
              <span>
                {table.getState().pagination.pageIndex + 1} de{' '}
                {table.getPageCount()}
              </span>
              <Boton
                variant='outline'
                className='w-3 h-7'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <Icono nombre='Siguiente' className='w-4 h-4' />
              </Boton>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface MenuContextualProps {
  items: { texto: string; onClick: () => void; icon?: React.ReactNode }[]
}

Tabla.MenuContextual = function MenuContextual({ items }: MenuContextualProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Boton variant='ghost' size='icon'>
          <Icono nombre='Más opciones' className='w-5 h-5' />
        </Boton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='bg-white min-w-32 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50 p-3'
      >
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className='py-1 cursor-pointer flex items-center gap-2'
          >
            {item.icon}
            {item.texto}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
