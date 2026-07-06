/**
 * @vitest-environment jsdom
 */
import { GrupoDeFasesDTO } from '@/api/clients'
import { TooltipProvider } from '@/design-system/base-ui/tooltip'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GrupoDeFasesItem } from './grupo-de-fases-item'
import type { GrupoDeFasesEstado } from './lib/tipos'

const mutateMock = vi.fn()
const esAdminMock = vi.fn()

vi.mock('@/logica-compartida/hooks/use-auth', () => ({
  useAuth: (selector: (state: { esAdmin: () => boolean }) => unknown) =>
    selector({ esAdmin: esAdminMock })
}))

vi.mock('@/api/hooks/use-visibilidad-en-app', () => ({
  useToggleVisibilidadGrupoDeFasesEnApp: () => ({
    mutate: mutateMock,
    isPending: false
  })
}))

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false })
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false
  }),
  rectSortingStrategy: {}
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Translate: { toString: () => undefined } }
}))

vi.mock('../../../crear-torneo/components/titulo-fase', () => ({
  TituloFase: ({ valor }: { valor: string }) => <span>{valor}</span>
}))

vi.mock('../fase-item/fase-item', () => ({
  FaseItem: () => null
}))

const grupoEstado: GrupoDeFasesEstado = {
  id: 10,
  idLocal: 'grupo-10',
  numero: 1,
  nombre: 'Grupo A',
  elementos: []
}

const torneoGrupos = [
  new GrupoDeFasesDTO({
    id: 10,
    nombre: 'Grupo A',
    numero: 1,
    esVisibleEnApp: true
  })
]

const callbacks = {
  onActualizarGrupo: vi.fn(),
  onActualizarFase: vi.fn(),
  onEliminarFase: vi.fn(),
  onEliminarGrupo: vi.fn(),
  onAgregarSubgrupo: vi.fn(),
  onIrAZonas: vi.fn()
}

function renderGrupo(props?: Partial<Parameters<typeof GrupoDeFasesItem>[0]>) {
  return render(
    <TooltipProvider>
      <GrupoDeFasesItem
        grupo={grupoEstado}
        profundidad={1}
        torneoId={1}
        nombreTorneo='Torneo Test'
        torneoFases={[]}
        torneoGrupos={torneoGrupos}
        estaGuardando={false}
        {...callbacks}
        {...props}
      />
    </TooltipProvider>
  )
}

describe('GrupoDeFasesItem — visibilidad en app', () => {
  afterEach(() => {
    cleanup()
    mutateMock.mockReset()
    esAdminMock.mockReset()
    Object.values(callbacks).forEach((fn) => fn.mockReset())
  })

  it('no muestra el botón de visibilidad si el usuario no es admin', () => {
    esAdminMock.mockReturnValue(false)
    renderGrupo()

    expect(
      screen.queryByRole('button', { name: 'Grupo de fases visible en la app' })
    ).toBeNull()
  })

  it('muestra el ojo visible para admin y dispara el toggle', () => {
    esAdminMock.mockReturnValue(true)
    renderGrupo()

    const boton = screen.getByRole('button', {
      name: 'Grupo de fases visible en la app'
    })
    fireEvent.click(boton)

    expect(mutateMock).toHaveBeenCalledOnce()
  })

  it('muestra el ojo tachado cuando el grupo está oculto', () => {
    esAdminMock.mockReturnValue(true)
    renderGrupo({
      torneoGrupos: [
        new GrupoDeFasesDTO({
          id: 10,
          nombre: 'Grupo A',
          numero: 1,
          esVisibleEnApp: false
        })
      ]
    })

    expect(
      screen.getByRole('button', {
        name: 'Grupo de fases no visible en la app'
      })
    ).toBeTruthy()
  })

  it('no muestra el botón si el grupo aún no tiene id persistido', () => {
    esAdminMock.mockReturnValue(true)
    renderGrupo({
      grupo: { ...grupoEstado, id: undefined },
      torneoGrupos: []
    })

    expect(
      screen.queryByRole('button', { name: /Grupo de fases .* en la app/ })
    ).toBeNull()
  })
})
