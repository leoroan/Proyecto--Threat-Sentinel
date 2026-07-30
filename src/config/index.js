/**
 * Módulo de configuración centralizada.
 */

import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootPath = resolve(__dirname, "..", "..");

dotenv.config({ path: resolve(rootPath, ".env") });

/**
 * Configuración de trust proxy para Express.
 * - true: confía en todos los proxies (útil tras Nginx/Docker/Cloudflare)
 * - false: no confía en ningún proxy (desarrollo local)
 * - número: confía en N proxies consecutivos
 * - string: lista de IPs/subredes de confianza
 */
function parseTrustProxy(value) {
  if (value === undefined) return false;

  if (value === "true") return true;
  if (value === "false") return false;

  const num = Number(value);
  if (!Number.isNaN(num)) return num;

  return value;
}

const config = Object.freeze({
  /** Puerto en el que escuchará el servidor HTTP */
  port: parseInt(process.env.PORT, 10) || 3000,

  /** URI de conexión a MongoDB */
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/threat-sentinel",

  /** Nombre de la aplicación que envía los eventos (por defecto) */
  sourceApplication: process.env.SOURCE_APPLICATION || "threat-sentinel",

  /** Orígenes permitidos para CORS. Separar múltiples orígenes con coma */
  corsOrigins: process.env.CORS_ORIGINS || "*",

  /** Ventana de tiempo para rate limiting en milisegundos */
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,

  /** Máximo de peticiones por ventana de tiempo */
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  /** Formato de Morgan para logging HTTP */
  morganFormat: process.env.MORGAN_FORMAT || "dev",

  /** Entorno de ejecución */
  nodeEnv: process.env.NODE_ENV || "development",

  /** Días de retención de eventos en MongoDB. 0 = sin límite */
  eventRetentionDays: parseInt(process.env.EVENT_RETENTION_DAYS, 10) || 0,

  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
});

export default config;
