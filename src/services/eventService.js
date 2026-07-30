/**
 * EventService
 *
 * Capa de servicio para la gestión de eventos de amenaza.
 * Contiene toda la lógica de negocio relacionada con ThreatEvent.
 * Los controladores delegan en este servicio; nunca contienen lógica.
 */

import ThreatEvent from "../models/ThreatEvent.js";
import ThreatDetectorService from "../detectors/ThreatDetectorService.js";
import { filterSensitiveHeaders } from "../utils/helpers.js";

/**
 * Crea un nuevo evento de amenaza después de detectar si es sospechoso.
 * Solo se almacenan eventos considerados sospechosos por el detector.
 *
 * @param {Object} eventData - Datos del evento a registrar
 * @returns {Object} Evento creado
 * @throws {Error} Si el evento no es sospechoso
 */
async function createEvent(eventData) {
  const detection = ThreatDetectorService.detect({
    path: eventData.path || "",
    userAgent: eventData.userAgent || "",
    method: eventData.method || "",
    responseStatus: eventData.responseStatus,
  });

  if (!detection.suspicious) {
    throw Object.assign(new Error("El evento no se considera sospechoso"), {
      statusCode: 422,
      code: "NOT_SUSPICIOUS",
    });
  }

  const filteredHeaders = filterSensitiveHeaders(eventData.headers);

  const event = new ThreatEvent({
    ip: eventData.ip || "",
    method: eventData.method || "",
    path: eventData.path || "",
    originalUrl: eventData.originalUrl || "",
    query: eventData.query || {},
    headers: filteredHeaders,
    userAgent: eventData.userAgent || "",
    referer: eventData.referer || "",
    host: eventData.host || "",
    protocol: eventData.protocol || "",
    httpVersion: eventData.httpVersion || "",
    responseStatus: eventData.responseStatus || null,
    sourceApplication: eventData.sourceApplication || "",
    severity: detection.severity,
    category: detection.category,
    matchedRule: detection.matchedRule,
    reason: detection.reason,
    notes: eventData.notes || "",
  });

  const savedEvent = await event.save();
  return savedEvent;
}

/**
 * Lista eventos con filtros y paginación.
 */
async function listEvents(options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
    severity,
    category,
    ip,
    sourceApplication,
    desde,
    hasta,
  } = options;

  const filter = {};

  if (severity) filter.severity = severity;
  if (category) filter.category = category;
  if (ip) filter.ip = ip;
  if (sourceApplication) filter.sourceApplication = sourceApplication;

  if (desde || hasta) {
    filter.createdAt = {};
    if (desde) filter.createdAt.$gte = new Date(desde);
    if (hasta) filter.createdAt.$lte = new Date(hasta);
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === "asc" ? 1 : -1;

  const [events, total] = await Promise.all([
    ThreatEvent.find(filter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    ThreatEvent.countDocuments(filter),
  ]);

  return {
    events,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Obtiene un evento por su ID.
 */
async function getEventById(id) {
  const event = await ThreatEvent.findById(id).lean();
  if (!event) {
    throw Object.assign(new Error("Evento no encontrado"), {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }
  return event;
}

/**
 * Elimina un evento por su ID.
 */
async function deleteEvent(id) {
  const event = await ThreatEvent.findByIdAndDelete(id);
  if (!event) {
    throw Object.assign(new Error("Evento no encontrado"), {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }
  return event;
}

export default {
  createEvent,
  listEvents,
  getEventById,
  deleteEvent,
};
