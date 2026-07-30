/**
 * Rutas de eventos.
 *
 * Define los endpoints relacionados con la gestión de eventos de amenaza.
 * Cada ruta valida la entrada antes de llegar al controlador.
 */

import { Router } from "express";
import eventController from "../controllers/eventController.js";
import {
  validateCreateEvent,
  validateListEvents,
  validateId,
} from "../middlewares/validationMiddleware.js";

const router = Router();

/**
 * POST /api/events
 * Registrar un nuevo evento de amenaza.
 * El cuerpo debe incluir ip, method, path y originalUrl como mínimo.
 */
router.post("/", validateCreateEvent, eventController.createEvent);

/**
 * GET /api/events
 * Listar eventos con paginación y filtros.
 * Query params: page, limit, sort, order, severity, category, ip, sourceApplication, desde, hasta
 */
router.get("/", validateListEvents, eventController.listEvents);

/**
 * GET /api/events/:id
 * Obtener detalle de un evento.
 */
router.get("/:id", validateId, eventController.getEventById);

/**
 * DELETE /api/events/:id
 * Eliminar un evento.
 */
router.delete("/:id", validateId, eventController.deleteEvent);

export default router;
