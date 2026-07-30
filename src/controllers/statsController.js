/**
 * Controlador de estadísticas.
 *
 * Capa de control que recibe las peticiones HTTP, delega en el servicio
 * y retorna las respuestas al cliente.
 *
 * NO contiene lógica de negocio. Toda la lógica está en statsService.
 */

import statsService from "../services/statsService.js";

/**
 * GET /api/stats
 * Obtiene estadísticas agregadas del sistema.
 */
async function getStats(req, res, next) {
  try {
    const stats = await statsService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

export default {
  getStats,
};
