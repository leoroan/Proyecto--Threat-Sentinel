/**
 * ThreatLoggerClient
 *
 * Cliente HTTP independiente para enviar eventos al servicio Threat Sentinel
 * desde cualquier aplicación (Node.js, Java, .NET, Python, etc.).
 *
 * Responsabilidad: enviar eventos ya estructurados al servicio.
 * No extrae información del request: eso es responsabilidad del backend
 * que integra el cliente.
 *
 * Uso:
 *   import ThreatLoggerClient from './clients/ThreatLoggerClient.js';
 *   const logger = new ThreatLoggerClient({ endpoint: 'http://localhost:3000', sourceApplication: 'mi-api' });
 *
 *   // Enviar un evento con datos ya preparados
 *   await logger.log({
 *     ip: req.ip,
 *     method: req.method,
 *     path: req.path,
 *     originalUrl: req.originalUrl,
 *     headers: { 'user-agent': req.get('User-Agent'), 'host': req.get('Host') },
 *     userAgent: req.get('User-Agent'),
 *     responseStatus: 404,
 *     sourceApplication: 'mi-api',
 *   });
 */

class ThreatLoggerClient {
  /**
   * @param {Object} options
   * @param {string} options.endpoint - URL base del servicio Threat Sentinel
   * @param {string} [options.sourceApplication='unknown'] - Nombre de la aplicación
   * @param {number} [options.timeout=5000] - Tiempo máximo de espera en ms
   */
  constructor(options = {}) {
    this.endpoint = options.endpoint || "http://localhost:3000";
    this.sourceApplication = options.sourceApplication || "unknown";
    this.timeout = options.timeout || 5000;
  }

  /**
   * Envía un evento al servicio Threat Sentinel.
   *
   * @param {Object} eventData - Datos del evento
   * @param {string} eventData.ip - IP del cliente
   * @param {string} eventData.method - Método HTTP
   * @param {string} eventData.path - Ruta de la solicitud
   * @param {string} eventData.originalUrl - URL original
   * @param {Object} [eventData.headers] - Headers HTTP
   * @param {string} [eventData.userAgent] - User-Agent
   * @param {number} [eventData.responseStatus] - Código de respuesta HTTP
   * @param {string} [eventData.sourceApplication] - Nombre de la aplicación
   * @param {string} [eventData.notes] - Notas adicionales
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async log(eventData = {}) {
    const payload = {
      ip: eventData.ip || "",
      method: eventData.method || "",
      path: eventData.path || "",
      originalUrl: eventData.originalUrl || "",
      query: eventData.query || {},
      headers: eventData.headers || {},
      userAgent: eventData.userAgent || "",
      referer: eventData.referer || "",
      host: eventData.host || "",
      protocol: eventData.protocol || "",
      httpVersion: eventData.httpVersion || "",
      responseStatus: eventData.responseStatus || null,
      sourceApplication: eventData.sourceApplication || this.sourceApplication,
      notes: eventData.notes || "",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.endpoint}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 422) {
          return { status: "not_suspicious" };
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Timeout al enviar evento a Threat Sentinel");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export default ThreatLoggerClient;
