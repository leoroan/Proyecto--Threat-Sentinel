/**
 * Ejemplo de integración con Threat Sentinel.
 *
 * Este ejemplo muestra cómo usar:
 *   1. El middleware automático threatLogger
 *   2. El cliente ThreatLoggerClient para registro manual
 *
 * Para ejecutar:
 *   1. Asegúrate de que Threat Sentinel esté corriendo en http://localhost:3000
 *   2. npm install
 *   3. node index.js
 *   4. Visita http://localhost:3001/test-404 y http://localhost:3001/.env
 */

import express from "express";
import threatLogger from "../../src/middlewares/threatLogger.js";
import ThreatLoggerClient from "../../src/clients/ThreatLoggerClient.js";

const app = express();
const PORT = process.env.PORT || 3001;
const THREAT_SENTINEL_ENDPOINT =
  process.env.THREAT_SENTINEL_ENDPOINT || "http://localhost:3000";
const SOURCE_APPLICATION =
  process.env.SOURCE_APPLICATION || "example-express-app";

// ============================================================
// Middleware automático de Threat Sentinel
// ============================================================
// Este middleware intercepta todas las respuestas con código >= 400
// y las envía automáticamente al servicio Threat Sentinel.
app.use(
  threatLogger({
    endpoint: THREAT_SENTINEL_ENDPOINT,
    sourceApplication: SOURCE_APPLICATION,
  }),
);

// ============================================================
// Cliente manual de Threat Sentinel
// ============================================================
const logger = new ThreatLoggerClient({
  endpoint: THREAT_SENTINEL_ENDPOINT,
  sourceApplication: SOURCE_APPLICATION,
});

// ============================================================
// Rutas de ejemplo
// ============================================================

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de ejemplo integrada con Threat Sentinel",
    instrucciones: [
      "Visita /test-404 para generar un evento 404",
      "Visita /test-500 para generar un evento 500",
      "Visita /manual para probar el registro manual",
      "Visita /stats para ver las estadísticas de Threat Sentinel",
    ],
  });
});

// Ruta que genera un 404 (será capturada automáticamente por el middleware)
app.get("/test-404", (req, res) => {
  res.status(404).json({ error: "Recurso no encontrado" });
});

// Ruta que genera un 500 (será capturada automáticamente por el middleware)
app.get("/test-500", (req, res) => {
  res.status(500).json({ error: "Error interno del servidor" });
});

// Ruta que simula un ataque (será capturado por el middleware)
app.get("/.env", (req, res) => {
  res.status(404).json({ error: "No encontrado" });
});

// Ruta que usa el cliente manual para registrar un evento
// El cliente ahora recibe los datos ya extraídos, no el request object
app.get("/manual", async (req, res) => {
  try {
    const evento = await logger.log({
      ip: req.ip || req.connection?.remoteAddress || "",
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      headers: { "user-agent": req.get("User-Agent"), host: req.get("Host") },
      userAgent: req.get("User-Agent") || "",
      referer: req.get("Referer") || "",
      host: req.get("Host") || "",
      protocol: req.protocol || "",
      httpVersion: req.httpVersion || "",
      responseStatus: 404,
      notes: "Evento registrado manualmente desde el ejemplo",
    });
    res.json({
      mensaje: "Evento enviado manualmente a Threat Sentinel",
      evento,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al enviar evento a Threat Sentinel",
      detalle: error.message,
    });
  }
});

// Ruta que consulta estadísticas de Threat Sentinel
app.get("/stats", async (req, res) => {
  try {
    const response = await fetch(`${THREAT_SENTINEL_ENDPOINT}/api/stats`);
    const stats = await response.json();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: "Error al consultar estadísticas",
      detalle: error.message,
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  Ejemplo Threat Sentinel corriendo en:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`========================================`);
  console.log(`  Threat Sentinel endpoint: ${THREAT_SENTINEL_ENDPOINT}`);
  console.log(`  Source Application: ${SOURCE_APPLICATION}`);
  console.log(`========================================`);
  console.log(`  Rutas de prueba:`);
  console.log(`  http://localhost:${PORT}/`);
  console.log(`  http://localhost:${PORT}/test-404`);
  console.log(`  http://localhost:${PORT}/test-500`);
  console.log(`  http://localhost:${PORT}/.env`);
  console.log(`  http://localhost:${PORT}/manual`);
  console.log(`  http://localhost:${PORT}/stats`);
  console.log(`========================================`);
});
