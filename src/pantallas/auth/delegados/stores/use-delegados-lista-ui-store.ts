import { createListaUiStore } from '@/logica-compartida/stores/create-lista-ui-store'
import { EstadoDelegado } from '@/logica-compartida/utils'

export const useDelegadosListaUiStore = createListaUiStore<EstadoDelegado>()
