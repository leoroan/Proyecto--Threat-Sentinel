/**
 * Middleware interno de detección de amenazas.
 *
 * Este middleware es EXCLUSIVO del propio servicio Threat Sentinel.
 * Monitorea todas las peticiones HTTP que recibe el servidor y registra
 * automáticamente las sospechosas en MongoDB.
 *
 * Diferencia con threatLogger (middleware externo):
 *   - threatLogger se usa en aplicaciones EXTERNAS para enviar eventos vía HTTP.
 *   - internalThreatDetector se usa dentro del propio Threat Sentinel.
 *   - No hace peticiones HTTP a sí mismo: persiste directamente mediante eventService.
 *
 * Flujo:
 *   Request → Express → internalThreatDetector → Routes → Response
 *           → (al finalizar la respuesta) → ThreatDetectorService.detect()
 *           → si es sospechoso → eventService.createEvent() → MongoDB
 *
 * Restricciones:
 *   - Jamás bloquea la respuesta HTTP del usuario.
 *   - No hace fetch/HTTP interno al propio servicio.
 *   - Excluye /health para no generar ruido de monitoreo.
 */

import ThreatDetectorService from "../detectors/ThreatDetectorService.js";
import eventService from "../services/eventService.js";
import { getClientIp } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * Verifica si una ruta debe ser excluida del monitoreo interno.
 * El servicio no debe monitorearse a sí mismo: las rutas de la propia API
 * y el health check no generan eventos.
 */
function shouldExclude(path) {
  return (
    path === "/health" ||
    path.startsWith("/api/events") ||
    path.startsWith("/api/stats")
  );
}

/**
 * Middleware que detecta y registra amenazas dirigidas al propio servicio.
 *
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next function
 */
function internalThreatDetector(req, res, next) {
  // Excluir rutas propias del servicio para no monitorearse a sí mismo
  if (shouldExclude(req.path)) {
    return next();
  }

  // Escuchar el evento 'finish' para conocer el status code real de la respuesta.
  // Esto se ejecuta DESPUÉS de que la respuesta fue enviada al cliente,
  // por lo que nunca bloquea la respuesta HTTP.
  res.on("finish", () => {
    const statusCode = res.statusCode;

    // Construir el objeto del evento desde la request original
    const eventData = {
      ip: getClientIp(req),
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      query: req.query || {},
      headers: req.headers || {},
      userAgent: req.get("User-Agent") || "",
      referer: req.get("Referer") || "",
      host: req.get("Host") || "",
      protocol: req.protocol || "",
      httpVersion: req.httpVersion || "",
      responseStatus: statusCode,
      sourceApplication: "threat-sentinel-internal",
    };

    // Ejecutar el detector para clasificar la solicitud
    const detection = ThreatDetectorService.detect({
      path: eventData.path,
      userAgent: eventData.userAgent,
      method: eventData.method,
      responseStatus: eventData.responseStatus,
    });

    // Si la solicitud es sospechosa, persistir directamente mediante eventService.
    // Se usa .catch() para que cualquier error de persistencia no afecte
    // la respuesta ya enviada al cliente.
    if (detection.suspicious) {
      eventService.createEvent(eventData).catch((error) => {
        logger.error(
          { err: error.message, path: eventData.path },
          "Error al persistir evento detectado internamente",
        );
      });
    }
  });

  next();
}

export default internalThreatDetector;
