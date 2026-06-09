/**
 * Endpoints backend sugeridos para persistir grupos de fases.
 * Ver plan en detalle-torneo; hasta implementarlos, grupos viven solo en estado local.
 *
 * ABM grupos (ABMControllerAnidado):
 *   GET    api/Torneo/{torneoId}/grupos-de-fases
 *   GET    api/Torneo/{torneoId}/grupos-de-fases/{id}
 *   POST   api/Torneo/{torneoId}/grupos-de-fases
 *   PUT    api/Torneo/{torneoId}/grupos-de-fases/{id}
 *   DELETE api/Torneo/{torneoId}/grupos-de-fases/{id}
 *
 * GrupoDeFasesDTO: id, nombre, ordenEnTorneo, torneoId, fases[]
 *
 * Extender Fase / FaseDTO:
 *   grupoDeFasesId?: number | null
 *   numeroEnGrupo: number
 *   ordenEnTorneo: number
 *
 * Operaciones de estructura (drag & drop):
 *   PUT api/Torneo/{torneoId}/estructura-fases
 *       body: { items: [{ tipo: 'fase' | 'grupo', id, orden }] }
 *   PUT api/Torneo/{torneoId}/fases/{faseId}/mover-a-grupo
 *       body: { grupoDeFasesId, numeroEnGrupo }
 *   PUT api/Torneo/{torneoId}/fases/{faseId}/sacar-de-grupo
 *       body: { ordenEnTorneo }
 *
 * Extender TorneoDTO / torneoGET:
 *   gruposDeFases?: GrupoDeFasesDTO[]
 *   estructura?: EstructuraTorneoItemDTO[]  // opcional, lista mixta ordenada
 */

export {}
