/**
 * Aplicación Express.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import config from "./config/index.js";
import eventRoutes from "./routes/eventRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// Trust proxy: necesario cuando la app está detrás de un proxy reverso
// (Nginx, Docker, Kubernetes, Cloudflare, etc.) para que Express respete
// los headers X-Forwarded-For y express-rate-limit identifique IPs correctamente.
app.set("trust proxy", config.trustProxy);

// Seguridad: Helmet protege headers HTTP
app.use(helmet());

// CORS: configurable desde .env
function parseCorsOrigins(raw) {
  if (!raw || raw === "*" || raw.trim() === "") return "*";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

const corsOptions = {
  origin: parseCorsOrigins(config.corsOrigins),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Rate Limiting: excluir /health para permitir monitoreo continuo
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Demasiadas solicitudes. Intente nuevamente más tarde.",
    },
  },
});

// Aplicar rate limit a todas las rutas excepto /health
app.use((req, res, next) => {
  if (req.path === "/health") {
    return next();
  }
  return limiter(req, res, next);
});

// Compresión de respuestas
app.use(compression());

// Parseo de JSON
app.use(express.json({ limit: "1mb" }));

// Logging HTTP con Morgan
app.use(morgan(config.morganFormat));

// ============================================================
// Rutas
// ============================================================

// Health check: verifica estado del servidor y conexión a MongoDB
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const dbStatus = dbState === 1 ? "connected" : "disconnected";

  const healthStatus = dbState === 1 ? "ok" : "degraded";

  res.json({
    status: healthStatus,
    database: dbStatus,
    servicio: "threat-sentinel",
  });
});

// API routes
app.use("/api/events", eventRoutes);
app.use("/api/stats", statsRoutes);

// Manejador de errores
app.use(errorHandler);

export default app;
