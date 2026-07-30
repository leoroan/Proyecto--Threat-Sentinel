/**
 * Logger estructurado del sistema.
 *
 * Utiliza Pino para proporcionar logging con niveles y formato JSON.
 * Reemplaza el uso de console.log/console.error en toda la aplicación.
 *
 * Niveles disponibles: trace, debug, info, warn, error, fatal
 *
 * Punto de extensión:
 *   Configurar transports adicionales (archivo, syslog, etc.) según
 *   el entorno sin modificar los módulos que usan el logger.
 */

import pino from "pino";
import config from "../config/index.js";

const logger = pino({
  level: config.nodeEnv === "production" ? "info" : "debug",
  transport:
    config.nodeEnv !== "production"
      ? {
          target: "pino/file",
          options: { destination: 1 }, // stdout
        }
      : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
