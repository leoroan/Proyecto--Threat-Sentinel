/**
 * StatsService
 *
 * Servicio de estadísticas del sistema.
 * Proporciona métricas agregadas sobre los eventos almacenados.
 */

import ThreatEvent from "../models/ThreatEvent.js";

/**
 * Obtiene estadísticas agregadas de los eventos.
 *
 * @returns {Object} Estadísticas del sistema
 */
async function getStats() {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfLastHour = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    totalEventos,
    eventosHoy,
    eventosUltimaHora,
    topIPs,
    topPaths,
    topUserAgents,
    topCategorias,
    topAplicaciones,
  ] = await Promise.all([
    ThreatEvent.countDocuments(),
    ThreatEvent.countDocuments({ createdAt: { $gte: startOfDay } }),
    ThreatEvent.countDocuments({ createdAt: { $gte: startOfLastHour } }),
    ThreatEvent.aggregate([
      { $group: { _id: "$ip", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, ip: "$_id", count: 1 } },
    ]),
    ThreatEvent.aggregate([
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, path: "$_id", count: 1 } },
    ]),
    ThreatEvent.aggregate([
      { $group: { _id: "$userAgent", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, userAgent: "$_id", count: 1 } },
    ]),
    ThreatEvent.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, category: "$_id", count: 1 } },
    ]),
    ThreatEvent.aggregate([
      { $group: { _id: "$sourceApplication", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, sourceApplication: "$_id", count: 1 } },
    ]),
  ]);

  return {
    totalEventos,
    eventosHoy,
    eventosUltimaHora,
    topIPs,
    topPaths,
    topUserAgents,
    topCategorias,
    topAplicaciones,
  };
}

export default { getStats };
