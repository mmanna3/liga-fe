import { EstadoJugador } from '@/logica-compartida/utils'
import { createListaUiStore } from '@/logica-compartida/stores/create-lista-ui-store'

export const useJugadoresListaUiStore = createListaUiStore<EstadoJugador>()
