/**
 * Punto de entrada del servidor.
 *
 * Conecta a MongoDB (Mongoose maneja la reconexión automáticamente),
 * crea el índice TTL desde el modelo, y arranca el servidor HTTP.
 */

import mongoose from "mongoose";
import app from "./app.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";

logger.info("========================================");
logger.info("  Threat Sentinel - Iniciando...");
logger.info("========================================");
logger.info({ port: config.port, env: config.nodeEnv }, "Configuración");

mongoose.set("strictQuery", true);

// Eventos de conexión (solo monitoreo, Mongoose maneja la reconexión)
mongoose.connection.on("connected", () => {
  logger.info("Conexión a MongoDB establecida");
});

mongoose.connection.on("disconnected", () => {
  logger.warn(
    "Conexión a MongoDB perdida. Mongoose reintentará automáticamente...",
  );
});

mongoose.connection.on("error", (err) => {
  logger.error({ err: err.message }, "Error en la conexión a MongoDB");
});

mongoose.connection.on("reconnected", () => {
  logger.info("Reconexión a MongoDB exitosa");
});

// Iniciar servidor
async function startServer() {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    logger.error({ err: error.message }, "No se pudo conectar a MongoDB");
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    logger.info(`Threat Sentinel corriendo en http://localhost:${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}/health`);
    logger.info("========================================");
  });

  // Manejo de cierre graceful
  process.on("SIGTERM", async () => {
    logger.info("Señal SIGTERM recibida. Cerrando servidor...");
    await gracefulShutdown(server);
  });

  process.on("SIGINT", async () => {
    logger.info("Señal SIGINT recibida. Cerrando servidor...");
    await gracefulShutdown(server);
  });
}

async function gracefulShutdown(server) {
  try {
    await new Promise((resolve) => server.close(resolve));
    logger.info("Servidor HTTP cerrado");

    await mongoose.connection.close();
    logger.info("Conexión a MongoDB cerrada");

    logger.info("Cierre graceful completado");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error.message }, "Error durante el cierre graceful");
    process.exit(1);
  }
}

startServer();
