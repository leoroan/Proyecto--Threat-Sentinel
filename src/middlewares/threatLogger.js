/**
 * Middleware reutilizable de Threat Logger.
 *
 * Este middleware Express se integra en cualquier aplicación para
 * detectar y enviar automáticamente eventos sospechosos al servicio
 * Threat Sentinel.
 *
 * Uso:
 *   import threatLogger from './src/middlewares/threatLogger.js';
 *   app.use(threatLogger({ endpoint: 'http://localhost:3000', sourceApplication: 'mi-app' }));
 *
 * Funcionamiento:
 *   - Se ejecuta en cada petición.
 *   - No bloquea la respuesta: funciona en segundo plano.
 *   - Detecta automáticamente 404s y los envía.
 *   - Detecta métodos HTTP sospechosos y los envía.
 *
 * @param {Object} options - Opciones de configuración
 * @param {string} options.endpoint - URL base del servicio Threat Sentinel (ej: http://localhost:3000)
 * @param {string} options.sourceApplication - Nombre de la aplicación que envía el evento
 * @returns {Function} Middleware de Express
 */
function threatLogger(options = {}) {
  const { endpoint = "http://localhost:3000", sourceApplication = "unknown" } =
    options;

  return function middleware(req, res, next) {
    // Almacenar la función original de res.end para ejecutarla después
    const originalEnd = res.end.bind(res);

    // Interceptar el final de la respuesta
    res.end = function (...args) {
      // Solo procesar si la respuesta fue un error (4xx o 5xx)
      const statusCode = res.statusCode;

      // Solo considerar respuestas con error para no generar ruido
      if (statusCode >= 400) {
        const eventData = {
          ip: req.ip || req.connection?.remoteAddress || "",
          method: req.method || "",
          path: req.path || "",
          originalUrl: req.originalUrl || "",
          query: req.query || {},
          headers: req.headers || {},
          userAgent: req.get("User-Agent") || "",
          referer: req.get("Referer") || "",
          host: req.get("Host") || "",
          protocol: req.protocol || "",
          httpVersion: req.httpVersion || "",
          responseStatus: statusCode,
          sourceApplication,
        };

        // Enviar el evento al servicio Threat Sentinel
        // No bloquear la respuesta, enviar en segundo plano
        fetch(`${endpoint}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        }).catch(() => {
          // Silenciar errores de red para no afectar la aplicación principal
        });
      }

      // Ejecutar la función original
      originalEnd(...args);
    };

    next();
  };
}

export default threatLogger;
