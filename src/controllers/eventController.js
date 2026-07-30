/**
 * Controlador de eventos.
 *
 * Capa de control que recibe las peticiones HTTP, delega en el servicio
 * y retorna las respuestas al cliente.
 *
 * NO contiene lógica de negocio. Toda la lógica está en eventService.
 */

import eventService from "../services/eventService.js";

/**
 * POST /api/events
 * Crea un nuevo evento de amenaza.
 */
async function createEvent(req, res, next) {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/events
 * Lista eventos con filtros y paginación.
 */
async function listEvents(req, res, next) {
  try {
    const result = await eventService.listEvents(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/events/:id
 * Obtiene el detalle de un evento.
 */
async function getEventById(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/events/:id
 * Elimina un evento.
 */
async function deleteEvent(req, res, next) {
  try {
    const event = await eventService.deleteEvent(req.params.id);
    res.json({ message: "Evento eliminado correctamente", event });
  } catch (error) {
    next(error);
  }
}

export default {
  createEvent,
  listEvents,
  getEventById,
  deleteEvent,
};
