/**
 * ThreatDetectorService
 *
 * Servicio central de detección de amenazas.
 * Único punto del sistema donde se evalúa si una solicitud es sospechosa.
 *
 * Flujo corregido:
 *   1. Primero evalúa todas las reglas de detección configuradas.
 *   2. Si alguna regla coincide, esa clasificación prevalece.
 *   3. Solo si ninguna regla coincide y responseStatus es 404,
 *      se clasifica como low/not-found.
 *
 * Esto corrige el bug donde un 404 cortocircuitaba la evaluación
 * de reglas, causando que amenazas como /.env se clasificaran
 * como low/not-found en lugar de high/dotenv.
 */

import rules from "../rules/index.js";

/**
 * @typedef {Object} DetectionResult
 * @property {boolean} suspicious - Indica si el evento es sospechoso
 * @property {string} [severity] - Nivel de severidad (low, medium, high)
 * @property {string} [category] - Categoría de la amenaza
 * @property {string} [matchedRule] - Nombre de la regla que coincidió
 * @property {string} [reason] - Descripción de por qué se consideró sospechoso
 */

/**
 * Evalúa si un evento es sospechoso basándose en las reglas configuradas.
 *
 * @param {Object} event - Información de la solicitud HTTP
 * @param {string} event.path - Ruta de la solicitud
 * @param {string} event.userAgent - User-Agent de la solicitud
 * @param {string} event.method - Método HTTP
 * @param {number} event.responseStatus - Código de respuesta HTTP
 * @returns {DetectionResult} Resultado de la detección
 */
function detect(event) {
  const { path, userAgent, method, responseStatus } = event;

  // 1. Pre-normalizar valores para la evaluación de reglas
  const lowerPath = (path || "").toLowerCase();
  const lowerUserAgent = (userAgent || "").toLowerCase();
  const upperMethod = (method || "").toUpperCase();

  // 2. Evaluar todas las reglas de detección primero
  for (const rule of rules) {
    const field = rule.field || "path";
    let targetValue = "";

    switch (field) {
      case "path":
        targetValue = lowerPath;
        break;
      case "userAgent":
        targetValue = lowerUserAgent;
        break;
      case "method":
        targetValue = upperMethod;
        break;
      default:
        targetValue = lowerPath;
    }

    const type = rule.type || "includes";
    let matched = false;

    if (type === "regex") {
      const regex = new RegExp(rule.pattern, "i");
      matched = regex.test(targetValue);
    } else {
      // includes: comparación case-insensitive
      matched = targetValue.toLowerCase().includes(rule.pattern.toLowerCase());
    }

    if (matched) {
      return {
        suspicious: true,
        severity: rule.severity,
        category: rule.category,
        matchedRule: rule.name,
        reason: rule.description,
      };
    }
  }

  // 3. Fallback: si ninguna regla coincidió y es 404, clasificar como not-found
  if (responseStatus === 404) {
    return {
      suspicious: true,
      severity: "low",
      category: "not-found",
      matchedRule: "not-found-response",
      reason: "La solicitud generó un 404 (recurso no encontrado)",
    };
  }

  // 4. No es sospechoso
  return {
    suspicious: false,
  };
}

export default { detect };
