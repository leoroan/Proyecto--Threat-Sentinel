/**
 * Utilidades generales del sistema.
 *
 * Funciones auxiliares reutilizables que no pertenecen a un dominio
 * específico. Se mantienen aquí para evitar duplicación de código.
 *
 * Punto de extensión:
 *   Agregar aquí nuevas funciones de utilidad a medida que el sistema
 *   requiera operaciones compartidas entre módulos.
 */

import { SENSITIVE_HEADERS } from "../constants/index.js";

/**
 * Extrae la IP del cliente desde un objeto Request de Express.
 * Soporta proxies y conexiones directas.
 *
 * @param {Object} req - Request de Express
 * @returns {string} Dirección IP del cliente
 */
function getClientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    return ips[0];
  }
  return req.ip || req.connection?.remoteAddress || "0.0.0.0";
}

/**
 * Filtra headers sensibles del objeto de headers.
 * Elimina headers como Authorization, Cookies, Tokens, etc.
 *
 * @param {Object} headers - Headers HTTP originales
 * @returns {Object} Headers filtrados sin datos sensibles
 */
function filterSensitiveHeaders(headers) {
  if (!headers || typeof headers !== "object") return {};

  const filtered = {};
  const lowerSensitive = SENSITIVE_HEADERS.map((h) => h.toLowerCase());

  for (const [key, value] of Object.entries(headers)) {
    if (!lowerSensitive.includes(key.toLowerCase())) {
      filtered[key] = value;
    }
  }
  return filtered;
}

/**
 * Normaliza un objeto de headers HTTP a un objeto plano.
 * Convierte todas las claves a minúsculas para consistencia.
 *
 * @param {Object} headers - Headers HTTP
 * @returns {Object} Headers normalizados
 */
function normalizeHeaders(headers) {
  if (!headers || typeof headers !== "object") return {};
  const normalized = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

export { getClientIp, filterSensitiveHeaders, normalizeHeaders };
